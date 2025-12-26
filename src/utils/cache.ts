import { createCache } from "cache-manager";

export const cache = createCache({
  ttl: 10 * 60 * 1000,       
  refreshThreshold: 60 * 1000, 
});