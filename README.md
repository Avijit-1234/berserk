# Deep Work Environment — AI Learning Companion for Competitive Exams
> Built for Dev Clash Hackathon. A focused study environment for JEE, NEET, and UPSC aspirants combining an AI tutor, RAG-powered NCERT Vault, focus tracking, and performance analytics.

---


<img width="1920" height="1080" alt="s01" src="https://github.com/user-attachments/assets/f00e11d2-c4a0-4120-a438-4f5d0d8fed96" />

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (with Vector Search) |
| AI Engine | Groq API (Llama 3.3 70B) |
| RAG / Embeddings | Python, sentence-transformers, all-MiniLM-L6-v2 |
| PDF Extraction | pdfplumber |

---

## Dependencies

### Node.js (Backend)
```
express, mongoose, cors, dotenv, groq-sdk
```

### Node.js (Frontend)
```
react, react-dom, react-markdown, remark-math, rehype-katex, katex, tailwindcss
```

### Python (RAG Engine)
```
sentence-transformers==2.7.0
transformers==4.44.2
huggingface_hub==0.23.4
torch==2.2.2 (CPU)
pdfplumber==0.11.4
pymongo==4.7.2
python-dotenv==1.0.1
numpy<2
```

---

## Installation

### Prerequisites
- Node.js v18+
- Python 3.10+
- MongoDB Atlas account (free tier works)
- Groq API key (free at console.groq.com)

---

### Linux / macOS

```bash
# 1. Clone the repo
git clone https://github.com/Avijit-1234/berserk.git
cd berserk

# 2. Set up environment variables
cp backend/.env.example backend/.env
# Open backend/.env and fill in your GROQ_API_KEY and MONGO_URI

# 3. Install backend Node dependencies
cd backend && npm install && cd ..

# 4. Install frontend Node dependencies
cd frontend && npm install && cd ..

# 5. Set up Python virtual environment
python3 -m venv backend/.venv

# 6. Install Python dependencies
backend/.venv/bin/python -m pip install torch==2.2.2 --index-url https://download.pytorch.org/whl/cpu
backend/.venv/bin/python -m pip install -r backend/requirements.txt
backend/.venv/bin/python -m pip install "numpy<2"

# 7. Test the RAG engine
backend/.venv/bin/python backend/embed_query.py "What is a Mendelian disorder?"
# You should see a large array of numbers — working correctly.

# 8. Start the backend (terminal 1)
cd backend && node server.js

# 9. Start the frontend (terminal 2)
cd frontend && npm run dev
```

---

### Windows

```powershell
# 1. Clone the repo
git clone https://github.com/Avijit-1234/berserk.git
cd berserk

# 2. Set up environment variables
copy backend\.env.example backend\.env
# Open backend\.env and fill in your GROQ_API_KEY and MONGO_URI

# 3. Install dependencies
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 4. Set up Python virtual environment
python -m venv backend\.venv

# 5. Install Python dependencies
backend\.venv\Scripts\python -m pip install torch==2.2.2 --index-url https://download.pytorch.org/whl/cpu
backend\.venv\Scripts\python -m pip install -r backend\requirements.txt
backend\.venv\Scripts\python -m pip install "numpy<2"

# 6. Test the RAG engine
backend\.venv\Scripts\python backend\embed_query.py "What is a Mendelian disorder?"

# 7. Start the backend (terminal 1)
cd backend && node server.js

# 8. Start the frontend (terminal 2)
cd frontend && npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Environment Variables

Create `backend/.env` from the template:

```
GROQ_API_KEY=your_groq_api_key_here
MONGO_URI=your_mongodb_atlas_connection_string_here
```

---

## Project Structure

```
/
├── backend/
│   ├── server.js          # Express API server
│   ├── vaultEngine.js     # RAG orchestrator
│   ├── embed_query.py     # Python embedding script
│   ├── ingest_chapter.py  # PDF ingestion script
│   ├── models/            # Mongoose schemas
│   ├── requirements.txt   # Python dependencies
│   └── .env.example       # Environment variable template
└── frontend/
    └── src/
        └── components/    # React components
```
