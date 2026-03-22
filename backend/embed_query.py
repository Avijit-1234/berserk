import sys
import json

# Force Python to print exactly what it's doing to the error console
print(">>> 1. Python Script Started", file=sys.stderr)

try:
    from sentence_transformers import SentenceTransformer
    print(">>> 2. Libraries Imported Successfully", file=sys.stderr)
except Exception as e:
    print(f">>> CRASH AT IMPORT: {e}", file=sys.stderr)
    sys.exit(1)

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No query provided"}))
        sys.exit(1)
        
    query = sys.argv[1]
    print(f">>> 3. Query Received: '{query}'", file=sys.stderr)
    
    try:
        print(">>> 4. Loading AI Model (If it hangs here, it is downloading...)", file=sys.stderr)
        model = SentenceTransformer('all-MiniLM-L6-v2')
        
        print(">>> 5. Model Loaded! Generating Vector...", file=sys.stderr)
        embedding = model.encode(query).tolist()
        
        print(">>> 6. Success! Outputting JSON.", file=sys.stderr)
        print(json.dumps(embedding)) # This is the only thing Node.js will read
        
    except Exception as e:
        print(f">>> CRASH DURING AI EXECUTION: {e}", file=sys.stderr)
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()