import opengradient as og
import os
from dotenv import load_dotenv

load_dotenv()
pk = os.environ.get("OG_PRIVATE_KEY")
if not pk.startswith("0x"): pk = "0x" + pk

client = og.Client(private_key=pk)
res = client.llm.chat(
    model=og.TEE_LLM.GPT_4O,
    messages=[{"role": "user", "content": "hi"}],
    max_tokens=5,
    x402_settlement_mode=og.x402SettlementMode.SETTLE
)
print("Payment Hash:", res.payment_hash)
print("Transaction Hash:", res.transaction_hash)
