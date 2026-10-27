import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, User, Gem, Utensils, Clock, Users, CheckCircle2, ShoppingCart } from 'lucide-react';
import { sendMessageToConcierge } from '../services/gemini';
import { ChatMessage, StructuredRecipe } from '../types';

export interface ConciergeProps {
  onAddRecipeToCart?: (recipe: StructuredRecipe) => void;
  showToast?: (message: string, type?: 'success' | 'info') => void;
}

export const Concierge: React.FC<ConciergeProps> = ({ onAddRecipeToCart, showToast }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'مرحباً بكم في هايبر المصري! كيف يمكنني مساعدتكم اليوم في العثور على أحدث عروضنا أو المنتجات الطازجة أو تتبع طلباتكم؟' }
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

    try {
      const res = await sendMessageToConcierge(messages, input);
      setMessages(prev => [...prev, { role: 'model', text: res.text, recipe: res.recipe }]);
    } catch {
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: 'يسعدنا دائماً خدمتك في هايبر المصري! يمكنك تصفح المنتجات الطازجة في قسم السوق أو التحدث معنا في أي وقت.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  // Gold text utility
  const goldText = "text-transparent bg-clip-text bg-gradient-to-b from-[#10B981] via-[#34D399] to-[#059669]";

  return (
    <div className="flex flex-col h-[600px] w-full max-w-4xl mx-auto bg-white dark:bg-[#0d0d0d] rounded-[2rem] border border-slate-200 dark:border-white/10 overflow-hidden shadow-2xl relative">
       {/* Decorative Background */}
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
       
       {/* Header */}
       <div className="p-6 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#121212] flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-[#10B981] to-[#059669]">
                <div className="w-full h-full rounded-full bg-slate-100 dark:bg-black flex items-center justify-center">
                   <Gem size={20} className="text-[#34D399]" />
                </div>
             </div>
             <div>
                <h3 className={`font-serif text-xl font-bold ${goldText}`}>المساعد الرقمي الذكي</h3>
                <p className="text-[10px] uppercase tracking-widest text-slate-450 dark:text-gray-500">مستشارك الشخصي للتسوق العائلي</p>
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
                   <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white' : 'border border-[#10B981]/30 bg-slate-50 dark:bg-black'}`}>
                      {msg.role === 'user' ? <User size={14} /> : <Sparkles size={14} className="text-[#10B981]" />}
                   </div>
                   <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user' 
                      ? 'bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white rounded-tr-sm border border-slate-200 dark:border-transparent' 
                      : 'bg-slate-55 dark:bg-[#1a1a1a] text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/5 rounded-tl-sm shadow-sm'
                   }`}>
                      <div className="whitespace-pre-line">{msg.text}</div>

                      {/* Structured Recipe Card with Catalog Linkage */}
                      {msg.recipe && (
                        <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 text-right space-y-3">
                          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2 flex-row-reverse">
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full font-cairo">
                              وصفة ذكية مقترحة
                            </span>
                            <h4 className="font-cairo font-black text-sm text-slate-900 dark:text-white flex items-center gap-1.5 flex-row-reverse">
                              <Utensils size={15} className="text-emerald-500" />
                              <span>{msg.recipe.title}</span>
                            </h4>
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {msg.recipe.description}
                          </p>

                          <div className="flex items-center justify-end gap-4 text-[10px] text-slate-500 dark:text-slate-400 flex-row-reverse">
                            <span className="flex items-center gap-1 flex-row-reverse">
                              <Clock size={12} className="text-emerald-500" />
                              <span>وقت التحضير: {msg.recipe.prepTime}</span>
                            </span>
                            <span className="flex items-center gap-1 flex-row-reverse">
                              <Users size={12} className="text-emerald-500" />
                              <span>تكفي: {msg.recipe.servings}</span>
                            </span>
                          </div>

                          <div className="space-y-1.5 border-t border-emerald-500/15 pt-2.5">
                            <p className="font-bold text-[11px] text-slate-700 dark:text-slate-200 mb-1">
                              المقادير المتوفرة من كتالوج المتجر:
                            </p>
                            {msg.recipe.ingredients.map((ing, i) => (
                              <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-emerald-500/5 last:border-b-0 flex-row-reverse">
                                <span className="flex items-center gap-1.5 flex-row-reverse">
                                  <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                                  <span className="text-slate-700 dark:text-slate-200">{ing.name} ({ing.amount})</span>
                                </span>
                                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                                  {ing.price ? `${ing.price} ج.م` : 'متوفر'}
                                </span>
                              </div>
                            ))}
                          </div>

                          {onAddRecipeToCart && (
                            <button
                              onClick={() => {
                                onAddRecipeToCart(msg.recipe!);
                              }}
                              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-cairo font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 active:scale-[0.98] transition-all cursor-pointer"
                            >
                              <ShoppingCart size={15} />
                              <span>🛒 أضف مقادير الوصفة كاملة إلى السلة</span>
                            </button>
                          )}
                        </div>
                      )}
                   </div>
                </div>
             </div>
          ))}
          {isLoading && (
             <div className="flex justify-start">
                <div className="flex gap-4 max-w-[80%]">
                   <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border border-[#10B981]/30 bg-slate-50 dark:bg-black">
                      <Sparkles size={14} className="text-[#10B981]" />
                   </div>
                   <div className="p-4 rounded-2xl bg-slate-55 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-tl-sm flex gap-1 items-center">
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
       <div className="p-4 bg-slate-50 dark:bg-[#121212] border-t border-slate-200 dark:border-white/5 z-10">
          <div className="relative">
             <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="اسأل عن المنتجات الطازجة، العروض الحالية، أو تتبع طلبك... | Ask about fresh items, offers, or order tracking..."
                className="w-full bg-white dark:bg-[#080808] border border-slate-200 dark:border-white/10 rounded-xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:border-[#10B981]/50 transition-colors text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 block shadow-sm"
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