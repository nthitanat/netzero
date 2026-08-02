import { useState } from 'react';

const useCheckIn = () => {
  const [stateCheckIn, setState] = useState({
    email: '',
    status: 'idle', // idle | loading | completed | not_completed | error
    redirectUrl: null,
    error: null,
  });

  const setCheckIn = (field, value) => {
    if (typeof field === 'object') {
      // Update multiple fields at once
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      // Update single field
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  return {
    stateCheckIn,
    setCheckIn,
  };
};

export default useCheckIn;
