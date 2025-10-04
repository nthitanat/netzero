import { useNavigate } from 'react-router-dom';

const ChatHandler = (stateChat, setChat) => {
  const navigate = useNavigate();
  
  return {
    handleChatClick: (chatApp) => {
      setChat({
        selectedChat: chatApp,
        showChatModal: true
      });
    },

    handleCreateChat: () => {
      setChat("showCreateModal", true);
    },

    handleCloseModal: () => {
      setChat({
        showChatModal: false,
        selectedChat: null
      });
    },

    handleCloseCreateModal: () => {
      setChat("showCreateModal", false);
    },

    handleNavigate: (path, label) => {
      // Navigate to the specified route
      navigate(path);
    },

    handleRefresh: async () => {
      try {
        setChat("isLoading", true);
        const { chatService } = await import('../../api');
        
        const response = await chatService.getAllChatApps();
        
        if (response.success) {
          const chatApps = response.data?.chatApps || [];

          setChat({
            chatApps,
            filteredChatApps: chatApps,
            isLoading: false,
            error: null
          });
        }
      } catch (error) {
        console.error('Error refreshing chat apps:', error);
        setChat({
          isLoading: false,
          error: 'เกิดข้อผิดพลาดในการโหลดข้อมูล'
        });
      }
    },

    handleSearch: async (searchTerm) => {
      setChat("searchTerm", searchTerm);
      
      // Use local filtering since search API doesn't exist in chatService
      const filtered = stateChat.chatApps.filter(chat => {
        if (!searchTerm.trim()) return true;
        
        const searchLower = searchTerm.toLowerCase();
        return (
          chat.title?.toLowerCase().includes(searchLower) ||
          chat.description?.toLowerCase().includes(searchLower) ||
          chat.productName?.toLowerCase().includes(searchLower) ||
          `${chat.ownerFirstName} ${chat.ownerLastName}`.toLowerCase().includes(searchLower)
        );
      });
      
      setChat({
        filteredChatApps: filtered,
        error: null
      });
    },

    handleFilterChange: (filterStatus) => {
      setChat("filterStatus", filterStatus);
      
      // Use local filtering since status filter API doesn't exist in chatService
      let filtered = stateChat.chatApps;
      
      if (filterStatus && filterStatus !== 'all') {
        filtered = stateChat.chatApps.filter(chat => chat.status === filterStatus);
      }
      
      // Apply current search term if exists
      if (stateChat.searchTerm && stateChat.searchTerm.trim()) {
        const searchLower = stateChat.searchTerm.toLowerCase();
        filtered = filtered.filter(chat => 
          chat.title?.toLowerCase().includes(searchLower) ||
          chat.description?.toLowerCase().includes(searchLower) ||
          chat.productName?.toLowerCase().includes(searchLower) ||
          `${chat.ownerFirstName} ${chat.ownerLastName}`.toLowerCase().includes(searchLower)
        );
      }
      
      setChat({
        filteredChatApps: filtered,
        error: null
      });
    },

    handleLoadMore: () => {
      // Implementation for pagination if needed
      console.log('Load more chat apps');
    },

    handleShare: (chatAppId) => {
      if (navigator.share) {
        navigator.share({
          title: 'NetZero Chat Application',
          text: 'Check out this chat application!',
          url: `${window.location.origin}/chat/${chatAppId}`,
        });
      } else {
        // Fallback for browsers that don't support native sharing
        navigator.clipboard.writeText(`${window.location.origin}/chat/${chatAppId}`);
        alert('Chat link copied to clipboard!');
      }
    },
  };
};

export default ChatHandler;