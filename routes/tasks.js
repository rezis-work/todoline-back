import { getDB } from "../db/db.js";

export async function handleTasksRoutes(req, res) {
  const db = await getDB();
  const taskCollection = db.collection("tasks");

  if (req.method === "GET" && req.url === "/tasks") {
    const tasks = await taskCollection.find({}).toArray();
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    });
    res.end(JSON.stringify(tasks));
  } else if (req.method === "POST" && req.url === "/tasks") {
    let body = "";
    req.on("data", (chunck) => {
      body += chunck;
    });
    req.on("end", async () => {
      const newTask = JSON.parse(body);
      const result = await taskCollection.insertOne(newTask);
      res.writeHead(201, {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      });
      res.end(
        JSON.stringify({
          message: "Task created successfully",
          taskId: result.insertedId,
        })
      );
    });
  } else {
    res.writeHead(404, {
      "Content-Type": "application/json",
    });
    res.end(JSON.stringify({ message: "Route not found" }));
  }
}
