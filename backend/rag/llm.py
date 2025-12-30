import subprocess


def generate_answer(question: str, context_chunks: list, structured_context: str | None = None, question_type: str | None = None
) -> str:
    """
    Generate answer using local Ollama LLM.
    Uses ONLY retrieved context.
    """

    context_text = "\n\n".join(
        f"- {chunk['text']}" for chunk in context_chunks
    )

    structured_text = structured_context or "None"

    prompt = f"""
You are a scientific assistant.

Answer the question using ALL the information below.

If structured data is incomplete, supplement it using document excerpts.
If information is partially available, answer with what is known.
Do NOT hallucinate missing facts.

Question:
{question}

Question type: {question_type}

Structured Information:
{structured_text}

Document Excerpts:
{context_text}

Instructions:
- Write a clean, concise answer
- Use bullet points
- Support both brief and detailed answers
- Do not repeat information
- Do not add external knowledge
- If question type is "numeric" or "measurement", extract exact values.
- If question type is "entity", list names if available.
- If question type is "comparison", clearly compare items.
"""
    OLLAMA_PATH = r"C:\Users\Avni Jain\AppData\Local\Programs\Ollama\ollama.exe"
    result = subprocess.run(
        [OLLAMA_PATH, "run", "llama3.1:8b"],
        input=prompt,
        text=True,
        encoding="utf-8",
        errors="ignore",
        capture_output=True
    )

    return result.stdout.strip()
