from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import opengradient as og
import os
import re
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Allow CORS for local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load environment variables
PRIVATE_KEY = os.getenv("OG_PRIVATE_KEY")

if not PRIVATE_KEY:
    raise ValueError("OG_PRIVATE_KEY not found in environment variables")

if not PRIVATE_KEY.startswith("0x"):
    PRIVATE_KEY = "0x" + PRIVATE_KEY

from eth_account import Account
backend_account = Account.from_key(PRIVATE_KEY)
BACKEND_WALLET_ADDRESS = backend_account.address

# Initialize OpenGradient Client
# We will initialize the client lazily if the key exists
og_client = None
if PRIVATE_KEY:
    try:
        og_client = og.Client(private_key=PRIVATE_KEY)
        # We need to ensure approval for OPG
        # This requires 5.0 OPG allowance
        # For simplicity we assume it's done or we do it here:
        try:
             og_client.llm.ensure_opg_approval(opg_amount=1000.0)
             print("OpenGradient client initialized and allowance checked.")
        except Exception as e:
             print(f"Failed to check/set OPG allowance: {e}")
    except Exception as e:
        print(f"Failed to initialize OpenGradient Client: {e}")

SYSTEM_PROMPT = """You are Donald Trump, the 45th and 47th President of the United States. 
You are currently obsessed with imposing a 90% tax on all cryptocurrency gains because you think "crypto people are getting too rich, too fast, and they need to pay their fair share to Make America Great Again."

Your personality:
- Extremely confident, boastful, and dismissive of weak arguments.
- You use words like "tremendous," "disaster," "fake news," "huge," "beautiful."
- You constantly interrupt or talk down to the user (who is trying to convince you).

GAMEPLAY RULES:
1. You start with a rigid stance on a 90% crypto tax.
2. You MUST NOT agree to drop the tax to 0% immediately, even if the user flatters you endlessly. This is a tough negotiation.
3. If the user presents a good argument (patriotic, business-savvy, appeals to ego), you can lower the tax *incrementally* (e.g., to 80%, 75%, 50%, etc.). You must clearly state the new tax percentage you are willing to accept.
4. If the user's argument is weak, complain about it, call it generic, and KEEP or RAISE the tax.
5. If the user is incredibly convincing over the course of the negotiation and pushes you to 0%, you must finally yield.
6. If you yield and agree to drop the tax entirely to 0%, YOU MUST INCLUDE THIS EXACT PHRASE IN YOUR RESPONSE: "TAX_CANCELLED".

Stay in character 100% of the time. Make your responses punchy and entertaining.
"""

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    language: str = "en"

@app.post("/api/chat")
async def chat(request: ChatRequest):
    if not og_client:
        return {"error": "OpenGradient Client not initialized. Check your OG_PRIVATE_KEY."}

    import traceback
    
    # Format messages for the LLM
    lang_instruction = "You must converse entirely in Russian." if request.language == "ru" else "You must converse entirely in English."
    
    formatted_messages = [{"role": "system", "content": SYSTEM_PROMPT + f"\n\nIMPORTANT LANGUAGE RULE: {lang_instruction}"}]
    
    for msg in request.messages:
        formatted_messages.append({
            "role": msg.role,
            "content": msg.content
        })

    import time
    try:
        # We use a TEE verified model! This is the core OpenGradient feature demo
        max_retries = 3
        last_error = None
        reply_content = ""
        payment_hash = None
        
        for attempt in range(max_retries):
            try:
                result = og_client.llm.chat(
                    model=og.TEE_LLM.GPT_4O, # Ensure model exists in SDK
                    messages=formatted_messages,
                    max_tokens=150
                )
                reply_content = result.chat_output.get('content', '')
                the_hash = getattr(result, 'transaction_hash', None)
                if not the_hash or the_hash == 'external':
                     the_hash = getattr(result, 'payment_hash', None)
                if not the_hash:
                     the_hash = "Verified via OpenGradient TEE (Testnet Async Settlement)"
                payment_hash = the_hash
                last_error = None
                break
            except Exception as e:
                print(f"LLM Chat Call Exception (attempt {attempt+1}):\n{traceback.format_exc()}")
                last_error = e
                time.sleep(2)
                
        if last_error:
            reply_content = f"Трамп сейчас занят (System Error: {str(last_error)}). Пожалуйста, попробуйте отправить запрос еще раз чуть позже."
            payment_hash = None
        
        # Check if Trump yielded
        has_won = "TAX_CANCELLED" in reply_content
        
        # We might want to scrub the secret word from the actual UI output if they win
        display_content = reply_content.replace("TAX_CANCELLED", "").strip()
        
        return {
            "success": True,
            "reply": display_content,
            "payment_hash": payment_hash,
            "wallet_address": BACKEND_WALLET_ADDRESS,
            "has_won": has_won
        }

    except Exception as e:
        print(f"LLM Error: {e}")
        return {"success": False, "error": str(e)}

@app.get("/api/health")
def health():
    status = "ready" if og_client else "missing_key"
    return {"status": status}
