import { useState } from "react";

const useChatModal = (initialProps) => {
  const [stateChatModal, setState] = useState({
    newMessage: '',
    sending: false,
    error: null,
    messages: [] // Array to store conversation history
  });

  const setChatModal = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleChatModalField = (field) => {
    setState((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const resetChatModal = () => {
    setState({
      newMessage: '',
      sending: false,
      error: null,
      messages: []
    });
  };

  const addMessage = (userMessage, botResponse) => {
    const newMessage = {
      id: Date.now(), // Simple ID generation
      userMessage,
      botResponse,
      timestamp: new Date().toISOString()
    };
    setState((prevState) => ({
      ...prevState,
      messages: [...prevState.messages, newMessage]
    }));
  };

  return {
    stateChatModal,
    setChatModal,
    toggleChatModalField,
    resetChatModal,
    addMessage,
  };
};

export default useChatModal;