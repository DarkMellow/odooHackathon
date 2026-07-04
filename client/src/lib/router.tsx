import { createBrowserRouter } from "react-router-dom";
import AppLayout from "@/components/app-layout";
import HomePage from "@/pages/home.page";
import SignIn from "@/pages/auth/signIn";
import Signup from "@/pages/auth/signup";
import ForgotPassword from "@/pages/auth/forgotPassword";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        path: "",
        element: <HomePage />
      },
      {
        path: "signin",
        element: <SignIn />
      },
      {
        path: "signup",
        element: <Signup />
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />
      }
    ]
  }
]);
