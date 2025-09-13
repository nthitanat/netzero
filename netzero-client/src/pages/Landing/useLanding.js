import { useState, useEffect } from "react";
import { eventsData } from "../../data/eventsData";

const useLanding = () => {
  const [stateLanding, setState] = useState({
    isLoading: false,
    currentTestimonial: 0,
    events: eventsData || [],
    stats: {
      carbonReduced: 0,
      treesPlanted: 0,
      communityMembers: 0,
      projectsCompleted: 0
    },
    testimonials: [
      {
        id: 1,
        name: "สมศรี วิไลกุล",
        role: "เกษตรกรออร์แกนิค",
        content: "NetZero ช่วยให้ฉันสามารถขายผลผลิตออร์แกนิคได้โดยตรงและเป็นส่วนหนึ่งของการลดคาร์บอน",
        rating: 5,
        image: "/assets/images/testimonials/user1.jpg"
      },
      {
        id: 2,
        name: "อนุชา ใจดี",
        role: "นักธุรกิจสีเขียว",
        content: "แพลตฟอร์มนี้เปิดโอกาสให้เราแลกเปลี่ยนสินค้าและสร้างเครือข่ายชุมชนที่ยั่งยืน",
        rating: 5,
        image: "/assets/images/testimonials/user2.jpg"
      },
      {
        id: 3,
        name: "มานี สีเขียว",
        role: "นักอนุรักษ์สิ่งแวดล้อม",
        content: "การติดตามป่าและการปลูกต้นไม้ผ่าน NetZero ทำให้เห็นผลลัพธ์ที่เป็นรูปธรรม",
        rating: 5,
        image: "/assets/images/testimonials/user3.jpg"
      }
    ],
    features: [
      {
        id: 1,
        title: "ตลาดสีเขียว",
        description: "ซื้อขายสินค้าเป็นมิตรกับสิ่งแวดล้อม",
        icon: "🌱"
      },
      {
        id: 2,
        title: "แลกเปลี่ยนสินค้า",
        description: "แลกเปลี่ยนสินค้าโดยไม่ใช้เงิน",
        icon: "🔄"
      },
      {
        id: 3,
        title: "ติดตามป่าไผ่",
        description: "ติดตามการเจริญเติบโตของป่าไผ่",
        icon: "🎋"
      },
      {
        id: 4,
        title: "กิจกรรมชุมชน",
        description: "เข้าร่วมกิจกรรมเพื่อสิ่งแวดล้อม",
        icon: "🤝"
      }
    ],
    scrollPosition: 0,
    isVisible: {
      hero: false,
      features: false,
      stats: false,
      testimonials: false,
      cta: false
    }
  });

  const setLanding = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleLandingField = (field) => {
    setState((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  // Auto-increment stats animation
  useEffect(() => {
    const animateStats = () => {
      const targetStats = {
        carbonReduced: 50000,
        treesPlanted: 25000,
        communityMembers: 10000,
        projectsCompleted: 500
      };

      const duration = 2000; // 2 seconds
      const steps = 60;
      const interval = duration / steps;

      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        
        setLanding('stats', {
          carbonReduced: Math.floor(targetStats.carbonReduced * progress),
          treesPlanted: Math.floor(targetStats.treesPlanted * progress),
          communityMembers: Math.floor(targetStats.communityMembers * progress),
          projectsCompleted: Math.floor(targetStats.projectsCompleted * progress)
        });

        if (step >= steps) {
          clearInterval(timer);
        }
      }, interval);

      return () => clearInterval(timer);
    };

    // Start animation after component mounts
    const timeout = setTimeout(animateStats, 1000);
    return () => clearTimeout(timeout);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setState((prevState) => ({
        ...prevState,
        currentTestimonial: (prevState.currentTestimonial + 1) % prevState.testimonials.length
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return {
    stateLanding,
    setLanding,
    toggleLandingField,
  };
};

export default useLanding;
