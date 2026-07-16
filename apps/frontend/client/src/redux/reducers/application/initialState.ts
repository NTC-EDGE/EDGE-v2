import {region_list} from "@utils/ntc";

const { Record  } = require('immutable');

export default Record({
  savingApplication: false,
  saveApplicationError: false,
  saveApplicationSuccess: false,
  savingBulkApplication: false,
  saveBulkApplicationError: false,
  saveBulkApplicationSuccess: false,
  fetchingApplications: false,
  fetchingApplication: false,
  list: [],
  applicationProcess: {
    label: "",
    value: "",
  },
  application: {},
  applications: [],
  batchApplications: [],
  page: 1,
  pageSize: 0,
  total: 0,
  applicationCart: {},

  uploadingRequirement: false,
  uploadRequirementSuccess: false,
  uploadRequirementError: false,
  buttonText: "",
  regions: region_list,
  fetchingRegions: false,
  schedules: [],
  fetchingSchedules: false,
  provinces: [],
  fetchingProvinces: false,
  cities: [],
  fetchingCities: false,
  barangays: [],
  fetchingBarangays: false,

  SOA: [],
  fetchingSOA: false,
  fetchSOASuccess: false,
  fetchSOAError: false,
});

