import { useState, useEffect } from "react";
import { productsService } from "../../../api";

const useProductModal = (product, isOpen = false) => {
  // State for dynamic images loading
  const [productImages, setProductImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  
  // Load dynamic images when product changes or modal opens
  useEffect(() => {
    const loadProductImages = async () => {
      if (!product?.id || !isOpen) {
        setProductImages([]);
        return;
      }

      setImagesLoading(true);
      
      try {
        // Get images metadata from the API
        const imagesResponse = await productsService.getProductImagesMetadata(product.id);
        
        const allImages = [];
        
        // Always include thumbnail as the FIRST image
        allImages.push(productsService.getProductThumbnailUrl(product.id));
        
        // Include cover as the SECOND image
        allImages.push(productsService.getProductCoverUrl(product.id));
        
        // Add additional images from the metadata (these will be images 3, 4, 5, etc.)
        if (imagesResponse.success && imagesResponse.data.images.length > 0) {
          const additionalImages = imagesResponse.data.images.map(img => img.url);
          allImages.push(...additionalImages);
        }
        
        setProductImages(allImages);
      } catch (error) {
        console.error('Error loading product images:', error);
        // Fallback to basic images - thumbnail FIRST, then cover
        setProductImages([
          productsService.getProductThumbnailUrl(product.id),
          productsService.getProductCoverUrl(product.id)
        ]);
      } finally {
        setImagesLoading(false);
      }
    };

    loadProductImages();
  }, [product?.id, isOpen]);

  // Create a product object with dynamic image URLs and field mappings
  const productWithImages = product ? {
    ...product,
    images: productImages,
    inStock: product.stock_quantity > 0 // Convert stock_quantity to inStock boolean
  } : null;

  return {
    productWithImages,
    productImages,
    imagesLoading
  };
};

export default useProductModal;