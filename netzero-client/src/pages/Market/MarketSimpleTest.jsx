import React, { useState } from 'react';
import { ReserveDialog } from '../../components/market';
import { getStaticImageUrls } from '../../utils/imageUtils';

export default function MarketSimpleTest() {
  const [showReserveDialog, setShowReserveDialog] = useState(false);
  
  const testProduct = {
    id: 1,
    title: "Test Product",
    price: 850,
    quantity: 8,
    images: getStaticImageUrls(["/assets/images/products/product-1/image-1.jpg"]),
    inStock: true,
    origin: "Bangkok",
    category: "Test"
  };

  const handleReservationSuccess = (reservationData) => {
    console.log("✅ Reservation successful:", reservationData);
    alert("Reservation successful!");
    setShowReserveDialog(false);
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Market - Reserve Dialog Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Product: {testProduct.title}</h3>
        <p>Price: {testProduct.price} บาท</p>
        <p>Available: {testProduct.quantity} items</p>
      </div>
      
      <button 
        onClick={() => {
          console.log("Button clicked - opening dialog");
          setShowReserveDialog(true);
        }}
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
        Open Reserve Dialog
      </button>
      
      <div style={{ marginTop: '20px', color: '#666' }}>
        <p>Dialog State: {showReserveDialog ? 'Open' : 'Closed'}</p>
      </div>
      
      <ReserveDialog
        product={testProduct}
        isOpen={showReserveDialog}
        onClose={() => {
          console.log("Closing dialog");
          setShowReserveDialog(false);
        }}
        onReservationSuccess={handleReservationSuccess}
        theme="market"
      />
    </div>
  );
}
