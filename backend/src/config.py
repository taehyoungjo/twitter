# %%
from __future__ import annotations

import json
import os
import random
import xml.etree.ElementTree as ET
from enum import Enum
from typing import Optional
from uuid import uuid4

from dotenv import load_dotenv
from langchain.chat_models import ChatAnthropic
from langchain.schema import AIMessage, BaseMessage, HumanMessage
from pydantic import BaseModel, Field

load_dotenv()
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")


# %%
# Global state


class UserDatabase:
    def __init__(self):
        self.users: list[User] = []

    def add_user(self, user: User):
        user.user_id = len(self.users)
        self.users.append(user)

    def __getitem__(self, key: int):
        return self.users[key]


class TweetDatabase:
    def __init__(self):
        self.tweets: list[Tweet] = []
        self.run_id = uuid4()

    def add_tweet(self, tweet: Tweet):
        tweet.tweet_id = len(self.tweets)
        self.tweets.append(tweet)

    def get_timeline(self):
        # get at most last 50 tweets
        return self.tweets[-50:]

    def update_log(self):
        print("trying to write")
        with open("../runs/tweets-" + str(self.run_id) + ".json", "a") as f:
            json_string = "[" + ",".join([t.json() for t in self.tweets]) + "]"
            f.write(json_string)
            f.write("\n")

    def __getitem__(self, key: int):
        return self.tweets[key]


users: UserDatabase = UserDatabase()
tweets: TweetDatabase = TweetDatabase()

llm = ChatAnthropic(
    anthropic_api_key=ANTHROPIC_API_KEY,
    model="claude-2",
    temperature=0.2,
    max_tokens_to_sample=4096,
)


class ActionType(str, Enum):
    TWEET = "TWEET"
    QUOTE = "QUOTE"
    COMMENT = "COMMENT"
    LIKE = "LIKE"
    RETWEET = "RETWEET"


class Action(BaseModel):
    type: ActionType
    user_id: Optional[int]

    content: Optional[str] = None  # only none if type is LIKE or RETWEET

    parent_id: Optional[int] = None  # only if type is COMMENT or QUOTE
    parent_name: Optional[str] = None  # only if type is COMMENT or QUOTE
    parent_content: Optional[str] = None  # only if type is COMMENT or QUOTE

    # @classmethod
    # def from_data(
    #     cls,
    #     type: ActionType,
    #     user_id: int,
    #     content: str,
    #     parent_name: str,
    #     parent_content: str,
    # ):
    #     """
    #     Create an from data.
    #     Parent ID is assigned randomly, unfortunately.
    #     """
    #     parent_id = random.randint(0, 1000)

    #     return Action(
    #         type=type,
    #         user_id=user_id,
    #         content=content,
    #         parent_id=parent_id,
    #         parent_name=parent_name,
    #         parent_content=parent_content,
    #     )

    def __str__(self):
        if self.parent_id is None:
            self.parent_id = random.randint(0, 1000)
        if self.type == ActionType.TWEET:
            return f"""\
<tweet>
    {self.content}
</tweet>\
"""
        elif self.type == ActionType.QUOTE:
            return f"""\
<quote>
    <parent id="{self.parent_id}" author="{self.parent_name}">
        {self.parent_content}
    </parent>
    {self.content}
</quote>\
"""

        elif self.type == ActionType.COMMENT:
            return f"""\
<comment>
    <parent id="{self.parent_id}" author="{self.parent_name}">
        {self.parent_content}
    </parent>
    {self.content}
</comment>\
"""

        elif self.type == ActionType.LIKE:
            return f"""\
<like>
    <parent id="{self.parent_id}" author="{self.parent_name}">
        {self.parent_content}
    </parent>
</like>\
"""

        elif self.type == ActionType.RETWEET:
            return f"""\
<retweet>
    <parent id="{self.parent_id}" author="{self.parent_name}">
        {self.parent_content}
    </parent>
</retweet>\
"""
        else:
            raise ValueError("Invalid action type")


