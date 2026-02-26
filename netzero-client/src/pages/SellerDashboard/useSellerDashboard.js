import { useState, useEffect, useCallback } from "react";
import { productsService, reservationsService } from "../../api";
import { useAuth } from "../../contexts/AuthContext";

const useSellerDashboard = (initialProps = {}) => {
  const { user } = useAuth();
  
  const [stateSellerDashboard, setState] = useState({
    activeTab: "products", // products, reservations
    isLoading: true,
    
    // Products data
    products: [],
    selectedProduct: null,
    showProductModal: false,
    showDeleteConfirm: false,
    productToDelete: null,
    productModalMode: "create", // "create" or "edit"
    isSubmittingProduct: false,
    
    // Product Survey flow
    showSurveyForm: false,
    showSurveyResult: false,
    surveyResult: null,
    pendingProductId: null, // Store product ID during survey flow
    
    // Add to Event Dialog
    showAddToEventDialog: false,
    productForEvent: null,
    
    // Reservations data
    reservations: [],
    
    error: null,
    ...initialProps
  });

  const setSellerDashboard = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  // Load seller's products
  const loadProducts = async () => {
    try {
      console.log("🔄 Loading seller's products...");
      const response = await productsService.getMyProducts();
      
      setState(prevState => ({
        ...prevState,
        products: response.data
      }));
      
      console.log(`✅ Loaded ${response.data.length} products for seller`);
    } catch (error) {
      console.error("❌ Error loading seller products:", error);
      setState(prevState => ({
        ...prevState,
        error: "ไม่สามารถโหลดข้อมูลสินค้าได้"
      }));
      throw error; // Re-throw to handle in Promise.all
    }
  };

  // Load seller's reservations
  const loadReservations = async () => {
    try {
      console.log("🔄 Loading seller's reservations...");
      const response = await reservationsService.getMyProductReservations();
      
      setState(prevState => ({
        ...prevState,
        reservations: response.data
      }));
      
      console.log(`✅ Loaded ${response.data.length} reservations for seller`);
    } catch (error) {
      console.error("❌ Error loading seller reservations:", error);
      setState(prevState => ({
        ...prevState,
        error: "ไม่สามารถโหลดข้อมูลการจองได้"
      }));
      throw error; // Re-throw to handle in Promise.all
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      if (!user || (user.role !== 'seller' && user.role !== 'community_head' && user.role !== 'admin')) {
        return;
      }
      
      try {
        setState(prevState => ({ ...prevState, isLoading: true, error: null }));
        
        // Load both products and reservations
        await Promise.all([
          loadProducts(),
          loadReservations()
        ]);
        
        // Set loading to false after both operations complete
        setState(prevState => ({ ...prevState, isLoading: false }));
        
      } catch (error) {
        console.error("❌ Error initializing seller dashboard:", error);
        setState(prevState => ({
          ...prevState,
          error: "ไม่สามารถโหลดข้อมูลได้",
          isLoading: false
        }));
      }
    };

    initializeData();
  }, [user]);

  return {
    stateSellerDashboard,
    setSellerDashboard,
    loadProducts,
    loadReservations
  };
};

export default useSellerDashboard;