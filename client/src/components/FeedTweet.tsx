import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Post } from "../config";
import { TweetFooter } from "./TweetFooter";
import { TweetHeader } from "./TweetHeader";

export function FeedTweet({ f, children }: { f: Post; children?: any }) {
  const [isInitialRender, setIsInitialRender] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    setIsInitialRender(false);
  }, []);

  return (
    <motion.div
      className="flex space-x-4 border-b border-slate-200 p-4"
      initial={isInitialRender ? { backgroundColor: "#F1F5F9" } : {}}
      animate={{ backgroundColor: "#ffffff" }}
      transition={{ duration: 1 }}
      onClick={() => {
        // use react router to navigate to the tweet view
        navigate(`/tweet/${f.id}`);
      }}
    >
      <div key={f.id} className="flex flex-col space-y-2 grow">
        {/* Header */}
        <TweetHeader name={f.name} handle={f.handle} timestamp={f.timestamp} />
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
    </motion.div>
  );
}
