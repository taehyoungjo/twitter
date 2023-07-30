import { FaRegComment, FaRegHeart } from "react-icons/fa";
import { AiOutlineRetweet } from "react-icons/ai";

export function TweetFooter({
  comments,
  retweets,
  likes,
}: {
  comments: number;
  retweets: number;
  likes: number;
}) {
  return (
    <div className="flex space-x-2">
      <div className="text-slate-600 flex space-x-1 items-center">
        <FaRegComment />
        <span>{comments}</span>
      </div>
      <div className="text-slate-600 flex space-x-2 items-center">
        <AiOutlineRetweet />
        <span>{retweets}</span>
      </div>
      <div className="text-slate-600 flex space-x-2 items-center">
        <FaRegHeart />
        <span>{likes}</span>
      </div>
    </div>
  );
}
