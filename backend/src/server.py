import asyncio
import threading
import time

from config import (
    Tweet,
    TweetType,
    User,
    build_prompt,
    clean_result,
    llm,
    parse_xml_to_actions,
    tweets,
    update_globals,
    users,
)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langchain.schema import BaseMessage
from pydantic import BaseModel

MAX_CONCURRENT_REQUESTS = 2

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=None,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def update():
    """
    Run a single tick of the simulation.
    """
    active_users = users.users

    async def async_generate(prompt: list[BaseMessage], user_id: int):
        try:
            response = await llm.agenerate([prompt])
            result_text = response.generations[0][0].text
            actions = parse_xml_to_actions(clean_result(result_text), user_id)
            update_globals(actions)

            print("PROMPT", prompt)
            print("RESULT", result_text)
        except Exception as e:
            print("FAILED:", e)

    prompts = [build_prompt(user, tweets.get_timeline()) for user in active_users]

    async def perform_requests(prompts: list[list[BaseMessage]], max_concurrent: int):
        semaphore = asyncio.Semaphore(max_concurrent)
        tasks = []

        async def worker(prompt: list[BaseMessage], user_id: int):
            async with semaphore:
                await async_generate(prompt, user_id)

        for prompt, user in zip(prompts, active_users):
            task = asyncio.ensure_future(worker(prompt, user.user_id))
            tasks.append(task)

        return await asyncio.gather(*tasks)

    await perform_requests(prompts, MAX_CONCURRENT_REQUESTS)

    print("Updated globals")


class Simulation:
    def __init__(self):
        self.running = False
        self.thread = None

    def start(self):
        if not self.running:
            self.running = True
            self.thread = threading.Thread(target=self.run)
            self.thread.start()

    def stop(self):
        if self.running:
            self.running = False
            if self.thread is not None:
                self.thread.join()

    def run(self):
        while self.running:
            asyncio.run(update())
            time.sleep(1)


sim = Simulation()


class StartRequest(BaseModel):
    user_id: int
    content: str


@app.post("/start")
def start(request: StartRequest):
    tweets.add_tweet(
        Tweet(
            type=TweetType.TWEET,
            user_id=request.user_id,
            content=request.content,
            timestamp=0,
        )
    )
    sim.start()


@app.post("/stop")
def stop():
    sim.stop()


class FeedResponse(BaseModel):
    users: list[User]
    tweets: list[Tweet]


@app.get("/feed")
def feed():
    return FeedResponse(users=users.users, tweets=tweets.tweets)
