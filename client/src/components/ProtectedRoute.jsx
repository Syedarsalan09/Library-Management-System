import { Navigate } from "react-router-dom";

const ProtectedRoute = ({
  isLoggedIn,
  adminOnly = false,
  user,
  children,
}) => {

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;