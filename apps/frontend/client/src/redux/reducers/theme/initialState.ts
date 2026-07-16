
const { Record } = require('immutable');

const InitialState = Record({
  split: true,
  bulkApplications: [],
  bulkApplication: {},
  background: {
    primary: '#FFFFFF',
    secondary: '#000000'
  },
  text: {
    primary: '#274AD7',
    secondary: '#FFFFFF',
    default: '#787A80',
    success: '#2C9669',
    error: '#CE1026',
  },
  button: {
    primary: '#274AD7',
    secondary: '#FFFFFF',
    default: '#C4C4C4',
    success: '#2C9669',
    error: '#CE1026',
  },
  outline: {
    primary: '#274AD7',
    secondary: '#FFFFFF',
    default: '#000000',
    success: '#2C9669',
    error: '#CE1026',
  },
  roundness: 2,
  thickness: 1,
});

export default InitialState;
