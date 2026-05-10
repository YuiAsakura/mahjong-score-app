// lib/crud/sessions.ts
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  deleteDoc,
  query, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "@/firebase";
import { Session } from "@/lib/types/session";

/**
 * すべてのセッションを日付の降順（新しい順）で取得する
 */
export const getSessions = async (): Promise<Session[]> => {
  try {
    const sessionsRef = collection(db, "sessions");
    const q = query(sessionsRef, orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Session));
  } catch (error) {
    console.error("Error getting sessions:", error);
    return [];
  }
};

/**
 * 特定のセッションをIDで1件取得する
 */
export const getSession = async (sessionId: string): Promise<Session | null> => {
  try {
    const sessionRef = doc(db, "sessions", sessionId);
    const docSnap = await getDoc(sessionRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Session;
    }
    return null;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
};

/**
 * 新規セッションを作成する
 */
export const createSession = async (data: Omit<Session, "id">): Promise<string> => {
  try {
    const sessionsRef = collection(db, "sessions");
    const docRef = await addDoc(sessionsRef, {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating session:", error);
    throw error;
  }
};

/**
 * セッションを削除する（追加）
 */
export const deleteSession = async (sessionId: string): Promise<void> => {
  try {
    const sessionRef = doc(db, "sessions", sessionId);
    await deleteDoc(sessionRef);
  } catch (error) {
    console.error("Error deleting session:", error);
    throw error;
  }
};