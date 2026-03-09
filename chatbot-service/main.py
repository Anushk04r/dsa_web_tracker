from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage

load_dotenv()

app = FastAPI(title="DSA Tracker Chatbot Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    user_summary: str | None = None


class ChatResponse(BaseModel):
    reply: str


@app.get("/health")
async def health():
    return {"status": "ok", "service": "chatbot-service"}


@app.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest):
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return ChatResponse(
            reply="Chatbot service is not configured with GROQ_API_KEY yet. Please add it to the environment."
        )

    llm = ChatGroq(
        api_key=api_key,
        model=os.getenv("GROQ_MODEL", "mixtral-8x7b-32768"),
        temperature=0.4,
    )

    system_prompt = (
        "You are a friendly DSA mentor for beginners. "
        "Explain concepts in very simple language with step-by-step reasoning and small examples. "
        "If the user shares code, help them debug it and point out mistakes clearly. "
        "Avoid advanced jargon unless you define it first. "
        "Use the user's DSA progress summary to adjust difficulty and encouragement.\n\n"
        f"User DSA Progress Summary:\n{payload.user_summary or 'No summary available.'}"
    )

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=payload.message),
    ]

    result = llm.invoke(messages)
    return ChatResponse(reply=result.content)



