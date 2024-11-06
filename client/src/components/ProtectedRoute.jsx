import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { loadUserFromStorage } from "@/features/auth/slices/authSlice";

const ProtectedRoute = () => {
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const loadUser = async () => {
      if (token && !isAuthenticated) {
        await dispatch(loadUserFromStorage());
      }
    };

    loadUser();
  }, [token, isAuthenticated, dispatch]);

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
