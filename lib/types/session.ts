// lib/types/session.ts
export interface Session {
  id: string;
  date: string; // YYYY-MM-DD
  members: string[];
  memo: string;
}