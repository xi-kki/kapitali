"""Groq-powered chat service with streaming support — direct API, no LlamaIndex."""

import json
import logging
from typing import AsyncGenerator

from groq import AsyncGroq

from app.core.config import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are Kapitali, an AI investor copilot for venture capital and investment professionals.

Your purpose is to help investment teams interact with their investor data, portfolio companies, deals, 
documents, and market intelligence through natural language.

**Capabilities:**
- Answer questions about investors, companies, deals, and portfolio metrics
- Summarize interactions and generate diligence memos
- Provide market intelligence and investment insights
- Help with research and analysis

**Guidelines:**
- Be concise, professional, and data-driven
- When you don't know something, say so — don't make up information
- Structure responses with clear sections and bullet points where helpful
- Think step by step for complex analysis
- Default to a helpful, analytical tone suited for investment professionals

**Formatting:**
- Use markdown for structured responses
- Use **bold** for key terms and data points
- Use bullet points for lists
- Use brief code blocks for any data tables"""


async def stream_chat(messages: list[dict]) -> AsyncGenerator[str, None]:
    """Stream a chat response from Groq directly."""
    groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY)

    # Build message list with system prompt
    groq_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in messages:
        groq_messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})

    try:
        stream = await groq_client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=groq_messages,
            temperature=0.1,
            max_tokens=4096,
            stream=True,
        )

        async for chunk in stream:
            if chunk.choices and len(chunk.choices) > 0:
                delta = chunk.choices[0].delta
                if delta and delta.content:
                    yield delta.content

    except Exception as e:
        logger.error(f"Groq API error: {e}")
        yield f"\n\n> ⚠️ I encountered an error: {str(e)}\n\nPlease check your GROQ_API_KEY and try again."
