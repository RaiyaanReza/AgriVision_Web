/*
AgriBot Chat Interface - Production Ready
Real-time chat with image upload and streaming responses
*/

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image, X, Bot, User, Loader2, Sparkles } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const AgriBotChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage({
          file: file,
          preview: reader.result,
          base64: reader.result.split(',')[1]
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const sendMessage = async () => {
    if ((!inputMessage.trim() && !selectedImage) || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      image: selectedImage?.preview,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsStreaming(true);

    try {
      const formData = new FormData();
      formData.append('message', inputMessage || 'Analyze this image');
      if (selectedImage?.file) {
        formData.append('image', selectedImage.file);
      }

      const response = await fetch('http://localhost:8000/api/chat/stream', {
        method: 'POST',
        body: formData
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botMessageContent = '';
      let botMessageId = Date.now() + 1;

      // Add empty bot message placeholder
      setMessages(prev => [...prev, {
        id: botMessageId,
        type: 'bot',
        content: '',
        timestamp: new Date().toISOString(),
        isStreaming: true
      }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setIsStreaming(false);
              // Update message to remove streaming flag
              setMessages(prev => prev.map(msg => 
                msg.id === botMessageId ? { ...msg, isStreaming: false } : msg
              ));
            } else {
              try {
                const parsed = JSON.parse(data);
                if (parsed.chunk) {
                  botMessageContent += parsed.chunk;
                  setMessages(prev => prev.map(msg => 
                    msg.id === botMessageId ? { ...msg, content: botMessageContent } : msg
                  ));
                }
                if (parsed.error) {
                  setMessages(prev => prev.map(msg => 
                    msg.id === botMessageId ? { ...msg, content: `Error: ${parsed.error}`, error: true } : msg
                  ));
                }
              } catch (e) {
                console.error('Parse error:', e);
              }
            }
          }
        }
      }

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'bot',
        content: `Sorry, I encountered an error: ${error.message}`,
        timestamp: new Date().toISOString(),
        error: true
      }]);
      setIsStreaming(false);
    } finally {
      setIsLoading(false);
      removeImage();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-6xl mx-auto p-4 md:p-6">
      {/* Header - Glassmorphism */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-t-3xl p-5 md:p-6 shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500"></div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-2xl shadow-inner">
              <Bot className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-700 to-emerald-600 dark:from-green-400 dark:to-emerald-300">
                AgriBot
              </h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Expert Agricultural Intelligence</p>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full border border-green-100 dark:border-green-800">
            <Sparkles className="w-4 h-4 text-green-600" />
            <span className="text-xs font-semibold text-green-700 dark:text-green-300">Gemini 2.0 Pro Powered</span>
          </div>
        </div>
      </motion.div>

      {/* Messages Container - Refined Scroll & Visuals */}
      <div className="flex-1 overflow-hidden relative border-x border-gray-200/50 dark:border-gray-700/50 bg-gray-50/30 dark:bg-gray-900/30 backdrop-blur-sm">
        <div className="h-full overflow-y-auto px-6 py-8 space-y-6 scroll-smooth scrollbar-hide" id="chat-messages">
          <AnimatePresence mode="popLayout">
            {messages.length === 0 ? (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center min-h-[400px] text-center"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-green-200/50 dark:shadow-none border border-green-200/30 dark:border-green-800/30">
                   <Bot className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">Your Field Assistant Awaits</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8 leading-relaxed">
                  Identify crop diseases instantly, get expert treatment plans, and master your farming with AI.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl">
                  {[
                    { text: "My tomato leaves have brown spots", icon: "🍅" },
                    { text: "Best organic pesticides for rice", icon: "🌾" },
                    { text: "When to apply nitrogen fertilizer?", icon: "🧪" },
                    { text: "Identify wheat rust symptoms", icon: "🍂" }
                  ].map((suggestion, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.02, backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setInputMessage(suggestion.text)}
                      className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm text-left group transition-all"
                    >
                      <span className="mr-2">{suggestion.icon}</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400">
                        {suggestion.text}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              messages.map((message) => (
                <motion.div
                  key={message.id}
                  layout
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex gap-4 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-105 ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white' 
                      : 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                  }`}>
                    {message.type === 'user' ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
                  </div>
                  <div className={`max-w-[85%] md:max-w-[75%] ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                    {message.image && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-3 inline-block rounded-3xl overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl"
                      >
                        <img 
                          src={message.image} 
                          alt="Uploaded" 
                          className="max-h-64 w-auto object-cover"
                        />
                      </motion.div>
                    )}
                    <div className={`inline-block p-5 rounded-3xl shadow-sm relative ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-sm bg-gradient-to-br from-blue-600 to-indigo-600'
                        : message.error
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-100 dark:border-red-900/30 rounded-tl-sm'
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-tl-sm shadow-md'
                    }`}>
                      <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed font-medium">
                        {message.content}
                      </div>
                      {message.isStreaming && (
                        <div className="flex gap-1 mt-2">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce delay-100"></span>
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce delay-200"></span>
                        </div>
                      )}
                    </div>
                    <div className={`flex items-center gap-2 mt-2 px-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {message.type === 'bot' && !message.error && (
                        <>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span className="text-green-500">Verified Diagnosis</span>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} className="h-4" />
        </div>
        
        {/* Subtle Overlay Gradient */}
        <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-gray-50/50 dark:from-gray-900/50 to-transparent pointer-events-none"></div>
      </div>

      {/* Input Area - Integrated Glassmorphism */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-t-0 border-gray-200/50 dark:border-gray-700/50 rounded-b-3xl p-4 md:p-6 shadow-2xl relative">
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-full left-6 mb-4 flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-green-100 dark:border-green-900/30"
            >
              <div className="relative group">
                <img 
                  src={selectedImage.preview} 
                  alt="Preview" 
                  className="w-20 h-20 object-cover rounded-xl border border-gray-200 dark:border-gray-700"
                />
                <button
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="pr-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter mb-1">Upload Ready</p>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate max-w-[150px]">
                  {selectedImage.file.name}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="flex items-center gap-3 md:gap-4 bg-gray-100 dark:bg-gray-900/50 p-2 rounded-2xl border border-gray-200/30 dark:border-gray-700/30">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="p-3 text-gray-500 hover:text-green-600 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all disabled:opacity-50"
            title="Upload Crop Image"
          >
            <Image className="w-6 h-6" />
          </button>
          
          <textarea
            rows="1"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Describe your plant problem..."
            className="flex-1 py-3 px-2 bg-transparent border-none focus:ring-0 dark:text-white resize-none text-base placeholder:text-gray-400 dark:placeholder:text-gray-600 min-h-[44px] max-h-32"
            disabled={isLoading}
          />
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={sendMessage}
            disabled={isLoading || (!inputMessage.trim() && !selectedImage)}
            className="flex items-center justify-center w-12 h-12 md:w-auto md:px-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl shadow-lg shadow-green-200 dark:shadow-none font-bold transition-all disabled:opacity-50 disabled:grayscale"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <span className="hidden md:inline mr-2">Send</span>
                <Send className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </div>
        <p className="mt-3 text-center text-[10px] text-gray-400 dark:text-gray-600 font-medium uppercase tracking-widest">
          AI can make mistakes. Verify critical diagnosis with agricultural experts.
        </p>
      </div>
    </div>
  );
};

export default AgriBotChat;
