export interface Task {
  _id: string;
  title: string;
  description: string;
  project_id: string;
  assignee: string;
  status: string;
}

export interface ServerResponse {
  tasks: Task[];
  total: number;
}

export const STATUS_OPTIONS = ['open', 'in-progress', 'completed'] as const;
export const ITEMS_PER_PAGE = 5;