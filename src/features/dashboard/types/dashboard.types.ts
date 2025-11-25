export interface Activity {
  id: number;
  description: string;
  timestamp: string;
  type: string;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalLessons: number;
  activeEnrollments: number;
  recentActivities: Activity[];
}
