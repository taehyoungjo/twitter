# %%
from __future__ import annotations

import os
import random
import xml.etree.ElementTree as ET
from enum import Enum
from typing import Optional

from dotenv import load_dotenv
from langchain.llms import Anthropic
from pydantic import BaseModel, Field

load_dotenv()
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")


# %%
# Global state
users: list[User] = []
tweets: list[Tweet] = []


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
    handle: str
    name: str
    bio: str
    activity: list[Action] = Field(default_factory=list)


class TweetType(str, Enum):
    TWEET = "TWEET"
    QUOTE = "QUOTE"
    COMMENT = "COMMENT"  # not shown in timeline?


class Tweet(BaseModel):
    """
    Tweets include quotes and comments.
    """

    type: TweetType
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
<tweet>
    {self.content}
</tweet>\
"""
        elif self.type == TweetType.QUOTE:
            return f"""\
<quote>
    <parent id="{self.parent_id}" author="{self.parent_tweet.author.name}">
        {self.parent_tweet.content}
    </parent>
    {self.content}
</quote>\
"""

        elif self.type == TweetType.COMMENT:
            return f"""\
<comment>
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
    users = [
        User(handle="elonmusk", name="Elon Musk", bio="Technoking of Tesla"),
        User(handle="jack", name="Jack Dorsey", bio="CEO of Twitter"),
        User(handle="sundarpichai", name="Sundar Pichai", bio="CEO of Google"),
        User(handle="satyanadella", name="Satya Nadella", bio="CEO of Microsoft"),
    ]

    tweets = [
        Tweet(
            type=TweetType.TWEET,
            user_id=0,
            likes=[1, 2, 3],
            retweets=[3],
            comments=[1],
            timestamp=0,
            content="I love Twitter!",
        ),
        Tweet(
            type=TweetType.COMMENT,
            user_id=1,
            likes=[],
            retweets=[2],
            comments=[],
            timestamp=0,
            content="I love Tesla!",
            parent_id=0,
        ),
        Tweet(
            type=TweetType.QUOTE,
            user_id=2,
            likes=[],
            retweets=[],
            comments=[],
            timestamp=0,
            content="I love Google!",
            parent_id=0,
        ),
    ]
    return users, tweets


users, tweets = init_tweets()


llm = Anthropic(
    anthropic_api_key=ANTHROPIC_API_KEY,
    model="claude-2",
    temperature=0.8,
)


sample = User.parse_file("../samples/jess.json")
print(sample)

users.append(sample)


# %%


def build_prompt(user: User, timeline: list[Tweet]) -> str:
    prompt = "\n\nHuman: "
    prompt += f'You are a Twitter user named {user.name}. Your bio is: "{user.bio}". Below is a collection of your past activity on Twitter, formatted as XML. These examples of how you use Twitter demonstrate your personality:\n'
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

    prompt += "Looking only at your current timeline, generate up to 3 new actions to the timeline that you might take during this Twitter session. Return your response as XML, matching the schema from above. Only generate tweets, comments, likes, retweets, and quotes."
    prompt += "\n\nAssistant:"

    prompt += " Here are up to 3 new actions I might take, based on Tweets on my timeline:\n<activity>\n"

    return prompt


def clean_result(result: str):
    return "<activity>\n" + result


def parse_xml_to_actions(xml_text: str, user_id: int):
    root = ET.fromstring(xml_text)
    actions = []

    for action in root:
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
            tweets.append(
                Tweet(
                    type=TweetType.TWEET,
                    user_id=action.user_id,
                    timestamp=0,
                    content=action.content,
                )
            )

        elif action.type == ActionType.QUOTE:
            tweets.append(
                Tweet(
                    type=TweetType.QUOTE,
                    user_id=action.user_id,
                    timestamp=0,
                    content=action.content,
                    parent_id=action.parent_id,
                )
            )

            tweets[action.parent_id].quotes.append(len(tweets) - 1)

        elif action.type == ActionType.COMMENT:
            tweets.append(
                Tweet(
                    type=TweetType.COMMENT,
                    user_id=action.user_id,
                    likes=[],
                    retweets=[],
                    comments=[],
                    timestamp=0,
                    content=action.content,
                    parent_id=action.parent_id,
                )
            )

            tweets[action.parent_id].comments.append(len(tweets) - 1)

        elif action.type == ActionType.LIKE:
            tweets[action.parent_id].likes.append(action.user_id)

        elif action.type == ActionType.RETWEET:
            tweets[action.parent_id].retweets.append(action.user_id)


# %%
prompt = build_prompt(sample, tweets)
print("Prompt:\n" + prompt)
result = llm.generate([prompt])
result_text = result.generations[0][0].text
result_text = clean_result(result_text)
print("Result text:\n" + result_text)
actions = parse_xml_to_actions(result_text, 4)  # todo: figure out user id stuff
print(actions)
print("Updating globals...")
update_globals(actions)
print("Tweets now:")
print(tweets)


# %%