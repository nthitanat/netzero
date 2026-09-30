รับทราบครับ ตัด warroom / impact / netzero ออก แล้วเขียนใหม่ดังนี้

---

## 1. แก่นแพลตฟอร์ม (ย่อ)

**Knowledge and Innovation Hub for Glocal Marketing** — แพลตฟอร์มรวมความรู้เกี่ยวกับสินค้าชุมชน เพื่อ
1. **เล่าเรื่อง community + ผู้ขาย** ให้ตลาดเห็นคุณค่า
2. **ออกแบบ prototype ร่วมกัน** ระหว่าง community + นิสิต/ศิษย์เก่า/ผู้เชี่ยวชาญจุฬาฯ
3. **Localize** สินค้าไทยให้เหมาะกับตลาดปลายทาง (โดยเฉพาะ GCC/อาหรับ)
4. **เพิ่มมูลค่าด้วย mini-course** ของแต่ละ community
5. **2 ภาษา** TH ↔ EN (เผื่อ AR ในเฟสถัดไป)

---

## 2. กลุ่มผู้ใช้

| Role | บทบาท |
|---|---|
| **Visitor** | ดูเรื่องราว community, เรียน mini-course แบบ preview, ดูสินค้า |
| **Community Leader** | หัวหน้ากลุ่ม / รายเดี่ยว — เจ้าของหน้า community, ลงสินค้า, สอนคอร์ส |
| **Community Member** | สมาชิกในกลุ่ม (กรณีกลุ่ม) |
| **Student / Alumni จุฬาฯ** | ร่วม co-design, ลงเรียน, mentor |
| **Expert / Faculty** | ให้ feedback, สร้างคอนเทนต์ความรู้ |
| **Buyer / Partner** | ค้นหาสินค้า, ส่ง inquiry |
| **Admin (Hub team)** | จัดการระบบ, รับรอง community |

---

## 3. Sitemap

```
/  (Landing)
├── /about               แนวคิด USR + Glocal + ทีมจุฬาฯ
│
├── /communities         รายชื่อ community ทั้งหมด (filter: ภาค/หมวด/ตลาดปลายทาง)
│   └── /communities/[slug]
│       ├── Story         เรื่องราวผู้ขาย/ชุมชน, ภูมิหลังท้องถิ่น
│       ├── Leader        โปรไฟล์หัวหน้า — อาชีพ, ศิษย์เก่าจุฬาฯ (รุ่น/คณะ),
│       │                 ความสัมพันธ์กับจุฬาฯ
│       ├── Members       (กรณีกลุ่ม; ซ่อนถ้ารายเดี่ยว)
│       ├── Products      สินค้าของ community
│       └── Mini-Courses  คอร์สสั้นของ community
│
├── /showroom            Digital Showroom — รวมสินค้าจากทุก community
│   └── /showroom/[product]
│       ├── ข้อมูลสินค้า (TH/EN)
│       ├── Localization Notes — ปรับยังไงให้เหมาะกับตลาดอาหรับ/อื่น ๆ
│       ├── เชื่อม community ต้นทาง
│       └── Inquiry / ติดต่อ
│
├── /knowledge-hub       คลังความรู้
│   ├── /articles        บทความ, งานวิจัย, case study
│   ├── /market-intel    ข้อมูลเชิงลึกตลาด GCC/อาหรับ และตลาดอื่น
│   └── /ai-assistant    AI ตอบคำถามจากเอกสารในคลัง (TH/EN)
│
├── /courses             รวม Mini-Courses ทุก community + คอร์สกลางจุฬาฯ
│   └── /courses/[id]    วิดีโอ + เอกสาร + แบบทดสอบ + ใบรับรอง
│
├── /co-design           พื้นที่ออกแบบ prototype ร่วมกัน
│   ├── /briefs          โจทย์เปิดจาก community
│   ├── /projects        โปรเจกต์ที่กำลังทำ + กระดาน Design Thinking
│   └── /demo-day        ตารางงาน pitching / trade mission
│
├── /events              เสวนา / workshop / hybrid event
│
├── /partners            เครือข่าย GCC, สถานทูต, สภาหอการค้า, มหา'ลัยพันธมิตร
│
├── /account             (login required)
│   ├── /dashboard
│   ├── /my-community    จัดการ community ของฉัน
│   ├── /my-courses      เรียน / สอน
│   ├── /my-projects     co-design ของฉัน
│   └── /settings        ภาษา (TH/EN), profile
│
└── /admin               (Hub team only)
    ├── จัดการ community / approval
    ├── จัดการคอนเทนต์ knowledge hub
    └── analytics ใช้งาน
```

---

## 4. Functional Requirements

### 4.1 Community Module
- หน้า community แสดง **storytelling** (ภาพ, วิดีโอ, timeline เรื่องราว)
- **โปรไฟล์หัวหน้า community**:
  - อาชีพ
  - สถานะศิษย์เก่าจุฬาฯ (รุ่น / คณะ / สาขา)
  - ความสัมพันธ์กับจุฬาฯ (งานวิจัยร่วม, อาจารย์ที่ปรึกษา, โครงการ ฯลฯ)
