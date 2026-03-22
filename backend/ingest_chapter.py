import sys
import os
from docling.document_converter import DocumentConverter
from sentence_transformers import SentenceTransformer
from pymongo import MongoClient
import dotenv

dotenv.load_dotenv()

# 1. Setup Connections
client = MongoClient(os.getenv("MONGO_URI"))
db = client["devclash_core"]
collection = db["vault_vectors"]
model = SentenceTransformer('all-MiniLM-L6-v2')
converter = DocumentConverter()

def ingest_pdf(file_path, chapter_name):
    print(f"⏳ Processing: {chapter_name}...")
    
    # 2. Extract Text using Docling
    result = converter.convert(file_path)
    text_content = result.document.export_to_markdown()
    
    # 3. Simple Chunking (by Paragraph/Double Newline)
    chunks = [c.strip() for c in text_content.split("\n\n") if len(c.strip()) > 100]
    
    docs_to_insert = []
    for i, chunk in enumerate(chunks):
        print(f"  Vectorizing chunk {i+1}/{len(chunks)}...", end="\r")
        vector = model.encode(chunk).tolist()
        
        docs_to_insert.append({
            "metadata": {
                "source": chapter_name,
                "chunk_id": i,
                "page_context": f"Chapter: {chapter_name}"
            },
            "content": chunk,
            "embedding": vector
        })

    # 4. Push to Sandbox Vault
    if docs_to_insert:
        collection.insert_many(docs_to_insert)
        print(f"\n✅ Successfully added {len(docs_to_insert)} chunks to the vault!")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python ingest_chapter.py <path_to_pdf> <chapter_name>")
    else:
        ingest_pdf(sys.argv[1], sys.argv[2])