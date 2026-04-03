import { useState } from 'react';
import { MdClose, MdSend } from 'react-icons/md';
import { FaRobot, FaUser } from 'react-icons/fa';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5260'}/api/chat`;

export default function ChatBot({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hello! I\'m your CRM AI Assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: inputMessage,
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Prepare chat history for API
      const history = messages
        .filter(msg => msg.type !== 'bot' || msg.id > 1) // Exclude initial greeting
        .map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.text
        }));

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          history: history
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMessage = {
          id: messages.length + 2,
          type: 'bot',
          text: `Error: ${data.error || `HTTP ${response.status}`}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        return;
      }

      if (data.success) {
        const botMessage = {
          id: messages.length + 2,
          type: 'bot',
          text: data.message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        const errorMessage = {
          id: messages.length + 2,
          type: 'bot',
          text: `Error: ${data.error || 'Failed to get response'}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: 'Sorry, I\'m having trouble connecting to the server. Please try again later.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '100px',
      right: '30px',
      width: '380px',
      height: '550px',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #FF8040 0%, #FF6B35 100%)',
        padding: '20px',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '45px',
            height: '45px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FaRobot size={24} />
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '16px' }}>AI Assistant</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>Online</div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '5px'
          }}
        >
          <MdClose size={24} />
        </button>
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        background: '#f8f9fa'
      }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '15px',
              flexDirection: message.type === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-start'
            }}
          >
            {/* Avatar */}
            <div style={{
              width: '35px',
              height: '35px',
              borderRadius: '50%',
              background: message.type === 'bot' ? '#FF8040' : '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              flexShrink: 0
            }}>
              {message.type === 'bot' ? <FaRobot size={18} /> : <FaUser size={16} />}
            </div>

            {/* Message Bubble */}
            <div style={{
              maxWidth: '70%',
              background: message.type === 'bot' ? 'white' : '#FF8040',
              color: message.type === 'bot' ? '#333' : 'white',
              padding: '12px 16px',
              borderRadius: message.type === 'bot' ? '12px 12px 12px 4px' : '12px 12px 4px 12px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              {message.text}
              <div style={{
                fontSize: '11px',
                marginTop: '6px',
                opacity: 0.7
              }}>
                {message.timestamp.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '15px',
            alignItems: 'flex-start'
          }}>
            <div style={{
              width: '35px',
              height: '35px',
              borderRadius: '50%',
              background: '#FF8040',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              flexShrink: 0
            }}>
              <FaRobot size={18} />
            </div>
            <div style={{
              background: 'white',
              padding: '12px 16px',
              borderRadius: '12px 12px 12px 4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
            }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                <span style={{ animation: 'bounce 1.4s infinite' }}>●</span>
                <span style={{ animation: 'bounce 1.4s infinite 0.2s' }}>●</span>
                <span style={{ animation: 'bounce 1.4s infinite 0.4s' }}>●</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>

      {/* Quick Actions */}
      <div style={{
        padding: '10px 20px',
        borderTop: '1px solid #e5e7eb',
        background: 'white'
      }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setInputMessage('How do I create a new ticket?')}
            style={{
              background: '#f3f4f6',
              border: '1px solid #e5e7eb',
              borderRadius: '16px',
              padding: '6px 12px',
              fontSize: '12px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            Create ticket
          </button>
          <button
            onClick={() => setInputMessage('Show ticket status')}
            style={{
              background: '#f3f4f6',
              border: '1px solid #e5e7eb',
              borderRadius: '16px',
              padding: '6px 12px',
              fontSize: '12px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            Ticket status
          </button>
        </div>
      </div>

      {/* Input Area */}
      <div style={{
        padding: '15px 20px',
        borderTop: '1px solid #e5e7eb',
        background: 'white',
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
      }}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: '12px 16px',
            border: '1px solid #e5e7eb',
            borderRadius: '24px',
            fontSize: '14px',
            outline: 'none',
            background: '#f9fafb'
          }}
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isLoading}
          style={{
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            background: (inputMessage.trim() && !isLoading) ? '#FF8040' : '#e5e7eb',
            border: 'none',
            color: 'white',
            cursor: (inputMessage.trim() && !isLoading) ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
        >
          <MdSend size={20} />
        </button>
      </div>
    </div>
  );
}
