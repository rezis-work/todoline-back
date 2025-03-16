const rateLimitStore = new Map();

export function rateLimiter(req, res, next, limit, windowMs) {
  const now = Date.now();

  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress ||
    "unknown";

  const key = process.env.NODE_ENV === "production" ? ip : "global_limit";

  console.log("\n=== Rate Limiter Debug ===");
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`IP Address: ${ip}`);
  console.log(`Using key: ${key}`);

  if (!rateLimitStore.has(key)) {
    console.log("Initializing new rate limit entry");
    rateLimitStore.set(key, []);
  }

  const timeStamps = rateLimitStore.get(key);

  const currentTimeStamps = timeStamps.filter((timeStamp) => {
    const isValid = now - timeStamp < windowMs;
    return isValid;
  });

  console.log(
    `Current window size: ${windowMs}ms (${windowMs / 1000} seconds)`
  );
  console.log(`Request count: ${currentTimeStamps.length + 1} of ${limit}`);
  console.log(`Timestamps in window:`, currentTimeStamps);

  if (currentTimeStamps.length >= limit) {
    console.log("❌ Rate limit exceeded!");
    res.writeHead(429, {
      "Content-Type": "application/json",
      "X-RateLimit-Limit": limit,
      "X-RateLimit-Remaining": 0,
      "X-RateLimit-Reset": Math.ceil(
        (Math.min(...currentTimeStamps) + windowMs) / 1000
      ),
    });
    res.end(
      JSON.stringify({
        error: "Too many requests, please try again later",
        currentCount: currentTimeStamps.length,
        limit: limit,
        windowMs: windowMs,
        tryAgainIn: `${Math.ceil(windowMs / 1000)} seconds`,
      })
    );
    return;
  }

  currentTimeStamps.push(now);
  rateLimitStore.set(key, currentTimeStamps);

  console.log("✅ Request allowed");
  console.log("======================\n");

  res.setHeader("X-RateLimit-Limit", limit);
  res.setHeader("X-RateLimit-Remaining", limit - currentTimeStamps.length);

  next();
}
