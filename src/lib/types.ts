
export type Language = {
  id: string;
  name: string;
};

export type ExpiryOption = {
  id: string;
  name: string;
  seconds: number | null; // null means never expire
};

export type User = {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
};

export type Paste = {
  id: string;
  title: string;
  content: string;
  language: string;
  expireAt: Date | null;
  createdAt: Date;
  userId: string | null;
  isPrivate: boolean;
  isPasswordProtected: boolean;
  password?: string;
  burnAfterRead: boolean;
  viewCount: number;
};
