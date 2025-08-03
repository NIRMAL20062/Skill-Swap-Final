// src/lib/firestore.ts
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore"; 
import { db } from "./firebase";

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  skillsToLearn?: string[];
  skillsToTeach?: string[];
  linkedinProfile?: string;
  githubProfile?: string;
  leetcodeProfile?: string;
  createdAt?: any;
  updatedAt?: any;
  profileComplete?: boolean;
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
    // Check for profile data from before profile saving was implemented.
    const a = await getDoc(doc(db, "user", uid));
    if (a.exists()) {
      return a.data() as UserProfile;
    }
    return null;
  }
};

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
