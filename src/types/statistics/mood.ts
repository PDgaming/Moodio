interface MoodStatistics {
  totalEntries: number;
  currentStreak: number;
  longestStreak: number;
  moodDistribution: MoodDistribution[];
  averageMood: number;
  moodOverTime: MoodOverTime[];
}

interface MoodDistribution {
  moodId: string;
  moodName: string;
  moodColor: string;
  count: number;
  percentage: number;
}

interface MoodOverTime {
  date: string;
  averageMood: number;
  entryCount: number;
}
