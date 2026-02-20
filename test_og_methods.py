import opengradient as og
import os
from dotenv import load_dotenv

load_dotenv()
pk = os.environ.get("OG_PRIVATE_KEY")
if not pk.startswith("0x"): pk = "0x" + pk
client = og.Client(private_key=pk)

print("Client methods:")
print([m for m in dir(client) if not m.startswith('_')])

print("Client.llm methods:")
print([m for m in dir(client.llm) if not m.startswith('_')])

try:
    print("Sending chat request...")
    res = client.llm.chat(
        model=og.TEE_LLM.GPT_4O,
        messages=[{"role": "user", "content": "hi"}],
        max_tokens=5
    )
    print("res vars:", vars(res))
except Exception as e:
    print("Error:", e)
