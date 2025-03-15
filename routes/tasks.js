import { getDB } from "../db/db.js";
import { ObjectId } from "mongodb";
import { getCache, setCache, invalidateCache } from "../utils/cache.js";

export async function handleTasksRoutes(req, res) {
  try {
    const db = await getDB();
    const taskCollection = db.collection("tasks");

    if (req.method === "GET" && req.url.startsWith("/tasks")) {
      const cacheKey = `tasks_${req.user.userId}`;
      const cachedTasks = getCache(cacheKey);

      if (cachedTasks) {
        res.writeHead(200, {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=60",
        });
        res.end(JSON.stringify(cachedTasks));
        return;
      }
      const urlParams = new URL(req.url, `http://${req.headers.host}`);
      const filter =
        req.user.role === "admin" ? {} : { userId: req.user.userId };

      if (urlParams.searchParams.has("completed")) {
        filter.completed = urlParams.searchParams.get("completed") === "true";
      }

      if (urlParams.searchParams.has("priority")) {
        filter.priority = parseInt(urlParams.searchParams.get("priority"), 10);
      }
      // **************************
      const tasks = await taskCollection
        .find(filter)
        .project({
          title: 1,
          completed: 1,
          priority: 1,
        })
        .toArray();

      setCache(cacheKey, tasks, 60);
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      });
      res.end(JSON.stringify(tasks));
    } else if (req.method === "POST" && req.url === "/tasks") {
      let body = "";
      req.on("data", (chunck) => {
        body += chunck.toString();
      });
      req.on("end", async () => {
        const newTask = JSON.parse(body);
        if (!newTask.task) {
          throw new Error("Task is required");
        }
        newTask.userId = req.user.userId;
        const result = await taskCollection.insertOne(newTask);
        invalidateCache(`tasks_${req.user.userId}`);
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
    } else if (
      req.method.startsWith("PATCH") &&
      req.url.startsWith("/tasks/")
    ) {
      const taskId = req.url.split("/tasks/")[1];
      if (!ObjectId.isValid(taskId)) {
        res.writeHead(400, {
          "Content-Type": "application/json",
        });
        res.end(JSON.stringify({ message: "Invalid task ID" }));
        return;
      }

      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", async () => {
        const updates = JSON.parse(body);
        const filter =
          req.user.role === "admin"
            ? { _id: new ObjectId(taskId) }
            : { _id: new ObjectId(taskId), userId: req.user.userId };
        const result = await taskCollection.updateOne(filter, {
          $set: updates,
        });

        if (result.matchedCount === 0) {
          res.writeHead(404, {
            "Content-Type": "application/json",
          });
          res.end(JSON.stringify({ message: "Task not found" }));
          return;
        } else {
          invalidateCache(`tasks_${req.user.userId}`);
          res.writeHead(200, {
            "Content-Type": "application/json",
          });
          res.end(JSON.stringify({ message: "Task updated successfully" }));
        }
      });
    } else if (
      req.method.startsWith("DELETE") &&
      req.url.startsWith("/tasks/")
    ) {
      const taskId = req.url.split("/tasks/")[1];
      if (!ObjectId.isValid(taskId)) {
        res.writeHead(400, {
          "Content-Type": "application/json",
        });
        res.end(JSON.stringify({ message: "Invalid task ID" }));
        return;
      }

      const filter =
        req.user.role === "admin"
          ? { _id: new ObjectId(taskId) }
          : { _id: new ObjectId(taskId), userId: req.user.userId };

      const result = await taskCollection.deleteOne(filter);

      if (result.deletedCount === 0) {
        res.writeHead(404, {
          "Content-Type": "application/json",
        });
        res.end(JSON.stringify({ message: "Task not found" }));
        return;
      } else {
        invalidateCache(`tasks_${req.user.userId}`);
        res.writeHead(200, {
          "Content-Type": "application/json",
        });
        res.end(JSON.stringify({ message: "Task deleted successfully" }));
      }
    } else {
      res.writeHead(404, {
        "Content-Type": "application/json",
      });
      res.end(JSON.stringify({ message: "Route not found" }));
    }
  } catch (err) {
    console.error("Error handling tasks routes", err);
    res.writeHead(500, {
      "Content-Type": "application/json",
    });
    res.end(JSON.stringify({ message: "Internal server error" }));
  }
}
