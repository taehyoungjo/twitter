"""
Write the raw data into cleaned JSON data compatible with the schema.

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


class User(BaseModel):
    user_id: int = -1  # sentinel
    handle: str
    name: str
    bio: str
    activity: list[Action] = Field(default_factory=list, exclude=True)
"""
# %%
import json
import os

# %%
TWEETS_PER_USER = 40

raw_dir = "raw"
clean_dir = "clean"
json_files = [f for f in os.listdir(raw_dir)]

# move "elonmusk.json" to front of list
json_files.remove("elonmusk.json")
json_files.insert(0, "elonmusk.json")

json_files.remove("jack.json")
json_files.insert(1, "jack.json")

json_files.remove("sundarpichai.json")
json_files.insert(2, "sundarpichai.json")

json_files.remove("satyanadella.json")
json_files.insert(3, "satyanadella.json")

print(json_files)

all_users = []
for filename in json_files:
    user_data = {}

    with open(os.path.join(raw_dir, filename), "r") as file:
        data = json.load(file)
        user_data["name"] = data.get("name")
        user_data["handle"] = data.get("handle")
        user_data["bio"] = data.get("bio")
        user_data["avatar_url"] = data.get("avatarUrl")

        activity = []
        for raw_action in data.get("activity"):
            action = {}
            if raw_action["type"] == "TWEET":
                action["type"] = "TWEET"
                action["content"] = raw_action["text"]
            elif raw_action["type"] == "QUOTE":
                action["type"] = "QUOTE"
                action["content"] = raw_action["text"]
                action["parent_name"] = raw_action["author"]["name"]
                action["parent_content"] = raw_action["quoted"]["text"]
            elif raw_action["type"] == "REPLY":
                action["type"] = "COMMENT"
                action["content"] = raw_action["text"]
                action["parent_name"] = raw_action["replyTo"]["author"]["name"]
                action["parent_content"] = raw_action["replyTo"]["text"]
            elif raw_action["type"] == "RETWEET":
                parts = raw_action["text"].split(": ")
                text = ": ".join(parts[1:])
                author = parts[0].strip("RT ")
                action["type"] = "RETWEET"
                action["parent_name"] = author
                action["parent_content"] = text

            activity.append(action)
            if len(activity) >= TWEETS_PER_USER:
                break

        user_data["activity"] = activity

    all_users.append(user_data)

with open("initjudges.json", "w") as out:
    json.dump(all_users, out)

# %%
