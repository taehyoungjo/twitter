from config import Tweet, User, tweets, users
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=None,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/start")
def start():
    return


class FeedResponse(BaseModel):
    users: list[User]
    tweets: list[Tweet]


@app.get("/feed")
def feed():
    return FeedResponse(users=users.users, tweets=tweets.tweets)
