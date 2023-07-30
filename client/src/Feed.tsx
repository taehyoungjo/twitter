import { useEffect, useState } from "react";
import { apiClient, ApiFeed } from "./config";
import { FaRegComment, FaRetweet, FaRegHeart } from "react-icons/fa";
import { AiOutlineRetweet } from "react-icons/ai";

type Tweet = {
  id: number;
  name: string;
  handle: string;
  content: string;
  likes: number;
  retweets: number;
  comments: number;
  timestamp: number;
};

type Quote = Tweet & {
  quotedTweet: Tweet;
};

type Post = Tweet | Quote;

export function Feed() {
  const [feed, setFeed] = useState<Post[] | undefined>();

  function convertFeed(apiFeed: ApiFeed) {
    const newFeed: Post[] = [];

    apiFeed.tweets.forEach((t, index) => {
      const author = apiFeed.users[t.user_id];
      if ("quoted_tweet_id" in t) {
        const quotedTweet = apiFeed.tweets[t.quoted_tweet_id];
        const quotedAuthor = apiFeed.users[quotedTweet.user_id];
        newFeed.push({
          id: index,
          name: author.name,
          handle: author.handle,
          content: t.content,
          likes: t.likes.length,
          retweets: t.retweets.length,
          comments: t.comments.length,
          timestamp: t.timestamp,
          quotedTweet: {
            id: t.quoted_tweet_id,
            name: quotedAuthor.name,
            handle: quotedAuthor.handle,
            content: quotedTweet.content,
            likes: quotedTweet.likes.length,
            retweets: quotedTweet.retweets.length,
            comments: quotedTweet.comments.length,
            timestamp: quotedTweet.timestamp,
          },
        });
      } else {
        newFeed.push({
          id: index,
          name: author.name,
          handle: author.handle,
          content: t.content,
          likes: t.likes.length,
          retweets: t.retweets.length,
          comments: t.comments.length,
          timestamp: t.timestamp,
        });
      }
    });
    return newFeed;
  }

  // ping server for new posts every second
  useEffect(() => {
    const interval = setInterval(() => {
      apiClient.get<ApiFeed>("/feed").then((res) => {
        console.log(res.data);
        setFeed(convertFeed(res.data));
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="border-slate-200 border-t">
      {feed &&
        feed.map((f) => {
          if ("quotedTweet" in f) {
            return (
              <div className="flex space-x-4 border-b border-slate-200 p-4">
                {/* Avatar */}
                <div className="bg-slate-300 rounded-full w-8 h-8"></div>

                <div key={f.id} className="flex flex-col space-y-2 grow">
                  {/* Header */}
                  <div className="flex space-x-2">
                    <h2 className="font-bold">{f.name}</h2>
                    <h2 className="text-slate-500">@{f.handle}</h2>
                    <span className="text-slate-500">
                      {new Date(f.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {/* Content */}
                  <div>{f.content}</div>

                  {/* Quoted Tweet */}
                  <div
                    key={f.quotedTweet.id}
                    className="space-y-2 border border-slate-200 p-4 rounded-lg"
                  >
                    <div className="flex space-x-2 items-center">
                      <div className="bg-slate-300 rounded-full w-5 h-5"></div>
                      <h2 className="font-bold">{f.quotedTweet.name}</h2>
                      <h2 className="text-slate-500">
                        @{f.quotedTweet.handle}
                      </h2>
                      <span className="text-slate-500">
                        {new Date(f.quotedTweet.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div>{f.content}</div>
                  </div>

                  {/* Footer */}
                  <div className="flex space-x-2">
                    <div className="text-slate-600 flex space-x-1 items-center">
                      <FaRegComment />
                      <span>{f.likes}</span>
                    </div>
                    <div className="text-slate-600 flex space-x-2 items-center">
                      <AiOutlineRetweet />
                      <span>{f.retweets}</span>
                    </div>
                    <div className="text-slate-600 flex space-x-2 items-center">
                      <FaRegHeart />
                      <span>{f.comments}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div className="flex space-x-4 border-b border-slate-200 p-4">
              {/* Avatar */}
              <div className="bg-slate-300 rounded-full w-8 h-8"></div>

              <div key={f.id} className="flex flex-col space-y-2 grow">
                {/* Header */}
                <div className="flex space-x-2">
                  <h2 className="font-bold">{f.name}</h2>
                  <h2 className="text-slate-500">@{f.handle}</h2>
                  <span className="text-slate-500">
                    {new Date(f.timestamp).toLocaleString()}
                  </span>
                </div>
                <div>{f.content}</div>

                {/* Footer */}
                <div className="flex space-x-2">
                  <div className="text-slate-600 flex space-x-1 items-center">
                    <FaRegComment />
                    <span>{f.likes}</span>
                  </div>
                  <div className="text-slate-600 flex space-x-2 items-center">
                    <AiOutlineRetweet />
                    <span>{f.retweets}</span>
                  </div>
                  <div className="text-slate-600 flex space-x-2 items-center">
                    <FaRegHeart />
                    <span>{f.comments}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
}
