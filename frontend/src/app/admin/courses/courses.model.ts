export interface Course {
  id: number;
  course: string;
  recurrence: number;
  description: string | null;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}