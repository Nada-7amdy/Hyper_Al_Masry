import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, Percent, ShoppingCart, Plus, Minus, Search, 
  Mic, QrCode, X, Check, Info, AlertTriangle, ChevronRight, Loader2
} from 'lucide-react';
import { Product, CartItem } from '../types';
import { Category } from '../data';

/* ==========================================
   DESIGN TOKENS & STYLES (Shopify / Apple Theme)
   ========================================== */

export const TOKENS = {
  colors: {
    brand: {
      primary: '#19C37D', // Signature Mint Emerald
      primaryHover: '#12a164',
      primaryLight: 'rgba(25, 195, 125, 0.1)',
      primaryLightHover: 'rgba(25, 195, 125, 0.15)',
      darkBg: '#0c0d10',
      darkCard: '#151619',
      lightBg: '#f8fafc',
      lightCard: '#ffffff',
      gold: '#F59E0B',
    },
    text: {
      lightPrimary: 'text-slate-900',
      lightSecondary: 'text-slate-500',
      darkPrimary: 'text-white',
      darkSecondary: 'text-gray-400',
    },
    gradients: {
      gold: 'bg-gradient-to-r from-emerald-400 via-emerald-500 to-green-500',
      goldText: 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400',
      premiumDark: 'bg-gradient-to-b from-[#151619] to-[#0c0d10]',
      hoverGlow: 'hover:shadow-[0_0_20px_rgba(25,195,125,0.15)]',
    },
  },
  radius: {
    sm: 'rounded-lg',     // 8px
    md: 'rounded-xl',     // 12px
    lg: 'rounded-2xl',    // 16px
    xl: 'rounded-3xl',    // 24px
    full: 'rounded-full',
  },
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
    glow: 'shadow-[0_0_20px_rgba(25,195,125,0.1)] dark:shadow-[0_0_25px_rgba(25,195,125,0.05)]',
  },
  spacing: {
    grid: 'p-4 sm:p-6 md:p-8 gap-4 sm:gap-6 md:gap-8',
  }
};

// Formatter for Egyptian Pound in Arabic
export const formatPrice = (price: number): string => {
  return price.toLocaleString('ar-EG') + ' ج.م';
};

/* ==========================================
   BUTTONS COMPONENT
   ========================================== */

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle = "font-cairo font-bold rounded-xl transition-all duration-200 inline-flex items-center justify-center gap-2 select-none active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100";
  
  const variants = {
    primary: "bg-gradient-to-r from-[#19C37D] to-[#10B981] text-black hover:opacity-95 shadow-md shadow-[#19C37D]/20 hover:shadow-[#19C37D]/35",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-200 border border-slate-200/50 dark:border-white/5",
    outline: "bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 text-[#19C37D] border-2 border-[#19C37D]/50 hover:border-[#19C37D]",
    ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-gray-300",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/20",
    gold: "bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black hover:opacity-95 shadow-md shadow-amber-500/20",
    success: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4.5 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base rounded-2xl",
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 size={16} className="animate-spin text-current" />}
      {!isLoading && leftIcon}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};

/* ==========================================
   CARDS COMPONENT (With Custom Tilt / Ripple)
   ========================================== */

interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> {
  interactive?: boolean;
  elevation?: 'none' | 'sm' | 'md' | 'lg' | 'glow';
  hoverY?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  interactive = false,
  elevation = 'md',
  hoverY = false,
  className = '',
  ...props
}) => {
  const baseCard = "bg-white dark:bg-[#151619] border border-slate-200/60 dark:border-white/5 transition-all duration-300 rounded-2xl text-right overflow-hidden";
  
  const elevations = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-md dark:shadow-none",
    lg: "shadow-xl dark:shadow-[0_15px_40px_rgba(0,0,0,0.4)]",
    glow: "shadow-[0_0_20px_rgba(25,195,125,0.06)] dark:shadow-[0_0_25px_rgba(25,195,125,0.03)] border-[#19C37D]/10 dark:border-[#19C37D]/5",
  };

  const hoverEffect = hoverY && interactive ? "hover:-translate-y-1 hover:border-[#19C37D]/35 hover:shadow-lg dark:hover:shadow-none" : "";
  const cursorStyle = interactive ? "cursor-pointer" : "";

  if (interactive) {
    return (
      <motion.div
        whileTap={{ scale: 0.98 }}
        className={`${baseCard} ${elevations[elevation]} ${hoverEffect} ${cursorStyle} ${className}`}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      className={`${baseCard} ${elevations[elevation]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/* ==========================================
   CHIPS & BADGES
   ========================================== */

interface ChipProps {
  label: string;
  variant?: 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  variant = 'brand',
  icon,
  className = '',
}) => {
  const baseStyle = "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black leading-none font-cairo select-none shadow-sm border";
  
  const variants = {
    brand: "bg-[#19C37D]/10 dark:bg-[#19C37D]/15 text-[#19C37D] border-[#19C37D]/25",
    success: "bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-500 border-emerald-500/25",
    warning: "bg-amber-500/10 dark:bg-amber-500/15 text-amber-500 border-amber-500/25",
    danger: "bg-red-500/10 dark:bg-red-500/15 text-red-500 border-red-500/25 animate-pulse",
    info: "bg-blue-500/10 dark:bg-blue-500/15 text-blue-500 border-blue-500/25",
    neutral: "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 border-slate-200/50 dark:border-white/5",
  };

  return (
    <span className={`${baseStyle} ${variants[variant]} ${className}`}>
      {icon}
      <span>{label}</span>
    </span>
  );
};

/* ==========================================
   INPUTS & FIELDS
   ========================================== */

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  rightIcon,
  leftIcon,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-1.5 text-right w-full">
      {label && <label className="block text-xs font-bold text-slate-600 dark:text-gray-400 font-cairo">{label}</label>}
      <div className="relative w-full group">
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none z-10 text-slate-400 group-focus-within:text-[#19C37D] transition-colors">
            {rightIcon}
          </div>
        )}
        <input
          className={`w-full bg-slate-50 dark:bg-[#161619] border rounded-xl py-3 text-sm focus:outline-none focus:bg-white dark:focus:bg-black transition-all text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 text-right font-cairo ${
            rightIcon ? 'pr-11' : 'pr-4'
          } ${leftIcon ? 'pl-11' : 'pl-4'} ${
            error 
              ? 'border-red-500 focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.15)]' 
              : 'border-slate-200 dark:border-white/10 focus:border-[#19C37D]/50 focus:shadow-[0_0_20px_rgba(25,195,125,0.08)]'
          } ${className}`}
          dir="rtl"
          {...props}
        />
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center z-10 text-slate-400">
            {leftIcon}
          </div>
        )}
      </div>
      {error && <p className="text-[10px] font-bold text-red-500 font-cairo mt-1">{error}</p>}
    </div>
  );
};

/* ==========================================
   PRODUCT CARDS COMPONENT
   ========================================== */

interface ProductCardProps {
  product: Product;
  cart: CartItem[];
  addToCart: (product: Product) => void;
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product: p,
  cart,
  addToCart,
  favorites,
  toggleFavorite,
  className = '',
}) => {
  const isFav = favorites.includes(p.id);
  const inCart = cart.find(item => item.id === p.id);
  const [isAdded, setIsAdded] = React.useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(p);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  return (
    <Card 
      elevation="glow" 
      interactive 
      hoverY 
      className={`w-64 sm:w-72 flex-shrink-0 snap-start p-4 flex flex-col justify-between group/pcard select-none border-slate-200/50 dark:border-white/5 ${className}`}
    >
      <div>
        {/* Aspect Ratio Container for Image */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-50 dark:bg-black/20">
          <img 
            src={p.image} 
            alt={p.name} 
            className="w-full h-full object-cover transform group-hover/pcard:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
          
          {/* Tags */}
          <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 z-10 items-end">
            {p.discount && (
              <Chip 
                label={p.discount} 
                variant="danger" 
                icon={<Percent size={9} />} 
              />
            )}
            {p.badge && (
              <Chip 
                label={p.badge} 
                variant="brand" 
              />
            )}
          </div>

          {/* Stock Notification */}
          {p.stockStatus === 'low' && (
            <div className="absolute top-2.5 left-2.5 bg-amber-500 text-black font-black text-[8px] px-2 py-0.5 rounded-md shadow-md animate-pulse z-10 font-cairo">
              كمية محدودة!
            </div>
          )}

          {/* Favorites Button with heart icon */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(p.id);
            }}
            className="absolute bottom-2.5 right-2.5 p-2 rounded-full bg-white/80 dark:bg-black/60 hover:bg-white dark:hover:bg-black text-slate-400 hover:text-red-500 transition-all cursor-pointer backdrop-blur-md shadow-sm z-10"
            aria-label="إضافة للمفضلة"
          >
            <Heart size={14} className={isFav ? "fill-red-500 text-red-500" : ""} />
          </button>
        </div>

        {/* Content Area */}
        <div className="mt-3 text-right space-y-1.5">
          <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 font-cairo">{p.category}</p>
          <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed h-10 group-hover/pcard:text-[#19C37D] transition-colors font-cairo">
            {p.name}
          </h3>
          
          {/* Reviews Row */}
          <div className="flex items-center gap-1 flex-row-reverse text-[10px] text-slate-400">
            <span className="text-amber-400">★</span>
            <span className="font-extrabold text-slate-600 dark:text-slate-300 font-mono">{p.rating}</span>
            {p.reviews && <span className="font-medium font-cairo">({p.reviews} تقييم)</span>}
          </div>
        </div>
      </div>

      {/* Pricing and Cart Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5">
        <div className="flex items-center justify-between flex-row-reverse gap-2">
          {/* Prices */}
          <div className="text-right">
            <p className="text-sm sm:text-base font-extrabold text-[#19C37D] font-mono leading-none">
              {formatPrice(p.price)}
            </p>
            {p.oldPrice && (
              <p className="text-[10px] sm:text-xs text-slate-400 dark:text-gray-500 line-through mt-1 font-mono">
                {formatPrice(p.oldPrice)}
              </p>
            )}
          </div>

          {/* Add-to-cart Accent Button */}
          <Button
            onClick={handleAdd}
            variant={isAdded ? 'success' : inCart ? 'outline' : 'primary'}
            size="sm"
            className="px-3.5 py-1.5 h-9 rounded-xl font-cairo text-xs"
            leftIcon={isAdded ? <Check size={13} /> : <Plus size={13} />}
          >
            {isAdded ? 'تم!' : inCart ? `أضف (${inCart.quantity})` : 'أضف للسلة'}
          </Button>
        </div>
        
        {/* Delivery estimate */}
        {p.deliveryEstimate && (
          <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 text-right mt-2 font-cairo">
            ⏳ {p.deliveryEstimate}
          </p>
        )}
      </div>
    </Card>
  );
};

/* ==========================================
   CATEGORY CARD COMPONENT
   ========================================== */

interface CategoryCardProps {
  category?: Category;
  cat?: Category;
  isSelected?: boolean;
  onSelect: (cat: Category | null) => void;
  className?: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  cat: catAlias,
  isSelected = false,
  onSelect,
  className = '',
}) => {
  const cat = category || catAlias;
  if (!cat) return null;

  return (
    <motion.button
      onClick={() => onSelect(isSelected ? null : cat)}
      className={`relative rounded-2xl overflow-hidden aspect-[4/5] w-full text-right block border transition-all duration-300 group/cat select-none cursor-pointer h-full min-h-[160px] sm:min-h-[180px] ${
        isSelected 
          ? 'ring-2 ring-[#19C37D] border-[#19C37D] shadow-[0_0_15px_rgba(25,195,125,0.25)]' 
          : 'border-slate-200/60 dark:border-white/5 hover:border-[#19C37D]/40 shadow-sm'
      } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#19C37D] ${className}`}
      whileHover={{ y: -4, scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="absolute inset-0 z-0">
        <img 
          src={cat.image || ''} 
          alt={cat.name || ''} 
          className="w-full h-full object-cover transform group-hover/cat:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/20" />
      </div>

      <div className="absolute inset-0 p-3 flex flex-col justify-between text-right z-10">
        <div className="flex justify-between items-start flex-row-reverse">
          <span className="text-xl sm:text-2xl transform group-hover/cat:scale-110 transition-transform duration-300">{cat.icon}</span>
          <Chip 
            label={(cat.productCount ?? 0) > 0 ? `${cat.productCount} صنف` : 'قريباً'} 
            variant={(cat.productCount ?? 0) > 0 ? 'brand' : 'neutral'} 
            className="bg-black/40 backdrop-blur-md text-white border-white/10"
          />
        </div>
        
        <div className="space-y-1">
          <h3 className="text-xs sm:text-sm font-bold text-white group-hover/cat:text-[#19C37D] transition-colors font-cairo">{cat.name}</h3>
          <p className="text-[8px] sm:text-[9px] text-slate-300 line-clamp-2 leading-relaxed opacity-0 group-hover/cat:opacity-100 transition-opacity duration-300 font-cairo">
            {cat.description}
          </p>
        </div>
      </div>
    </motion.button>
  );
};

/* ==========================================
   MODALS / BOTTOM SHEETS
   ========================================== */

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) => {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          {/* Backdrop blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md" 
            onClick={onClose} 
          />
          
          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`relative w-full ${sizes[size]} bg-white dark:bg-[#151518] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl p-6 overflow-hidden text-right z-50 font-cairo`}
          >
            {/* Header */}
            <div className="flex items-center justify-between flex-row-reverse pb-4 border-b border-slate-100 dark:border-white/5">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-none font-cairo">{title}</h3>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="max-h-[70vh] overflow-y-auto mt-4 scrollbar-hide">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

/* ==========================================
   TOASTS (Stripe UX)
   ========================================== */

interface ToastProps {
  message: string;
  type?: 'success' | 'info';
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  onClose,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -15, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`px-4.5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border flex-row-reverse text-right select-none font-cairo ${
        type === 'success' 
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
          : 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400'
      }`}
    >
      <div className={`p-1 rounded-lg ${type === 'success' ? 'bg-emerald-500/20' : 'bg-blue-500/20'}`}>
        {type === 'success' ? <Check size={14} /> : <Info size={14} />}
      </div>
      <p className="text-xs font-black leading-normal flex-1">{message}</p>
      {onClose && (
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
          <X size={12} />
        </button>
      )}
    </motion.div>
  );
};

/* ==========================================
   LOADERS & SKELETONS
   ========================================== */

export const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-3 font-cairo">
      <div className="relative flex items-center justify-center">
        <Loader2 size={36} className="text-[#19C37D] animate-spin" />
        <div className="absolute w-2 h-2 rounded-full bg-[#19C37D] animate-ping" />
      </div>
      <p className="text-xs font-bold text-slate-400 dark:text-gray-500">جاري تحميل تشكيلة الأطعمة الفاخرة...</p>
    </div>
  );
};

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-slate-200 dark:bg-white/5 rounded-xl ${className}`} />
  );
};

/* ==========================================
   EMPTY STATES
   ========================================== */

interface EmptyStateProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
}) => {
  return (
    <Card elevation="glow" className="p-8 text-center max-w-md mx-auto space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-gray-500 mx-auto border border-slate-100 dark:border-white/5">
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="text-sm sm:text-base font-black text-slate-800 dark:text-white font-cairo">{title}</h3>
        <p className="text-xs text-slate-400 dark:text-gray-500 leading-relaxed font-cairo">{description}</p>
      </div>
      {actionLabel && onAction && (
        <div className="pt-2">
          <Button onClick={onAction} variant="secondary" size="sm">
            {actionLabel}
          </Button>
        </div>
      )}
    </Card>
  );
};
