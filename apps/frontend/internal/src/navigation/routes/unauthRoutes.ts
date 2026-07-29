import { InternalLoginPage } from "../../features/login/components/InternalLoginPage";
// Assuming we create simple placeholders for Landing and Onboarding in a moment
import { LandingScreen } from "../../features/login/components/LandingScreen";
import { OnboardingScreen } from "../../features/login/components/OnboardingScreen";
import { SignupScreen } from "../../features/login/components/SignupScreen";

export const unauthRoutes = {
  Landing: {
    screen: LandingScreen,
    path: "landing",
    options: { title: "Welcome" },
  },
  Onboarding: {
    screen: OnboardingScreen,
    path: "onboarding",
    options: { title: "Get Started" },
  },
  InternalLogin: {
    screen: InternalLoginPage,
    path: "internal/login",
    options: { title: "Login" },
  },
  Signup: {
    screen: SignupScreen,
    path: "signup",
    options: { title: "Sign Up" },
  },
};
