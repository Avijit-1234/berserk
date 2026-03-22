import { execFile } from 'child_process';
import mongoose from 'mongoose';
import Groq from 'groq-sdk';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config(); 

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 1. Python Embedding
function getEmbedding(text) {
  return new Promise((resolve, reject) => {
    const pythonExe = path.join(__dirname, '.venv', 'bin', 'python');
    const scriptPath = path.join(__dirname, 'embed_query.py');

    execFile(pythonExe, [scriptPath, text], { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      try {
        const lines = stdout.trim().split('\n');
        const lastLine = lines[lines.length - 1];
        
        const result = JSON.parse(lastLine);
        
        if (result.error) return reject(new Error(result.error));
        resolve(result);
      } catch (e) {
        console.error("--- RAW PYTHON OUTPUT ---");
        console.error(stdout);
        console.error("-------------------------");
        reject(new Error("Failed to parse vector embedding."));
      }
    });
  });
}

// 2. The Orchestrator
export async function getVaultResponse(question) {
  try {
    const vector = await getEmbedding(question);

    const vectorDb = mongoose.connection.client.db('devclash_core');
    const collection = vectorDb.collection('vault_vectors');
    
    const results = await collection.aggregate([
      {
        "$vectorSearch": {
          "index": "vector_index", 
          "path": "embedding",
          "queryVector": vector,
          "numCandidates": 50,
          "limit": 3 
        }
      },
      {
        "$project": {
          "_id": 0, "book": 1, "page": 1, "content": 1
        }
      }
    ]).toArray();

    if (results.length === 0) {
      return { answer: "No relevant NCERT data found in the Vault.", topic: "Unknown", sources: [] };
    }

    let contextText = results.map((r, i) => `[Source ${i+1}: Page ${r.page}]\n${r.content}`).join('\n\n');

    const strictPrompt = `
You are an AI Tutor. Use ONLY the provided textbook snippets.
Return your response in strict JSON format exactly like this:
{
  "answer": "Your synthesized explanation here",
  "topic": "The 1-3 word core concept being asked about (e.g., 'Mendelian Disorders', 'Cell Cycle')"
}

TEXTBOOK SNIPPETS:
${contextText}
    `.trim();

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: strictPrompt },
        { role: 'user', content: question }
      ],
      response_format: { type: "json_object" },
      max_tokens: 600,
      temperature: 0.1,
    });

    const aiData = JSON.parse(completion.choices[0].message.content);

    return {
      answer: aiData.answer,
      topic: aiData.topic,
      sources: results
    };

  } catch (err) {
    console.error("Vault Engine Error:", err);
    throw err;
  }
}