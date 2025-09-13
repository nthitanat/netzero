const TestimonialSectionHandler = (stateTestimonialSection, setTestimonialSection) => {
  return {
    handleTestimonialChange: (index, onTestimonialChange) => {
      console.log("Testimonial changed to:", index);
      if (onTestimonialChange && typeof onTestimonialChange === 'function') {
        onTestimonialChange(index);
      }
    },

    handleNextTestimonial: (currentTestimonial, testimonials, onTestimonialChange) => {
      console.log("Next testimonial clicked");
      if (!testimonials || testimonials.length === 0) return;
      
      const nextIndex = (currentTestimonial + 1) % testimonials.length;
      if (onTestimonialChange && typeof onTestimonialChange === 'function') {
        onTestimonialChange(nextIndex);
      }
    },

    handlePreviousTestimonial: (currentTestimonial, testimonials, onTestimonialChange) => {
      console.log("Previous testimonial clicked");
      if (!testimonials || testimonials.length === 0) return;
      
      const prevIndex = currentTestimonial === 0 ? testimonials.length - 1 : currentTestimonial - 1;
      if (onTestimonialChange && typeof onTestimonialChange === 'function') {
        onTestimonialChange(prevIndex);
      }
    },

    handlePauseAutoplay: () => {
      setTestimonialSection('isPaused', true);
      setTestimonialSection('isAutoplay', false);
    },

    handleResumeAutoplay: () => {
      setTestimonialSection('isPaused', false);
      setTestimonialSection('isAutoplay', true);
    },

    handleSuccessCardClick: (cardType) => {
      console.log("Success card clicked:", cardType);
      // Could navigate to detailed success stories
    }
  };
};

export default TestimonialSectionHandler;
