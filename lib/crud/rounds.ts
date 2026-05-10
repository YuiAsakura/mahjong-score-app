// lib/crud/rounds.ts
import {
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
} from "firebase/firestore";

import { roundsCol, roundDoc } from "../firestore";
import { Round } from "../types/round";

// Create
export const createRound = async (
  sessionId: string,
  hanchanId: string,
  data: Omit<Round, "id">
) => {
  const ref = await addDoc(roundsCol(sessionId, hanchanId), data);
  return ref.id;
};

// Read all
export const getAllRounds = async (sessionId: string, hanchanId: string) => {
  const snapshot = await getDocs(roundsCol(sessionId, hanchanId));
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Round[];
};

// Read one
export const getRound = async (
  sessionId: string,
  hanchanId: string,
  roundId: string
) => {
  const snap = await getDoc(roundDoc(sessionId, hanchanId, roundId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Round;
};

// Update
export const updateRound = async (
  sessionId: string,
  hanchanId: string,
  roundId: string,
  data: Partial<Round>
) => {
  await updateDoc(roundDoc(sessionId, hanchanId, roundId), data);
};

// Delete
export const deleteRound = async (
  sessionId: string,
  hanchanId: string,
  roundId: string
) => {
  await deleteDoc(roundDoc(sessionId, hanchanId, roundId));
};