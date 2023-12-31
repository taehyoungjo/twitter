import { useEffect, useState } from "react";
import { apiClient, ApiFeed, ApiUser, Post } from "./config";
import { useNavigate, useParams } from "react-router-dom";
import { FeedTweet } from "./components/FeedTweet";
import TwitterLogo from "./components/twitter.svg";

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
        avatarUrl: author.avatar_url,
        quotedTweet: {
          id: t.parent_id!,
          name: quotedAuthor.name,
          handle: quotedAuthor.handle,
          content: quotedTweet.content,
          likes: quotedTweet.likes.length,
          retweets: quotedTweet.retweets.length,
          comments: quotedTweet.comments.length,
          timestamp: quotedTweet.timestamp,
          avatarUrl: quotedAuthor.avatar_url,
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
        avatarUrl: author.avatar_url,
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
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!userId) {
    return <div>Invalid user id</div>;
  }

  return (
    <>
      <div className="flex items-center w-full  fixed bg-white/50 backdrop-blur-md">
        <div className="max-w-screen-md w-full flex mx-auto border-b border-x p-6 py-3">
          <img src={TwitterLogo} className="w-12 rotate-180 mr-4" />
          <h1 className="text-4xl font-semibold">Twitter</h1>
        </div>
      </div>
      <div className="max-w-screen-md mx-auto border-l border-r">
        {/* Message Box */}
        <div className="pt-16 border-b">
          <div className="px-4 py-2 text-xl bg-neutral-200 text-neutral-600">
            Viewing as
            <span className="font-bold ml-1 text-black">{user?.name}</span>
          </div>
          <div className="group">
            <textarea
              placeholder="What is happening?!"
              className="w-full text-xl focus:outline-none border-slate-200 px-4 py-2"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="flex justify-end p-2">
              <button
                className="bg-blue-500 font-semibold text-lg text-white rounded-full px-8 py-2"
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
          </div>
        </div>
        {feed &&
          feed.map((f) => {
            if ("quotedTweet" in f) {
              return (
                <FeedTweet f={f} key={f.id}>
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
                      <img
                        src={f.quotedTweet.avatarUrl}
                        className="w-5 h-5 rounded-full"
                      />
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
                </FeedTweet>
              );
            }

            return <FeedTweet f={f} key={f.id} />;
          })}
      </div>
    </>
  );
}
