import axios from "axios";

export const API_ENDPOINT = "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_ENDPOINT,
});

// api models

export interface ApiUser {
  user_id: number;
  handle: string;
  name: string;
  bio: string;
  avatar_url: string;
}

export interface ApiTweet {
  type: "TWEET" | "QUOTE" | "COMMENT";
  tweet_id: number;
  user_id: number;
  likes: Array<number>;
  retweets: Array<number>;
  quotes: Array<number>;
  comments: Array<number>;
  timestamp: number;
  content: string;
  parent_id?: number;
}

export interface ApiFeed {
  users: Array<ApiUser>;
  tweets: Array<ApiTweet>;
}

export type Tweet = {
  id: number;
  name: string;
  handle: string;
  avatarUrl: string;
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
