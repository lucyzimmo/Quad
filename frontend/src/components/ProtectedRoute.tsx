import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) { 
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  console.log('ProtectedRoute:', { 
    currentUser, 
    requireAdmin, 
    isAdmin: currentUser?.isAdmin 
  });

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
