interface CreateEntryRequest {
  date: string;
  time: string;
  moodId: string;
  activityIds: string[];
  note?: string;
}

interface UpdateEntryRequest {
  date?: string;
  time?: string;
  moodId?: string;
  activityIds?: string[];
  note?: string;
}
