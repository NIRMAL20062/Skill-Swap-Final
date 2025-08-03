
// src/lib/firestore.ts
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, serverTimestamp, addDoc, query, where, getDocsFromServer } from "firebase/firestore"; 
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

  // First, get the existing profile to merge with new data
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
  });
};

// Function to get all sessions for a user (as mentee or mentor)
export const getUserSessions = async (userId: string): Promise<Session[]> => {
    const sessionsCollection = collection(db, 'sessions');
    const menteeQuery = query(sessionsCollection, where('menteeId', '==', userId));
    const mentorQuery = query(sessionsCollection, where('mentorId', '==', userId));

    const [menteeSnapshot, mentorSnapshot] = await Promise.all([
        getDocsFromServer(menteeQuery),
        getDocsFromServer(mentorQuery)
    ]);
    
    const sessions: Session[] = [];
    menteeSnapshot.forEach(doc => {
        sessions.push({ id: doc.id, ...doc.data() } as Session);
    });
    mentorSnapshot.forEach(doc => {
        // Avoid duplicates if a user is both mentee and mentor in the same session (unlikely but possible)
        if (!sessions.find(s => s.id === doc.id)) {
            sessions.push({ id: doc.id, ...doc.data() } as Session);
        }
    });

    return sessions.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
};


// Function to update a session's status
export const updateSessionStatus = async (sessionId: string, status: Session['status']) => {
    const sessionRef = doc(db, 'sessions', sessionId);
    return updateDoc(sessionRef, {
        status,
        updatedAt: serverTimestamp(),
    });
};
