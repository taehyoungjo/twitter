import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ApiFeed, ApiTweet, Tweet, apiClient } from "./config";
import { FaRegComment, FaRegHeart } from "react-icons/fa";
import { AiOutlineRetweet } from "react-icons/ai";

export function TweetView() {
  const { id } = useParams();

  const [mainTweet, setMainTweet] = useState<Tweet | undefined>();
  const [comments, setComments] = useState<Tweet[] | undefined>();

  console.log(id);

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

  if (!mainTweet || !comments) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* Main Tweet */}
      <div className="flex space-x-4 border-b border-slate-200 p-4">
        {/* Avatar */}
        <div className="bg-slate-300 rounded-full w-8 h-8"></div>

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
        return (
          <div
            key={comment.id}
            className="flex space-x-4 border-b border-slate-200 p-4"
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
          </div>
        );
      })}
    </div>
  );
}
