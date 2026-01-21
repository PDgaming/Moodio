import { Mood } from "./mood";

interface EnrichedEntry {
  id: string;
  userId: string;
  date: string;
  time: string;
  moodId: Mood;
  activityIds: string[];
  note: string | null;
  createdAt: string;
  updatedAt: string;
  syncedAt: Date | null;
}
