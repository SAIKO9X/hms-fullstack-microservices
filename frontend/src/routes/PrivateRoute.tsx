import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Navigate, Outlet } from "react-router";
import { logout } from "@/store/slices/authSlice";
import { useEffect } from "react";

export const PrivateRoute = () => {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!token) {
      dispatch(logout());
    }
  }, [token, dispatch]);

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
};
