import { useState } from "react";

const useTestimonialSection = ({ testimonials, currentTestimonial, onTestimonialChange }) => {
  const [stateTestimonialSection, setState] = useState({
    isAutoplay: true,
    isPaused: false
  });

  const setTestimonialSection = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleTestimonialSectionField = (field) => {
    setState((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  return {
    stateTestimonialSection,
    setTestimonialSection,
    toggleTestimonialSectionField,
  };
};

export default useTestimonialSection;
