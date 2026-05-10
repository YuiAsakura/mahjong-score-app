// lib/crud/hanchans.ts
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "@/firebase";
import { Hanchan } from "@/lib/types/hanchan";

/**
 * セッション内のすべての対局（半荘）を取得する
 * 作成日時順に並べて取得します
 */
export const getHanchans = async (sessionId: string): Promise<Hanchan[]> => {
  try {
    const hanchansRef = collection(db, "sessions", sessionId, "hanchans");
    // 作成日時（createdAt）で昇順にソート
    const q = query(hanchansRef, orderBy("createdAt", "asc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Hanchan));
  } catch (error) {
    console.error("Error getting hanchans:", error);
    return [];
  }
};

/**
 * 特定の対局（半荘）を1件取得する
 */
export const getHanchan = async (sessionId: string, hanchanId: string): Promise<Hanchan | null> => {
  try {
    const hanchanRef = doc(db, "sessions", sessionId, "hanchans", hanchanId);
    const docSnap = await getDoc(hanchanRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Hanchan;
    }
    return null;
  } catch (error) {
    console.error("Error getting hanchan:", error);
    return null;
  }
};

/**
 * 新しい対局（半荘）を作成する
 */
export const createHanchan = async (sessionId: string, data: Partial<Hanchan>): Promise<string> => {
  const hanchansRef = collection(db, "sessions", sessionId, "hanchans");
  
  // 初期状態をセットして保存
  const docRef = await addDoc(hanchansRef, {
    ...data,
    status: "active", // 最初は必ず進行中
    createdAt: serverTimestamp(),
    finalScore: data.finalScore || {},
  });
  
  return docRef.id;
};

/**
 * 対局（半荘）のデータ（スコアやステータス）を更新する
 */
export const updateHanchan = async (
  sessionId: string, 
  hanchanId: string, 
  data: Partial<Hanchan>
): Promise<void> => {
  try {
    const hanchanRef = doc(db, "sessions", sessionId, "hanchans", hanchanId);
    await updateDoc(hanchanRef, data);
  } catch (error) {
    console.error("Error updating hanchan:", error);
    throw error;
  }
};