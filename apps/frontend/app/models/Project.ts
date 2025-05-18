export interface Project {
  _id: string;
  name: string;
  description: string;
  owner_email: string;
}

export interface ServerResponse {
  projects: Project[];
  totalCount: number;
}