import { useState } from "react";

const useSurveyForm = () => {
  const [stateSurveyForm, setState] = useState({
    answers: {},
    errors: {},
    submitError: null,
    submitting: false,
    progress: 0,
  });

  const setSurveyForm = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  return {
    stateSurveyForm,
    setSurveyForm,
  };
};

export default useSurveyForm;