class User(BaseModel):
    user_id: int = -1  # sentinel
    handle: str
    name: str
    bio: str
    activity: list[Action] = Field(default_factory=list, exclude=True)


class TweetType(str, Enum):
    TWEET = "TWEET"
    QUOTE = "QUOTE"
    COMMENT = "COMMENT"  # not shown in timeline?


class Tweet(BaseModel):
    """
    Tweets include quotes and comments. Tweets only exist in timeline
    """

    type: TweetType
    tweet_id: int = -1  # sentinel
    user_id: int  # person who made the tweet
    likes: list[int] = Field(default_factory=list)  # list of user_ids who liked
    retweets: list[int] = Field(default_factory=list)  # list of user_ids who retweeted
    quotes: list[int] = Field(default_factory=list)  # list of tweet_ids that are quotes
    comments: list[int] = Field(
        default_factory=list
    )  # list of tweet_ids that are replies
    timestamp: int  # unix timestamp, not using for now
    content: str  # the actual text of the tweet

    parent_id: Optional[int] = None  # only if type is QUOTE or COMMENT

    # TODO: add validator for parent_tweet_id

    @property
    def parent_tweet(self) -> Tweet:
        if self.parent_id is None:
            raise ValueError("Tweet is not a quote or comment")

        return tweets[self.parent_id]

    @property
    def author(self) -> User:
        return users[self.user_id]

    def __str__(self):
        if self.type == TweetType.TWEET:
            return f"""\
<tweet id="{self.tweet_id}" author="{self.author.name}">
    {self.content}
</tweet>\
"""
        elif self.type == TweetType.QUOTE:
            return f"""\
<quote id="{self.tweet_id}" author="{self.author.name}">
    <parent id="{self.parent_id}" author="{self.parent_tweet.author.name}">
        {self.parent_tweet.content}
    </parent>
    {self.content}
</quote>\
"""

        elif self.type == TweetType.COMMENT:
            return f"""\
<comment id="{self.tweet_id}" author="{self.author.name}">
    <parent id="{self.parent_id}" author="{self.parent_tweet.author.name}">
        {self.parent_tweet.content}
    </parent>
    {self.content}
</comment>\
"""
        else:
            raise ValueError("Invalid tweet type")


# Initialize tweets with some dummy data
def init_tweets():
    users.add_user(
        User(handle="elonmusk", name="Elon Musk", bio="Technoking of Tesla"),
    )
    users.add_user(
        User(handle="jack", name="Jack Dorsey", bio="CEO of Twitter"),
    )
    users.add_user(
        User(handle="sundarpichai", name="Sundar Pichai", bio="CEO of Google"),
    )
    users.add_user(
        User(handle="satyanadella", name="Satya Nadella", bio="CEO of Microsoft"),
    )

    tweets.add_tweet(
        Tweet(
            type=TweetType.TWEET,
            user_id=0,
            likes=[1, 2, 3],
            retweets=[3],
            comments=[1],
            timestamp=0,
            content="I love Twitter!",
        )
    )
    tweets.add_tweet(
        Tweet(
            type=TweetType.COMMENT,
            user_id=1,
            likes=[],
            retweets=[2],
            comments=[],
            timestamp=0,
            content="I love Tesla!",
            parent_id=0,
        )
    )
    tweets.add_tweet(
        Tweet(
            type=TweetType.QUOTE,
            user_id=2,
            likes=[],
            retweets=[],
            comments=[],
            timestamp=0,
            content="I love Google!",
            parent_id=0,
        )
    )


init_tweets()


