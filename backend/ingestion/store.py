from chromadb import PersistentClient

# Create / load a persistent Chroma DB
client = PersistentClient(path="../../vector_store")

def init_collection(name="astrokosh"):
    """Create or get collection."""
    try:
        collection = client.get_collection(name)
    except:
        collection = client.create_collection(name)
    return collection

def add_documents(collection, chunks, metadatas, embeddings):
    """Insert documents and embeddings into Chroma."""
    ids = [f"{collection.name}_{i}" for i in range(len(chunks))]
    collection.add(
        ids=ids,
        documents=chunks,
        metadatas=metadatas,
        embeddings=embeddings
    )
