/* eslint-disable object-curly-spacing */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
/**
 * Import function triggers from their respective submodules:
 *
 * cd.. go up one cd functions got to dir
 * to test   functions script npm.cmd --prefix functions run build
 * to deploy from wigeon-admin cd   firebase deploy --only functions
 * to deploy   individual functions firebase deploy --only functions:onUserSignIn
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */


// import {onRequest} from "firebase-functions/https";
// import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
import { setGlobalOptions } from "firebase-functions";
setGlobalOptions({ maxInstances: 10 });

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { beforeUserSignedIn } from "firebase-functions/v2/identity";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";


initializeApp();
const db = getFirestore();
const auth = getAuth();

/**
 * 1. AUTOMATIC LOGIN & INVITATION PROCESSOR
 * Runs automatically whenever a user logs in or signs up.
 * - Converts any pending email invitations into permanent gateway.
 * - Sets their initial 'activeBId' claim so they land in a valid business.
 */
export const onUserSignIn = beforeUserSignedIn(async (event) => {
  const user = event.data;
  if (!user) return;

  const userId = user.uid;
  const userEmail = user.email ? user.email.toLowerCase().trim() : null;

  try {

    const userSnapshot = await db.doc(`users/${userId}`).get();
    if (!userSnapshot.exists) {
      throw new HttpsError("unauthenticated", "Users record cannot be found.");
    }

    // Check for any pending invitations matching this user's email
    if (userEmail) {
      const inviteQuery = await db.collection("gateway")
        .where("userId", "==", "")
        .where("email", "==", userEmail)
        .get();

      if (!inviteQuery.empty) {
        const batch = db.batch();

        inviteQuery.forEach((doc: any) => {
          // const inviteData = doc.data();
          // const mappingRef = db.collection("gateway").doc();

          // batch.set(mappingRef, {
          //   userId: userId,
          //   bId: inviteData.bId,
          //   email: userEmail,
          //   joinedAt: new Date(),
          // });
          if (doc.data().rights > 0) {
            batch.update(doc.ref, {
              acceptedAt: new Date(),
              userId: userId,
              joinedAt: new Date(),
            });
          }
        });

        await batch.commit();
      }
    }

    // Fetch all valid tenant mappings for this user
    const mappingsSnap = await db.collection("gateway")
      .where("userId", "==", userId)
      .get();

    let validGateWay: any = null;

    const docs = mappingsSnap.docs.map(d => d.data()).filter(x => x.rights > 0);
    if (docs.length > 0) {
      const currentActiveId = user.customClaims?.activeBId as string | 'undefined';
      if (currentActiveId) {
        validGateWay = docs.find((x: any) => x.bId === currentActiveId) || null;
      }
      if (!validGateWay) {
        // try for first with rights filtered in query
        validGateWay = docs[0];
      }
    }
    const u = userSnapshot.data();
    return {
      customClaims: {
        userRights: (u) ? u.rights : 0,
        userOrgId: (u) ? u.orgId : '',
        activeBId: (validGateWay) ? validGateWay.bId : '',
        rights: (validGateWay) ? validGateWay.rights : 0,
        role: (validGateWay) ? validGateWay.role : '',
        linkedBId: '', // rights > 0
        // epoc and permissions are advisory and controlled on the client
      },
    };

  } catch (error) {
    console.error("Error in onUserSignIn:", error);
    return;
  }
});

/**
 * 2. business SWITCHER (Callable from Angular)
 * Called when a user selects a different tenant from their business dropdown.
 * - Verifies they actually have access to the requested tenant.
 * - Updates their token claim to the new single activeBId.
 */
export const switchActivebusiness = onCall(async (request) => {
  if (!request.auth || !request.auth.uid) {
    // Public access set for this function so make sure is logged
    // long term setup Firebase App Check - This ensures Google rejects any request that does not originate from your genuine Angular application before your function code runs.

    throw new HttpsError("unauthenticated", "You must be logged in to switch businesss.");
  }

  const userId = request.auth.uid;
  const targetbId = request.data?.bId as string | undefined;

  const userSnapshot = await db.doc(`users/${userId}`).get();
  if (!userSnapshot.exists) {
    throw new HttpsError("unauthenticated", "Users record cannot be found.");
  }


  if (!targetbId) {
    throw new HttpsError("invalid-argument", "A target bId is required.");
  }

  try {
    // Verify the user is mapped to the requested tenant
    const mappingQuery = await db.collection("gateway")
      .where("userId", "==", userId)
      .where("bId", "==", targetbId)
      .get();

    const docs = mappingQuery.docs.map(d => d.data()).filter(x => x.rights > 0);
    if (docs.length === 0) {
      throw new HttpsError("permission-denied", "You do not have access to this business.");
    }

    if (docs[0].linkedBId) {
      const linkedQuery = await db.collection("gateway")
        .where("userId", "==", userId)
        .where("bId", "==", docs[0].linkedBId)
        .get();

      const ldocs = linkedQuery.docs.map(d => d.data()).filter(x => x.rights > 0);
      if (ldocs.length > 0) {

      }
    }

    // Update the token claim with the new single active business ID
    const u = userSnapshot.data();
    await auth.setCustomUserClaims(userId, {
      userRights: (u) ? u.rights : 0,
      userOrgId: (u) ? u.orgId : '',
      activeBId: targetbId,
      activeOrgId: docs[0].orgId,
      rights: docs[0].rights,
      role: docs[0].role,
      linkedBId: '', // rights > 0
    });

    return { status: "success", switchedTo: targetbId };
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    console.error("Error switching business:", error);
    throw new HttpsError("internal", "Failed to switch business context.");
  }
});
