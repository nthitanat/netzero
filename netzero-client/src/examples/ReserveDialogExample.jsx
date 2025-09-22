import React, { useState } from 'react';
import { ReserveDialog } from '../components/market';
import { getStaticImageUrl, getStaticImageUrls } from '../utils/imageUtils';

// Example product data for testing
const sampleProduct = {
  id: 1,
  title: "เสื้อผ้าชาวม๊ง",
  description: "เสื้อผ้าทอมือแบบดั้งเดิมของชาวม๊ง จังหวัดน่าน",
  price: 850,
  quantity: 8,
  images: getStaticImageUrls(["/assets/images/products/product-1/image-1.jpg"]),
  thumbnail: getStaticImageUrl("/assets/images/products/product-1/image-1.jpg"),
  category: "เสื้อผ้า",
  region: "ภาคเหนือ",
  inStock: true,
  weight: "300g",
  origin: "น่าน"
};

export default function ReserveDialogExample() {
  const [showReserveDialog, setShowReserveDialog] = useState(false);

  const handleReservationSuccess = (reservationData) => {
    const { transaction, updatedProduct, reservedQuantity } = reservationData;
    
    console.log('✅ Reservation successful:', {
      productId: transaction.productId,
      productTitle: transaction.productTitle,
      quantity: reservedQuantity,
      totalPrice: transaction.totalPrice,
      userId: transaction.userId,
      timestamp: transaction.timestamp
    });
    
    // Show success notification
    alert(
      `จองสินค้า "${transaction.productTitle}" จำนวน ${reservedQuantity} ชิ้น เรียบร้อยแล้ว!\n` +
      `ยอดรวม: ${transaction.totalPrice.toLocaleString()} บาท\n` +
      `เราจะติดต่อกลับในเร็วๆ นี้`
    );
    
    // Close the dialog
    setShowReserveDialog(false);
    
    // Here you could also:
    // - Update the product list to show new quantity
    // - Navigate to a confirmation page
    // - Send analytics events
    // - Update user's reservation history
  };

  const handleCloseDialog = () => {
    setShowReserveDialog(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Reserve Dialog Example</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Sample Product:</h3>
        <p><strong>Title:</strong> {sampleProduct.title}</p>
        <p><strong>Price:</strong> {sampleProduct.price.toLocaleString()} บาท</p>
        <p><strong>Available Quantity:</strong> {sampleProduct.quantity} ชิ้น</p>
        <p><strong>Origin:</strong> {sampleProduct.origin}</p>
      </div>
      
      <button 
        onClick={() => setShowReserveDialog(true)}
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
        จองสินค้า (Reserve Product)
      </button>
      
      <ReserveDialog
        product={sampleProduct}
        isOpen={showReserveDialog}
        onClose={handleCloseDialog}
        onReservationSuccess={handleReservationSuccess}
        theme="market"
      />
      
      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Usage Instructions:</h3>
        <ol>
          <li>Click the "จองสินค้า" button to open the reserve dialog</li>
          <li>Select the quantity you want to reserve using +/- buttons or direct input</li>
          <li>View the total price calculation</li>
          <li>Click "ยืนยันการจอง" to confirm the reservation</li>
          <li>The dialog will simulate an API call and show success message</li>
        </ol>
        
        <h3>Features:</h3>
        <ul>
          <li>Quantity validation (min: 1, max: available stock)</li>
          <li>Real-time price calculation</li>
          <li>Error handling for invalid inputs</li>
          <li>Loading states during API calls</li>
          <li>Responsive design</li>
          <li>Keyboard navigation (ESC to close)</li>
        </ul>
      </div>
    </div>
  );
}
