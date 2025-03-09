import http from "http";
import dotenv from "dotenv";
import { handleTasksRoutes } from "./routes/tasks.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer((req, res) => {
  handleTasksRoutes(req, res);
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
