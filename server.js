import http from "http";
import dotenv from "dotenv";
import { handleTasksRoutes } from "./routes/tasks.js";
import { connectDB } from "./db/db.js";
import { handleAuthRoutes } from "./routes/auth.js";
import { authenticate } from "./middleware/authMiddleware.js";
import { rateLimiter } from "./middleware/rateLimiter.js";
import { logInfo } from "./utils/logger.js";
import { handleProfileRoutes } from "./routes/profile.js";
import { handleRandomUsersRoutes } from "./routes/randomUsers.js";
import { handleCors } from "./middleware/cors.js";
import { handleAdminRoutes } from "./routes/adminRoutes.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();

  const server = http.createServer((req, res) => {
    if (handleCors(req, res)) return;
    if (req.url.startsWith("/auth")) {
      rateLimiter(
        req,
        res,
        () => handleAuthRoutes(req, res),
        30,
        15 * 60 * 1000
      );
    } else {
      rateLimiter(req, res, () => {
        authenticate(
          req,
          res,
          () => {
            logInfo(`User ${req.user.username} accessed ${req.url}`);
            if (req.url.startsWith("/profile")) {
              handleProfileRoutes(req, res);
            } else if (req.url.startsWith("/users/random")) {
              handleRandomUsersRoutes(req, res);
            } else if (req.url.startsWith("/users/")) {
              handleAdminRoutes(req, res);
            } else {
              handleTasksRoutes(req, res);
            }
          },
          60,
          60 * 1000
        );
      });
    }
  });

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer().catch((err) => console.error("Failed to start server", err));
