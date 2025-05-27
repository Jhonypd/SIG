export interface UserData {
  [key: string]: unknown;
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

export interface userDataToken extends UserData {
  iat: number;
  exp: number;
}
