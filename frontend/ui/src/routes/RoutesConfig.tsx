import { AuthPage, Dashboard, Home, AdminLogin } from "../pages";
import { ProtectedRoute } from "../components/ProtectedRoute";
export const routesConfig = [
  { path: "/", element: <AuthPage /> },
  { path: "/admin", element: <AdminLogin /> },

  { path: "/dashboard", element: <Dashboard /> },
  {
    path: "/home",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
];
