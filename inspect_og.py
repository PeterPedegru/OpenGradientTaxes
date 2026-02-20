import opengradient as og
import os
from dotenv import load_dotenv

load_dotenv()
pk = os.environ.get("OG_PRIVATE_KEY")
if not pk.startswith("0x"): pk = "0x" + pk

client = og.Client(private_key=pk)
try:
    print("Sending chat request...")
    res = client.llm.chat(
        model=og.TEE_LLM.GPT_4O,
        messages=[{"role": "user", "content": "hello"}],
        max_tokens=10
    )
    print("Response fields:")
    print(dir(res))
    print("Vars:")
    print(vars(res))
except Exception as e:
    print("Error:", e)
