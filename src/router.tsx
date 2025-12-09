import { createBrowserRouter } from "react-router-dom";
import LoginPage from "@/features/auth/pages/LoginPage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import MainLayout from "@/components/layout/MainLayout";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import RoleGuard from "@/components/auth/RoleGuard";
import UserListPage from "@/features/users/pages/UserListPage";
import UserCreatePage from "@/features/users/pages/UserCreatePage";
import UserEditPage from "@/features/users/pages/UserEditPage";
import CourseListPage from "@/features/courses/pages/CourseListPage";
import CourseCreatePage from "@/features/courses/pages/CourseCreatePage";
import CourseEditPage from "@/features/courses/pages/CourseEditPage";
import CoursePreviewPage from "@/features/courses/pages/CoursePreviewPage";
import LessonCreatePage from "@/features/lessons/pages/LessonCreatePage";
import LessonEditPage from "@/features/lessons/pages/LessonEditPage";
import SystemHealthPage from "@/features/monitoring/pages/SystemHealthPage";
import AIUsageLogsPage from "@/features/monitoring/pages/AIUsageLogsPage";
import ActivityLogsPage from "@/features/monitoring/pages/ActivityLogsPage";
import AuditLogsPage from "@/features/monitoring/pages/AuditLogsPage";
import { NotificationsPage } from "@/features/notifications";
import { EmailManagementPage } from "@/features/emails";
import ProfilePage from "@/features/profile/pages/ProfilePage";
import SettingsPage from "@/features/settings/pages/SettingsPage";
import ForbiddenPage from "@/features/auth/pages/ForbiddenPage";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/403",
    element: <ForbiddenPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "users",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <UserListPage />
          </RoleGuard>
        ),
      },
      {
        path: "users/create",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <UserCreatePage />
          </RoleGuard>
        ),
      },
      {
        path: "users/:id/edit",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <UserEditPage />
          </RoleGuard>
        ),
      },
      {
        path: "courses",
        element: <CourseListPage />,
      },
      {
        path: "courses/create",
        element: <CourseCreatePage />,
      },
      {
        path: "courses/:id/edit",
        element: <CourseEditPage />,
      },
      {
        path: "courses/:id/preview",
        element: <CoursePreviewPage />,
      },
      {
        path: "lessons/create",
        element: <LessonCreatePage />,
      },
      {
        path: "lessons/:id/edit",
        element: <LessonEditPage />,
      },
      {
        path: "monitoring/health",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <SystemHealthPage />
          </RoleGuard>
        ),
      },
      {
        path: "monitoring/ai-usage",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <AIUsageLogsPage />
          </RoleGuard>
        ),
      },
      {
        path: "monitoring/activity-logs",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <ActivityLogsPage />
          </RoleGuard>
        ),
      },
      {
        path: "monitoring/audit-logs",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <AuditLogsPage />
          </RoleGuard>
        ),
      },
      {
        path: "notifications",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <NotificationsPage />
          </RoleGuard>
        ),
      },
      {
        path: "emails",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <EmailManagementPage />
          </RoleGuard>
        ),
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "settings",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <SettingsPage />
          </RoleGuard>
        ),
      },
    ],
  },
]);

export default router;
