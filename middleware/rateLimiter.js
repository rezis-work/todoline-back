const rateLimitStore = new Map();

export function rateLimiter(req, res, next, limit, windowMs) {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const now = Date.now();

  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, []);
  }

  const timeStamps = rateLimitStore.get(ip);
  rateLimitStore.set(
    ip,
    timeStamps.filter((timeStamp) => now - timeStamp < windowMs)
  );

  if (timeStamps.length >= limit) {
    res.writeHead(429, {
      "Content-Type": "application/json",
    });
    res.end(
      JSON.stringify({
        error: "Too many requests, please try again later",
      })
    );
    return;
  }

  timeStamps.push(now);
  next();
}
