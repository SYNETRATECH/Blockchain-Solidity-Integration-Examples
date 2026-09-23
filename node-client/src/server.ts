import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { blockchainService } from "./blockchain";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Welcome Route
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Welcome to the Node.js TypeScript Web3 API!",
    status: "Running",
    endpoints: {
      "GET": "/api/greeting",
      "POST": "/api/greeting"
    }
  });
});

// Read from Blockchain
app.get("/api/greeting", async (req: Request, res: Response) => {
  try {
    const greeting = await blockchainService.getGreeting();
    res.json({ greeting });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Write to Blockchain
app.post("/api/greeting", async (req: Request, res: Response) => {
  try {
    const { greeting } = req.body;
    
    if (!greeting || typeof greeting !== "string") {
      return res.status(400).json({ error: "Invalid or missing 'greeting' field" });
    }

    const txHash = await blockchainService.setGreeting(greeting);
    res.json({ transaction_hash: txHash, status: "Success" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
  console.log(`📚 Endpoints:`);
  console.log(`   GET  http://localhost:${port}/api/greeting`);
  console.log(`   POST http://localhost:${port}/api/greeting`);
});
