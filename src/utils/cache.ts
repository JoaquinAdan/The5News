import { createCache } from "cache-manager";

export const cache = createCache({
  ttl: process.env.CACHE_TTL_MILLISECONDS ? parseInt(process.env.CACHE_TTL_MILLISECONDS) : 10 * 60 * 1000,
  refreshThreshold: process.env.REFRESH_THRESHOLD_MILLISECONDS ? parseInt(process.env.REFRESH_THRESHOLD_MILLISECONDS) : 60 * 1000,
});
