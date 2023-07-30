from anthropic import Anthropic, HUMAN_PROMPT, AI_PROMPT
from dotenv import load_dotenv
import os

load_dotenv()

anthropic = Anthropic(
    # defaults to os.environ.get("ANTHROPIC_API_KEY")
    api_key=os.getenv("ANTHROPIC_API_KEY")
)

completion = anthropic.completions.create(
    model="claude-2",
    max_tokens_to_sample=300,
    prompt=f"{HUMAN_PROMPT} Here is some info about a twitter user. Simulate 100 possible responses she might have to an advertisement from peloton where a man gifts his wife a peloton for christmas. {AI_PROMPT}",
)
print(completion.completion)