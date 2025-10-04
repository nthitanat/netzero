import { useState, useEffect, useCallback } from "react";
import { chatService, API_STATUS, ApiError } from "../../api";
import { useAuth } from "../../contexts/AuthContext";

const useChat = (initialProps) => {
  const { user, isAuthenticated } = useAuth();
  
  const [stateChat, setState] = useState({
    chatApps: [],
    filteredChatApps: [],
    searchTerm: '',
    filterStatus: 'all',
    isLoading: true,
    error: null,
    isEmpty: false,
    isFiltered: false,
    pagination: null,
    currentPage: 1,
    hasMoreChats: false,
    // Modal state
    showChatModal: false,
    showCreateModal: false,
    selectedChat: null,
    // User state
    user: null,
  });

  const setChat = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleChatField = (field) => {
    setState((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };



  // Filter chat apps based on search and status filter
  const applyFilters = useCallback((chatApps, searchTerm, filterStatus) => {
    let filtered = [...chatApps];

    // Apply status filter
    if (filterStatus && filterStatus !== 'all') {
      filtered = filtered.filter(chat => chat.status === filterStatus);
    }

    // Apply search filter
    if (searchTerm && searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(chat => 
        chat.title?.toLowerCase().includes(search) ||
        chat.description?.toLowerCase().includes(search) ||
        chat.id?.toLowerCase().includes(search)
      );
    }

    const isEmpty = filtered.length === 0;
    const isFiltered = filterStatus !== 'all' || (searchTerm && searchTerm.trim());

    return { filtered, isEmpty, isFiltered };
  }, []);

  // Load chat applications using API service
  const loadChatApps = useCallback(async (options = {}) => {
    try {
      setState(prevState => ({ 
        ...prevState, 
        isLoading: true, 
        error: null 
      }));

      const {
        status = stateChat.filterStatus,
        limit = 50,
      } = options;

      // Build filters object for the API
      const filters = {};
      if (status && status !== 'all') {
        filters.status = status;
      }
      if (limit) {
        filters.limit = limit;
      }

      // Use the chat service to get data
      const chatResponse = await chatService.getAllChatApps(filters);

      if (chatResponse.status) {
        const chatApps = chatResponse.data || [];
        
        // Apply local filtering
        const { filtered, isEmpty, isFiltered } = applyFilters(
          chatApps, 
          stateChat.searchTerm, 
          stateChat.filterStatus
        );

        setState(prevState => ({
          ...prevState,
          chatApps,
          filteredChatApps: filtered,
          isEmpty,
          isFiltered,
          isLoading: false,
          error: null,
        }));
      }
    } catch (error) {
      console.error('Error loading chat applications:', error);
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to load chat applications';
        
      setState(prevState => ({
        ...prevState,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, [stateChat.filterStatus, stateChat.searchTerm, applyFilters]);

  // Load user information from auth context
  const loadUserInfo = useCallback(async () => {
    try {
      // User info comes from auth context, no API call needed
      if (user && isAuthenticated) {
        setState(prevState => ({
          ...prevState,
          user: user,
        }));
      }
    } catch (error) {
      console.error('Error loading user info:', error);
      // Don't show error for user info, just log it
    }
  }, [user, isAuthenticated]);

  // Initial load on component mount
  useEffect(() => {
    const initializeChat = async () => {
      await Promise.all([
        loadChatApps(),
        loadUserInfo(),
      ]);
    };

    initializeChat();
  }, [loadChatApps, loadUserInfo]);

  // Update filtered results when search or filter changes
  useEffect(() => {
    if (stateChat.chatApps.length > 0) {
      const { filtered, isEmpty, isFiltered } = applyFilters(
        stateChat.chatApps,
        stateChat.searchTerm,
        stateChat.filterStatus
      );

      setState(prevState => ({
        ...prevState,
        filteredChatApps: filtered,
        isEmpty,
        isFiltered,
      }));
    }
  }, [stateChat.searchTerm, stateChat.filterStatus, stateChat.chatApps, applyFilters]);

  return {
    stateChat,
    setChat,
    toggleChatField,
    loadChatApps,
    loadUserInfo,
  };
};

export default useChat;