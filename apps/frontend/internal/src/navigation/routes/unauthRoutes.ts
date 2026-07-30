import { InternalLoginScreen } from "../../features/login/components/InternalLoginScreen";
import { LandingScreen } from "../../features/login/components/LandingScreen";
import { OnboardingScreen } from "../../features/login/components/OnboardingScreen";

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
    screen: InternalLoginScreen,
    path: "internal/login",
    options: { title: "Login" },
  },
};
