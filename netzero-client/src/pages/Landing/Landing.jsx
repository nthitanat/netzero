import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Landing.module.scss";
import useLanding from "./useLanding";
import LandingHandler from "./LandingHandler";
import { 
  HeroSection, 
  FeatureSection, 
  RecommendedEventsSection,
  StatsSection, 
  TestimonialSection,
  CallToActionSection 
} from "../../components/landing";
import { OrganicDecoration, FloatingNavBar } from "../../components/common";

export default function Landing() {
  const navigate = useNavigate();
  const { stateLanding, setLanding } = useLanding();
  const handlers = LandingHandler(stateLanding, setLanding, navigate);

  return (
    <div className={styles.Container}>
      <FloatingNavBar onNavigate={handlers.handleNavigation} />
      <OrganicDecoration variant="primary" />
      
    <HeroSection 
        onGetStarted={handlers.handleGetStarted}
        onExploreFeatures={handlers.handleExploreFeatures}
      />
      
      
      <RecommendedEventsSection 
        events={stateLanding.events}
        onEventClick={handlers.handleEventClick}
      />
 
      <FeatureSection />
      <StatsSection 
        stats={stateLanding.stats}
        onStatsLoad={handlers.handleStatsLoad}
      />
      
      <TestimonialSection 
        testimonials={stateLanding.testimonials}
        currentTestimonial={stateLanding.currentTestimonial}
        onTestimonialChange={handlers.handleTestimonialChange}
      />
      
      <CallToActionSection 
        onJoinCommunity={handlers.handleJoinCommunity}
        onLearnMore={handlers.handleLearnMore}
      />
      
      <OrganicDecoration variant="secondary" />
    </div>
  );
}
