import os
import json

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
        user_data["texts"] = text_data

    initial_user_data.append(user_data)

print(initial_user_data)