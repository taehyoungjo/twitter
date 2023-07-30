import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ApiFeed, ApiTweet, Tweet, apiClient } from "./config";
import { FaRegComment, FaRegHeart } from "react-icons/fa";
import { AiOutlineRetweet } from "react-icons/ai";
import { motion } from "framer-motion";
import TwitterLogo from "./components/twitter.svg";

function Comment({ comment }: { comment: Tweet }) {
  const [isInitialRender, setIsInitialRender] = useState(true);

  useEffect(() => {
    setIsInitialRender(false);
  }, []);

  return (
    <motion.div
      key={comment.id}
      className="flex space-x-4 border-b border-slate-200 p-4"
      initial={isInitialRender ? { backgroundColor: "#F1F5F9" } : {}}
      animate={{ backgroundColor: "#ffffff" }}
      transition={{ duration: 1 }}
    >
      {/* Avatar */}
      <div className="bg-slate-300 rounded-full w-8 h-8"></div>
      <div key={comment.id} className="flex flex-col space-y-2 grow">
        {/* Header */}
        <div className="flex space-x-2">
          <h2 className="font-bold">{comment.name}</h2>
          <h2 className="text-slate-500">@{comment.handle}</h2>
          <span className="text-slate-500">
            {new Date(comment.timestamp).toLocaleString()}
          </span>
        </div>
        {/* Content */}
        <div>{comment.content}</div>

        {/* Footer */}
        <div className="flex space-x-2">
          <div className="text-slate-600 flex space-x-1 items-center">
            <FaRegComment />
            <span>{comment.comments}</span>
          </div>
          <div className="text-slate-600 flex space-x-2 items-center">
            <AiOutlineRetweet />
            <span>{comment.retweets}</span>
          </div>
          <div className="text-slate-600 flex space-x-2 items-center">
            <FaRegHeart />
            <span>{comment.likes}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function TweetView() {
  const { id } = useParams();

  const [mainTweet, setMainTweet] = useState<Tweet | undefined>();
  const [comments, setComments] = useState<Tweet[] | undefined>();

  // ping server for new posts every second
  useEffect(() => {
    const interval = setInterval(() => {
      apiClient.get<ApiFeed>("/feed").then((res) => {
        console.log(res.data);
        const tweets = res.data.tweets;

        const index = parseInt(id!);
        const mainApiTweet: ApiTweet = tweets[index];
        const mainTweetAuthor = res.data.users[mainApiTweet.user_id];

        setMainTweet({
          id: index,
          name: mainTweetAuthor.name,
          handle: mainTweetAuthor.handle,
          content: mainApiTweet.content,
          likes: mainApiTweet.likes.length,
          retweets: mainApiTweet.retweets.length,
          comments: mainApiTweet.comments.length,
          timestamp: mainApiTweet.timestamp,
        });

        const mainTweetComments: Tweet[] = [];
        mainApiTweet.comments.forEach((commentId) => {
          const commentApiTweet = tweets[commentId];
          const commentAuthor = res.data.users[commentApiTweet.user_id];
          mainTweetComments.push({
            id: commentAuthor.user_id,
            name: commentAuthor.name,
            handle: commentAuthor.handle,
            content: commentApiTweet.content,
            likes: commentApiTweet.likes.length,
            retweets: commentApiTweet.retweets.length,
            comments: commentApiTweet.comments.length,
            timestamp: commentApiTweet.timestamp,
          });
        });
        setComments(mainTweetComments);
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [id]);

  return (
    <>
      <div className="flex items-center w-full fixed bg-white">
        <div className="max-w-screen-md w-full flex mx-auto border-b border-x p-6 py-3">
          <img src={TwitterLogo} className="w-12 rotate-180 mr-4" />
          <h1 className="text-4xl font-semibold">Twitter</h1>
        </div>
      </div>

      {mainTweet && comments ? (
        <div className="max-w-screen-md mx-auto border-l border-r pt-24">
          {/* Main Tweet */}
          <div className="flex space-x-4 border-b border-slate-200 p-4">
            {/* Avatar */}
            <div className="bg-slate-300 rounded-full w-8 h-8 shrink-0"></div>

            <div key={mainTweet.id} className="flex flex-col space-y-2 grow">
              {/* Header */}
              <div className="flex space-x-2">
                <h2 className="font-bold">{mainTweet.name}</h2>
                <h2 className="text-slate-500">@{mainTweet.handle}</h2>
                <span className="text-slate-500">
                  {new Date(mainTweet.timestamp).toLocaleString()}
                </span>
              </div>
              {/* Content */}
              <div>{mainTweet.content}</div>

              {/* Footer */}
              <div className="flex space-x-2">
                <div className="text-slate-600 flex space-x-1 items-center">
                  <FaRegComment />
                  <span>{mainTweet.comments}</span>
                </div>
                <div className="text-slate-600 flex space-x-2 items-center">
                  <AiOutlineRetweet />
                  <span>{mainTweet.retweets}</span>
                </div>
                <div className="text-slate-600 flex space-x-2 items-center">
                  <FaRegHeart />
                  <span>{mainTweet.likes}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Comments */}
          {comments.map((comment) => {
            return <Comment comment={comment} />;
          })}
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
