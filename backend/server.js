import express from "express";
import cors from "cors";
import { spawn } from "child_process";
import path from "path";
import mongoose from 'mongoose';
import Message from './models/message.js'; // adjust path if needed

const app = express();
app.use(cors());
app.use(express.json());

// Start Python engine once
const python = spawn("/home/dwarakesh/base/bin/python3", [
  path.join(process.cwd(), "../python_engine/engine_server.py")
]);

let ready = false;

// Read stderr for logs + ready signal
python.stderr.on("data", (data) => {
  const msg = data.toString();
  console.log("[PY]", msg.trim());
  if (msg.includes("READY")) ready = true;
});

// Tiny queue to handle async replies
let callbacks = [];
python.stdout.on("data", (data) => {
  const lines = data.toString().trim().split("\n");
  for (const line of lines) {
    const cb = callbacks.shift();
    if (cb) cb(JSON.parse(line));
  }
});

// Helper to send request to python
function askPython(query) {
  return new Promise((resolve, reject) => {
    if (!ready) return reject("Python engine not ready");

    callbacks.push(resolve);
    python.stdin.write(JSON.stringify({ query }) + "\n");
  });
}

// connect to mongo
mongoose.connect("mongodb://127.0.0.1:27017/semantic_chat")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));


// API endpoint
app.post("/ask", async (req, res) => {
  try {
    const userQuery = req.body.query;

    // store user message
    await Message.create({
      role: "user",
      text: userQuery
    });

    const result = await askPython(userQuery);

    // store bot messages
    if (Array.isArray(result.response)) {
      for (const msg of result.response) {
        await Message.create({
          role: "bot",
          text: msg
        });
      }
    }

    res.json(result);

  } catch (err) {
    console.error("Error in /ask:", err);
    res.status(500).json({ error: err.toString() });
  }
});

app.get("/history", async (req, res) => {
  const messages = await Message.find().sort({ timestamp: 1 });
  res.json(messages);
});

// Clear chat history endpoint
app.post("/clear", async (req, res) => {
  try {
    // Delete all messages from database
    await Message.deleteMany({});
    
    // Create new initial greeting message
    const initialMessage = await Message.create({
      role: "bot",
      text: "Hi. I am Dwarakesh. Ask me anything."
    });

    res.json({ success: true, message: initialMessage });
  } catch (err) {
    console.error("Error clearing chat:", err);
    res.status(500).json({ error: err.toString() });
  }
});

app.listen(8000, () =>
  console.log("Node server running on http://localhost:8000")
);