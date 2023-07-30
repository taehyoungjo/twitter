import { useState } from "react";
import { BiComment } from "react-icons/bi";

type BasePost = {
  id: string;
  username: string;
  content: string;
  likes: number;
  retweets: number;
  comments: number;
  timestamp: number;
};

type QuoteTweetPost = BasePost & {
  quoteTarget: BasePost;
};

type RetweetPost = BasePost & {
  reTarget: BasePost;
};

type Post = BasePost | QuoteTweetPost | RetweetPost;

const DUMMY_FEED: Post[] = [
  /**
   * Quote Tweet
   */
  {
    id: "1",
    username: "johndoe",
    content: "Hello, world!",
    likes: 0,
    retweets: 0,
    comments: 0,
    timestamp: Date.now(),
    quoteTarget: {
      id: "1",
      username: "johndoe",
      content: "Hello, world!",
      likes: 0,
      retweets: 0,
      comments: 0,
      timestamp: Date.now(),
    },
  } as QuoteTweetPost,
  /**
   * Base Tweet
   */
  {
    id: "2",
    username: "kevinhu",
    content: "Hello, world!",
    likes: 0,
    retweets: 0,
    comments: 0,
    timestamp: Date.now(),
  } as BasePost,
  /**
   * Retweet
   */
  {
    id: "3",
    username: "kevinhu",
    content: "Hello, world!",
    likes: 0,
    retweets: 0,
    comments: 0,
    timestamp: Date.now(),
    reTarget: {
      id: "1",
      username: "johndoe",
      content: "Hello, world!",
      likes: 0,
      retweets: 0,
      comments: 0,
      timestamp: Date.now(),
    },
  } as RetweetPost,
];

export function Feed() {
  const [feed] = useState<Post[]>(DUMMY_FEED);

  return (
    <div className="border-slate-200 border-t">
      {feed.map((f) => {
        if ("quoteTarget" in f) {
          return (
            <div className="flex space-x-4 border-b border-slate-200 p-4">
              <div className="bg-slate-300 rounded-full w-8 h-8"></div>

              <div key={f.id} className="flex flex-col space-y-2 grow">
                <div className="flex space-x-2">
                  <h2 className="font-bold">@{f.username}</h2>
                  <span className="text-slate-600">
                    {new Date(f.timestamp).toLocaleString()}
                  </span>
                </div>
                <div>{f.content}</div>
                <div
                  key={f.quoteTarget.id}
                  className="space-y-2 border border-slate-200 p-4 rounded-lg"
                >
                  <div className="flex space-x-2">
                    <h2 className="font-bold">@{f.quoteTarget.username}</h2>
                    <span className="text-slate-600">
                      {new Date(f.quoteTarget.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div>{f.quoteTarget.content}</div>
                </div>
                <div className="flex space-x-2">
                  <div className="text-slate-600 flex space-x-1 items-center">
                    <BiComment />
                    <span>{f.likes}</span>
                  </div>
                  <div className="text-slate-600 flex space-x-2 items-center">
                    <BiComment />
                    <span>{f.retweets}</span>
                  </div>
                  <div className="text-slate-600 flex space-x-2 items-center">
                    <BiComment />
                    <span>{f.comments}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        if ("reTarget" in f) {
          return (
            <div
              key={f.id}
              className="flex flex-col space-y-2 border-b border-slate-200 p-4"
            >
              <div>@{f.username} retweeted</div>
              <div className="flex space-x-4">
                <div className="bg-slate-300 rounded-full w-8 h-8"></div>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <h2 className="font-bold">@{f.reTarget.username}</h2>
                    <span className="text-slate-600">
                      {new Date(f.reTarget.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div>{f.reTarget.content}</div>
                  <div className="flex space-x-2">
                    <div className="text-slate-600 flex space-x-1 items-center">
                      <BiComment />
                      <span>{f.reTarget.likes}</span>
                    </div>
                    <div className="text-slate-600 flex space-x-2 items-center">
                      <BiComment />
                      <span>{f.reTarget.retweets}</span>
                    </div>
                    <div className="text-slate-600 flex space-x-2 items-center">
                      <BiComment />
                      <span>{f.reTarget.comments}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="flex space-x-4 border-b border-slate-200 p-4">
            <div className="bg-slate-300 rounded-full w-8 h-8"></div>

            <div key={f.id} className="flex flex-col grow space-y-2">
              <div className="flex space-x-2">
                <h2 className="font-bold">@{f.username}</h2>
                <span className="text-slate-600">
                  {new Date(f.timestamp).toLocaleString()}
                </span>
              </div>
              <div>{f.content}</div>
              <div className="flex space-x-2">
                <div className="text-slate-600 flex space-x-1 items-center">
                  <BiComment />
                  <span>{f.likes}</span>
                </div>
                <div className="text-slate-600 flex space-x-2 items-center">
                  <BiComment />
                  <span>{f.retweets}</span>
                </div>
                <div className="text-slate-600 flex space-x-2 items-center">
                  <BiComment />
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
