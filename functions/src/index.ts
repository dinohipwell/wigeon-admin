/* eslint-disable object-curly-spacing */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
/**
 * Import function triggers from their respective submodules:
 *
 * cd.. go up one cd functions got to dir
 * to test   functions script npm.cmd --prefix functions run build
 * to deploy from the wigeon-admin path
 *   set FUNCTIONS_DISCOVERY_TIMEOUT=60
 *   firebase deploy --only functions
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


import { setGlobalOptions } from "firebase-functions/v2";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { beforeUserSignedIn } from "firebase-functions/v2/identity";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

setGlobalOptions({ maxInstances: 10 });

initializeApp();
const db = getFirestore();
const auth = getAuth();

/**
 * 1. AUTOMATIC LOGIN & INVITATION PROCESSOR
 * Runs automatically whenever a user logs in or signs up.
 */
export const onUserSignIn = beforeUserSignedIn(async (event) => {
  const user = event.data;

  if (!user || !user.uid || !user.email) {
    throw new HttpsError(
      "invalid-argument",
      "A valid user and email address is required to sign in."
    );
  }

  const userId = user.uid;
  const userEmail = user.email.toLowerCase().trim();

  try {
    const userSnapshot = await db.doc(`users/${userId}`).get();
    if (!userSnapshot.exists) {
      throw new HttpsError("unauthenticated", "Users record cannot be found.");
    }

    const u = userSnapshot.data();
    if (!u || u.email !== userEmail) {
      throw new HttpsError("unauthenticated", "Invalid user record.");
    } else if (u.rights < 1) {
      throw new HttpsError("unauthenticated", "User record has no rights.");
    }

    return {
      customClaims: {
        userRights: u.rights,
        userOrgId: u.orgId,
        activeBId: "",
        activeOrgId: "",
        rights: 0,
        role: "",
        linkedBId: "",
      },
    };
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    console.error("Error in onUserSignIn:", error);
    throw new HttpsError("internal", "Unable to verify user sign-in.");
  }
});

/**
 * 2. BUSINESS SWITCHER (Callable from Angular)
 */
export const switchActivebusiness = onCall(async (request) => {
  if (!request.auth || !request.auth.uid || !request.auth.token.email) {
    throw new HttpsError(
      "unauthenticated",
      "You must be logged in with a valid email to switch businesses."
    );
  }

  try {
    const userId = request.auth.uid;
    const targetbId = request.data?.bId as string | undefined;
    let linkBId = (request.data?.linkBId as string | undefined) ?? "";

    const userSnapshot = await db.doc(`users/${userId}`).get();
    if (!userSnapshot.exists) {
      throw new HttpsError("unauthenticated", "Users record cannot be found.");
    }

    const u = userSnapshot.data();
    if (!u || u.email !== request.auth.token.email) {
      throw new HttpsError("unauthenticated", "Invalid user record.");
    } else if (u.rights < 1) {
      throw new HttpsError("unauthenticated", "User record has no rights.");
    }

    if (!targetbId) {
      const udClaim = {
        userRights: u.rights,
        userOrgId: u.orgId,
        activeBId: "",
        activeOrgId: "",
        rights: 0,
        role: "",
        linkedBId: "",
      };
      await auth.setCustomUserClaims(userId, udClaim);

      return "success";
    }

    const mappingQuery = await db
      .collection("gateway")
      .where("userId", "==", userId)
      .where("bId", "==", targetbId)
      .get();

    const docs = mappingQuery.docs
      .map((d) => d.data())
      .filter((x) => x.rights > 0);

    if (docs.length === 0) {
      throw new HttpsError(
        "permission-denied",
        "You do not have access to this business."
      );
    }

    if (linkBId) {
      const linkedQuery = await db
        .collection("gateway")
        .where("userId", "==", userId)
        .where("bId", "==", linkBId)
        .get();

      const ldocs = linkedQuery.docs
        .map((d) => d.data())
        .filter((x) => x.rights > 0);

      if (ldocs.length === 0) {
        linkBId = "";
      }
    }

    const udClaim = {
      userRights: u.rights,
      userOrgId: u.orgId,
      activeBId: targetbId,
      activeOrgId: docs[0].orgId,
      rights: docs[0].rights,
      role: docs[0].role,
      linkedBId: linkBId,
    };
    await auth.setCustomUserClaims(userId, udClaim);

    return "success";
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    console.error("Error switching business:", error);
    throw new HttpsError("internal", "Failed to switch business context.");
  }
});

















// import { setGlobalOptions } from "firebase-functions";
// setGlobalOptions({ maxInstances: 10 });

// import { onCall, HttpsError } from "firebase-functions/v2/https";
// import { beforeUserSignedIn } from "firebase-functions/v2/identity";
// import { initializeApp } from "firebase-admin/app";
// import { getFirestore } from "firebase-admin/firestore";
// import { getAuth } from "firebase-admin/auth";

