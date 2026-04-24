/*
AgriBot Chat Interface - Production Ready
Real-time chat with image upload and streaming responses
*/

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image, X, Bot, User, Loader2, Sparkles } from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';

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
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto p-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-2xl p-6 shadow-lg"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-full">
            <Bot className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AgriBot</h1>
            <p className="text-green-100 text-sm">Your AI Agricultural Assistant</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Powered by Gemini AI</span>
          </div>
        </div>
      </motion.div>

      {/* Messages Container */}
      <Card className="flex-1 overflow-y-auto rounded-t-none border-t-0 space-y-4 p-6 bg-gray-50 dark:bg-gray-900">
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400"
            >
              <Bot className="w-16 h-16 mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Welcome to AgriBot!</h3>
              <p className="text-center max-w-md">
                Ask me anything about crop diseases, treatments, or farming tips. 
                You can also upload images for instant diagnosis!
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
                {[
                  "How do I treat tomato blight?",
                  "What causes yellow leaves in plants?",
                  "Organic pest control methods",
                  "Best fertilizer for wheat crops"
                ].map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInputMessage(suggestion)}
                    className="p-3 text-sm bg-white dark:bg-gray-800 rounded-lg hover:bg-green-50 dark:hover:bg-gray-700 transition-colors text-left border border-gray-200 dark:border-gray-700"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-green-600 text-white'
                }`}>
                  {message.type === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className={`max-w-[70%] ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                  {message.image && (
                    <img 
                      src={message.image} 
                      alt="Uploaded" 
                      className="rounded-lg mb-2 max-h-48 object-cover"
                    />
                  )}
                  <div className={`inline-block p-4 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-sm'
                      : message.error
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-tl-sm'
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm shadow-md'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.isStreaming && (
                      <Loader2 className="w-4 h-4 animate-spin inline ml-2" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 px-2">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </Card>

      {/* Input Area */}
      <Card className="rounded-b-none border-b-0 p-4 bg-white dark:bg-gray-800">
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-3 flex items-center gap-3 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
          >
            <img 
              src={selectedImage.preview} 
              alt="Preview" 
              className="w-16 h-16 object-cover rounded"
            />
            <span className="text-sm text-gray-600 dark:text-gray-300 flex-1 truncate">
              {selectedImage.file.name}
            </span>
            <button
              onClick={removeImage}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-red-600" />
            </button>
          </motion.div>
        )}
        
        <div className="flex gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="flex-shrink-0"
          >
            <Image className="w-5 h-5" />
          </Button>
          
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask AgriBot anything..."
            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white"
            disabled={isLoading}
          />
          
          <Button
            onClick={sendMessage}
            disabled={isLoading || (!inputMessage.trim() && !selectedImage)}
            className="flex-shrink-0 px-6"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Send
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AgriBotChat;
