import React, { useState, useEffect } from 'react';
import { Search, Plus, ShoppingBag, Star, Filter } from 'lucide-react';
import { Product, CartItem } from '../types';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface MarketplaceProps {
  cart: CartItem[];
  addToCart: (product: Product) => void;
}

// Configuration for Category Colors
const CATEGORY_STYLES: Record<string, { bg: string, text: string, border: string, iconColor: string }> = {
  'خضروات وفواكه': { bg: 'bg-[#6AA84F]/10', text: 'text-[#6AA84F]', border: 'border-[#6AA84F]/30', iconColor: '#6AA84F' },
  'لحوم ومجمدات': { bg: 'bg-[#2E86AB]/10', text: 'text-[#5DADE2]', border: 'border-[#2E86AB]/30', iconColor: '#5DADE2' },
  'بقالة ومؤن': { bg: 'bg-[#10B981]/10', text: 'text-[#10B981]', border: 'border-[#10B981]/30', iconColor: '#10B981' },
  'عطارة': { bg: 'bg-[#D35400]/10', text: 'text-[#E59866]', border: 'border-[#D35400]/30', iconColor: '#E59866' },
  'All': { bg: 'bg-white/5', text: 'text-gray-400', border: 'border-white/10', iconColor: '#999' }
};

export const Marketplace: React.FC<MarketplaceProps> = ({ cart, addToCart }) => {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const goldText = "text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300";

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch from Firestore
        const querySnapshot = await getDocs(collection(db, "products"));
        
        // 2. Map data
        let realProducts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Default fallbacks
          rating: doc.data().rating || 4.8, 
          description: doc.data().description || "منتج طازج وعالي الجودة من هايبر المصري",
          image: doc.data().image || "https://placehold.co/400x300/1a1a1a/gold?text=Product",
          category: doc.data().category || "عام"
        })) as Product[];

        // 3. Client-side Filter
        if (query) {
          realProducts = realProducts.filter(p => 
            p.name.includes(query) || (p.description && p.description.includes(query))
          );
        }

        setProducts(realProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
      setIsLoading(false);
    };
    
    const timeoutId = setTimeout(fetch, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const categories = ['All', 'خضروات وفواكه', 'لحوم ومجمدات', 'بقالة ومؤن', 'عطارة'];

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ShoppingBag size={14} className="text-emerald-400" />
            <span className={`text-[10px] uppercase tracking-[0.4em] font-bold ${goldText}`}>السوق اليومي</span>
          </div>
          <h2 className="text-4xl font-serif">تسوق طلبات بيتك</h2>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
            </div>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-3 pr-10 pl-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all text-white placeholder-gray-500 focus:shadow-[0_0_15px_rgba(16,185,129,0.1)] text-right"
                placeholder="ابحث عن منتج (أرز، سكر، لحوم...)"
                dir="rtl"
            />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide flex-row-reverse">
        {categories.map(cat => {
            const style = CATEGORY_STYLES[cat] || CATEGORY_STYLES['All'];
            const isSelected = selectedCategory === cat;
            return (
                <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-6 py-3 rounded-full text-xs font-bold whitespace-nowrap transition-all border shadow-lg ${
                        isSelected 
                        ? `${style.bg} ${style.border} ${style.text} ring-1 ring-white/10` 
                        : 'bg-[#1a1a1a] text-gray-500 border-white/5 hover:border-white/20'
                    }`}
                >
                    {cat === 'All' ? 'الكل' : cat}
                </button>
            );
        })}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[400px]">
        {isLoading ? (
            // Skeletons
            [1,2,3,4].map(i => (
                <div key={i} className="aspect-[4/5] rounded-[2rem] bg-[#111] animate-pulse border border-white/5"></div>
            ))
        ) : filteredProducts.length > 0 ? (
            filteredProducts.map(product => {
                const catStyle = CATEGORY_STYLES[product.category] || CATEGORY_STYLES['All'];
                return (
                <div key={product.id} className="group relative bg-[#161616] rounded-[2rem] border border-white/5 overflow-hidden hover:border-emerald-500/30 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] flex flex-col">
                    {/* Image Area */}
                    <div className="aspect-[4/3] w-full relative overflow-hidden bg-[#222]">
                        <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                        />
                        {/* Category Badge */}
                        <div className={`absolute top-3 right-3 z-20 backdrop-blur-md px-3 py-1 rounded-full border flex items-center gap-1 ${catStyle.bg} ${catStyle.border}`}>
                            <span className={`text-[10px] font-bold ${catStyle.text}`}>{product.category}</span>
                        </div>
                        {/* Rating */}
                        <div className="absolute bottom-3 left-3 z-20 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1">
                            <Star size={10} className="text-emerald-400 fill-emerald-400" />
                            <span className="text-[10px] font-bold text-white">{product.rating}</span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                            <h3 className="text-lg font-serif font-bold leading-tight mb-2 text-right text-white">{product.name}</h3>
                            <p className="text-gray-400 text-xs line-clamp-2 mb-4 text-right leading-relaxed">{product.description}</p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                            <button 
                                onClick={() => addToCart(product)}
                                className="px-4 py-2 rounded-xl bg-[#2a2a2a] hover:bg-[#6AA84F] hover:text-white border border-white/5 flex items-center gap-2 transition-all active:scale-95 group/btn"
                            >
                                <Plus size={16} className="text-[#6AA84F] group-hover/btn:text-white transition-colors" />
                                <span className="text-xs font-bold text-gray-300 group-hover/btn:text-white">أضف للسلة</span>
                            </button>

                            <div className="text-right">
                                <span className="text-lg font-bold text-emerald-400">
                                    {product.price}
                                </span>
                                <span className="text-[10px] text-gray-500 mr-1">ج.م</span>
                            </div>
                        </div>
                    </div>
                </div>
            )})
        ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500">
                <Filter size={48} className="mb-4 opacity-20" />
                <p>عفواً، المخزن فاضي أو مفيش منتج بالاسم ده.</p>
            </div>
        )}
      </div>
    </div>
  );
};