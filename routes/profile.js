import { getDB } from "../db/db.js";
import { ObjectId } from "mongodb";

export async function handleProfileRoutes(req, res) {
  const db = await getDB();
  const userCollection = db.collection("users");

  if (req.method === "GET" && req.url === "/profile") {
    const user = await userCollection.findOne(
      { _id: new ObjectId(req.user.userId) },
      { projection: { username: 1, email: 1, phone: 1 } }
    );

    if (!user) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "User not found" }));
      return;
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(user));
  } else if (req.method === "PATCH" && req.url === "/profile") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", async () => {
      try {
        const updates = JSON.parse(body);
        const validFields = {};

        if (updates.username) validFields.username = updates.username;
        if (updates.email) validFields.email = updates.email;
        if (updates.phone) validFields.phone = updates.phone;

        if (Object.keys(validFields).length === 0) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "No valid fields to update" }));
          return;
        }

        await userCollection.updateOne(
          { _id: new ObjectId(req.user.userId) },
          { $set: validFields }
        );

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Profile updated successfully" }));
      } catch (error) {
        console.error("Error updating profile", error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Internal server error" }));
      }
    });
  }
}
