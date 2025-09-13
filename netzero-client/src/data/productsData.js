export const productsData = [
  {
    id: 1,
    title: "เสื้อผ้าชาวม๊ง",
    description: "เสื้อผ้าทอมือแบบดั้งเดิมของชาวม๊ง จังหวัดน่าน ลวดลายสวยงาม ผ้าคุณภาพดี ผลิตภัณฑ์จากภูมิปญญาท้องถิ่น",
    price: 850,
    images: [
      "/assets/images/products/product-1/image-1.jpg",
      "/assets/images/products/product-1/image-2.jpg",
      "/assets/images/products/product-1/image-3.jpg"
    ],
    thumbnail: "/src/assets/images/products/product-1/image-1.jpg",
    category: "เสื้อผ้า",
    region: "ภาคเหนือ",
    inStock: true,
    quantity: 8,
    weight: "300g",
    origin: "น่าน",
    userId: 101,
    marketType: "market",
    coordinate: [100.7750, 19.2186], // Nan
    isRecommended: true
  },
  {
    id: 2,
    title: "พริกหยวกชาวม๊ง",
    description: "พริกหยวกสดจากไร่สูงชาวม๊ง ปลูกแบบธรรมชาติ ไม่ใช้สารเคมี",
    price: 180,
    images: [
      "/assets/images/products/product-2/image-1.jpg",
    ],
    thumbnail: "/src/assets/images/products/product-2/thumbnail.jpg",
    category: "ผักสด",
    region: "ภาคเหนือ",
    inStock: true,
    quantity: 15,
    weight: "1kg",
    origin: "น่าน",
    userId: 102,
    marketType: "market",
    coordinate: [100.7750, 19.2186], // Nan
    isRecommended: false
  },
  {
    id: 3,
    title: "กล่ำปรีชาวม๊ง",
    description: "กล่ำปรีสดจากไร่สูงชาวม๊ง ปลูกแบบธรรมชาติ ไม่ใช้สารเคมี",
    price: 180,
    images: [
      "/assets/images/products/product-3/image-1.jpg",
    ],
    thumbnail: "/src/assets/images/products/product-2/thumbnail.jpg",
    category: "ผักสด",
    region: "ภาคเหนือ",
    inStock: true,
    quantity: 3,
    weight: "1kg",
    origin: "น่าน",
    userId: 103,
    marketType: "market",
    coordinate: [100.7750, 19.2186], // Nan
    isRecommended: false
  },
];

// Add sample advertisement data
export const advertisementsData = [
  {
    id: 1,
    title: "",
    description: "",
    image: "/assets/images/products/ad-1.png",
    link: "/market?region=ภาคเหนือ",
    badge: "ลดราคา",
    endDate: "2025-09-15"
  },
];

