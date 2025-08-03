/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

interface ReviewData {
    sessionId: string;
    mentorId: string;
    menteeId: string;
    menteeName: string;
    rating: number;
    reviewText: string;
}

export const submitReview = onCall(async (request) => {
    // 1. Authentication Check
    if (!request.auth) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "The function must be called while authenticated.",
        );
    }
    
    const menteeId = request.auth.uid;
    const data: ReviewData = request.data;
    
    // 2. Data Validation
    if (menteeId !== data.menteeId) {
        throw new functions.https.HttpsError(
            "permission-denied",
            "You can only submit a review for your own sessions.",
        );
    }
    if (!(data.rating >= 1 && data.rating <= 5)) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Rating must be between 1 and 5.",
        );
    }
    if (!data.reviewText || data.reviewText.length < 10) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Review text must be at least 10 characters long.",
        );
    }

    logger.info("New review submission received for mentor:", data.mentorId);

    const mentorRef = db.collection("users").doc(data.mentorId);
    const sessionRef = db.collection("sessions").doc(data.sessionId);
    const newReviewRef = db.collection("reviews").doc();

    try {
        await db.runTransaction(async (transaction) => {
            const mentorDoc = await transaction.get(mentorRef);
            const sessionDoc = await transaction.get(sessionRef);

            if (!mentorDoc.exists) {
                throw new functions.https.HttpsError("not-found", "Mentor not found.");
            }
            if (!sessionDoc.exists) {
                throw new functions.https.HttpsError("not-found", "Session not found.");
            }
            
            const sessionData = sessionDoc.data();
            if (sessionData?.feedbackSubmitted) {
                throw new functions.https.HttpsError("failed-precondition", "Feedback has already been submitted for this session.");
            }

            const mentorData = mentorDoc.data()!;

            // Calculate new average rating
            const currentRating = mentorData.rating || 0;
            const reviewCount = mentorData.reviewCount || 0;
            const newReviewCount = reviewCount + 1;
            const newTotalRating = (currentRating * reviewCount) + data.rating;
            const newAverageRating = newTotalRating / newReviewCount;
            
            // Perform the writes
            transaction.update(mentorRef, {
                rating: newAverageRating,
                reviewCount: newReviewCount,
            });
            transaction.set(newReviewRef, {
                ...data,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            transaction.update(sessionRef, { feedbackSubmitted: true });
        });

        logger.info("Review submitted successfully for mentor:", data.mentorId);
        return { success: true, message: "Feedback submitted successfully." };
    } catch (error) {
        logger.error("Error submitting review:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError(
            "internal",
            "An unexpected error occurred while submitting feedback.",
        );
    }
});
