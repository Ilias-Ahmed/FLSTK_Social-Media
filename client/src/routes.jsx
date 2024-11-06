import { createBrowserRouter } from "react-router-dom";
import App from "@/App";
import {
  SignUp,
  Login,
  ForgotPassword,
  ResetPassword,
} from "@/features/auth/components";
import { ErrorPage, HomePage } from "@/pages";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ProfilePage, UpdateProfile } from "./features/profile/components";
import Chat from "./features/conversation/components/Chat";

const protectedRoutes = [
  { index: true, element: <HomePage /> },
  { path: "profile", element: <ProfilePage /> },
  { path: "profile/edit", element: <UpdateProfile /> },
  { path: "messages", element: <Chat /> },
  { path: "messages/:conversationId", element: <Chat /> },
];

const publicRoutes = [
  { path: "signup", element: <SignUp /> },
  { path: "login", element: <Login /> },
  { path: "forgot-password", element: <ForgotPassword /> },
  { path: "reset-password", element: <ResetPassword /> },
];

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <ProtectedRoute />,
        children: protectedRoutes,
      },
    ],
  },
  ...publicRoutes,
]);

export default router;
