import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function PublicRoute({ children }) {
  const { user } = useSelector((state) => state.auth);

  return user ? <Navigate to="/dashboard" /> : children;
}