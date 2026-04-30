import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return <div className="p-6 animate-pulse">Checking auth...</div>;
  }

  return user ? children : <Navigate to="/login" />;
}