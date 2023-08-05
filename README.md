Simulating multi-agent social networks

## To run

Include an env.py file in src called "ANTHROPIC_API_KEY = "XXXXX"

In client:
yarn install
yarn dev

In backend/src:
poetry install
poetry run uvicorn server:app

## Inspiration

Simulate multi-agent interactions with LLMs

Currently, simulations are used in many domains to guide actions (e.g., in physics, biology, quant trading), but **simulating language-based human interactions (e.g., in politics, economics, marketing, trust & safety)** has been difficult until now. It’s been theorized that LLMs could be useful to simulate human actions, and in particular, emergent behavior that occurs from humans engaging with each other, e.g., belief-formation, debate and deliberation, consensus and fragmentation. By tailoring prompts to each specific individual and having agents interact with each other, group dynamics for real individuals can be replicated.

If we could realistically simulate how people engage with online content and communities, we could both study social behavior and adapt our online behavior optimized based on test data (e.g., ad campaigns, product launches, political statements, board presentations). Simulations are preferable in cases where real-world testing carries: 
1) low accuracy (e.g., focus groups for a potential ad campaign cannot capture the full spectrum of potential emergent responses from multi-agent online interaction), 
2) reputational cost (e.g., testing whether AOC should run for president would probably get leaked if tested on real people), 
3) economic cost (e.g., testing response to a new airplane design is expensive so simulating planes pre-build can save money), or 
4) difficulty (e.g., testing presentations for a board meeting might not be possible, but a virtual board can respond to hundreds of iterations on a potential pitch).

The effectiveness of these simulations comes from being able to realistically mimic what an actual agent would do, based on all their past behavior. We use the example of a text-based online community (Twitter) with real user personas to demonstrate how LLMs can be used to create realistic multi-agent simulations.

## What it does

We built agents to simulate real Twitter users based on their tweet, retweet, quote tweet, comment, and like history. Each user is an agent with their own specific prompt based on their past history (the 100K context window is quite useful here). Agents interact with each other and all the content they post, generating new tweets and new engagement based on how those users would actually behave according to past behavior. The interface also allowed for tweets to be added manually to see how the community responds. 

We then test the responses of the community to various ad campaigns from brands, political statements from candidates, and social commentary from comedians. 

This is a proof of concept for how anyone who engages with communities of other humans could use these simulations to predict engagement, responses, and behavior modification.

## Use cases

* Ad campaigns: In Dec 2020, Peloton released an ad which featured a husband gifting his wife a Peloton for the holidays. The ad was negatively [picked up](https://www.forbes.com/sites/elanagross/2019/12/05/peloton-stock-is-down-more-than-10-following-backlash-about-sexist-ad/) up by communities on Twitter, who called it sexist, and **Peloton stock dropped 10% ($1.5Bn) in just 3 days.** This reaction was unanticipated by the marketing team at Peloton, and focus groups alone were not able to capture this backlash, leading to financial harm and stock volatility for Peloton. If instead they had been able to run hundreds of low-cost simulations, they could have identified that the gift made it seem like the husband was forcing his wife to lose weight, and instead could have tested potential tweaks (e.g., woman buys herself a Peloton). Large-scale simulations allow for visibility into edge cases and tail risks

* Social engagement: Brands and influencers can test how various posts will perform in terms of engagement beyond just predicting likes or response rates. They can assess the text of comments and analyze the granularities of how users respond (e.g., references, jokes that are likely to be made, if there will be any backlash), what accounts might be most likely to respond well, or analytics on content in responses. By having the language of potential responses, it can be deeply mined to optimized response across the full distribution of possible outcomes.

* Political research: Politicians or academics can test how consensus, debate, and deliberation would occur among real user populations. Candidates running for office can temperature check how their user base would respond to various tweets without risking their real follower base. They can also use this to shape what political positions might appeal to their constituents. Academics can study how deliberation and belief-formation occurs with richer custom datasets that allow for exploration across the spectrum of interaction types.

* Trust & safety: Social media platforms can test how different algorithmic decisions or content policies might influence behavior on the platform by testing out lots of simulations, especially where long-tail outcomes (e.g., CSAM, threats of violence, etc) are high-risk and high-impact to the company. Testing computationally before releasing changes ensures that the risks can be mitigated before public engagement can occur.

* Product launch / sales: Simulated users can be used to see risks in a product launch to the general population, or even to a specific group (e.g., in-house employees, external investors). If I want to know how my board might respond to a product launch, I can simulate the board meeting with agents for each member and analyze how the conversation flows. If I want to optimize my pitch to sell a big deal to a partner, I can test it out based on a virtual version of the people who will be in the meeting.

## Challenges we ran into
Twitter API has a rate limit of 1500 tweets/month -- so we did some reverse engineering to scrape it anyway :)

## How we built it
* Scraping Twitter by reverse-engineering their Android & iOS clients
* Claude-2 100K context window API
* LangChain + LangSmith
* Vite + React + Typescript

Inspiration from Kevin Liu and Evan Mays

## Improvements
Increase number of simulations
Increase number of agents
Increase complexity of each agent to get closer and closer to “true” reality
Increase closeness of simulating real-life interaction process
Multi-modal content to move beyond text-based online content


## The future 

Simulated users can be used to mimic the interactions of real-world group. The closer the LLMs are to the real group (e.g., by providing relevant history of prior actions, by ensuring agents are demographically-representative of the real-world population), the more accurate these simulations will become. 
