import { AuthPage, Dashboard } from "../pages";

export const routesConfig = [
  { path: "/", element: <AuthPage /> },
  { path: "/dashboard", element: <Dashboard /> },
];
