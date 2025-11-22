export type CircleVisibility = 'inner' | 'outer';

export type User = {
  id: string;
  name: string;
  interests: string[];
  credibilityScore: number;
};

export type Friend = {
  userId: string;
  name: string;
  credibilityScore: number;
};

export type Circle = {
  id: string;
  name: CircleVisibility;
  memberIds: string[];
};

export type Recommendation = {
  id: string;
  authorId: string;
  text: string;
  imageUrl?: string;
  credibility: number;
  visibility: CircleVisibility;
  anonymous: boolean;
  createdAt: string;
};

export type Question = {
  id: string;
  authorId: string;
  text: string;
  visibility: CircleVisibility;
  createdAt: string;
};

export type Notification = {
  id: string;
  type: string;
  message: string;
  createdAt: string;
};
