export type AuthUser = {
  id: string;
  email: string | null;
  name: string | null;
  interests: string[];
  credibilityScore: number;
};

export type SignupResponse = { userId: string };
export type AuthUserResponse = { user: AuthUser };
