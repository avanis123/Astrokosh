import subprocess


def generate_answer(question: str, context_chunks: list) -> str:
    """
    Generate answer using local Ollama LLM.
    Uses ONLY retrieved context.
    """

    context_text = "\n\n".join(
        f"- {chunk['text']}" for chunk in context_chunks
    )

    prompt = f"""
You are a scientific assistant.

Answer the question using ONLY the context below.
If the answer is not in the context, say:
"Information not found in the provided documents."

Question:
{question}

Context:
{context_text}

Instructions:
- Write a clean, concise answer
- Use bullet points
- Do not repeat information
- Do not add external knowledge
"""
    OLLAMA_PATH = r"C:\Users\Avni Jain\AppData\Local\Programs\Ollama\ollama.exe"
    result = subprocess.run(
        [OLLAMA_PATH, "run", "llama3.1:8b"],
        input=prompt,
        text=True,
        capture_output=True
    )

    return result.stdout.strip()
