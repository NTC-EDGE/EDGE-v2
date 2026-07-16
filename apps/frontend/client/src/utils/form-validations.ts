import Moment from 'moment';

const validateEmail = (text:string) => {
  const regex = /^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/;
  return regex.test(text);
};



const validatePassword = (text:string, type: any = '') => {
  const characterLength = /^.{8,}$/.test(text);
  if (type === 'length') return { isValid: characterLength };
  const upperAndLowerCase = /[a-z].*[A-Z]|[A-Z].*[a-z]/.test(text);
  const atLeastOneNumber = /.*[0-9].*/.test(text);
  const strongPassword = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})").test(text);
  const mediumPassword = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})").test(text);
  let passwordStrength = 'Weak';
  if (mediumPassword && !strongPassword) {
    passwordStrength = 'Average'
  } else if (strongPassword) {
    passwordStrength = 'Strong'
  }

  return {
    characterLength,
    upperAndLowerCase,
    atLeastOneNumber,
    isValid: characterLength && upperAndLowerCase && atLeastOneNumber,
    strength: passwordStrength,
  };
};

const validatePhone = (text:string) => {
  const regex = /((^(\+)(\d){12}$)|(^\d{11}$))/;
  return regex.test(text);
};

const validateText = (text:string) => {
  return !!text.replace(/ /g, '');
};

const validateNumber = (text: string) => {
  return /^(\d+(\.\d+)?)$/.test(text);
};
const validateDate = (text:string) => {
  return Number(text) >= 1 && Number(text) <= 31;
};

const validateYear = (text:string) => {
  return Number(text) >= 1000 && Number(text) <= Moment().year();
};

const validateZipCode = (text:string) => {
  return Number(text) >= 1000 && Number(text) <= 9999;
};

const validateIMEI = (text:string) => {
  const regex = /((^\d{15}$))/;
  return regex.test(text);
};
const validationFunctions: Record<string, (val: string) => boolean> = {
  validateEmail,
  validatePhone,
  validateText,
  validateNumber,
  validateDate,
  validateYear,
  validateZipCode,
  validateIMEI
};

const toValidationFunction = (fnName: string): ((val: string) => boolean) => {
  return validationFunctions[fnName] || (() => true);
};

export {
  validateEmail,
  validatePassword,
  validatePhone,
  validateText,
  validateNumber,
  validateDate,
  validateYear,
  validateZipCode,
  validateIMEI,
  toValidationFunction
}
