"use strict";

const createSlidingWindow = require("../../security-utils-nodejs/rate-limit");

const WINDOW_MS: number = 60 * 1000;
const MAX_REQUESTS: number = Number(process.env.DB_GATEWAY_QPS_PER_MIN || 30);

const limiter = createSlidingWindow({
  windowMs: WINDOW_MS,
  maxRequests: MAX_REQUESTS,
  keyFn: (service: string, store: string): string => (service ? `${service}::${store || "*"}` : ""),
  reasonOnDeny: "L4_rate_limit",
});

/**
 * @param service - The service name
 * @param store - The store identifier
 * @returns Backward-compat boolean.
 */
async function check(service: string, store: string): Promise<boolean> {
  const result = await limiter.check(service, store);
  return result.ok;
}

export = { check, WINDOW_MS, MAX_REQUESTS };