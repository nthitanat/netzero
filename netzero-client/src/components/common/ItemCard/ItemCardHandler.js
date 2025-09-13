const ItemCardHandler = (stateItemCard, setItemCard, item, onItemClick) => {
  return {
    handleCardClick: (event) => {
      // Prevent default behavior if clicking on action buttons
      if (event?.target.closest('button')) {
        return;
      }
      
      if (onItemClick && item) {
        onItemClick(item.id || item._id || item.key, item);
      }
    },
    
    handleMouseEnter: () => {
      setItemCard("isHovered", true);
    },
    
    handleMouseLeave: () => {
      setItemCard("isHovered", false);
    },
    
    handleImageLoad: () => {
      setItemCard("isLoading", false);
    },
    
    handleImageError: () => {
      console.error(`Failed to load image for item: ${item?.title || item?.name}`);
      setItemCard("isLoading", false);
    },
    
    handleSelect: () => {
      setItemCard("isSelected", !stateItemCard.isSelected);
    },
    
    handleFavorite: () => {
      // This can be extended for specific implementations
      console.log(`Toggle favorite for item: ${item?.title || item?.name}`);
    }
  };
};

export default ItemCardHandler;
