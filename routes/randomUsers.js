import { getDB } from "../db/db.js";

export async function handleRandomUsersRoutes(req, res) {
  const db = await getDB();
  const userCollection = db.collection("users");

  if (req.method === "GET" && req.url === "/users/random") {
    try {
      const randomUsers = await userCollection
        .aggregate([
          { $sample: { size: 3 } },
          { $project: { username: 1, email: 1, _id: 0 } },
        ])
        .toArray();

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(randomUsers));
    } catch (err) {
      console.error("Error fetching random users", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Internal server error" }));
    }
  } else {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Not found" }));
  }
}
