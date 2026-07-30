import {
  useNavigation as useReactNavigation,
  type NavigationProp,
} from "@react-navigation/native";

export type RootStackParamList = {
  Landing: undefined;
  Onboarding: undefined;
  InternalLogin: undefined;
  Dashboard: undefined;
  Feedback: undefined;
  FormBuilder: undefined;
  Announcements: undefined;
  AuditLogs: undefined;
  Activities: undefined;
  Chat: undefined;
  Meet: undefined;
  Reports: undefined;
  ReceiptManagement: undefined;
  RolesPermission: undefined;
  Schedule: undefined;
  Employees: undefined;
  Users: undefined;
  Settings: undefined;
  AccountSettings: undefined;
  ActivitiesList: {
    filter?: 'All' | 'Pending' | 'History';
    applicationId?: string;
    activeTab?: 'bulk' | 'details' | 'payment';
  } | undefined;
  ActivitiesDetail: {
    applicationId: string;
    activeTab: 'bulk' | 'details' | 'payment';
    filter: 'All' | 'Pending' | 'History';
  };
};

export type AppNavigationProp = ReturnType<typeof useReactNavigation>;

export function useAppNavigation(): AppNavigationProp {
  return useReactNavigation();
}

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
