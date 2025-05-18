export interface User {
  _id: string;
  email: string;
  full_name: string;
  role: string;
}

export interface ServerResponse {
  users: User[];
  totalCount: number;
}