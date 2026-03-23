import sys
import os
import pdfplumber
from sentence_transformers import SentenceTransformer
from pymongo import MongoClient
import dotenv
dotenv.load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))
db = client["devclash_core"]
collection = db["vault_vectors"]
model = SentenceTransformer('all-MiniLM-L6-v2')

def ingest_pdf(file_path, chapter_name):
    print(f"⏳ Processing: {chapter_name}...")
    chunks = []
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                paragraphs = [p.strip() for p in text.split("\n\n") if len(p.strip()) > 100]
                chunks.extend(paragraphs)

    docs_to_insert = []
    for i, chunk in enumerate(chunks):
        print(f"  Vectorizing chunk {i+1}/{len(chunks)}...", end="\r")
        vector = model.encode(chunk).tolist()
        docs_to_insert.append({
            "metadata": {"source": chapter_name, "chunk_id": i},
            "content": chunk,
            "embedding": vector
        })

    if docs_to_insert:
        collection.insert_many(docs_to_insert)
        print(f"\n✅ Done! {len(docs_to_insert)} chunks added for {chapter_name}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python ingest_chapter.py <path_to_pdf> <chapter_name>")
    else:
        ingest_pdf(sys.argv[1], sys.argv[2])
