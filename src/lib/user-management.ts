import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export interface UserData {
  email: string;
  name?: string;
  image?: string;
  provider?: string;
  providerId?: string;
  createdAt: Date;
  lastSignIn: Date;
  signInCount: number;
}

export async function createUser(userData: Partial<UserData>) {
  try {
    const userRef = doc(db, "users", userData.email!);
    await setDoc(userRef, {
      ...userData,
      createdAt: new Date(),
      lastSignIn: new Date(),
      signInCount: 1,
    });
    return true;
  } catch (error) {
    console.error("Error creating user:", error);
    return false;
  }
}

export async function updateUserSignIn(email: string) {
  try {
    const userRef = doc(db, "users", email);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const currentData = userDoc.data();
      await updateDoc(userRef, {
        lastSignIn: new Date(),
        signInCount: (currentData.signInCount || 0) + 1,
      });
    }
    return true;
  } catch (error) {
    console.error("Error updating user sign in:", error);
    return false;
  }
}

export async function getUserData(email: string): Promise<UserData | null> {
  try {
    const userRef = doc(db, "users", email);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        lastSignIn: data.lastSignIn?.toDate?.() || data.lastSignIn,
      } as UserData;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}


export async function getAllUsers(): Promise<UserData[]> {
  try {
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(usersRef);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        lastSignIn: data.lastSignIn?.toDate?.() || data.lastSignIn,
      } as UserData;
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
    return [];
  }
} 