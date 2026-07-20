import '@react-navigation/native';

declare global {
  namespace ReactNavigation {
    interface RootParamList {
      Landing: undefined;
      Login: undefined;
      SignUp: undefined;
      ForgotPassword: undefined;
      Services: undefined;
      MyApplications: undefined;
    }
  }
}