// initializeApp();
// const db = getFirestore();
// const auth = getAuth();

// /**
//  * 1. AUTOMATIC LOGIN & INVITATION PROCESSOR
//  * Runs automatically whenever a user logs in or signs up.
//  * - Converts any pending email invitations into permanent gateway.
//  * - Sets their initial 'activeBId' claim so they land in a valid business.
//  */
// export const onUserSignIn = beforeUserSignedIn(async (event) => {
//   const user = event.data;

//   if (!user || !user.uid || !user.email) {
//     throw new HttpsError("invalid-argument", "A valid user and email address is required to sign in.");
//   }
//   const userId = user.uid;
//   const userEmail = user.email.toLowerCase().trim();

//   try {

//     // user record check
//     const userSnapshot = await db.doc(`users/${userId}`).get();
//     if (!userSnapshot.exists) {

//       // could add a user record and setup as a guest maybe with a guest gateway record

//       throw new HttpsError("unauthenticated", "Users record cannot be found.");
//     }
//     const u = userSnapshot.data();
//     if (!u || u.email !== userEmail) {
//       throw new HttpsError("unauthenticated", "Invalid user record.");
//     } else if (u.rights < 0) {
//       throw new HttpsError("unauthenticated", "User record has no rights.");
//     }

//     // Return user is logged on but no business set YET
//     return {
//       customClaims: {
//         userRights: u.rights,
//         userOrgId: u.orgId,
//         activeBId: '',
//         activeOrgId: '',
//         rights: 0,
//         role: '',
//         linkedBId: '', // rights > 0
//         // epoc and permissions are advisory and controlled on the client
//       },
//     };

//   } catch (error) {
//     console.error("Error in onUserSignIn:", error);
//     return;
//   }
// });

// /**
//  * 2. business SWITCHER (Callable from Angular)
//  * Called when a user selects a different tenant from their business dropdown.
//  * - Verifies they actually have access to the requested tenant.
//  * - Updates their token claim to the new single activeBId.
//  */
// export const switchActivebusiness = onCall(async (request) => {
//   if (!request.auth || !request.auth.uid || !request.auth.token.email) {
//     // Public access set for this function so make sure is logged
//     // long term setup Firebase App Check - This ensures Google rejects any request that does not originate from your genuine Angular application before your function code runs.

//     throw new HttpsError("unauthenticated", "You must be logged in with a valid email to switch businesss.");
//   }

//   try {

//     const userId = request.auth.uid;
//     const targetbId = request.data?.bId as string | undefined;
//     let linkBId = request.data?.linkBId as string | undefined;

//     // user record check
//     const userSnapshot = await db.doc(`users/${userId}`).get();
//     if (!userSnapshot.exists) {
//       throw new HttpsError("unauthenticated", "Users record cannot be found.");
//     }
//     const u = userSnapshot.data();
//     if (!u || u.email !== request.auth.token.email) {
//       throw new HttpsError("unauthenticated", "Invalid user record.");
//     } else if (u.rights < 0) {
//       throw new HttpsError("unauthenticated", "User record has no rights.");
//     }

//     if (!targetbId) {
//       // Update the token claim with the cleared business

//       const udClaim = {
//         userRights: u.rights,
//         userOrgId: u.orgId,
//         activeBId: '',
//         activeOrgId: '',
//         rights: '',
//         role: '',
//         linkedBId: '', // rights > 0
//       };
//       await auth.setCustomUserClaims(userId, udClaim);

//       return { status: "success", fsClaim: udClaim };

//     } else {

//       // Verify the user is mapped to the requested tenant
//       const mappingQuery = await db.collection("gateway")
//         .where("userId", "==", userId)
//         .where("bId", "==", targetbId)
//         .get();

//       const docs = mappingQuery.docs.map(d => d.data()).filter(x => x.rights > 0);
//       if (docs.length === 0) {
//         throw new HttpsError("permission-denied", "You do not have access to this business.");
//       }

//       if (linkBId) {
//         const linkedQuery = await db.collection("gateway")
//           .where("userId", "==", userId)
//           .where("bId", "==", linkBId)
//           .get();

//         const ldocs = linkedQuery.docs.map(d => d.data()).filter(x => x.rights > 0);
//         if (ldocs.length === 0) {
//           linkBId = '';// no rights vaid
//         }
//       }

//       // Update the token claim with the new single active business ID
//       const udClaim = {
//         userRights: u.rights,
//         userOrgId: u.orgId,
//         activeBId: targetbId,
//         activeOrgId: docs[0].orgId,
//         rights: docs[0].rights,
//         role: docs[0].role,
//         linkedBId: linkBId,
//       };
//       await auth.setCustomUserClaims(userId, udClaim);

//       return { status: "success", fsClaim: udClaim };
//     }
//   } catch (error) {
//     if (error instanceof HttpsError) throw error;
//     console.error("Error switching business:", error);
//     throw new HttpsError("internal", "Failed to switch business context.");
//   }
// });
