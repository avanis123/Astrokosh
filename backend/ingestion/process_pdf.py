import os
from ingestion.extractor import extract_text
from ingestion.chunker import chunk_text
from ingestion.embedder import embed_texts
from ingestion.store import init_collection, add_documents


def process_pdf(pdf_path: str, mission_name: str = None):
    print(f"\nProcessing PDF: {pdf_path}")

    # Extract text
    text = extract_text(pdf_path)

    # Chunk text
    chunks = chunk_text(text)
    print(f"Created {len(chunks)} text chunks.")

    # Embed
    embeddings = embed_texts(chunks)
    print("Generated embeddings.")

    # Metadata
    metadatas = []
    for i in range(len(chunks)):
        metadatas.append({
            "mission": mission_name or os.path.basename(pdf_path),
            "chunk_id": i,
            "source": os.path.basename(pdf_path)
        })

    # Store in DB
    collection = init_collection()
    add_documents(collection, chunks, metadatas, embeddings)

    print("✓ PDF processed and stored successfully!")

    # ⭐ Return summary dictionary
    return {
        "chunks": len(chunks),
        "text_length": len(text),
    }

