export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  workload: number; // 0-100
  status?: 'Active' | 'Warning' | 'Inactive'; // Optional because it might be computed on frontend initially
  created_at?: string;
}