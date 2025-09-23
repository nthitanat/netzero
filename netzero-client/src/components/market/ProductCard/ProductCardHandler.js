const ProductCardHandler = (product, onProductClick, onReserveClick) => {
  return {
    handleProductClick: (itemId, item, event) => {
      // The ItemCard passes (itemId, item) as parameters, event might be undefined
      // We'll use the item parameter if available, otherwise fallback to product
      const productItem = item || product;
      
      if (onProductClick) {
        onProductClick(productItem);
      }
    },

    handleReserveClick: (event) => {
      if (event && event.stopPropagation) {
        event.stopPropagation(); // Prevent event bubbling to card click
      }
      
      // Check if product is in stock - use stock_quantity from database or inStock field for legacy data
      const isInStock = product?.stock_quantity > 0 || product?.inStock;
      
      if (!isInStock) {
        return;
      }
      
      // Call the reserve callback to let parent handle the reserve dialog
      if (onReserveClick) {
        onReserveClick(product);
      }
    }
  };
};

export default ProductCardHandler;
