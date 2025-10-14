import { productsService } from "../../../api";

const ProductModalHandler = (stateProductModal, hookFunctions, onSave, onClose) => {
  const { 
    setFormField, 
    setThumbnail, 
    setCover, 
    addAdditionalImages, 
    removeAdditionalImage,
    clearThumbnail,
    clearCover,
    setError,
    clearError
  } = hookFunctions;

  return {
    handleInputChange: (field, value) => {
      // Clear error when user starts typing
      if (stateProductModal.error) {
        clearError();
      }

      // Special handling for type field - clear price if type is "willing"
      if (field === "type" && value === "willing") {
        setFormField("price", "0");
      }

      setFormField(field, value);
    },

    handleSubmit: async (e) => {
      e.preventDefault();
      clearError();

      try {
        // Validate form
        const { formData } = stateProductModal;
        
        if (!formData.title.trim()) {
          throw new Error("กรุณาใส่ชื่อสินค้า");
        }
        
        if (!formData.description.trim()) {
          throw new Error("กรุณาใส่รายละเอียดสินค้า");
        }

        if (!formData.category) {
          throw new Error("กรุณาเลือกหมวดหมู่");
        }

        if (!formData.type) {
          throw new Error("กรุณาเลือกประเภทการขาย");
        }

        if (!formData.stock_quantity || parseInt(formData.stock_quantity) < 0) {
          throw new Error("กรุณาใส่จำนวนคงเหลือที่ถูกต้อง");
        }

        if (formData.type !== "willing" && (!formData.price || parseFloat(formData.price) < 0)) {
          throw new Error("กรุณาใส่ราคาที่ถูกต้อง");
        }

        // Prepare form data for submission
        const productData = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          price: formData.type === "willing" ? 0 : parseFloat(formData.price),
          category: formData.category,
          type: formData.type,
          stock_quantity: parseInt(formData.stock_quantity),
          unit: formData.unit.trim() || null,
          isRecommend: formData.isRecommend
        };

        // Prepare image files
        const imageFiles = {
          thumbnail: stateProductModal.thumbnailFile,
          cover: stateProductModal.coverFile,
          additionalImages: stateProductModal.additionalImages.map(img => img.file)
        };

        // Call the parent save handler
        await onSave(productData, imageFiles);

      } catch (error) {
        console.error('Error submitting product form:', error);
        setError(error.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    },

    handleThumbnailChange: (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError("กรุณาเลือกไฟล์รูปภาพ");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("ขนาดไฟล์รูปภาพต้องไม่เกิน 5MB");
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setThumbnail(file, event.target.result);
      };
      reader.readAsDataURL(file);
    },

    handleCoverChange: (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError("กรุณาเลือกไฟล์รูปภาพ");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("ขนาดไฟล์รูปภาพต้องไม่เกิน 5MB");
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setCover(file, event.target.result);
      };
      reader.readAsDataURL(file);
    },

    handleImagesChange: (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      const currentCount = stateProductModal.additionalImages.length;
      const remainingSlots = 5 - currentCount;

      if (remainingSlots <= 0) {
        setError("สามารถอัพโหลดรูปเพิ่มเติมได้สูงสุด 5 รูป");
        return;
      }

      const filesToProcess = files.slice(0, remainingSlots);
      const processedImages = [];

      filesToProcess.forEach((file, index) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          setError("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
          return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError("ขนาดไฟล์รูปภาพต้องไม่เกิน 5MB");
          return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (event) => {
          processedImages.push({
            file: file,
            preview: event.target.result
          });

          // Add all images when all are processed
          if (processedImages.length === filesToProcess.length) {
            addAdditionalImages(processedImages);
          }
        };
        reader.readAsDataURL(file);
      });
    },

    handleRemoveThumbnail: () => {
      clearThumbnail();
    },

    handleRemoveCover: () => {
      clearCover();
    },

    handleRemoveAdditionalImage: (index) => {
      removeAdditionalImage(index);
    },

    handleCancel: () => {
      clearError();
      onClose();
    },

    // Utility functions for price formatting
    formatPrice: (price) => {
      if (!price || price === "0") return "0";
      return parseFloat(price).toLocaleString();
    },

    validateField: (field, value) => {
      switch (field) {
        case "title":
          return value.trim().length > 0 ? null : "ชื่อสินค้าไม่สามารถเว้นว่างได้";
        case "description":
          return value.trim().length > 0 ? null : "รายละเอียดสินค้าไม่สามารถเว้นว่างได้";
        case "category":
          return value !== "" ? null : "กรุณาเลือกหมวดหมู่";
        case "type":
          return value !== "" ? null : "กรุณาเลือกประเภทการขาย";
        case "price":
          if (stateProductModal.formData.type === "willing") return null;
          const price = parseFloat(value);
          return !isNaN(price) && price >= 0 ? null : "ราคาต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0";
        case "stock_quantity":
          const quantity = parseInt(value);
          return !isNaN(quantity) && quantity >= 0 ? null : "จำนวนคงเหลือต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0";
        default:
          return null;
      }
    }
  };
};

export default ProductModalHandler;