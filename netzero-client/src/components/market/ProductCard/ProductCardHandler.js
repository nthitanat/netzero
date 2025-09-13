const ProductCardHandler = (stateProductCard, setProductCard, product, onProductClick, onReserveClick) => {
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
      
      if (!product.inStock) {
        return;
      }
      
      // Call the reserve callback to let parent handle the reserve dialog
      if (onReserveClick) {
        onReserveClick(product);
      }
    },

    handleMouseEnter: () => {
      setProductCard("isHovered", true);
    },

    handleMouseLeave: () => {
      setProductCard("isHovered", false);
    }
  };
};

export default ProductCardHandler;
