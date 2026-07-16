import { batchAddApplications } from "./actions";

const {
  SAVING_APPLICATION,
  SAVE_APPLICATION_ERROR,
  SAVE_APPLICATION_SUCCESS,
  ADD_APPLICATION,
  SET_APPLICATION_CART,
  SET_APPLICATIONS,
  BATCH_ADD_APPLICATIONS,
  BATCH_SET_APPLICATIONS,
  SET_APPLICATION,
  FETCHING_APPLICATIONS,
  FETCHING_APPLICATION,
  APPLICATION_PROCESS,
  UPLOADING_REQUIREMENT,
  UPLOAD_REQUIREMENT_SUCCESS,
  UPLOAD_REQUIREMENT_ERROR,

  FETCHING_REGIONS,
  SET_REGIONS,
  FETCHING_SCHEDULES,
  SET_SCHEDULES,
  FETCHING_PROVINCES,
  SET_PROVINCES,
  FETCHING_CITIES,
  SET_CITIES,
  FETCHING_BARANGAYS,
  SET_BARANGAYS,

  FETCHING_SOA,
  SET_SOA,
  SAVING_BULK_APPLICATION,
  SAVE_BULK_APPLICATION_ERROR,
  SAVE_BULK_APPLICATION_SUCCESS,

  FETCH_SOA_SUCCESS,
  FETCH_SOA_ERROR,

  RESET_APPLICATION,

  SET_BUTTON_TEXT
} = require('./types').default;
const InitialState = require('./initialState').default;

interface Action {
  type: string;
  payload: any;
};

export default (state = new InitialState(), action:Action) => {
  const { type, payload } = action;
  let list = state?.list || [];
  switch (type) {
    case BATCH_ADD_APPLICATIONS: {
      if(state.batchApplications?.length > 0){
        state.batchApplications.push(action.payload);
        return {
          ...state,
          batchApplications: state.batchApplications,
        }
      }else{
        state.batchApplications = [];
        state.batchApplications.push(action.payload);
       
        return {
         ...state,
          batchApplications: state.batchApplications,
        }
      }
    
    }
    case SAVING_APPLICATION: {
      return {
        ...state,
        savingApplication: payload,
      }
    }
    case SAVING_BULK_APPLICATION: {
      return {
        ...state,
        savingBulkApplication: payload,
      }
    }
    case APPLICATION_PROCESS: {
      return {
        ...state,
        applicationProcess: payload,
      }
    }
    case SAVE_APPLICATION_ERROR: {
      return {
        ...state,
        saveApplicationError: payload,
      }
    }
    case SAVE_APPLICATION_SUCCESS: {
      return {
        ...state,
        saveApplicationSuccess: payload,
      }
    }
    case SAVE_BULK_APPLICATION_ERROR: {
      return {
        ...state,
        saveBulkApplicationError: payload,
      }
    }
    case SAVE_BULK_APPLICATION_SUCCESS: {
      return {
        ...state,
        saveBulkApplicationSuccess: payload,
      }
    }
    case ADD_APPLICATION: {
      list.splice(0, 0, payload);
      list = list.filter((value: any, index: number, self: any) =>
        index === self.findIndex((t: any) => (
          t?._id === value?._id
        ))
      );
      return {
        ...state,
        list,
      }
    }
    case SET_APPLICATION_CART: {
      return {
        ...state,
        applicationCart: payload,
      }
    }
    case SET_APPLICATIONS: {

      let { docs, page, pageSize, total } = payload;
      list = page === 1 ? docs : list?.concat(docs);
      list = list.filter((value: any, index: number, self: any) =>
        index === self.findIndex((t: any) => (
          t?._id === value?._id
        ))
      );


      return {
        ...state,
        list,
        page,
        pageSize,
        total,
      }
    }
    case SET_APPLICATION: {
      return {
        ...state,
        application: payload,
      }
    }
    case FETCHING_APPLICATIONS: {
      return {
        ...state,
        fetchingApplications: payload,
      }
    }
    case FETCHING_APPLICATION: {
      return {
        ...state,
        fetchingApplication: payload,
      }
    }
    case UPLOADING_REQUIREMENT: {
      return {
        ...state,
        uploadingRequirement: payload,
      }
    }
    case UPLOAD_REQUIREMENT_SUCCESS: {
      return {
        ...state,
        uploadRequirementSuccess: payload,
      }
    }
    case UPLOAD_REQUIREMENT_ERROR: {
      return {
        ...state,
        uploadRequirementError: payload,
      }
    }
    case FETCHING_REGIONS: {
      return {
        ...state,
        fetchingRegions: payload,
      }
    }
    case SET_REGIONS: {
      return {
        ...state,
        regions: payload,
      }
    }
    case FETCHING_SCHEDULES: {
      return {
        ...state,
        fetchingSchedules: payload,
      }
    }
    case SET_SCHEDULES: {
      return {
        ...state,
        schedules: payload,
      }
    }
    case FETCHING_PROVINCES: {
      return {
        ...state,
        fetchingProvinces: payload,
      }
    }
    case SET_PROVINCES: {
      return {
        ...state,
        provinces: payload,
      }
    }
    case FETCHING_CITIES: {
      return {
        ...state,
        fetchingCities: payload,
      }
    }
    case SET_CITIES: {
      return {
        ...state,
        cities: payload,
      }
    }
    case FETCHING_BARANGAYS: {
      return {
        ...state,
        fetchingBarangays: payload,
      }
    }
    case SET_BARANGAYS: {
      return {
        ...state,
        barangays: payload,
      }
    }
    case FETCHING_SOA: {
      return {
        ...state,
        fetchingSOA: payload,
      }
    }
    case SET_SOA: {
      return {
        ...state,
        soa: payload,
      }
    }
    case FETCH_SOA_SUCCESS: {
      return {
        ...state,
        fetchSOASuccess: payload,
      }
    }
    case FETCH_SOA_ERROR: {
      return {
        ...state,
        fetchSOAError: payload,
      }
    }
    case RESET_APPLICATION: {
      return InitialState;
    }
    case SET_BUTTON_TEXT: {
      return {
        ...state,
        buttonText: payload,
      }
    }
    default:
      return state;
  }
};
