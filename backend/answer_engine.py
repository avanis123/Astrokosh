from llama_cpp import Llama
import chromadb
from chromadb.config import Settings

# ---- Load the local LLM ----
MODEL_PATH = "models/llama/llama-3.2-1b.gguf"

llm = Llama(
    model_path=MODEL_PATH,
    n_ctx=2048,
    n_threads=6,
    verbose=False
)

# ---- Connect to ChromaDB ----
chroma_client = chromadb.Client(Settings(chroma_db_impl="duckdb+parquet", persist_directory="vector_db"))

collection = chroma_client.get_or_create_collection("astrokosh_docs")

# ---- Main Answer Function ----
def answer_question(query: str):
    # Step 1: Retrieve chunks from vector DB
    results = collection.query(
        query_texts=[query],
        n_results=5
    )

    context = "\n\n".join(results["documents"][0]) if results["documents"] else "No context found."

    # Step 2: Create prompt
    prompt = f"""
You are AstroKosh, an expert scientific assistant.
Use the context to answer the question.

CONTEXT:
{context}

QUESTION:
{query}

Answer clearly and factually. If the context does not contain the answer,
say: "The documents do not contain this information, but here is general knowledge:" and continue.
"""

    # Step 3: Run the model
    output = llm(prompt, max_tokens=300, temperature=0.2)

    return output["choices"][0]["text"]
