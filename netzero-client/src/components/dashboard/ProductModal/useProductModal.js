import { useState, useRef, useEffect } from "react";

const useProductModal = (product = null, mode = "create") => {
  const [stateProductModal, setState] = useState({
    formData: {
      title: "",
      description: "",
      price: "",
      category: "",
      type: "",
      stock_quantity: "",
      unit: "",
      isRecommend: false
    },
    thumbnailFile: null,
    coverFile: null,
    additionalImages: [],
    thumbnailPreview: null,
    coverPreview: null,
    error: null,
    isFormValid: false
  });

  // Refs for file inputs
  const thumbnailInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const imagesInputRef = useRef(null);

  // Initialize form data when product or mode changes
  useEffect(() => {
    if (mode === "edit" && product) {
      setProductModal("formData", {
        title: product.title || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        category: product.category || "",
        type: product.type || "",
        stock_quantity: product.stock_quantity?.toString() || "",
        unit: product.unit || "",
        isRecommend: product.isRecommend || false
      });
    } else {
      // Reset form for create mode
      setProductModal("formData", {
        title: "",
        description: "",
        price: "",
        category: "",
        type: "",
        stock_quantity: "",
        unit: "",
        isRecommend: false
      });
      clearImages();
    }
  }, [product, mode]);

  // Validate form whenever formData changes
  useEffect(() => {
    const { formData } = stateProductModal;
    const isValid = 
      formData.title.trim() !== "" &&
      formData.description.trim() !== "" &&
      formData.category !== "" &&
      formData.type !== "" &&
      formData.stock_quantity !== "" &&
      parseInt(formData.stock_quantity) >= 0 &&
      (formData.type === "willing" || (formData.price !== "" && parseFloat(formData.price) >= 0));

    setProductModal("isFormValid", isValid);
  }, [stateProductModal.formData]);

  const setProductModal = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const setFormField = (field, value) => {
    setState((prevState) => ({
      ...prevState,
      formData: {
        ...prevState.formData,
        [field]: value
      }
    }));
  };

  const clearImages = () => {
    setState((prevState) => ({
      ...prevState,
      thumbnailFile: null,
      coverFile: null,
      additionalImages: [],
      thumbnailPreview: null,
      coverPreview: null
    }));

    // Clear file inputs
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
    if (coverInputRef.current) coverInputRef.current.value = "";
    if (imagesInputRef.current) imagesInputRef.current.value = "";
  };

  const setThumbnail = (file, preview) => {
    setState((prevState) => ({
      ...prevState,
      thumbnailFile: file,
      thumbnailPreview: preview
    }));
  };

  const setCover = (file, preview) => {
    setState((prevState) => ({
      ...prevState,
      coverFile: file,
      coverPreview: preview
    }));
  };

  const addAdditionalImages = (newImages) => {
    setState((prevState) => {
      const currentImages = prevState.additionalImages;
      const remainingSlots = 5 - currentImages.length;
      const imagesToAdd = newImages.slice(0, remainingSlots);
      
      return {
        ...prevState,
        additionalImages: [...currentImages, ...imagesToAdd]
      };
    });
  };

  const removeAdditionalImage = (index) => {
    setState((prevState) => ({
      ...prevState,
      additionalImages: prevState.additionalImages.filter((_, i) => i !== index)
    }));
  };

  const clearThumbnail = () => {
    setState((prevState) => ({
      ...prevState,
      thumbnailFile: null,
      thumbnailPreview: null
    }));
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
  };

  const clearCover = () => {
    setState((prevState) => ({
      ...prevState,
      coverFile: null,
      coverPreview: null
    }));
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const setError = (error) => {
    setState((prevState) => ({
      ...prevState,
      error: error
    }));
  };

  const clearError = () => {
    setState((prevState) => ({
      ...prevState,
      error: null
    }));
  };

  const resetForm = () => {
    setState((prevState) => ({
      ...prevState,
      formData: {
        title: "",
        description: "",
        price: "",
        category: "",
        type: "",
        stock_quantity: "",
        unit: "",
        isRecommend: false
      },
      error: null,
      isFormValid: false
    }));
    clearImages();
  };

  return {
    stateProductModal: {
      ...stateProductModal,
      thumbnailInputRef,
      coverInputRef,
      imagesInputRef
    },
    setProductModal,
    setFormField,
    clearImages,
    setThumbnail,
    setCover,
    addAdditionalImages,
    removeAdditionalImage,
    clearThumbnail,
    clearCover,
    setError,
    clearError,
    resetForm
  };
};

export default useProductModal;