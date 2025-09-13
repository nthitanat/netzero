import styles from "./ProductListCard.module.scss";

const ProductListCardHandler = (stateProductListCard, setProductListCard, callbacks) => {
  const { onProductClick, onProductMapView } = callbacks;

  const handleProductClick = (product) => {
    console.log("ProductListCard: Product clicked:", product);
    setProductListCard("selectedProduct", product);
    if (onProductClick) {
      onProductClick(product);
    }
  };

  const handleProductMapView = (product) => {
    console.log("ProductListCard: View on map clicked:", product);
    if (onProductMapView) {
      onProductMapView(product);
    }
  };

  const handleProductHover = (product) => {
    setProductListCard("hoveredProduct", product);
  };

  const handleProductLeave = () => {
    setProductListCard("hoveredProduct", null);
  };

  const getMarketTypeEmoji = (marketType) => {
    switch (marketType) {
      case "market":
        return "🛒";
      case "willing":
        return "🎁";
      case "barther-trade":
        return "🔄";
      default:
        return "📍";
    }
  };

  const getActionLabel = (marketType) => {
    switch (marketType) {
      case "market":
        return "สั่งซื้อ";
      case "willing":
        return "รับฟรี";
      case "barther-trade":
        return "แลกเปลี่ยน";
      default:
        return "ดูรายละเอียด";
    }
  };

  return {
    handleProductClick,
    handleProductMapView,
    handleProductHover,
    handleProductLeave,
    getMarketTypeEmoji,
    getActionLabel,
  };
};

export default ProductListCardHandler;
