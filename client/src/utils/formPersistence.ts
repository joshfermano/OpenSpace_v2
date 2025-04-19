import { useState, useEffect } from 'react';

export function useFormPersist<T>(
  key: string,
  initialState: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialState;
    } catch (error) {
      console.error('Error loading form state from sessionStorage:', error);
      return initialState;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving form state to sessionStorage:', error);
    }
  }, [key, state]);

  useEffect(() => {
    return () => {
      try {
        sessionStorage.removeItem(key);
      } catch (error) {
        console.error('Error clearing form state from sessionStorage:', error);
      }
    };
  }, [key]);

  return [state, setState];
}

export const clearAllFormData = () => {
  try {
    const formKeys = Object.keys(sessionStorage).filter((key) =>
      key.startsWith('form_')
    );
    formKeys.forEach((key) => sessionStorage.removeItem(key));
  } catch (error) {
    console.error('Error clearing form data from sessionStorage:', error);
  }
};
