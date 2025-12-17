import {
  AuthPage,
  Home,
  AdminLogin,
  AdminDashboard,
  DoctorSearch,
  Appointments,
} from "../pages";
import { ProtectedRoute } from "../components/ProtectedRoute";
export const routesConfig = [
  { path: "/", element: <AuthPage /> },
  {
    path: "/home",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: "/doctor-search",
    element: (
      <ProtectedRoute>
        <DoctorSearch />
      </ProtectedRoute>
    ),
  },
  {
    path: "/appointments",
    element: (
      <ProtectedRoute>
        <Appointments />
      </ProtectedRoute>
    ),
  },
  { path: "/admin", element: <AdminLogin /> },
  {
    path: "/admin/dashboard",
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
];
