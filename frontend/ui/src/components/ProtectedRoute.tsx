import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "patient" | "admin";
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole = "patient",
}) => {
  const tokenKey = requiredRole === "admin" ? "adminToken" : "authToken";
  const token = localStorage.getItem(tokenKey);

  if (!token) {
    const redirectPath = requiredRole === "admin" ? "/admin/login" : "/";
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};
