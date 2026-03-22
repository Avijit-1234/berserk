import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Interaction from './models/Interaction.js';
import { getVaultResponse } from './vaultEngine.js'; // <-- THIS FIXES THE CRASH

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MONGO DB CLOUD: Connected to devclash_core'))
  .catch(err => console.error('❌ MONGO DB ERROR:', err));

app.get('/api/status', (req, res) => {
  res.json({ status: "DevClash Backend Online" });
});

// THE UNIFIED RAG ENDPOINT
app.post('/api/tutor', async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: "Question required." });

  try {
    const data = await getVaultResponse(question);

    if (data.topic !== "Unknown") {
      await Interaction.create({
        studentId: "demo_student_01",
        questionAsked: question,
        coreConcept: data.topic
      });
      console.log(`[LOGGED] Core Concept Weakness: ${data.topic}`);
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: `TUTOR_ERROR: ${err.message}` });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});