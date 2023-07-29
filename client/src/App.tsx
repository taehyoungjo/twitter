import { useState } from "react";
import { BiComment } from "react-icons/bi";
import "./App.css";

type Post = {
  id: string;
  username: string;
  content: string;
  likes: number;
  retweets: number;
  comments: number;
  timestamp: number;
};

const DUMMY_FEED: Post[] = [
  {
    id: "1",
    username: "johndoe",
    content: "Hello, world!",
    likes: 0,
    retweets: 0,
    comments: 0,
    timestamp: Date.now(),
  },
  {
    id: "2",
    username: "kevinhu",
    content: "Hello, world!",
    likes: 0,
    retweets: 0,
    comments: 0,
    timestamp: Date.now(),
  },
];

function App() {
  const [feed] = useState<Post[]>(DUMMY_FEED);

  return (
    <div className="border-slate-200 border-t">
      {feed.map((f) => (
        <div key={f.id} className="space-y-2 border-b border-slate-200 p-4">
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
      ))}
    </div>
  );
}

export default App;