def build_prompt(user: User, timeline: list[Tweet]) -> list[BaseMessage]:
    messages = []
    prompt = f'You are a Twitter user named {user.name}. Your bio is: "{user.bio}". Below is a collection of your past activity on Twitter, formatted as XML. These examples of how you use Twitter demonstrate your personality:\n'
    prompt += "<activity>\n"
    for action in user.activity:
        prompt += str(action)
        prompt += "\n"

    prompt += "</activity>\n"

    prompt += "\nHere are the posts in your current Twitter timeline, also formatted as XML:\n"
    prompt += "<timeline>\n"
    for tweet in timeline:
        prompt += str(tweet)
        prompt += "\n"

    prompt += "</timeline>\n\n"

    prompt += """\
Looking only at your current timeline, generate up to 3 new actions to the timeline that you might take during this Twitter session. Only generate tweets, comments, retweets, and quotes. Include IDs for any parents.

Before giving your response, think about what tweets, if any, you would interact with and what your tone and writing style would be. Also, think about new tweets of your own you could post. Use the following demonstration XML:
<response>
<thoughts>
Your thoughts here
</thoughts>
<activity>
Your tweets, comments, retweets, and quotes here
</activity>
</response>\
"""

    messages.append(HumanMessage(content=prompt))

    ai_prompt = "<response><thoughts>\n"

    messages.append(AIMessage(content=ai_prompt))

    return messages


def clean_result(result: str):
    return "<response>\n<thoughts>\n" + result


def parse_xml_to_actions(xml_text: str, user_id: int):
    root = ET.fromstring(xml_text)
    activity = root.find("activity")
    actions = []

    for action in activity:
        if action.tag == "tweet":
            actions.append(
                Action(
                    type=ActionType.TWEET, user_id=user_id, content=action.text.strip()
                )
            )

        elif action.tag == "quote":
            parent = action.find("parent")
            assert parent is not None
            # get text ignoring the parent
            *_, content = action.itertext()

            actions.append(
                Action(
                    type=ActionType.QUOTE,
                    user_id=user_id,
                    parent_id=parent.get("id"),
                    parent_name=parent.get("author"),
                    parent_content=parent.text.strip(),
                    content=content,
                )
            )

        elif action.tag == "comment":
            parent = action.find("parent")
            assert parent is not None
            # get text ignoring the parent
            *_, content = action.itertext()

            actions.append(
                Action(
                    type=ActionType.COMMENT,
                    user_id=user_id,
                    parent_id=parent.get("id"),
                    parent_name=parent.get("author"),
                    parent_content=parent.text.strip(),
                    content=content,
                )
            )

        elif action.tag == "like":
            parent = action.find("parent")
            assert parent is not None
            actions.append(
                Action(
                    type=ActionType.LIKE,
                    user_id=user_id,
                    parent_id=parent.get("id"),
                    parent_name=parent.get("author"),
                    parent_content=parent.text.strip(),
                )
            )

        elif action.tag == "retweet":
            parent = action.find("parent")
            assert parent is not None
            actions.append(
                Action(
                    type=ActionType.RETWEET,
                    user_id=user_id,
                    parent_id=parent.get("id"),
                    parent_name=parent.get("author"),
                    parent_content=parent.text.strip(),
                )
            )

    return actions


def update_globals(actions: list[Action]):
    for action in actions:
        if action.type == ActionType.TWEET:
            tweets.add_tweet(
                Tweet(
                    type=TweetType.TWEET,
                    user_id=action.user_id,
                    timestamp=0,
                    content=action.content,
                )
            )

        elif action.type == ActionType.QUOTE:
            new_tweet = Tweet(
                type=TweetType.QUOTE,
                user_id=action.user_id,
                timestamp=0,
                content=action.content,
                parent_id=action.parent_id,
            )
            tweets.add_tweet(new_tweet)

            tweets[action.parent_id].quotes.append(new_tweet.tweet_id)

        elif action.type == ActionType.COMMENT:
            new_tweet = Tweet(
                type=TweetType.COMMENT,
                user_id=action.user_id,
                likes=[],
                retweets=[],
                comments=[],
                timestamp=0,
                content=action.content,
                parent_id=action.parent_id,
            )
            tweets.add_tweet(new_tweet)

            tweets[action.parent_id].comments.append(new_tweet.tweet_id)

        elif action.type == ActionType.LIKE:
            tweets[action.parent_id].likes.append(action.user_id)

        elif action.type == ActionType.RETWEET:
            tweets[action.parent_id].retweets.append(action.user_id)


# %%
sample = User.parse_file("../samples/jess.json")

users.add_user(sample)
