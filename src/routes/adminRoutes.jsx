import React, { lazy } from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import { ROLES } from './roles';

// Cada vista admin se carga en su propio chunk. Antes las 18 viajaban en el
// bundle inicial, así que un alumno que abría /login descargaba también el
// dashboard financiero completo (recharts incluido). El <Suspense> que cubre
// estas rutas vive en DashboardLayout, alrededor del <Outlet />.
const Dashboard = lazy(() => import('../pages/Dashboard'));
const AdminLocationsManager = lazy(() => import('../pages/admin/AdminLocationsManager'));
const AdminLevelsManager = lazy(() => import('../pages/admin/AdminLevelsManager'));
const AdminTeachersManager = lazy(() => import('../pages/admin/AdminTeachersManager'));
const AdminCatalogManager = lazy(() => import('../pages/admin/AdminCatalogManager'));
const AdminSchedulesManager = lazy(() => import('../pages/admin/AdminScheduleManager'));
const AdminStudentsManager = lazy(() => import('../pages/admin/AdminStudentManager'));
const AdminPaymentManager = lazy(() => import('../pages/admin/AdminPaymentManager'));
const AdminSettings = lazy(() => import('../pages/admin/AdminSettings'));
const AdminInjuriesManager = lazy(() => import('../pages/admin/AdminInjuriesManager'));
const AdminBenefits = lazy(() => import('../pages/admin/AdminBenefits'));
const AdminCreateBenefits = lazy(() => import('../pages/admin/AdminCreateBenefits'));
const AdminPublications = lazy(() => import('../pages/admin/AdminPublications'));
const AdminGuestPasses = lazy(() => import('../pages/admin/AdminGuestPasses'));
const AdminReprogramaciones = lazy(() => import('../pages/admin/AdminReprogramaciones'));
const AdminDeleteMakeups = lazy(() => import('../pages/admin/AdminDeleteMakeups'));
const AdminCreateBenefitsAnuncio = lazy(() => import('../pages/admin/AdminCreateBenefitsAnuncio'));
const AdminCashFlow = lazy(() => import('../pages/admin/monthly-transactions/AdminCashFlow'));
const AdminMerchManager = lazy(() => import('../pages/admin/AdminMerchManager'));
const AdminMerchDeliveries = lazy(() => import('../pages/admin/AdminMerchDeliveries'));
const AdminPaymentMethodsManager = lazy(() => import('../pages/admin/AdminPaymentMethodsManager'));

// Devuelve el árbol de <Route> del grupo Administrador (ver nota en studentRoutes.jsx
// sobre por qué es una función y no un componente <AdminRoutes/>).
export const getAdminRoutes = () => (
    <Route element={<ProtectedRoute allowedRoles={ROLES.ADMIN} />}>
        <Route element={<DashboardLayout />}>
            <Route path="admin" element={<Dashboard role="admin" />} />

            {/* Gestión CRUD */}
            <Route path="admin/students" element={<AdminStudentsManager />} />
            <Route path="admin/teachers" element={<AdminTeachersManager />} />
            <Route path="admin/delete-makeups" element={<AdminDeleteMakeups />} />
            <Route path="admin/benefits" element={<AdminBenefits />} />
            <Route path="admin/CreateBenefits" element={<AdminCreateBenefits />} />
            <Route path="admin/schedule" element={<AdminSchedulesManager />} />
            <Route path="admin/reprogramaciones" element={<AdminReprogramaciones />} />
            <Route path="admin/levels" element={<AdminLevelsManager />} />
            <Route path="admin/catalog" element={<AdminCatalogManager />} />
            <Route path="admin/locations" element={<AdminLocationsManager />} />
            <Route path="admin/injuries" element={<AdminInjuriesManager />} />
            <Route path="admin/publications" element={<AdminPublications />} />
            <Route path="admin/anuncios-beneficios" element={<AdminCreateBenefitsAnuncio />} />
            <Route path="admin/payment-validation" element={<AdminPaymentManager />} />
            <Route path="admin/guest-passes" element={<AdminGuestPasses />} />
            <Route path="admin/cash-flow" element={<AdminCashFlow />} />
            <Route path="admin/merch" element={<AdminMerchManager />} />
            <Route path="admin/entregas-merch" element={<AdminMerchDeliveries />} />

            {/* Configuración */}
            <Route path="admin/payment-methods" element={<AdminPaymentMethodsManager />} />
            <Route path="admin/settings" element={<AdminSettings />} />
        </Route>
    </Route>
);
