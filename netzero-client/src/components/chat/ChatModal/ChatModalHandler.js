import { chatService } from "../../../api/chat";

const ChatModalHandler = (stateChatModal, setChatModal, onClose, chatApp, addMessage) => {
  return {
    handleClose: () => {
      // Reset state when closing
      setChatModal({
        newMessage: '',
        error: null,
        messages: []
      });
      if (onClose) {
        onClose();
      }
    },

    handleOverlayClick: (event) => {
      // Close modal only if clicking on the overlay itself
      if (event.target === event.currentTarget) {
        setChatModal({
          newMessage: '',
          error: null,
          messages: []
        });
        if (onClose) {
          onClose();
        }
      }
    },

    handleKeyDown: (event) => {
      if (event.key === "Escape") {
        setChatModal({
          newMessage: '',
          error: null,
          messages: []
        });
        if (onClose) {
          onClose();
        }
      }
    },

    handleMessageChange: (e) => {
      setChatModal('newMessage', e.target.value);
    },

    handleSendMessage: async (e) => {
      e.preventDefault();
      
      if (!stateChatModal.newMessage.trim() || stateChatModal.sending) return;

      const messageText = stateChatModal.newMessage.trim();
      setChatModal('sending', true);
      setChatModal('error', null);

      try {
        // Check if chatApp exists before accessing its properties
        if (!chatApp || !chatApp.id) {
          throw new Error('ไม่พบข้อมูลการแชท');
        }
        
        // Send message to server and get welcome response
        const result = await chatService.sendMessage(chatApp.id, messageText);
        
        if (result.status === 'success') {
          // Add new message pair to conversation history
          addMessage(messageText, result.data.botResponse);
          // Clear input after successful send
          setChatModal('newMessage', '');
        } else {
          throw new Error(result.message);
        }

      } catch (error) {
        console.error('Error sending message:', error);
        setChatModal('error', 'ไม่สามารถส่งข้อความได้: ' + error.message);
      } finally {
        setChatModal('sending', false);
      }
    }
  };
};

export default ChatModalHandler;