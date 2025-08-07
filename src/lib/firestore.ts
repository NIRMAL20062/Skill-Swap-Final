
// src/lib/firestore.ts
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, serverTimestamp, addDoc, query, where, runTransaction, Timestamp, writeBatch, orderBy, limit } from "firebase/firestore"; 
import { db } from "./firebase";

// The email for the admin user
export const ADMIN_EMAIL = 'admin@skillswap.com';

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
  totalRating?: number; // Sum of all ratings received
  coins?: number;
  admin?: boolean;
}

export interface Session {
  id: string;
  menteeId: string;
  menteeName: string;
  mentorId: string;
  mentorName: string;
  skill: string;
  dateTime: string;
  duration: number; // in hours
  cost: number; // in coins
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
    createdAt: Timestamp;
}

export interface Transaction {
    id?: string;
    userId: string;
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    relatedSessionId?: string;
    timestamp: any;
}


// Function to create a user profile document
export const createUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, "users", uid);
  const isAdmin = data.email === ADMIN_EMAIL;
  
  return setDoc(userRef, {
    uid,
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    profileComplete: false,
    rating: 0,
    reviewCount: 0,
    totalRating: 0,
    coins: 100, // Welcome bonus
    admin: isAdmin,
  }, { merge: true });
};


// Function to get a user profile
export const getUserProfile = async (uid:string): Promise<UserProfile | null> => {
  const userRef = doc(db, "users", uid);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return { ...data, uid: docSnap.id } as UserProfile;
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

    return sessions.sort((a, b) => {
      const dateA = a.createdAt?.toDate() ?? 0;
      const dateB = b.createdAt?.toDate() ?? 0;
      if (dateA > dateB) return -1;
      if (dateA < dateB) return 1;
      return 0;
    });
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
            throw new Error("Session does not exist!");
        }

        const sessionData = sessionDoc.data() as Session;
        if (sessionData.status === 'completed') {
            return sessionData; 
        }

        const isMentor = sessionData.mentorId === userId;
        const currentUserHasCompleted = isMentor ? sessionData.mentorCompleted : sessionData.menteeCompleted;

        if (currentUserHasCompleted) {
             throw new Error("You have already marked this session as complete.");
        }
        
        const updateData: Partial<Session> = {};
        if (isMentor) {
            updateData.mentorCompleted = true;
        } else {
            updateData.menteeCompleted = true;
        }

        const bothPartiesCompleted = (isMentor && sessionData.menteeCompleted) || (!isMentor && sessionData.mentorCompleted);
        
        if (bothPartiesCompleted) {
            updateData.status = 'completed';
            
            const { menteeId, mentorId, cost, duration, skill } = sessionData;
            const mentorShare = duration * 8;
            const adminShare = cost - mentorShare;

            const menteeRef = doc(db, 'users', menteeId);
            const mentorRef = doc(db, 'users', mentorId);
            const adminQuery = query(collection(db, 'users'), where('admin', '==', true));
            
            const adminSnapshot = await getDocs(adminQuery);
            if (adminSnapshot.empty) throw new Error("Admin account not found.");
            const adminRef = adminSnapshot.docs[0].ref;

            const [menteeDoc, mentorDoc, adminDoc] = await Promise.all([
              transaction.get(menteeRef),
              transaction.get(mentorRef),
              transaction.get(adminRef)
            ]);

            if (!menteeDoc.exists() || !mentorDoc.exists() || !adminDoc.exists()) {
                throw new Error("One or more user profiles not found for transaction.");
            }

            const menteeData = menteeDoc.data() as UserProfile;
            const mentorData = mentorDoc.data() as UserProfile;
            const adminData = adminDoc.data() as UserProfile;
            
            transaction.update(menteeRef, { coins: (menteeData.coins || 0) - cost });
            transaction.update(mentorRef, { coins: (mentorData.coins || 0) + mentorShare });
            transaction.update(adminRef, { coins: (adminData.coins || 0) + adminShare });

            // Create transaction logs
            const description = `Session for ${skill} with ${isMentor ? sessionData.menteeName : sessionData.mentorName}`;
            
            const menteeTxRef = doc(collection(db, "transactions"));
            transaction.set(menteeTxRef, {
                userId: menteeId, type: 'debit', amount: cost, description,
                relatedSessionId: sessionId, timestamp: serverTimestamp(),
            });

            const mentorTxRef = doc(collection(db, "transactions"));
            transaction.set(mentorTxRef, {
                userId: mentorId, type: 'credit', amount: mentorShare, description,
                relatedSessionId: sessionId, timestamp: serverTimestamp(),
            });

            const adminTxRef = doc(collection(db, "transactions"));
            transaction.set(adminTxRef, {
                userId: adminDoc.id, type: 'credit', amount: adminShare, description: `Admin fee for session: ${sessionId}`,
                relatedSessionId: sessionId, timestamp: serverTimestamp(),
            });
        }
        
        transaction.update(sessionRef, { ...updateData, updatedAt: serverTimestamp() });
        return { ...sessionData, ...updateData };
    });
};


export const getReviewsForUser = async (userId: string): Promise<Review[]> => {
    const reviewsCollection = collection(db, 'reviews');
    const q = query(reviewsCollection, where('mentorId', '==', userId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const reviews: Review[] = [];
    querySnapshot.forEach((doc) => {
        reviews.push({ id: doc.id, ...doc.data() } as Review);
    });
    return reviews;
}

export const submitReview = async (reviewData: Omit<Review, 'id' | 'createdAt'>) => {
    return runTransaction(db, async (transaction) => {
        const sessionRef = doc(db, 'sessions', reviewData.sessionId);
        
        const sessionDoc = await transaction.get(sessionRef);
        if (sessionDoc.exists() && sessionDoc.data().feedbackSubmitted) {
            throw new Error("Feedback has already been submitted for this session.");
        }
        
        const newReviewRef = doc(collection(db, 'reviews')); 
        transaction.set(newReviewRef, {
            ...reviewData,
            createdAt: serverTimestamp(),
        });
        
        transaction.update(sessionRef, { feedbackSubmitted: true, updatedAt: serverTimestamp() });
    });
};


export const getUserTransactions = async (userId: string): Promise<Transaction[]> => {
    const transactionsCollection = collection(db, 'transactions');
    const q = query(transactionsCollection, where('userId', '==', userId), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);

    const transactions: Transaction[] = [];
    querySnapshot.forEach((doc) => {
        transactions.push({ id: doc.id, ...doc.data() } as Transaction);
    });
    return transactions;
}

export const adjustUserCoins = async (userId: string, newCoinBalance: number) => {
    const userRef = doc(db, 'users', userId);
    return updateDoc(userRef, {
        coins: newCoinBalance,
        updatedAt: serverTimestamp(),
    });
}

// Get top users for leaderboard
export const getLeaderboard = async (count: number): Promise<UserProfile[]> => {
    const usersCollection = collection(db, "users");
    const q = query(usersCollection, orderBy("rating", "desc"), limit(count));
    const querySnapshot = await getDocs(q);
    const usersList = querySnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as UserProfile));
    return usersList;
}

    