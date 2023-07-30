import { TweetHeader } from "./TweetHeader";
import { TweetFooter } from "./TweetFooter";
import { useNavigate } from "react-router-dom";
import { Post } from "../config";

export function FeedTweet({ f, children }: { f: Post; children?: any }) {
  const navigate = useNavigate();

  return (
    <div
      className="flex space-x-4 border-b border-slate-200 p-4"
      onClick={() => {
        // use react router to navigate to the tweet view
        navigate(`/tweet/${f.id}`);
      }}
    >
      <div key={f.id} className="flex flex-col space-y-2 grow">
        {/* Header */}
        <TweetHeader
          name={f.name}
          handle={f.handle}
          timestamp={f.timestamp}
          avatarUrl={f.avatarUrl}
        />
        {/* Content */}
        <div>{f.content}</div>
        {children}
        {/* Footer */}
        <TweetFooter
          comments={f.comments}
          retweets={f.retweets}
          likes={f.likes}
        />
      </div>
    </div>
  );
}
