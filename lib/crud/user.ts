// 1行目から
import { collection, getDocs, addDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";

export interface UserMaster {
  id?: string;
  name: string;
  createdAt?: any;
}

// ユーザー一覧を名前順で取得
export async function getUsers(): Promise<UserMaster[]> {
  const userRef = collection(db, "users");
  const q = query(userRef, orderBy("name", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserMaster));
}

// ユーザーをマスターに新規登録
export async function addUser(name: string): Promise<string> {
  const userRef = collection(db, "users");
  const docRef = await addDoc(userRef, {
    name,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}