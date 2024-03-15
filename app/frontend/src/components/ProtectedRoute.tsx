import React, { useEffect } from 'react';
import { useUser } from '../hooks/UserContext';
import ErrorPage from '../pages/ErrorPage';
import { useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
    children: React.ReactNode;
    adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly }) => {
    const { user } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (user === null || (adminOnly && !user?.isAdmin)) navigate('/');
    }, [user, adminOnly, navigate]);

    return user === undefined ? <ErrorPage /> : children;
};

export default ProtectedRoute;
