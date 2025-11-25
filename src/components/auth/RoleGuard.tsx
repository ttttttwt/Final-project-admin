import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface RoleGuardProps {
    children: ReactNode;
    allowedRoles: string[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
    const { user } = useAuthStore();

    if (!user || !allowedRoles.includes(user.role)) {
        return <Navigate to="/403" replace />;
    }

    return <>{children}</>;
}
