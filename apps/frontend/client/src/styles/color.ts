const primaryColor = '#031A6E';
const lightPrimaryColor = '#d3daf7';
const secondaryColor = '#FFFFFF';
const defaultColor = '#565962';
const lightDefaultColor = '#EFF0F6';
const lighterDefaultColor = '#F7F7F7';
const successColor = '#2C9669';
const lightSuccessColor = '#EAF9DF';
const errorColor = '#CA024F';
const lightErrorColor = '#FFECFC';
const warningColor = '#FFAE42';
const disabledColor = '#D1D1D1';
const infoColor = '#2F5BFA';
const lightInfoColor = '#DBEAFE';

const outline = {
  primary: '#031A6E',
  secondary: '#FFFFFF',
  default: '#DADFE4',
  success: '#2C9669',
  error: '#CA024F',
  warning: '#FFAE42',
  disabled: '#D1D1D1',
}

const text = {
  info: '#2F5BFA',
  primary: '#031A6E',
  secondary: '#FFFFFF',
  default: '#565962',
  success: '#34C759',
  error: '#CA024F',
  warning: '#FFAE42',
  disabled: '#808197',
};

const input = {
  text: {
    mainColor: '#15142A',
    defaultColor: '#808197',
    activeColor: text.primary,
    requiredColor: text.error,
    errorColor: text.error,
    successColor: text.success,
  },
  background: {
    default: lightDefaultColor,
    lightDefault: lighterDefaultColor,
    required: lightErrorColor,
    error: lightErrorColor,
    success: lightSuccessColor,
  },
};

const button = {
  primary: '#031A6E',
  secondary: '#FFFFFF',
  default: '#C4C4C4',
  success: '#2C9669',
  error: '#CA024F',
  disabled: '#D1D1D1',
  warning: '#FFAE42',
  info: '#2F5BFA',
};


export const palette = {
  primary:  '#031A6E',
  secondary:'#FFFFFF',
  default:  '#C4C4C4',
  success:  '#2C9669',
  error:    '#CA024F',
  disabled: '#D1D1D1',
  warning:  '#FFAE42',
  info:     '#2F5BFA',

  // extras for UI
  surface:  '#FFFFFF',
  text:     '#0F172A',
  muted:    '#6B7280',
  border:   '#E6E8EF',
};

export const alpha = (hex: string, a: number) => {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};


export {
  primaryColor,
  lightPrimaryColor,
  secondaryColor,
  defaultColor,
  successColor,
  errorColor,
  warningColor,
  disabledColor,
  infoColor,
  lightInfoColor,
  outline,
  text,
  button,
  input,
}
