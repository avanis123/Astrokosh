import os
import time
from typing import Optional, List, Dict
import google.genai as genai
from google.genai import errors
from google.genai import types

def generate_answer_gemini(
    question: str, 
    context_chunks: list,
    structured_context: str | None = None, 
    question_type: str | None = None,
    conversation_history: Optional[List[Dict]] = None,
    preferred_model: str = "models/gemini-2.5-flash"
) -> str:
    """
    Generate answer using Gemini API with automatic fallback for 429 Quota errors.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable not set")

    client = genai.Client(
        api_key=api_key,
        http_options=types.HttpOptions(api_version='v1')
    )

    # 1. Prepare Content
    context_text = "\n\n".join(
        f"- {chunk['text']}" for chunk in context_chunks
    )
    structured_text = structured_context or "None"

    # 2. Prepare History
    history_text = ""
    if conversation_history:
        history_text = "\n\nPrevious Conversation Context:\n" + "="*50 + "\n"
        for msg in conversation_history:
            role = msg.get("role", "USER").upper()
            content = msg.get("content", "")[:300]
            history_text += f"{role}: {content}\n"
        history_text += "="*50 + "\n"

    # 3. Construct Prompt
    prompt = f"""You are a scientific assistant with memory of previous conversation context.

Answer the current question using ONLY the information provided below.
If the question references something from previous messages, use that context to provide continuity.

Instructions:
- Write a clean, concise answer
- Use bullet points
- Do NOT hallucinate or add external knowledge
- If information is incomplete, say so clearly
- For numeric questions, extract exact values

{history_text}

Current Question: {question}
Question type: {question_type or 'General'}

Structured Information: {structured_text}

Document Excerpts:
{context_text}
"""

    # 4. Try models in order of stability/preference
    # If 2.0-flash is 'exhausted', 1.5-flash is usually the most reliable backup.
    model_priority = [preferred_model,"models/gemini-2.5-pro",
    "models/gemini-2.0-flash-lite",
    "models/gemini-flash-latest",]

    for model_id in model_priority:
        try:
            response = client.models.generate_content(
                model=model_id,
                contents=prompt,
                config={
                    "temperature": 0.3,
                    "max_output_tokens": 1000,
                }
            )
            return response.text.strip()

        except errors.ClientError as e:
            # If rate limited, try the next model in the list
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                print(f"⚠️ Model {model_id} quota exhausted. Trying fallback...")
                continue 
            # If it's a different error (like a bad prompt), raise it
            return f"API Error: {str(e)}"
        except Exception as e:
            return f"Unexpected Error: {str(e)}"

    return "❌ All available Gemini models are currently rate-limited. Please try again in a few seconds."

def generate_answer(
    question: str, 
    context_chunks: list, 
    structured_context: str | None = None, 
    question_type: str | None = None,
    conversation_history: Optional[List[Dict]] = None
) -> str:
    """
    Standard entry point for the backend.
    """
    return generate_answer_gemini(
        question=question,
        context_chunks=context_chunks,
        structured_context=structured_context,
        question_type=question_type,
        conversation_history=conversation_history
    )