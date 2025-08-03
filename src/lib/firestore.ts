
// src/lib/firestore.ts
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, serverTimestamp, addDoc, query, where, runTransaction } from "firebase/firestore"; 
import { db } from "./firebase";

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  skillsToLearn?: string[];
  skillsToTeach?: string[];
  linkedinProfile?: string;
  githubProfile?: string;
  leetcodeProfile?: string;
  createdAt?: any;
  updatedAt?: any;
  profileComplete?: boolean;
  rating?: number;
  reviewCount?: number;
}

export interface Session {
  id: string;
  menteeId: string;
  menteeName: string;
  mentorId: string;
  mentorName: string;
  skill: string;
  dateTime: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt?: any;
  updatedAt?: any;
  meetingLink?: string;
  mentorCompleted?: boolean;
  menteeCompleted?: boolean;
  feedbackSubmitted?: boolean;
}

export interface Review {
    id?: string;
    sessionId: string;
    mentorId: string;
    menteeId: string;
    menteeName: string;
    rating: number;
    reviewText: string;
    createdAt?: any;
}


// Function to create a user profile document
export const createUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, "users", uid);
  return setDoc(userRef, {
    uid,
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    profileComplete: false,
    rating: 0,
    reviewCount: 0,
  }, { merge: true });
};

// Function to get a user profile
export const getUserProfile = async (uid:string): Promise<UserProfile | null> => {
  const userRef = doc(db, "users", uid);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  } else {
    return null;
  }
};

// Function to get all user profiles
export const getAllUsers = async (): Promise<UserProfile[]> => {
  const usersCollection = collection(db, "users");
  const usersSnapshot = await getDocs(usersCollection);
  const usersList = usersSnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as UserProfile));
  return usersList;
}

// Function to update a user profile
export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, "users", uid);

  const existingProfile = await getUserProfile(uid);
  const mergedData = { ...existingProfile, ...data };

  const { skillsToLearn, skillsToTeach, linkedinProfile } = mergedData;

  const isComplete = 
    Array.isArray(skillsToLearn) && skillsToLearn.length > 0 &&
    Array.isArray(skillsToTeach) && skillsToTeach.length > 0 &&
    linkedinProfile && linkedinProfile.trim() !== '';

  return updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp(),
    profileComplete: isComplete
  });
};


// Function to request a new session
export const requestSession = async (sessionData: Omit<Session, 'id'>) => {
  const sessionsCollection = collection(db, 'sessions');
  return await addDoc(sessionsCollection, {
    ...sessionData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    mentorCompleted: false,
    menteeCompleted: false,
    feedbackSubmitted: false,
  });
};

// Function to get all sessions for a user (as mentee or mentor)
export const getUserSessions = async (userId: string): Promise<Session[]> => {
    const sessionsCollection = collection(db, 'sessions');
    const menteeQuery = query(sessionsCollection, where('menteeId', '==', userId));
    const mentorQuery = query(sessionsCollection, where('mentorId', '==', userId));

    const [menteeSnapshot, mentorSnapshot] = await Promise.all([
        getDocs(menteeQuery),
        getDocs(mentorQuery)
    ]);
    
    const sessions: Session[] = [];
    menteeSnapshot.forEach(doc => {
        sessions.push({ id: doc.id, ...doc.data() } as Session);
    });
    mentorSnapshot.forEach(doc => {
        if (!sessions.find(s => s.id === doc.id)) {
            sessions.push({ id: doc.id, ...doc.data() } as Session);
        }
    });

    return sessions.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
};

// Function to update a session's status
export const updateSessionStatus = async (sessionId: string, status: Session['status'], meetingLink?: string) => {
    const sessionRef = doc(db, 'sessions', sessionId);
    const updateData: any = {
        status,
        updatedAt: serverTimestamp(),
    };
    if (meetingLink) {
        updateData.meetingLink = meetingLink;
    }
    return updateDoc(sessionRef, updateData);
};

export const markSessionAsComplete = async (sessionId: string, userId: string) => {
    const sessionRef = doc(db, 'sessions', sessionId);

    return runTransaction(db, async (transaction) => {
        const sessionDoc = await transaction.get(sessionRef);
        if (!sessionDoc.exists()) {
            throw "Session does not exist!";
        }

        const sessionData = sessionDoc.data() as Session;
        const isMentor = sessionData.mentorId === userId;
        
        const updateData: Partial<Session> = {};
        if (isMentor) {
            updateData.mentorCompleted = true;
        } else {
            updateData.menteeCompleted = true;
        }

        // Check if the other party has already marked it as complete
        const bothMarked = (isMentor && sessionData.menteeCompleted) || (!isMentor && sessionData.mentorCompleted);

        if (bothMarked) {
            updateData.status = 'completed';
        }
        
        transaction.update(sessionRef, { ...updateData, updatedAt: serverTimestamp() });

        return { ...sessionData, ...updateData };
    });
};

export const submitReviewAndUpdateRating = async (review: Omit<Review, 'id'|'createdAt'>) => {
    const mentorRef = doc(db, "users", review.mentorId);
    const reviewCollection = collection(db, "reviews");
    const newReviewRef = doc(reviewCollection);
    const sessionRef = doc(db, "sessions", review.sessionId);

    return runTransaction(db, async (transaction) => {
        const mentorDoc = await transaction.get(mentorRef);
        const sessionDoc = await transaction.get(sessionRef);

        if (!mentorDoc.exists()) {
            throw new Error("Mentor not found.");
        }
        if (!sessionDoc.exists()) {
            throw new Error("Session not found.");
        }
        
        const sessionData = sessionDoc.data();
        if (sessionData?.feedbackSubmitted) {
            throw new Error("Feedback has already been submitted for this session.");
        }

        const mentorData = mentorDoc.data() as UserProfile;

        // Calculate new average rating
        const currentRating = mentorData.rating || 0;
        const reviewCount = mentorData.reviewCount || 0;
        const newReviewCount = reviewCount + 1;
        const newTotalRating = (currentRating * reviewCount) + review.rating;
        const newAverageRating = newTotalRating / newReviewCount;

        // Update mentor's profile with new rating
        transaction.update(mentorRef, { 
            rating: newAverageRating,
            reviewCount: newReviewCount 
        });

        // Save the new review
        transaction.set(newReviewRef, { ...review, createdAt: serverTimestamp() });

        // Mark that feedback has been submitted on the session
        transaction.update(sessionRef, { feedbackSubmitted: true });
    });
}

export const getReviewsForUser = async (userId: string): Promise<Review[]> => {
    const reviewsCollection = collection(db, 'reviews');
    const q = query(reviewsCollection, where('mentorId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const reviews: Review[] = [];
    querySnapshot.forEach((doc) => {
        reviews.push({ id: doc.id, ...doc.data() } as Review);
    });
    return reviews;
}

    