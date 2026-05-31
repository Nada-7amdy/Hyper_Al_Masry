import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, User, Gem } from 'lucide-react';
import { sendMessageToConcierge } from '../services/gemini';
import { ChatMessage } from '../types';

export const Concierge: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Welcome to the Hyper Al Masri Atelier. How may I assist you in your pursuit of excellence today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const responseText = await sendMessageToConcierge(messages, input);
    
    setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  // Gold text utility
  const goldText = "text-transparent bg-clip-text bg-gradient-to-b from-[#10B981] via-[#34D399] to-[#059669]";

  return (
    <div className="flex flex-col h-[600px] w-full max-w-4xl mx-auto bg-[#0d0d0d] rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl relative">
       {/* Decorative Background */}
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
       
       {/* Header */}
       <div className="p-6 border-b border-white/5 bg-[#121212] flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-[#10B981] to-[#059669]">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                   <Gem size={20} className="text-[#34D399]" />
                </div>
             </div>
             <div>
                <h3 className={`font-serif text-xl font-bold ${goldText}`}>The Royal Concierge</h3>
                <p className="text-[10px] uppercase tracking-widest text-gray-500">Always at your service</p>
             </div>
          </div>
          <div className="flex gap-2">
             <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></div>
             <div className="text-[10px] uppercase tracking-widest text-[#10B981]">Online</div>
          </div>
       </div>

       {/* Chat Area */}
       <div className="flex-1 overflow-y-auto p-6 space-y-6 z-10 scrollbar-thin">
          {messages.map((msg, idx) => (
             <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-4 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                   <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-white/10' : 'border border-[#10B981]/30 bg-black'}`}>
                      {msg.role === 'user' ? <User size={14} /> : <Sparkles size={14} className="text-[#10B981]" />}
                   </div>
                   <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user' 
                      ? 'bg-white/10 text-white rounded-tr-sm' 
                      : 'bg-[#1a1a1a] text-gray-300 border border-white/5 rounded-tl-sm'
                   }`}>
                      {msg.text}
                   </div>
                </div>
             </div>
          ))}
          {isLoading && (
             <div className="flex justify-start">
                <div className="flex gap-4 max-w-[80%]">
                   <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border border-[#10B981]/30 bg-black">
                      <Sparkles size={14} className="text-[#10B981]" />
                   </div>
                   <div className="p-4 rounded-2xl bg-[#1a1a1a] border border-white/5 rounded-tl-sm flex gap-1 items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-bounce"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-bounce delay-100"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-bounce delay-200"></div>
                   </div>
                </div>
             </div>
          )}
          <div ref={messagesEndRef} />
       </div>

       {/* Input Area */}
       <div className="p-4 bg-[#121212] border-t border-white/5 z-10">
          <div className="relative">
             <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about our heritage, services, or collections..."
                className="w-full bg-[#080808] border border-white/10 rounded-xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:border-[#10B981]/50 transition-colors text-white placeholder-gray-600"
             />
             <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-2 p-2 rounded-lg bg-[#10B981]/10 hover:bg-[#10B981]/20 text-[#10B981] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
             >
                <Send size={18} />
             </button>
          </div>
       </div>
    </div>
  );
};