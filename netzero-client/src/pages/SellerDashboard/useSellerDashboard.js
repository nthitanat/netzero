import { useState, useEffect, useCallback } from "react";
import { productsService, reservationsService } from "../../api";
import { useAuth } from "../../contexts/AuthContext";

const useSellerDashboard = (initialProps = {}) => {
  const { user } = useAuth();
  
  const [stateSellerDashboard, setState] = useState({
    activeTab: "stats", // stats, products, reservations
    isLoading: true,
    
    // Products data
    products: [],
    selectedProduct: null,
    showProductModal: false,
    showDeleteConfirm: false,
    productToDelete: null,
    productModalMode: "create", // "create" or "edit"
    isSubmittingProduct: false,
    
    // Reservations data
    reservations: [],
    
    // Stats data
    stats: {
      totalProducts: 0,
      totalReservations: 0,
      pendingReservations: 0,
      confirmedReservations: 0,
      totalRevenue: 0,
      outOfStockProducts: 0
    },
    
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

  // Calculate statistics
  const calculateStats = useCallback(() => {
    const products = stateSellerDashboard.products;
    const reservations = stateSellerDashboard.reservations;
    
    const totalProducts = products.length;
    const totalReservations = reservations.length;
    const pendingReservations = reservations.filter(r => r.status === 'pending').length;
    const confirmedReservations = reservations.filter(r => r.status === 'confirmed').length;
    const outOfStockProducts = products.filter(p => p.stock_quantity === 0).length;
    
    // Calculate revenue from confirmed reservations
    const totalRevenue = reservations
      .filter(r => r.status === 'confirmed')
      .reduce((sum, r) => {
        const product = products.find(p => p.id === r.product_id);
        return sum + (product ? product.price * r.quantity : 0);
      }, 0);
    
    setState(prevState => ({
      ...prevState,
      stats: {
        totalProducts,
        totalReservations,
        pendingReservations,
        confirmedReservations,
        totalRevenue,
        outOfStockProducts
      }
    }));
  }, [stateSellerDashboard.products, stateSellerDashboard.reservations]);

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      if (!user || user.role !== 'seller') {
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

  // Calculate stats when products or reservations change
  useEffect(() => {
    // Always calculate stats, even with empty arrays
    calculateStats();
  }, [calculateStats]);

  return {
    stateSellerDashboard,
    setSellerDashboard,
    loadProducts,
    loadReservations,
    calculateStats
  };
};

export default useSellerDashboard;