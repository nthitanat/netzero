import React, { useEffect, useRef } from "react";
import styles from "./ChatModal.module.scss";
import useChatModal from "./useChatModal";
import ChatModalHandler from "./ChatModalHandler";
import { GoogleIcon } from "../../common";

export default function ChatModal({ 
  isOpen, 
  onClose, 
  chatApp,
  user 
}) {
  const { stateChatModal, setChatModal, addMessage } = useChatModal({ chatApp, user });
  const handlers = ChatModalHandler(stateChatModal, setChatModal, onClose, chatApp, addMessage);
  const responseAreaRef = useRef(null);

  // Add keyboard event listener for Escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && isOpen) {
        handlers.handleKeyDown(event);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset"; // Restore scrolling
    };
  }, [isOpen, handlers]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (responseAreaRef.current && stateChatModal.messages.length > 0) {
      responseAreaRef.current.scrollTop = responseAreaRef.current.scrollHeight;
    }
  }, [stateChatModal.messages]);

  if (!isOpen || !chatApp) return null;

  return (
    <div className={styles.Container}>
      <div className={styles.Overlay} onClick={handlers.handleOverlayClick} />
      
      <div className={styles.Modal}>
        <button 
          className={styles.CloseButton}
          onClick={handlers.handleClose}
        >
          <GoogleIcon iconType="close" size="medium" />
        </button>
        
        <div className={styles.ModalContent}>
          {/* Header */}
          <div className={styles.Header}>
            <div className={styles.HeaderInfo}>
              <h2 className={styles.Title}>
                💬 {chatApp.title}
              </h2>
              <p className={styles.Subtitle}>
                📦 {chatApp.productName} • 👤 {chatApp.ownerFirstName} {chatApp.ownerLastName}
              </p>
            </div>
          </div>

          {/* Response Area */}
          <div className={styles.ResponseArea} ref={responseAreaRef}>
            {/* Welcome Instructions */}
            {stateChatModal.messages.length === 0 && !stateChatModal.error && (
              <div className={styles.WelcomeMessage}>
                <div className={styles.WelcomeIcon}>💬</div>
                <p className={styles.WelcomeTitle}>ส่งข้อความเพื่อเริ่มต้นการสนทนา</p>
                <p className={styles.WelcomeSubtitle}>AI Assistant จะตอบกลับด้วยข้อความต้อนรับ</p>
              </div>
            )}

            {/* Messages Display */}
            {stateChatModal.messages.length > 0 && (
              <div className={styles.MessagesContainer}>
                {stateChatModal.messages.map((message) => (
                  <div key={message.id} className={styles.MessageContainer}>
                    {/* User Message */}
                    <div className={styles.MessageWrapper}>
                      <div className={styles.UserMessage}>
                        <div className={styles.MessageHeader}>
                          👤 {user?.firstName || 'คุณ'}
                        </div>
                        <div className={styles.MessageText}>{message.userMessage}</div>
                        <div className={styles.MessageTime}>
                          {new Date(message.timestamp).toLocaleTimeString('th-TH', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Bot Response */}
                    <div className={styles.MessageWrapper}>
                      <div className={styles.BotMessage}>
                        <div className={styles.MessageHeader}>
                          🤖 AI Assistant
                        </div>
                        <div className={styles.MessageText}>{message.botResponse}</div>
                        <div className={styles.MessageTime}>
                          {new Date(message.timestamp).toLocaleTimeString('th-TH', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error Display */}
            {stateChatModal.error && (
              <div className={styles.ErrorMessage}>
                <GoogleIcon iconType="error" size="small" className={styles.ErrorIcon} />
                <p className={styles.ErrorText}>{stateChatModal.error}</p>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className={styles.InputSection}>
            <form onSubmit={handlers.handleSendMessage} className={styles.MessageForm}>
              <input
                type="text"
                value={stateChatModal.newMessage}
                onChange={handlers.handleMessageChange}
                placeholder="พิมพ์ข้อความของคุณ..."
                disabled={stateChatModal.sending}
                className={styles.MessageInput}
              />
              <button
                type="submit"
                disabled={!stateChatModal.newMessage.trim() || stateChatModal.sending}
                className={styles.SendButton}
              >
                {stateChatModal.sending ? (
                  <>
                    <div className={styles.LoadingSpinner} />
                    ส่ง...
                  </>
                ) : (
                  <>
                    <GoogleIcon iconType="send" size="medium" />
                    📤 ส่ง
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}