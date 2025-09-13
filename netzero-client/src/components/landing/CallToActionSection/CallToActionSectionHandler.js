import styles from "./CallToActionSection.module.scss";

const CallToActionSectionHandler = (stateCallToActionSection, setCallToActionSection) => {
  return {
    handleEmailChange: (email) => {
      setCallToActionSection('email', email);
    },

    handleNewsletterSubmit: async (e) => {
      e.preventDefault();
      
      if (!stateCallToActionSection.email) {
        alert('กรุณากรอกอีเมล');
        return;
      }

      setCallToActionSection('isSubmitting', true);
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setCallToActionSection('isSubscribed', true);
        setCallToActionSection('showSuccessMessage', true);
        setCallToActionSection('email', '');
        
        alert('ขอบคุณสำหรับการสมัครรับข่าวสาร! เราจะส่งข้อมูลที่เป็นประโยชน์ให้คุณทุกสัปดาห์');
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setCallToActionSection('showSuccessMessage', false);
        }, 3000);
        
      } catch (error) {
        console.error('Newsletter subscription error:', error);
        alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      } finally {
        setCallToActionSection('isSubmitting', false);
      }
    },

    handleSocialLinkClick: (platform) => {
      console.log("Social link clicked:", platform);
      // Add analytics tracking here
    },

    handleJoinCommunityClick: () => {
      console.log("Join community clicked from CTA");
      // Add analytics tracking here
    },

    handleLearnMoreClick: () => {
      console.log("Learn more clicked from CTA");
      // Add analytics tracking here
    }
  };
};

export default CallToActionSectionHandler;
