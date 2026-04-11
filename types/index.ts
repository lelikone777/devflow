import type { ClientSession } from "mongoose";
import type { NextResponse } from "next/server";

import type { IInteractionDoc } from "@/database/interaction.model";

export type ActionResponse<T = null> = {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: Record<string, string[]>;
  };
  status?: number;
};

export type SuccessResponse<T = null> = ActionResponse<T> & { success: true };
export type ErrorResponse = ActionResponse<undefined> & { success: false };
export type APIErrorResponse = NextResponse<ErrorResponse>;
export type APIResponse<T = null> = NextResponse<SuccessResponse<T> | ErrorResponse>;

export interface Tag {
  _id: string;
  name: string;
  questions?: number;
}

export interface Author {
  _id: string;
  name: string;
  image: string;
}

export interface Question {
  _id: string;
  title: string;
  content: string;
  tags: Tag[];
  author: Author;
  createdAt: Date;
  upvotes: number;
  downvotes: number;
  answers: number;
  views: number;
}

export interface Answer {
  _id: string;
  author: Author;
  content: string;
  upvotes: number;
  question: string;
  downvotes: number;
  createdAt: Date;
}

export interface RouteParams {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}

export interface PaginatedSearchParams {
  page?: number;
  pageSize?: number;
  query?: string;
  filter?: string;
  sort?: string;
}

export interface Collection {
  _id: string;
  author: string | Author;
  question: Question;
}

export interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  bio?: string;
  image?: string;
  location?: string;
  portfolio?: string;
  reputation?: number;
  createdAt: Date;
}

export interface Badges {
  GOLD: number;
  SILVER: number;
  BRONZE: number;
}

export interface Job {
  id?: string;
  job_id?: string;
  employer_name?: string;
  employer_logo?: string | undefined;
  employer_website?: string;
  job_employment_type?: string;
  job_title?: string;
  job_description?: string;
  job_apply_link?: string;
  job_city?: string;
  job_state?: string;
  job_country?: string;
}

export interface Country {
  name: {
    common: string;
  };
  cca2: string;
}

export interface GlobalSearchedItem {
  id: string;
  type: "question" | "answer" | "user" | "tag";
  title: string;
}

export interface SignInWithOAuthParams {
  provider: "github" | "google";
  providerAccountId: string;
  user: {
    name: string;
    username: string;
    email: string;
    image: string;
  };
}

export interface AuthCredentials {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface CreateQuestionParams {
  title: string;
  content: string;
  tags: string[];
}

export interface EditQuestionParams extends CreateQuestionParams {
  questionId: string;
}

export interface GetQuestionParams {
  questionId: string;
}

export interface GetTagQuestionsParams
  extends Omit<PaginatedSearchParams, "filter"> {
  tagId: string;
}

export interface IncrementViewsParams {
  questionId: string;
}

export interface CreateAnswerParams {
  content: string;
  questionId: string;
}

export interface GetAnswersParams extends PaginatedSearchParams {
  questionId: string;
}

export interface CreateVoteParams {
  targetId: string;
  targetType: "question" | "answer";
  voteType: "upvote" | "downvote";
}

export interface UpdateVoteCountParams extends CreateVoteParams {
  change: 1 | -1;
}

export type HasVotedParams = Pick<CreateVoteParams, "targetId" | "targetType">;

export interface HasVotedResponse {
  hasUpvoted: boolean;
  hasDownvoted: boolean;
}

export interface CollectionBaseParams {
  questionId: string;
}

export interface GetUserParams {
  userId: string;
}

export interface GetUserQuestionsParams
  extends Omit<PaginatedSearchParams, "query | filter | sort"> {
  userId: string;
}

export interface GetUserAnswersParams extends PaginatedSearchParams {
  userId: string;
}

export interface GetUserTagsParams {
  userId: string;
}

export interface DeleteQuestionParams {
  questionId: string;
}

export interface DeleteAnswerParams {
  answerId: string;
}

export interface CreateInteractionParams {
  action:
    | "view"
    | "upvote"
    | "downvote"
    | "bookmark"
    | "post"
    | "edit"
    | "delete"
    | "search";
  actionId: string;
  authorId: string;
  actionTarget: "question" | "answer";
}

export interface UpdateReputationParams {
  interaction: IInteractionDoc;
  session: ClientSession;
  performerId: string;
  authorId: string;
}

export interface RecommendationParams {
  userId: string;
  query?: string;
  skip: number;
  limit: number;
}

export interface JobFilterParams {
  query: string;
  page: string;
  country?: string;
  location?: string;
  datePosted?: "all" | "today" | "3days" | "week" | "month";
  workFromHome?: boolean;
  employmentTypes?: "FULLTIME" | "CONTRACTOR" | "PARTTIME" | "INTERN";
  jobRequirements?:
    | "under_3_years_experience"
    | "more_than_3_years_experience"
    | "no_experience"
    | "no_degree";
  radius?: string;
  language?: string;
  fields?: string;
}

export interface UpdateUserParams {
  name?: string;
  username?: string;
  email?: string;
  image?: string;
  password?: string;
}

export interface GlobalSearchParams {
  query: string;
  type: string | null;
}
