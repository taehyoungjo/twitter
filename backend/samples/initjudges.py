import os
import json

subdir = 'bios'
json_files = [f for f in os.listdir(subdir)]

initial_user_data = []

for filename in json_files:
    user_data = {}

    with open(os.path.join(subdir, filename), 'r') as file:
        data = json.load(file)
        user_data["name"] = data.get('name')
        user_data["handle"] = data.get('screen_name')
        user_data["bio"] = data.get('description')

    initial_user_data.append(user_data)

print(initial_user_data)


