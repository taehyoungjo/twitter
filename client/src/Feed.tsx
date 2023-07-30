import { useEffect, useState } from "react";
import { apiClient, ApiFeed, Post } from "./config";
import { FaRegComment, FaRegHeart } from "react-icons/fa";
import { AiOutlineRetweet } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

export function Feed() {
  const navigate = useNavigate();
  const [feed, setFeed] = useState<Post[] | undefined>();

  function convertFeed(apiFeed: ApiFeed) {
    const newFeed: Post[] = [];

    apiFeed.tweets.forEach((t, index) => {
      if ("parent_tweet_id" in t) {
        return;
      }
      const author = apiFeed.users[t.user_id];
      if (t.type === "QUOTE") {
        const quotedTweet = apiFeed.tweets[t.parent_id!];
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
            id: t.parent_id!,
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

  console.log(feed);

  return (
    <div className="border-slate-200 border-t">
      {feed &&
        feed.map((f) => {
          if ("quotedTweet" in f) {
            return (
              <div
                className="flex space-x-4 border-b border-slate-200 p-4"
                onClick={() => {
                  // use react router to navigate to the tweet view
                  navigate(`/tweet/${f.id}`);
                }}
              >
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
                    onClick={(e) => {
                      // use react router to navigate to the tweet view
                      e.stopPropagation();
                      navigate(`/tweet/${f.quotedTweet.id}`);
                    }}
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
                    <div>{f.quotedTweet.content}</div>
                  </div>

                  {/* Footer */}
                  <div className="flex space-x-2">
                    <div className="text-slate-600 flex space-x-1 items-center">
                      <FaRegComment />
                      <span>{f.comments}</span>
                    </div>
                    <div className="text-slate-600 flex space-x-2 items-center">
                      <AiOutlineRetweet />
                      <span>{f.retweets}</span>
                    </div>
                    <div className="text-slate-600 flex space-x-2 items-center">
                      <FaRegHeart />
                      <span>{f.likes}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              className="flex space-x-4 border-b border-slate-200 p-4"
              onClick={() => {
                // use react router to navigate to the tweet view
                navigate(`/tweet/${f.id}`);
              }}
            >
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
                    <span>{f.comments}</span>
                  </div>
                  <div className="text-slate-600 flex space-x-2 items-center">
                    <AiOutlineRetweet />
                    <span>{f.retweets}</span>
                  </div>
                  <div className="text-slate-600 flex space-x-2 items-center">
                    <FaRegHeart />
                    <span>{f.likes}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
}
