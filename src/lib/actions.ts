
'use server';

import { collection, doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase-admin"; // Using admin SDK for privileged writes
import type { Review, UserProfile } from "./firestore";

interface SubmitReviewPayload extends Omit<Review, 'id' | 'createdAt'> {}

/**
 * A server action to securely submit a review and update the mentor's rating.
 * This runs on the server with admin privileges, bypassing client-side security rule complexities.
 */
export async function submitReviewAndUpdateRatingAction(payload: SubmitReviewPayload) {
  const { sessionId, mentorId, menteeId, rating, reviewText, menteeName } = payload;

  if (!sessionId || !mentorId || !menteeId) {
    throw new Error("Missing required IDs for submission.");
  }

  const mentorRef = db.collection("users").doc(mentorId);
  const sessionRef = db.collection("sessions").doc(sessionId);
  const newReviewRef = db.collection("reviews").doc(); // Auto-generate new review ID

  try {
    await db.runTransaction(async (transaction) => {
      // 1. Get the mentor's current profile
      const mentorDoc = await transaction.get(mentorRef);
      if (!mentorDoc.exists) {
        throw new Error("Mentor does not exist!");
      }
      const mentorData = mentorDoc.data() as UserProfile;

      // 2. Calculate the new average rating
      const currentRating = mentorData.rating || 0;
      const reviewCount = mentorData.reviewCount || 0;
      const newReviewCount = reviewCount + 1;
      const newTotalRating = (currentRating * reviewCount) + rating;
      const newAverageRating = newTotalRating / newReviewCount;

      // 3. Update the mentor's profile with the new rating
      transaction.update(mentorRef, {
        rating: newAverageRating,
        reviewCount: newReviewCount,
      });

      // 4. Create the new review document
      transaction.set(newReviewRef, {
        sessionId,
        mentorId,
        menteeId,
        menteeName,
        rating,
        reviewText,
        createdAt: serverTimestamp(),
      });

      // 5. Mark the session as having feedback submitted
      transaction.update(sessionRef, { feedbackSubmitted: true });
    });

    return { success: true, message: "Feedback submitted successfully." };
  } catch (error) {
    console.error("Transaction failed: ", error);
    // Throwing the error will propagate it to the client's catch block.
    if (error instanceof Error) {
        throw new Error(error.message);
    }
    throw new Error("An unknown error occurred while submitting feedback.");
  }
}
