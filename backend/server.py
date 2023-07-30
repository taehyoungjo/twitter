from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# 1. need to build timeline


class User(BaseModel):
    handle: str  # the @handle
    name: str  # displayed name
    bio: str


class Tweet(BaseModel):
    """
    Tweets include quotes and replies.
    """

    user_id: int  # person who made the tweet
    likes: list[int]  # list of user_ids who liked
    retweets: list[int]  # list of user_ids who retweeted
    comments: list[int]  # list of tweet_ids that are replies
    timestamp: int  # unix timestamp, not using for now
    content: str  # the actual text of the tweet


class Quote(Tweet):
    quoted_tweet_id: int  # the tweet_id of the tweet being quoted


class Comment(Tweet):
    parent_tweet_id: int


# Global state
users: list[User] = []
tweets: list[Tweet] = []


# Initialize tweets with some dummy data
def init_tweets():
    users = [
        User(handle="elonmusk", name="Elon Musk", bio="Technoking of Tesla"),
        User(handle="jack", name="Jack Dorsey", bio="CEO of Twitter"),
        User(handle="sundarpichai", name="Sundar Pichai", bio="CEO of Google"),
        User(handle="satyanadella", name="Satya Nadella", bio="CEO of Microsoft"),
    ]

    tweets = [
        Tweet(
            user_id=0,
            likes=[1, 2, 3],
            retweets=[3],
            comments=[1],
            timestamp=0,
            content="I love Twitter!",
        ),
        Comment(
            user_id=1,
            likes=[],
            retweets=[2],
            comments=[],
            timestamp=0,
            content="I love Tesla!",
            parent_tweet_id=0,
        ),
        Quote(
            user_id=2,
            likes=[],
            retweets=[],
            comments=[],
            timestamp=0,
            content="I love Google!",
            quoted_tweet_id=0,
        ),
    ]
    return users, tweets


users, tweets = init_tweets()


@app.post("/start")
def start():
    return


class FeedResponse(BaseModel):
    users: list[User]
    tweets: list[Tweet]


@app.get("/feed")
def feed():
    return FeedResponse(users=users, tweets=tweets)
