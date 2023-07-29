# %%
import os
from enum import Enum

from dotenv import load_dotenv
from langchain.llms import Anthropic
from pydantic import BaseModel

load_dotenv()
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")


class User(BaseModel):
    handle: str
    name: str
    bio: str


class ActionType(Enum):
    COMMENT = 1
    LIKE = 2
    RETWEET = 3
    QUOTE = 4


class Tweet(BaseModel):
    name: str  # this is a user's name
    content: str  # content of the tweet


class Action(BaseModel):
    target: Tweet
    type: ActionType
    content: str


class UserData(BaseModel):
    handle: str
    name: str
    bio: str
    activity: list[Action]


# %%
llm = Anthropic(
    anthropic_api_key=ANTHROPIC_API_KEY,
    model="claude-2",
    temperature=0.8,
)

llm.generate(["\n\nHuman: Hi, my name is John.\n\nAssistant: Hi, "])
