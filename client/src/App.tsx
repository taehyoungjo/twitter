import { useState } from "react";
import "./App.css";

type Feed = {
  id: string;
  username: string;
  content: string;
  likes: number;
  retweets: number;
  comments: number;
  timestamp: number;
};

const DUMMY_FEED: Feed[] = [
  {
    id: "1",
    username: "johndoe",
    content: "Hello, world!",
    likes: 0,
    retweets: 0,
    comments: 0,
    timestamp: Date.now(),
  },
];

function App() {
  const [feed] = useState<Feed[]>(DUMMY_FEED);

  return (
    <div>
      {feed.map((f) => (
        <div>
          <div>{f.username}</div>
          <div>{f.content}</div>
          <div>{f.likes}</div>
          <div>{f.retweets}</div>
          <div>{f.comments}</div>
          <div>{f.timestamp}</div>
        </div>
      ))}
    </div>
  );
}

export default App;
