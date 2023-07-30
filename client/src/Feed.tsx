import { useEffect, useState } from "react";
import { apiClient, ApiFeed, ApiUser, Post } from "./config";
import { useNavigate, useParams } from "react-router-dom";
import { FeedTweet } from "./components/FeedTweet";

function convertFeed(apiFeed: ApiFeed) {
  const newFeed: Post[] = [];

  apiFeed.tweets.forEach((t) => {
    if (t.type === "COMMENT") {
      return;
    }
    const author = apiFeed.users[t.user_id];
    if (t.type === "QUOTE") {
      const quotedTweet = apiFeed.tweets[t.parent_id!];
      const quotedAuthor = apiFeed.users[quotedTweet.user_id];
      newFeed.push({
        id: t.tweet_id,
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
        id: t.tweet_id,
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
  return newFeed.reverse();
}

export function Feed() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [feed, setFeed] = useState<Post[] | undefined>();
  const [user, setUser] = useState<ApiUser>();
  const [text, setText] = useState<string>("");

  // initial load
  useEffect(() => {
    if (!userId) {
      return;
    }
    apiClient.get<ApiFeed>("/feed").then((res) => {
      setFeed(convertFeed(res.data));
      setUser(res.data.users[parseInt(userId)]);
    });
  }, [userId]);

  // ping server for new posts every second
  useEffect(() => {
    const interval = setInterval(() => {
      apiClient.get<ApiFeed>("/feed").then((res) => {
        console.log(res.data);
        setFeed(convertFeed(res.data));
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  if (!userId) {
    return <div>Invalid user id</div>;
  }

  return (
    <div className="">
      {/* Message Box */}
      <div className="border-slate-200 p-4">
        Currently viewing as:
        <div className="font-bold">{user?.name}</div>
        <textarea
          placeholder="What is happening?!"
          className="w-full border border-slate-200 p-4"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          className="bg-blue-500 font-bold text-white rounded-full px-4 py-2"
          onClick={() => {
            apiClient.post("/start", {
              user_id: parseInt(userId),
              content: text,
            });
            setText("");
          }}
        >
          Tweet
        </button>
      </div>
      {feed &&
        feed.map((f) => {
          if ("quotedTweet" in f) {
            return (
              <FeedTweet f={f}>
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
                    <h2 className="text-slate-500">@{f.quotedTweet.handle}</h2>
                    <span className="text-slate-500">
                      {new Date(f.quotedTweet.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div>{f.quotedTweet.content}</div>
                </div>
              </FeedTweet>
            );
          }

          return <FeedTweet f={f} />;
        })}
    </div>
  );
}
