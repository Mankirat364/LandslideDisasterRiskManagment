import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import io from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { MdMenu, MdClose } from 'react-icons/md';
import { Link } from 'react-router-dom';

const ChatRoom = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentRoom, setCurrentRoom] = useState('general');
  const [rooms, setRooms] = useState(['general', 'monitoring', 'emergency', 'equipment']);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeView, setActiveView] = useState('chat');
  const typingTimeout = useRef(null);
  const messagesEndRef = useRef(null);

  const baseUrl = useSelector((state) => state.base.baseUrl);
  const userid = JSON.parse(localStorage.getItem("userid"));
  const username = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const role = JSON.parse(localStorage.getItem("role"));

  // Handle window resize for responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMobileNavOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Socket connection
  useEffect(() => {
    const newSocket = io(baseUrl, {
      transports: ['websocket'],
      upgrade: false
    });
    
    newSocket.on('connect', () => {
      setIsConnected(true);
    });
    
    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('typing', ({ userId, username, room }) => {
      if (room === currentRoom && userId !== userid) {
        setTypingUsers(prev => {
          const exists = prev.find(u => u.userId === userId);
          return exists ? prev : [...prev, { userId, username }];
        });
      }
    });

    newSocket.on('stopTyping', ({ userId, room }) => {
      if (room === currentRoom) {
        setTypingUsers(prev => prev.filter(u => u.userId !== userId));
      }
    });

    setSocket(newSocket);
    return () => {
      newSocket.off('connect');
      newSocket.off('disconnect');
      newSocket.off('typing');
      newSocket.off('stopTyping');
      newSocket.disconnect();
    };
  }, [baseUrl]);

  // Fetch messages when room changes
  useEffect(() => {
    if (!socket || !userid || !username || !currentRoom || !baseUrl) return;
    setMessages([]);
    socket.emit('joinRoom', { userId: userid, username, room: currentRoom });

    axios.get(`${baseUrl}/api/messages/getRoomMessages/${currentRoom}`, {
      withCredentials: true,
    })
    .then(res => {
      setMessages(res.data || []);
    })
    .catch(err => console.error("Fetch error:", err?.response?.data?.message || err.message));

    socket.on('receiveMessage', (message) => {
      setMessages(prev => [...prev, message]);
      setTypingUsers(prev => prev.filter(u => u.userId !== message.sender));
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [currentRoom, socket, userid, username, baseUrl, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !baseUrl) return;
    if (currentRoom !== 'general' && role !== 'admin') {
      toast.error('Only admins can send messages in this room.')
      return;
    }
    
    socket.emit('stopTyping', { userId: userid, room: currentRoom });
    setIsTyping(false);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    const message = {
      sender: userid,
      senderName: username,
      text: newMessage,
      room: currentRoom
    };

    try {
      const res = await axios.post(`${baseUrl}/api/messages/saveMessage`, message, {
        withCredentials: true,
      });

      if (res.status === 201 && res.data?.data) {
        const savedMessage = res.data.data;
        socket.emit('sendMessage', savedMessage);
        setNewMessage('');
      }
    } catch (err) {
      console.error("Send error:", err?.response?.data?.message || err.message);
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    if (!isTyping) {
      socket.emit('typing', { userId: userid, username, room: currentRoom });
      setIsTyping(true);
    }
    
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    
    typingTimeout.current = setTimeout(() => {
      socket.emit('stopTyping', { userId: userid, room: currentRoom });
      setIsTyping(false);
    }, 2000);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300">
      <Toaster position="top-center" reverseOrder={false} />
      
      {isMobile && (
        <button 
          className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-base-200/90 backdrop-blur-sm border border-base-300 shadow-sm"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
        >
          {mobileNavOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
        </button>
      )}

      <AnimatePresence>
        {(mobileNavOpen || !isMobile) && (
          <motion.div 
            initial={isMobile ? { x: -300, opacity: 0 } : { x: 0, opacity: 1 }}
            animate={isMobile ? { x: 0, opacity: 1 } : { x: 0, opacity: 1 }}
            exit={isMobile ? { x: -300, opacity: 0 } : { x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`${isMobile ? 'fixed inset-y-0 left-0 z-40 w-64' : 'w-64'} bg-base-100/90 backdrop-blur-sm border-r border-base-300 p-4 flex flex-col shadow-2xl`}
          >
            <div className="flex items-center gap-3 mb-6">
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                className="avatar placeholder"
              >
                <div className="w-12 rounded-full relative bg-gradient-to-br from-primary to-secondary text-primary-content shadow-lg">
                  <span className="text-xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">LM</span>
                </div>
              </motion.div>
              <div>
            
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary" onClick={() => window.location.reload()}>
                  Landslide Management
                </h2>
                
                <p className="text-xs text-base-content/50 flex items-center gap-1">
                  <span className={`inline-block w-2 h-2 rounded-full ${isConnected ? 'bg-success' : 'bg-error'}`}></span>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </p>
              </div>
            </div>
            
            <div className="divider my-0"></div>
            
            <div className="flex-1 overflow-y-auto">
              <h3 className="font-semibold text-sm uppercase text-base-content/70 mb-2 px-2">Chat Rooms</h3>
              <ul className="menu bg-base-100/50 rounded-box gap-1">
                {rooms.map(room => (
                  <motion.li 
                    key={room}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button 
                      className={`flex items-center rounded-xl transition-all ${currentRoom === room ? 
                        'active bg-gradient-to-r from-primary to-secondary text-primary-content shadow-lg' : 
                        'hover:bg-base-200 hover:shadow-md'}`}
                      onClick={() => {
                        setCurrentRoom(room);
                        if (isMobile) setMobileNavOpen(false);
                      }}
                    >
                      <span className={`badge badge-sm ${currentRoom === room ? 'badge-primary-content' : 'badge-primary'} mr-2`}></span>
                      {room.charAt(0).toUpperCase() + room.slice(1)}
                      {currentRoom === room && (
                        <span className="badge badge-sm badge-primary-content ml-auto">Active</span>
                      )}
                    </button>
                  </motion.li>
                ))}
              </ul>
            </div>

            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="mt-auto pt-4"
            >
              <div className="card bg-base-200/80 shadow-lg overflow-hidden">
                <div className="card-body p-4">
                  <div className="flex items-center gap-3">
                    <div className={`avatar ${isConnected ? 'online' : 'offline'}`}>
                      <div className="w-12 rounded-full ring-2 ring-offset-base-100 ring-offset-2">
                        <img src={`https://ui-avatars.com/api/?name=${username}&background=random&bold=true`} alt="User" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">{username}</p>
                      <p className="text-xs text-base-content/50 flex items-center gap-1">
                        <span className="capitalize">{role}</span>
                        {isTyping && (
                          <span className="badge badge-xs badge-primary animate-pulse">typing</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileNavOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className={`flex-1 flex flex-col overflow-hidden relative ${isMobile && mobileNavOpen ? 'blur-sm' : ''}`}>
        <AnimatePresence>
          {!isConnected && (
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20"
            >
              <div className="alert alert-warning shadow-lg">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Connection lost. Attempting to reconnect...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          layout
          className="bg-base-100/90 backdrop-blur-sm border-b border-base-300 p-4 flex items-center shadow-sm z-10"
        >
          <div className="flex items-center gap-3">
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="avatar placeholder"
            >
              <div className="w-12 relative rounded-full bg-accent text-accent-content shadow-md">
                <span className="text-xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">{currentRoom.charAt(0).toUpperCase()}</span>
              </div>
            </motion.div>
            <div className=''>
              <h2 className="text-xl font-bold ">
                {currentRoom.charAt(0).toUpperCase() + currentRoom.slice(1)} Room
              </h2>
              <AnimatePresence mode="wait">
                <motion.p 
                  key={typingUsers.length}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="text-xs text-base-content/50"
                >
                  {typingUsers.length > 0 ? (
                    <span className="flex items-center gap-1">
                      {typingUsers.map(u => u.username).join(', ')}
                      {typingUsers.length === 1 ? ' is ' : ' are '}
                      typing
                      <span className="loading loading-dots loading-xs"></span>
                    </span>
                  ) : (
                    `${messages.length} messages • ${isConnected ? 'Connected' : 'Disconnected'}`
                  )}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
          <div className="ml-auto">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="btn btn-ghost btn-sm btn-circle"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </motion.button>
          </div>
        </motion.div>

        <div className="flex-1 p-4 overflow-y-auto bg-base-100/50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
          {messages.length === 0 ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center justify-center h-full"
            >
              <div className="text-center max-w-md p-6 rounded-xl bg-base-200/80 backdrop-blur-sm border border-base-300 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-base-content/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="text-lg font-medium text-base-content/70 mb-1">Welcome to {currentRoom}!</h3>
                <p className="text-sm text-base-content/50 mb-4">
                  Start the conversation by sending your first message.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-sm btn-primary"
                >
                  Say hello!
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {messages.map((msg, index) => (
                  <motion.div
                    key={msg._id || index}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`chat ${msg.sender === userid ? 'chat-end' : 'chat-start'}`}
                  >
                    <div className="chat-image avatar">
                      <motion.div 
                        whileHover={{ scale: 1.1 }}
                        className="w-10 rounded-full ring-2 ring-offset-base-100 ring-offset-2"
                      >
                        <img src={`https://ui-avatars.com/api/?name=${msg.senderName}&background=random&bold=true`} alt="User" />
                      </motion.div>
                    </div>
                    <div className="chat-header">
                      {msg.senderName}
                      <time className="text-xs opacity-50 ml-2">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </time>
                    </div>
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className={`chat-bubble ${msg.sender === userid ? 
                        'chat-bubble-primary' : 
                        'chat-bubble-secondary'} shadow-md`}
                    >
                      {msg.text}
                    </motion.div>
                    <div className="chat-footer opacity-50 text-xs">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <AnimatePresence>
          {typingUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="px-4 pb-2"
            >
              <div className="flex items-center gap-2 bg-base-200/50 rounded-full px-4 py-2 w-fit shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm text-base-content/70">
                  {typingUsers.map(u => u.username).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          layout
          className="bg-base-100/90 backdrop-blur-sm border-t border-base-300 p-4 shadow-inner"
        >
          <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <motion.input
                type="text"
                placeholder={`Message in ${currentRoom}...`}
                className="input input-bordered w-full pr-12 shadow-inner"
                value={newMessage}
                onChange={handleInputChange}
                onFocus={() => socket.emit('typing', { userId: userid, username, room: currentRoom })}
                onBlur={() => {
                  socket.emit('stopTyping', { userId: userid, room: currentRoom });
                  setIsTyping(false);
                  if (typingTimeout.current) clearTimeout(typingTimeout.current);
                }}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                <motion.button 
                  type="button" 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="btn btn-ghost btn-xs btn-circle"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </motion.button>
                <motion.button 
                  type="button" 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="btn btn-ghost btn-xs btn-circle"
                  onClick={() => setNewMessage(prev => prev + '📍')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </motion.button>
              </div>
            </div>
            <motion.button 
              type="submit" 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`btn gap-2 ${newMessage.trim() ? 
                'btn-primary shadow-lg' : 
                'btn-disabled'}`}
              disabled={!newMessage.trim()}
            >
              <span>Send</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ChatRoom;