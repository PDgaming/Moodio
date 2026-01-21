interface Entry {
  id: string;
  userId: string;
  date: string;
  time: string;
  moodId: string;
  activityIds: string[];
  note: string | null;
  createdAt: string;
  updatedAt: string;
  syncedAt: Date | null;
}
