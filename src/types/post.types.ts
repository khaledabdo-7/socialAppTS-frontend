import { IUser } from "./auth.types";

export enum ReactType {
  LIKE = "LIKE",
  LOVE = "LOVE",
  HAHA = "HAHA",
  WOW = "WOW",
  SAD = "SAD",
  ANGRY = "ANGRY",
}

export interface IReaction {
  userId: string | IUser;
  type: ReactType;
}

export interface IPost {
  _id: string;
  id?: string;
  title: string;
  content: string;
  ownerId: IUser;
  imageUrl?: string;
  tags?: (string | IUser)[];
  allowComments: boolean;
  comments?: any[];
  reaction?: IReaction[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostPayload {
  title: string;
  content: string;
  imageUrl?: string;
  tags?: string[];
  allowComments?: boolean;
}

