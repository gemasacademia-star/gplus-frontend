import React, { Suspense } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import MobileNavbar from '../components/MobileNavbar';
import { useAuth } from '../context/AuthContext';
import StudentSidebar from '../components/student/StudentSidebar';
import LoadingSpinner from '../components/shared/LoadingSpinner';

const StudentLayout = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-brand-bg">
      <StudentSidebar />
      <div className="w-full md:pl-64 flex-1 relative min-h-screen">
        {/* Las rutas hijas son lazy: este Suspense cubre su descarga. */}
        <Suspense fallback={<LoadingSpinner />}>
          <Outlet />
        </Suspense>
      </div>
      <MobileNavbar />
    </div>
  );
};

export default StudentLayout;