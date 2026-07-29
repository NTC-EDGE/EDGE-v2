import { InternalLoginPage } from "../../features/login/components/InternalLoginPage";
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
    screen: InternalLoginPage,
    path: "internal/login",
    options: { title: "Login" },
  },
};
