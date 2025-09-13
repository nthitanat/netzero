import React, { useState } from 'react';
import { ReserveDialog } from '../components/market';

// Simple test component to verify ReserveDialog works
const ReserveDialogTest = () => {
  const [showDialog, setShowDialog] = useState(false);
  
  const testProduct = {
    id: 1,
    title: "เสื้อผ้าชาวม๊ง",
    price: 850,
    quantity: 8,
    images: ["/assets/images/products/product-1/image-1.jpg"],
    inStock: true,
    origin: "น่าน",
    category: "เสื้อผ้า"
  };

  const handleReservationSuccess = (reservationData) => {
    console.log("✅ Test: Reservation successful", reservationData);
    alert("Test: Reservation successful!");
    setShowDialog(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Reserve Dialog Test</h1>
      <button 
        onClick={() => setShowDialog(true)}
        style={{
          padding: '12px 24px',
          backgroundColor: '#45CE69',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Test Reserve Dialog
      </button>
      
      <ReserveDialog
        product={testProduct}
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onReservationSuccess={handleReservationSuccess}
        theme="market"
      />
      
      <div style={{ marginTop: '20px', color: '#666' }}>
        <p>Dialog state: {showDialog ? 'Open' : 'Closed'}</p>
      </div>
    </div>
  );
};

export default ReserveDialogTest;