- รองรับทั้ง **กลุ่ม** และ **รายเดี่ยว** (toggle ซ่อน section Members)
- เชื่อม Products + Mini-Courses ของ community เข้าด้วยกันบนหน้าเดียว
- มีระบบ follow / subscribe เพื่อรับ update

### 4.2 Mini-Course Module
- Community leader **สร้างคอร์สเองได้** (อัปวิดีโอ, slides, quiz)
- เน้น **"เพิ่มคุณค่าของของ"** — ที่มาวัตถุดิบ, ภูมิปัญญา, วิธีใช้, การดูแล
- ใบรับรองการเรียน (เชื่อมแนวคิด "ใบเบิกทางสากล" ใน proposal)
- คอร์สกลางของจุฬาฯ (เช่น "เข้าตลาด GCC 101", "Design Thinking สำหรับผู้ประกอบการชุมชน")
- รองรับทั้ง free + paid

### 4.3 Bilingual (TH/EN)
- ทุกหน้า + ทุก content มี 2 ภาษา
- เผื่อ slot **ภาษา AR + RTL layout** สำหรับเฟสถัดไป
- ระบบ **AI-assisted translation** + ขั้นตอน review โดยคน
- เลือกภาษาเริ่มต้นได้ในโปรไฟล์

### 4.4 Localization Module (หัวใจของ Glocal)
- ในแต่ละสินค้า มี **Localization Notes** เป็น field structured:
  - ตลาดปลายทาง (เลือกได้หลายตัว: GCC, อาเซียน, ฯลฯ)
  - การปรับ packaging / สี / สัญลักษณ์
  - การปรับส่วนผสม / สูตร (เช่น halal-friendly)
  - คำแนะนำการสื่อสาร / ภาษา / วัฒนธรรม
- มี **template + checklist** ให้ community กรอกได้ง่าย
- Expert จาก hub review และ comment ได้

### 4.5 Showroom + Inquiry
- โปรไฟล์สินค้าแบบสากล: spec, story, ภาพ, วิดีโอ, MOQ, lead time
- ปุ่ม **Inquiry / RFQ** ส่งถึง community leader โดยตรง
- Filter: หมวดสินค้า, ตลาดปลายทางที่เหมาะ, community
- Match-making suggestion (rule-based ก่อน, AI ภายหลัง)

### 4.6 Knowledge Hub + AI Assistant
- คลังบทความ + market intelligence (เน้น GCC/อาหรับเป็นพิเศษ)
- **AI assistant** (RAG จากเอกสารในคลัง) ตอบคำถาม:
  - "สินค้าเครื่องหอมไทยขายในซาอุฯ ต้องปรับยังไง"
  - "ขั้นตอนจดทะเบียนเข้าตลาด UAE"
- รองรับทั้ง TH/EN
- ทุกคำตอบมี citation กลับไปยัง source

### 4.7 Co-Design / Prototype
- Community ตั้ง **brief** (โจทย์) เปิดรับนิสิต/ศิษย์เก่า/expert มาร่วม
- กระดาน **Design Thinking canvas** (empathize → define → ideate → prototype → test)
- Version history ของ prototype + comment thread
- สถานะ project: open → in progress → ready for demo day
- ปุ่มเสนอเข้า demo day / trade mission

### 4.8 Events
- ปฏิทินกิจกรรม + ลงทะเบียน
- Hybrid (online + onsite)
- หลังจบ event เก็บ recording + เอกสาร เข้า knowledge hub

---

## 5. Non-Functional Requirements

- **Responsive** mobile-first (community leader หลายคนใช้มือถือ)
- **Accessibility** WCAG 2.1 AA
- **i18n + RTL-ready**
- **Auth**: SSO จุฬาฯ + email/social สำหรับ external
- **Role-based access** ตามตาราง §2
- **Media hosting**: CDN + video transcode
- **API-first** เผื่อต่อกับระบบจุฬาฯ และ partners
- **SEO + Open Graph** — community story ต้องแชร์สวยใน social
- **Search** — full-text ข้าม community / product / course / article

---

## 6. Phased Roadmap (จับคู่งวดใน proposal)

| งวด | Scope |
|---|---|
| **งวด 1 (ม.ค.–มิ.ย. 2569)** | Auth, Community pages, Leader/Member profile, Showroom v1, Localization Notes, TH/EN, CMS หลังบ้าน |
| **งวด 2 (ก.ค. 2569–มี.ค. 2570)** | Mini-course module, Knowledge Hub + AI assistant, Co-design board, Events |
| **งวด 3 (เม.ย.–มิ.ย. 2570)** | Inquiry / matching, Demo day module, ภาษา AR + RTL, Analytics |

---

ขั้นต่อไปอยากให้ทำอันไหน?
1. **เจาะ wireframe** หน้าใดหน้าหนึ่ง (แนะนำ `/communities/[slug]` หรือ Showroom)
2. **Data model / ER diagram** ของ entities หลัก (Community, User, Product, Course, Project)
3. **User flow** เช่น "community leader สร้างหน้า community + ลงสินค้าแรก"