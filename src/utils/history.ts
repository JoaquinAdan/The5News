export interface NewsRequest {
  topic: string | null;
  filterBy: string | null;
  requestedAt: string;
  failed?: boolean;
}

export const newsHistory: NewsRequest[] = [];

export const addToHistory = (topic: string | null, filterBy: string | null, failed = false) => {
  try {
    newsHistory.push({
      topic,
      filterBy,
      requestedAt: new Date().toISOString(),
      failed,
    });
    const maxHistoryLength = process.env.HISTORY_MAX_LENGTH ? parseInt(process.env.HISTORY_MAX_LENGTH) : 50;
    console.log(maxHistoryLength)
    if (newsHistory.length > maxHistoryLength) {
      newsHistory.shift();
    }
  } catch (error) {
    console.error("Failed to add to history:", error);
  }
};
