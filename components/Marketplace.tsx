import React, { useState, useEffect } from 'react';
import { Search, Plus, ShoppingBag, Star, Filter } from 'lucide-react';
import { Product, CartItem } from '../types';
import { PRODUCTS } from '../data';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Button, Card, Chip, Input, ProductCard, CategoryCard, Loader, EmptyState, formatPrice } from './DesignSystem';

interface MarketplaceProps {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  favorites: string[];
  toggleFavorite: (productId: string) => void;
}

// Configuration for Category Colors
const CATEGORY_STYLES: Record<string, { bg: string, text: string, border: string, iconColor: string }> = {
  'خضروات وفواكه': { bg: 'bg-[#6AA84F]/10', text: 'text-[#6AA84F]', border: 'border-[#6AA84F]/30', iconColor: '#6AA84F' },
  'لحوم ومجمدات': { bg: 'bg-[#2E86AB]/10', text: 'text-[#5DADE2]', border: 'border-[#2E86AB]/30', iconColor: '#5DADE2' },
  'بقالة ومؤن': { bg: 'bg-[#10B981]/10', text: 'text-[#10B981]', border: 'border-[#10B981]/30', iconColor: '#10B981' },
  'عطارة': { bg: 'bg-[#D35400]/10', text: 'text-[#E59866]', border: 'border-[#D35400]/30', iconColor: '#E59866' },
  'All': { bg: 'bg-white/5', text: 'text-gray-400', border: 'border-white/10', iconColor: '#999' }
};

export const Marketplace: React.FC<MarketplaceProps> = ({ 
  cart, 
  addToCart, 
  favorites, 
  toggleFavorite 
}) => {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const goldText = "text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300";

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        let realProducts: Product[] = [];
        try {
          // 1. Attempt to fetch from Firestore
          const querySnapshot = await getDocs(collection(db, "products"));
          realProducts = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            rating: doc.data().rating || 4.8, 
            description: doc.data().description || "منتج طازج وعالي الجودة من هايبر المصري",
            image: doc.data().image || "https://placehold.co/400x300/1a1a1a/gold?text=Product",
            category: doc.data().category || "عام"
          })) as Product[];
        } catch (dbError) {
          console.warn("Firestore unreachable, using verified catalog fallback:", dbError);
        }

        // 2. Fallback to verified catalog if Firestore is empty or offline
        if (realProducts.length === 0) {
          realProducts = [...PRODUCTS];
        }

        // 3. Client-side Filter
        if (query) {
          realProducts = realProducts.filter(p => 
            p.name.includes(query) || (p.description && p.description.includes(query))
          );
        }

        setProducts(realProducts);
      } catch (error) {
        console.error("Error in marketplace catalog:", error);
        setProducts([...PRODUCTS]);
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
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-200 dark:border-white/5 pb-8 flex-col-reverse md:flex-row">
        <div className="space-y-2 text-right w-full md:w-auto">
          <div className="flex items-center gap-2 justify-end">
            <ShoppingBag size={14} className="text-emerald-500 dark:text-emerald-400" />
            <span className={`text-[10px] uppercase tracking-[0.4em] font-bold ${goldText}`}>عروض تسوق متميزة</span>
          </div>
          <h2 className="text-3xl font-serif text-slate-800 dark:text-white font-bold">🥬 منتجات طازجة وعروض مذهلة اليوم</h2>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400 dark:text-gray-500 group-focus-within:text-emerald-500 dark:group-focus-within:text-emerald-400 transition-colors" />
            </div>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl py-3 pr-10 pl-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all text-slate-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:shadow-[0_0_15px_rgba(16,185,129,0.1)] text-right shadow-sm dark:shadow-none"
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
                    className={`px-6 py-3 rounded-full text-xs font-bold whitespace-nowrap transition-all border shadow-md ${
                        isSelected 
                        ? `${style.bg} ${style.border} ${style.text} ring-1 ring-slate-200 dark:ring-white/10` 
                        : 'bg-white dark:bg-[#1a1a1a] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/5 hover:border-emerald-500/45 dark:hover:border-white/20'
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
                <div key={i} className="aspect-[4/5] rounded-[2rem] bg-slate-100 dark:bg-[#111] animate-pulse border border-slate-200 dark:border-white/5"></div>
            ))
        ) : filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
                <ProductCard 
                    key={product.id}
                    product={product}
                    cart={cart}
                    addToCart={addToCart}
                    favorites={favorites}
                    toggleFavorite={toggleFavorite}
                />
            ))
        ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400 dark:text-gray-500">
                <Filter size={48} className="mb-4 opacity-20" />
                <p>عفواً، المخزن فاضي أو مفيش منتج بالاسم ده.</p>
            </div>
        )}
      </div>
    </div>
  );
};