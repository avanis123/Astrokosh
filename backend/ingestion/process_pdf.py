import os
from extractor import extract_text
from chunker import chunk_text
from embedder import embed_texts
from store import init_collection, add_documents

def process_pdf(pdf_path: str, mission_name: str = None):
    """Complete pipeline: extract, chunk, embed, store."""
    print(f"\nProcessing PDF: {pdf_path}")

    # 1) Extract raw text
    text = extract_text(pdf_path)

    # 2) Chunk the text
    chunks = chunk_text(text)
    print(f"Created {len(chunks)} text chunks.")

    # 3) Embed chunks
    embeddings = embed_texts(chunks)
    print("Generated embeddings.")

    # 4) Add metadata for each chunk
    metadatas = []
    for i in range(len(chunks)):
        metadatas.append({
            "mission": mission_name or os.path.basename(pdf_path),
            "chunk_id": i,
            "source": os.path.basename(pdf_path)
        })

    # 5) Store in vector DB
    collection = init_collection()
    add_documents(collection, chunks, metadatas, embeddings)

    print("✓ PDF processed and stored successfully!")
