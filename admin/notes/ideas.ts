import { HttpsError } from "firebase-functions/v2/https";
import { beforeUserSignedIn } from "firebase-functions/v2/identity";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";


initializeApp();
const db = getFirestore();
//const auth = getAuth();



import { onDocumentCreated } from "firebase-functions/v2/firestore";

export const sendInvitationEmail = onDocumentCreated("invitations/{inviteId}", async (event) => {
  const invite = event.data?.data();
  if (!invite || invite.status !== "pending") return;

  const signupUrl = `https://your-domain.co.uk{encodeURIComponent(invite.email)}`;

  // Example using Resend or any transactional email API
  await fetch("https://resend.com", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Wigeon <noreply@your-domain.co.uk>",
      to: invite.email,
      subject: "You have been invited to join a workspace on Wigeon",
      html: `<p>You have been invited to join a business workspace.</p>
             <p><a href="${signupUrl}">Click here to accept your invitation and sign in</a></p>`,
    }),
  });
});

//  async sendInvite(email: string, rights: string | string[]): Promise < void> {
//   const activeBId = this.workspaceService.activeTenantId();
//   if(!activeBId) throw new Error('No active business selected.');

//   await addDoc(collection(this.firestore, 'invitations'), {
//   email: email.toLowerCase().trim(),
//   bId: activeBId,
//   rights: rights,
//   status: 'pending',
//   createdAt: serverTimestamp(),
// });
//   }

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
        activeOrgId: (validGateWay) ? validGateWay.orgId : '',
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
