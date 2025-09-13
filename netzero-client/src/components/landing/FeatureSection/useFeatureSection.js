import { useState } from "react";

const useFeatureSection = () => {
  const [stateFeatureSection, setState] = useState({
    selectedFeature: null,
    isLoaded: false,
    features: [
      {
        id: 1,
        title: "ตลาดสีเขียว",
        description: "ซื้อขายสินค้าเป็นมิตรกับสิ่งแวดล้อมจากเกษตรกรและผู้ประกอบการท้องถิ่น",
        icon: "🌱",
        details: [
          "สินค้าออร์แกนิคและเป็นมิตรกับสิ่งแวดล้อม",
          "รับรองมาตรฐานคุณภาพและความปลอดภัย",
          "สนับสนุนเกษตรกรและชุมชนท้องถิ่น"
        ]
      },
      {
        id: 2,
        title: "แลกเปลี่ยนสินค้า",
        description: "แลกเปลี่ยนสินค้าและบริการโดยไม่ใช้เงิน เพื่อลดการบริโภคและขยะ",
        icon: "🔄",
        details: [
          "แลกเปลี่ยนสินค้าที่ไม่ได้ใช้แล้ว",
          "ระบบประเมินคุณภาพและความน่าเชื่อถือ",
          "สร้างชุมชนแห่งการแบ่งปัน"
        ]
      },
      {
        id: 3,
        title: "ติดตามป่าไผ่",
        description: "ติดตามการเจริญเติบโตของป่าไผ่และการดูดซับคาร์บอนไดออกไซด์",
        icon: "🎋",
        details: [
          "ระบบติดตามแบบเรียลไทม์",
          "คำนวณการดูดซับคาร์บอน",
          "ข้อมูลสถิติและรายงานผลกระทบ"
        ]
      },
      {
        id: 4,
        title: "กิจกรรมชุมชน",
        description: "เข้าร่วมกิจกรรมและเวิร์คช็อปเพื่อเรียนรู้การใช้ชีวิตอย่างยั่งยืน",
        icon: "🤝",
        details: [
          "เวิร์คช็อปและสัมมนาความรู้",
          "กิจกรรมอาสาสมัครและการอนุรักษ์",
          "เครือข่ายชุมชนและการแลกเปลี่ยนประสบการณ์"
        ]
      }
    ]
  });

  const setFeatureSection = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleFeatureSectionField = (field) => {
    setState((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  return {
    stateFeatureSection,
    setFeatureSection,
    toggleFeatureSectionField,
  };
};

export default useFeatureSection;
