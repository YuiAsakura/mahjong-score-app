// lib/firestore.ts
import { collection, doc } from "firebase/firestore";
import { db } from "../firebase";

// sessions コレクション
export const sessionsCol = collection(db, "sessions");

// sessionId のドキュメント
export const sessionDoc = (sessionId: string) =>
  doc(db, "sessions", sessionId);

// sessionId/hanchans
export const hanchansCol = (sessionId: string) =>
  collection(db, "sessions", sessionId, "hanchans");

// sessionId/hanchans/hanchanId
export const hanchanDoc = (sessionId: string, hanchanId: string) =>
  doc(db, "sessions", sessionId, "hanchans", hanchanId);

// sessionId/hanchans/hanchanId/rounds
export const roundsCol = (sessionId: string, hanchanId: string) =>
  collection(db, "sessions", sessionId, "hanchans", hanchanId, "rounds");

// sessionId/hanchans/hanchanId/rounds/roundId
export const roundDoc = (
  sessionId: string,
  hanchanId: string,
  roundId: string
) =>
  doc(
    db,
    "sessions",
    sessionId,
    "hanchans",
    hanchanId,
    "rounds",
    roundId
  );