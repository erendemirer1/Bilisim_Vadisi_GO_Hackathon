import { AuthPage, Dashboard, Home } from "../pages";

export const routesConfig = [
  { path: "/", element: <AuthPage /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/home", element: <Home /> },
];
