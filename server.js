import http from "http";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/html",
  });
  res.end(JSON.stringify({ message: "Server is running on port " + PORT }));
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
