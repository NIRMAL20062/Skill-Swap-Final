
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// This background function triggers when a new document is created in the 'reviews' collection.
export const aggregateReviews = functions.firestore
  .document("reviews/{reviewId}")
  .onCreate(async (snap, context) => {
    const reviewData = snap.data();
    if (!reviewData) {
      console.log("No data associated with the event");
      return;
    }

    const mentorId = reviewData.mentorId;
    const rating = reviewData.rating;

    // Get a reference to the mentor's user document
    const mentorRef = db.collection("users").doc(mentorId);

    // Update the mentor's rating in a transaction
    return db.runTransaction(async (transaction) => {
      const mentorDoc = await transaction.get(mentorRef);

      if (!mentorDoc.exists) {
        throw new Error("Mentor document does not exist!");
      }

      const mentorData = mentorDoc.data()!;
      
      // Get current rating and review count, defaulting to 0 if they don't exist
      const currentReviewCount = mentorData.reviewCount || 0;
      const currentTotalRating = mentorData.totalRating || 0;

      // Calculate the new values
      const newReviewCount = currentReviewCount + 1;
      const newTotalRating = currentTotalRating + rating;
      const newAverageRating = newTotalRating / newReviewCount;

      // Update the mentor's document
      transaction.update(mentorRef, {
        reviewCount: newReviewCount,
        totalRating: newTotalRating,
        rating: newAverageRating, // Storing the calculated average
      });
    });
  });

    