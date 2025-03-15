import { getDB } from "../db/db.js";
import { ObjectId } from "mongodb";

export async function handleAdminRoutes(req, res) {
  const db = await getDB();
  const userCollection = db.collection("users");
  const taskCollection = db.collection("tasks");

  try {
    if (req.method === "DELETE" && req.url.startsWith("/users/")) {
      if (req.user.role !== "admin") {
        res.writeHead(403, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Forbidden" }));
        return;
      }

      const userId = req.url.split("/users/")[1];

      if (!ObjectId.isValid(userId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid user ID" }));
        return;
      }

      const user = await userCollection.findOne({ _id: new ObjectId(userId) });

      if (!user) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "User not found" }));
        return;
      }

      await userCollection.deleteOne({ _id: new ObjectId(userId) });

      await taskCollection.deleteMany({ userId: userId });

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "User and associated tasks deleted successfully",
        })
      );
    } else {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid request" }));
    }
  } catch (error) {
    console.error("Error in admin routes:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}
