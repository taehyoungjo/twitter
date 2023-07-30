import asyncio
import random
from typing import Tuple

from config import (
    Tweet,
    TweetType,
    User,
    build_prompt,
    clean_result,
    llms,
    parse_xml_to_actions,
    tweets,
    update_globals,
    users,
)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langchain.chat_models import ChatAnthropic
from langchain.schema import BaseMessage
from pydantic import BaseModel

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
    active_users = random.sample(users.users, 10)

    # this is our queue
    prompts = [
        (user.user_id, build_prompt(user, tweets.get_timeline()))
        for user in active_users
    ]

    queue = asyncio.Queue()
    for prompt in prompts:
        await queue.put(prompt)

    async def worker(
        llm: ChatAnthropic, queue: asyncio.Queue[Tuple[int, list[BaseMessage]]]
    ):
        while not queue.empty():
            user_id, prompt = await queue.get()
            try:
                response = await llm.agenerate([prompt])
                result_text = response.generations[0][0].text
                actions = parse_xml_to_actions(clean_result(result_text), user_id)
                update_globals(actions)
            except Exception as e:
                print("FAILED:", e)
                # await queue.put((user_id, prompt))

            queue.task_done()

    tasks = []
    for llm_info in llms:
        for _ in range(llm_info["max_concurrent"]):
            task = asyncio.create_task(worker(llm_info["llm"], queue))
            tasks.append(task)

    print("Running", len(tasks), "tasks")

    await queue.join()
    for task in tasks:
        task.cancel()

    await asyncio.gather(*tasks, return_exceptions=True)


class Simulation:
    def __init__(self):
        self.task = None
        self.timestep = 0

    def start(self):
        if self.task is None:
            self.task = asyncio.create_task(self.run())

    async def run(self):
        while True:
            await update()
            self.timestep += 1
            tweets.update_log()
            await asyncio.sleep(3)

    async def stop(self):
        if self.task:
            self.task.cancel()
        self.task = None


sim = Simulation()


class StartRequest(BaseModel):
    user_id: int
    content: str


@app.post("/start")
async def start(request: StartRequest):
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
async def stop():
    await sim.stop()


class FeedResponse(BaseModel):
    users: list[User]
    tweets: list[Tweet]


@app.get("/feed")
async def feed():
    return FeedResponse(users=users.users, tweets=tweets.tweets)
