import '@react-navigation/native';

declare global {
  namespace ReactNavigation {
    interface RootParamList {
      [key: string]: object | undefined;
      Dashboard: undefined;
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
    }
  }
}
