import { IUser } from "./auth.types";

export enum FriendStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  BLOCKED = "BLOCKED",
}

export interface IFriend {
  _id?: string;
  friendshipId?: string;
  user?: IUser;
  requester?: IUser;
  recipient?: IUser;
  status?: FriendStatus;
  since?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FriendsResponse {
  friends: IFriend[];
  pendingRequests: IFriend[];
  sentPendingRequests?: IFriend[];
}

