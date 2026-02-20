import opengradient as og
import os
from dotenv import load_dotenv
import json

load_dotenv()
pk = os.environ.get("OG_PRIVATE_KEY")
if not pk.startswith("0x"): pk = "0x" + pk
client = og.Client(private_key=pk)

res = client.llm.chat(
    model=og.TEE_LLM.GPT_4O,
    messages=[{"role": "user", "content": "hi"}],
    max_tokens=5
)

d = vars(res)
print("Keys:", d.keys())
for k, v in d.items():
    print(k, ":", v)
    if hasattr(v, '__dict__'):
        print("  ->", vars(v))
