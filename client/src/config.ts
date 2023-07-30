import axios from "axios";

export const API_ENDPOINT = "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_ENDPOINT,
});

// api models

export interface ApiUser {
  handle: string;
  name: string;
  bio: string;
}

export interface ApiTweet {
  user_id: number;
  likes: Array<number>;
  retweets: Array<number>;
  comments: Array<number>;
  timestamp: number;
  content: string;
}

export interface ApiQuote extends ApiTweet {
  quoted_tweet_id: number;
}

export interface ApiComment extends ApiTweet {
  parent_tweet_id: number;
}

export interface ApiFeed {
  users: Array<ApiUser>;
  tweets: Array<ApiTweet | ApiQuote | ApiComment>;
}

export type Tweet = {
  id: number;
  name: string;
  handle: string;
  content: string;
  likes: number;
  retweets: number;
  comments: number;
  timestamp: number;
};

export type Quote = Tweet & {
  quotedTweet: Tweet;
};

export type Post = Tweet | Quote;
