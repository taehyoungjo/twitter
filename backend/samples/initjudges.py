import os
import json

MAX_TWEETS_PER_USR = 10

subdir1 = 'bios'
subdir2 = 'tweets'
json_files = [f for f in os.listdir(subdir1)]

initial_user_data = []

for filename in json_files:
    user_data = {}

    with open(os.path.join(subdir1, filename), 'r') as file:
        data = json.load(file)
        user_data["name"] = data.get('name')
        user_data["handle"] = data.get('screen_name')
        user_data["bio"] = data.get('description')

    with open(os.path.join(subdir2, filename), 'r') as file:
        data = json.load(file)
        text_data = [v['text'] for v in data.values()]
        tweet_type = []

        for text in text_data:
            if text[0:2] == "RT":
                tweet_type.append("RETWEET")
            elif text[0:1] == "@":
                tweet_type.append("COMMENT")
            else:
                tweet_type.append("TWEET")

        return_data = [] # I just want tweets
        for i in range(len(tweet_type)):
            if tweet_type[i] == "TWEET":
                return_data.append(text_data[i])

        if len(return_data) <= MAX_TWEETS_PER_USR:
            user_data["texts"] = return_data
        else:
            user_data["texts"] = return_data[0:MAX_TWEETS_PER_USR]

    initial_user_data.append(user_data)

print(initial_user_data)

with open('initjudges.json', 'w') as output_file:
    json.dump(initial_user_data, output_file)