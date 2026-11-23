import { IUser } from "./auth.types";

export interface IComment {
  _id: string;
  id?: string;
  content: string;
  ownerId: IUser;
  postId: string;
  mentions?: IUser[];
  imageUrl?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentPayload {
  postId: string;
  content: string;
  mentions?: string[];
  imageUrl?: string[];
}

