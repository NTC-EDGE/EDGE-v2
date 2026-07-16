import { useState, useEffect } from 'react';

export const useSessioChecker = () => {
  let [test, setTest] = useState(false);
  return test;
};