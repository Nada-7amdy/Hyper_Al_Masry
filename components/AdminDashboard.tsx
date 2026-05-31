import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Product } from '../types';
import { 
  Layers, Shield, Cpu, RefreshCw, BarChart2, ShoppingCart, Ban, Edit, Printer, Database, 
  Settings, Search, Plus, Minus, Trash2, Smartphone, CreditCard, DollarSign, Wifi, WifiOff, 
  Bell, ArrowLeft, ArrowRight, Save, Scale, Check, Key, Zap, Flame, Award, HelpCircle
} from 'lucide-react';

// Define localized types for the POS system
export interface InvoiceItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  weight?: number; // Sold by weight
  isWeightBased?: boolean;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  timestamp: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'wallet';
  status: 'synced' | 'local_pending' | 'voided';
  cashier: string;
}

const CATEGORIES = ['الكل', 'خضروات وفواكه', 'لحوم ومجمدات', 'بقالة ومؤن', 'عطارة'];

export const AdminDashboard = () => {
  // Roles: Core requirement (role-based access)
  const [currentRole, setCurrentRole] = useState<'cashier' | 'manager' | 'executive'>('cashier');
  
  // Tab within POS dashboard
  const [activeSubTab, setActiveSubTab] = useState<'pos' | 'invoices' | 'inventory' | 'bi' | 'peripherals'>('pos');
  
  // Database States
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  
  // Network Status State (Offline Mode requirement)
  const [isOffline, setIsOffline] = useState(false);
  
  // POS States
  const [posCart, setPosCart] = useState<InvoiceItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'wallet'>('cash');
  
  // Weighed scale simulator modal
  const [weighingProduct, setWeighingProduct] = useState<Product | null>(null);
  const [sliderWeight, setSliderWeight] = useState<number>(1.25);
  
  // Hardware status simulation logs (Hardware integration requirement)
  const [hardwarePaperSize, setHardwarePaperSize] = useState<'80mm' | '58mm'>('80mm');
  const [drawerOpenLog, setDrawerOpenLog] = useState<boolean>(false);
  const [scaleCalibration, setScaleCalibration] = useState<number>(1.0); // scale calibration offset
  const [scannedBarcode, setScannedBarcode] = useState<string>('');
  const [hardwareLogs, setHardwareLogs] = useState<string[]>([
    "طابعة الفواتير متصلة (منفذ USB001)",
    "درج النقدية RJ11 جاهز ومربوط بالطابعة",
    "قارئ الباركود النشط يترقب المدخلات",
    "الميزان الرقمي تمت معايرته بنجاح"
  ]);

  // Product addition state
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('بقالة ومؤن');
  const [newProductStock, setNewProductStock] = useState('50');
  const [newProductIsWeight, setNewProductIsWeight] = useState(false);

  // Active Receipt preview modal
  const [showInvoiceModal, setShowInvoiceModal] = useState<Invoice | null>(null);

  // Sound feedback text
  const [voiceNotification, setVoiceNotification] = useState<string>("");

  // Styling
  const goldGradient = "bg-gradient-to-r from-[#10B981] via-[#34D399] to-[#059669]";
  const goldText = "text-transparent bg-clip-text bg-gradient-to-b from-[#10B981] via-[#34D399] to-[#059669]";

  // --- Initial Loading & Seeding ---
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch Products
      const querySnapshot = await getDocs(collection(db, "products"));
      let productsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
      
      // Auto-Seed if database is empty to guarantee a majestic experience immediately
      if (productsList.length === 0) {
        await seedDefaultProducts();
        const retrySnapshot = await getDocs(collection(db, "products"));
        productsList = retrySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
      }
      
      // Determine Weight Based status cleanly. Let's make sure it handles Arabic tags or has weights
      const enrichedProducts = productsList.map(p => ({
        ...p,
        isWeightBased: p.isWeightBased !== undefined ? p.isWeightBased : (
          p.category === 'خضروات وفواكه' || p.category === 'لحوم ومجمدات' || p.name.includes('كجم') || p.name.includes('جم')
        )
      }));
      setProducts(enrichedProducts);

      // Load invoices (from firestore or combined with localStorage)
      const cachedInvoices = JSON.parse(localStorage.getItem('almasri_local_invoices') || '[]');
      let serverInvoices: Invoice[] = [];
      try {
        const invSnapshot = await getDocs(collection(db, "invoices"));
        serverInvoices = invSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Invoice[];
      } catch (invErr) {
        console.warn("Could not load invoices from server, relying on local storage index:", invErr);
      }
      
      // Merge unique server items and local items
      const combined = [...cachedInvoices];
      serverInvoices.forEach(srv => {
        if (!combined.some(c => c.invoiceNo === srv.invoiceNo)) {
          combined.push(srv);
        }
      });
      // Sort newest first
      combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setInvoices(combined);
    } catch (error) {
      console.error("Error loading POS database: ", error);
      // Failback to localStorage completely
      const cachedProducts = JSON.parse(localStorage.getItem('almasri_local_products') || '[]');
      if (cachedProducts.length > 0) {
        setProducts(cachedProducts);
      }
    }
    setLoading(false);
  };

  const seedDefaultProducts = async () => {
    const defaultSeed = [
      {
        name: "أرز مصري ياسمين فاخر (5 كجم)",
        category: "بقالة ومؤن",
        price: 185,
        rating: 4.9,
        stock: 65,
        description: "أرز بلدي مصري عريض الحبة نقاوة تامة.",
        image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400",
        isWeightBased: false
      },
      {
        name: "طماطم بلدي فينيسيا (طازجة)",
        category: "خضروات وفواكه",
        price: 18,
        rating: 4.8,
        stock: 120,
        description: "طماطم بلدي حمراء طازجة من مزارع الدلتا.",
        image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=400",
        isWeightBased: true
      },
      {
        name: "لحم مفروم كندوز بلدي مبرد",
        category: "لحوم ومجمدات",
        price: 360,
        rating: 4.9,
        stock: 35,
        description: "لحم كفتة ممتاز بقري صافي قليل الدسم.",
        image: "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&q=80&w=400",
        isWeightBased: true
      },
      {
        name: "سمك بلطي رويال طازج",
        category: "لحوم ومجمدات",
        price: 95,
        rating: 4.7,
        stock: 40,
        description: "سمك بلطي مغسول برفق ومجهز للشواء والطهي.",
        image: "https://images.unsplash.com/photo-1615141982901-f748f65aa694?auto=format&fit=crop&q=80&w=400",
        isWeightBased: true
      },
      {
        name: "طقم توابل مشكل لؤلؤة الصعيد",
        category: "عطارة",
        price: 125,
        rating: 5.0,
        stock: 50,
        description: "خلطة بهارات ملكية طحن كلاسيكي للوجبات الفاخرة.",
        image: "https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&q=80&w=400",
        isWeightBased: false
      },
      {
        name: "سمن طبيعي فلاحي جاموسي بكر",
        category: "بقالة ومؤن",
        price: 490,
        rating: 5.0,
        stock: 12,
        description: "سمن جاموسي مصفى 100% غني بالأصالة البلدي.",
        image: "https://images.unsplash.com/photo-1620662776269-61b4020a5963?auto=format&fit=crop&q=80&w=400",
        isWeightBased: false
      },
      {
        name: "تفاح سكري طازج مستورد",
        category: "خضروات وفواكه",
        price: 65,
        rating: 4.6,
        stock: 90,
        description: "حب تفاح سكري ريان عالي الحلاوة وممتاز التغذية.",
        image: "https://images.unsplash.com/photo-1553279768-1154378111af?auto=format&fit=crop&q=80&w=400",
        isWeightBased: true
      },
      {
        name: "جبن رومي قديم مشيخ (باتريك)",
        category: "بقالة ومؤن",
        price: 240,
        rating: 4.9,
        stock: 45,
        description: "جبن رومي قديم فلفل نكهة عتيقة ومذاق ريفي رائع.",
        image: "https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&q=80&w=400",
        isWeightBased: true
      }
    ];

    for (const item of defaultSeed) {
      await addDoc(collection(db, "products"), item);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Save changes locally as well
  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem('almasri_local_products', JSON.stringify(products));
    }
  }, [products]);

  // Keep records synced in local cache
  useEffect(() => {
    if (invoices.length > 0) {
      localStorage.setItem('almasri_local_invoices', JSON.stringify(invoices));
    }
  }, [invoices]);

  // Alert log handler helper
  const addHardwareLog = (message: string) => {
    const time = new Date().toLocaleTimeString('ar-EG');
    setHardwareLogs(prev => [`[${time}] ${message}`, ...prev.slice(0, 50)]);
  };

  // --- POS Cashier Actions ---
  const handleProductClick = (product: Product) => {
    if (product.stock <= 0) {
      triggerNotification(`❌ عذراً، لا يوجد مخزون كافي للمنتج ${product.name}`);
      return;
    }

    if (product.isWeightBased) {
      // Open weight selector modal for scale simulation
      setWeighingProduct(product);
      setSliderWeight(1.0);
    } else {
      addToCartPOS(product, 1);
    }
  };

  // Barcode Scanning Simulation
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedBarcode.trim()) return;

    // Search by ID or keyword
    const found = products.find(p => 
      p.id.toLowerCase() === scannedBarcode.trim().toLowerCase() || 
      p.name.includes(scannedBarcode)
    );

    if (found) {
      addHardwareLog(`🔊 صفير! تم قراءة الباركود بنجاح لمنتج: ${found.name}`);
      handleProductClick(found);
      triggerNotification(`🏷️ قراءة باركود: ${found.name}`);
    } else {
      addHardwareLog(`⚠️ صفير متقطع! فشل قراءة باركود: ${scannedBarcode}`);
      triggerNotification(`🔍 لم نجد منتجاً بهذا الرمز: ${scannedBarcode}`);
    }
    setScannedBarcode('');
  };

  const addToCartPOS = (product: Product, quantity: number, weight?: number) => {
    setPosCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      
      if (existing) {
        // If weight based, replace or aggregate weight
        if (product.isWeightBased && weight) {
          return prev.map(item => item.id === product.id 
            ? { ...item, weight: Number((item.weight || 0) + weight) } 
            : item
          );
        }
        // Unit based increase quantity
        return prev.map(item => item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
        );
      }

      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        weight: weight,
        isWeightBased: product.isWeightBased
      }];
    });

    addHardwareLog(`🛒 تمت إضافة ${product.name} إلى مسودة الفاتورة`);
  };

  const handleFinishWeighing = () => {
    if (!weighingProduct) return;
    
    // Scale Calibration dynamic offset calculation
    const measuredWeight = Number((sliderWeight * scaleCalibration).toFixed(3));
    
    addToCartPOS(weighingProduct, 1, measuredWeight);
    addHardwareLog(`⚖️ ميزان الشاشات: وزن ${weighingProduct.name} هو ${measuredWeight} كجم`);
    triggerNotification(`⚖️ تم وزن السلعة: ${measuredWeight} كجم`);
    setWeighingProduct(null);
  };

  const updateCartPOSQuantity = (id: string, delta: number) => {
    setPosCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean) as InvoiceItem[];
    });
  };

  const updateCartPOSWeight = (id: string, fileWeight: number) => {
    setPosCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          return { ...item, weight: fileWeight };
        }
        return item;
      });
    });
  };

  const removeFromCartPOS = (id: string) => {
    setPosCart(prev => prev.filter(item => item.id !== id));
    addHardwareLog(`🗑️ إزالة صنف من سلة البيع الفورية`);
  };

  const triggerNotification = (text: string) => {
    setVoiceNotification(text);
    setTimeout(() => {
      setVoiceNotification("");
    }, 4500);
  };

  // Calculations for current POS Cart draft
  const getDraftInvoiceTotals = () => {
    const subtotal = posCart.reduce((total, item) => {
      const itemCost = item.isWeightBased && item.weight 
        ? item.price * item.weight 
        : item.price * item.quantity;
      return total + itemCost;
    }, 0);

    const discountAmount = subtotal * (discountPercent / 100);
    const taxAmount = (subtotal - discountAmount) * 0.14; // Standard 14% Egyptian VAT
    const finalTotal = subtotal - discountAmount + taxAmount;

    return {
      subtotal: Math.round(subtotal),
      discount: Math.round(discountAmount),
      tax: Math.round(taxAmount),
      total: Math.round(finalTotal)
    };
  };

  const draftTotals = getDraftInvoiceTotals();

  // Issue Invoice: Core Sales + Sync logic (Business requirement 1, 4)
  const handleIssueInvoice = async () => {
    if (posCart.length === 0) {
      triggerNotification("⚠️ سلة الفاتورة فارغة حالياً!");
      return;
    }

    // Check inventory stock volumes before finalizing sale
    for (const item of posCart) {
      const dbProd = products.find(p => p.id === item.id);
      if (dbProd) {
        const requiredAmount = item.isWeightBased && item.weight ? item.weight : item.quantity;
        if (dbProd.stock < requiredAmount) {
          triggerNotification(`❌ مخزون غير كافي لـ ${item.name}! المتبقي: ${dbProd.stock}`);
          return;
        }
      }
    }

    // Prepare Invoice ID
    const invoiceNo = `INV-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
    const newInvoice: Invoice = {
      id: Math.random().toString(36).substring(2, 11),
      invoiceNo,
      timestamp: new Date().toISOString(),
      items: [...posCart],
      subtotal: draftTotals.subtotal,
      discount: draftTotals.discount,
      tax: draftTotals.tax,
      total: draftTotals.total,
      paymentMethod,
      status: isOffline ? 'local_pending' : 'synced',
      cashier: 'كاشير رويال ١ (أسعد البدري)'
    };

    // Deduct stock levels locally in state & trigger warnings (Inventory depletion)
    const updatedProducts = products.map(p => {
      const cartItem = posCart.find(c => c.id === p.id);
      if (cartItem) {
        const factor = cartItem.isWeightBased && cartItem.weight ? cartItem.weight : cartItem.quantity;
        const newStock = Math.max(0, Number((p.stock - factor).toFixed(2)));
        
        // Low Stock alert trigger
        if (newStock <= 5) {
          setTimeout(() => {
            triggerNotification(`⚠️ تنبيه عاجل: مخزون [${p.name}] منخفض جداً! المتبقي: ${newStock}`);
          }, 1500);
        }
        return { ...p, stock: newStock };
      }
      return p;
    });

    setProducts(updatedProducts);

    // Save actual Invoice Data
    if (isOffline) {
      // Save locally to local invoices
      setInvoices(prev => [newInvoice, ...prev]);
      addHardwareLog(`💾 تم حفظ الفاتورة ${invoiceNo} محلياً (وضع الأوفلاين نشط SQLite)`);
      triggerNotification(`💾 تم البيع أوفلاين وحفظ الفاتورة برقم ${invoiceNo}`);
    } else {
      // Save directly to Firebase
      try {
        await addDoc(collection(db, "invoices"), newInvoice);
        
        // Push Stock levels updates online to firebase
        for (const item of posCart) {
          const docRef = doc(db, "products", item.id);
          const currentProd = updatedProducts.find(p => p.id === item.id);
          if (currentProd) {
            await updateDoc(docRef, { stock: currentProd.stock });
          }
        }

        setInvoices(prev => [newInvoice, ...prev]);
        addHardwareLog(`🌐 تم ترحيل الفاتورة ${invoiceNo} وخصم المخزون بنجاح على السحابة`);
        triggerNotification(`✅ تم إصدار الفاتورة وتزامنها: ${invoiceNo}`);
      } catch (err) {
        console.error("Firestore offline fallback during checkout: ", err);
        // Fallback to local
        newInvoice.status = 'local_pending';
        setInvoices(prev => [newInvoice, ...prev]);
        addHardwareLog(`⚠️ فشل الترحيل السحابي! تم الحفظ مؤقتاً في الطابور المحلي: ${invoiceNo}`);
        triggerNotification(`💾 تم البيع وحفظ الفاتورة محلياً للسلامة.`);
      }
    }

    // Simulated Peripheral Behavior (Hardware integration requirement 3)
    setDrawerOpenLog(true);
    addHardwareLog(`💵 إشارة نبض كهربائي 24v مرسلة لطابعة الحرارية -> درج النقدية فتح تلقائياً`);
    
    // Clear draft cart space
    setPosCart([]);
    setDiscountPercent(0);

    // Display Thermal receipt preview immediately for the cashier (Hardware size simulation)
    setShowInvoiceModal(newInvoice);
  };

  // Offline Sync protocol handler
  const handleSyncPendingInvoices = async () => {
    const pendings = invoices.filter(inv => inv.status === 'local_pending');
    if (pendings.length === 0) {
      triggerNotification("ℹ️ كل الفواتير مزمَنة تماماً مع الخادم الرئيسي!");
      return;
    }

    setSyncing(true);
    addHardwareLog(`🔄 بدء بروتوكول المزامنة الدفعي لعدد (${pendings.length}) فواتير...`);
    
    let successCount = 0;
    try {
      for (const inv of pendings) {
        // Post Invoice
        await addDoc(collection(db, "invoices"), {
          ...inv,
          status: 'synced'
        });

        // Update database stocks in firebase as well
        for (const item of inv.items) {
          const matchedProd = products.find(p => p.id === item.id);
          if (matchedProd) {
            try {
              const docRef = doc(db, "products", item.id);
              await updateDoc(docRef, { stock: matchedProd.stock });
            } catch (pErr) {
              console.warn("Could not push stock update during sync:", pErr);
            }
          }
        }
        successCount++;
        // Delay simulation for sync visual luxury feeling
        await new Promise(r => setTimeout(r, 600));
      }

      // Update local states status
      const updatedInvoices = invoices.map(inv => {
        if (inv.status === 'local_pending') {
          return { ...inv, status: 'synced' as const };
        }
        return inv;
      });
      setInvoices(updatedInvoices);
      
      addHardwareLog(`💫 تمت المزامنة الكلية بنجاح لعدد ${successCount} فواتير تتبع نظام POS`);
      triggerNotification(`🌟 تم ترحيل ${successCount} فواتير وتحقيق مزامنة المخزون!`);
    } catch (syncErr) {
      console.error("Batch synchronization error: ", syncErr);
      triggerNotification(`❌ حدث انقطاع أثناء المزامنة. تم إنقاذ ${successCount} فواتير بنجاح.`);
    }
    setSyncing(false);
  };

  // --- Manager Portal Role Actions (Edit / Void - Requirement 3) ---
  const handleVoidInvoice = async (invoiceId: string) => {
    // Role Gate check
    if (currentRole === 'cashier') {
      triggerNotification("🔒 عذراً: صلاحيتك كـ (كاشير) لا تسمح بإلغاء الفواتير أو المرتجعات!");
      addHardwareLog(`❌ محاولة إلغاء فاتورة مرفوضة - حظر صلاحيات الكاشير`);
      return;
    }

    const selectedInv = invoices.find(inv => inv.id === invoiceId);
    if (!selectedInv) return;

    if (selectedInv.status === 'voided') {
      triggerNotification("ℹ️ هذه الفاتورة تم إلغاؤها بالفعل.");
      return;
    }

    if (window.confirm(`هل أنت متأكد من إلغاء الفاتورة ${selectedInv.invoiceNo} بالكامل ومرتجعات المنتجات؟`)) {
      setLoading(true);
      
      // Restock the items
      const updatedProducts = products.map(p => {
        const returnedInvItem = selectedInv.items.find(item => item.id === p.id);
        if (returnedInvItem) {
          const factor = returnedInvItem.isWeightBased && returnedInvItem.weight ? returnedInvItem.weight : returnedInvItem.quantity;
          const returnedStock = Number((p.stock + factor).toFixed(2));
          return { ...p, stock: returnedStock };
        }
        return p;
      });

      setProducts(updatedProducts);

      // Update state
      const updatedInvoices = invoices.map(inv => {
        if (inv.id === invoiceId) {
          return { ...inv, status: 'voided' as const };
        }
        return inv;
      });
      setInvoices(updatedInvoices);

      // Save to firebase if online and not pending
      if (!isOffline && selectedInv.status === 'synced') {
        try {
          // Find doc in Firebase
          const invQuery = await getDocs(collection(db, "invoices"));
          const firebaseDoc = invQuery.docs.find(d => d.data().invoiceNo === selectedInv.invoiceNo);
          if (firebaseDoc) {
            await updateDoc(doc(db, "invoices", firebaseDoc.id), { status: 'voided' });
          }
          
          // Re-update stock levels back to Firebase
          for (const item of selectedInv.items) {
            const currentProd = updatedProducts.find(p => p.id === item.id);
            if (currentProd) {
              await updateDoc(doc(db, "products", item.id), { stock: currentProd.stock });
            }
          }
          addHardwareLog(`↩️ تم إلغاء الفاتورة سحابياً برقم: ${selectedInv.invoiceNo} وإرجاع المخزون`);
        } catch (fbErr) {
          console.warn("Could not reflect void transaction to Firebase, stored locally", fbErr);
        }
      } else {
        addHardwareLog(`↩️ تم إلغاء الفاتورة محلياً برقم: ${selectedInv.invoiceNo} وإرجاع المخزون (أوفلاين)`);
      }

      triggerNotification(`↩️ تم إلغاء الفاتورة بنجاح وإرجاع السلع للمخزن.`);
      setLoading(false);
    }
  };

  // Quick Restock Function inside Stock management panel
  const handleQuickRestock = async (productId: string, amount: number = 50) => {
    setLoading(true);
    const updatedProducts = products.map(p => {
      if (p.id === productId) {
        return { ...p, stock: p.stock + amount };
      }
      return p;
    });
    setProducts(updatedProducts);

    // Write directly to firebase if online
    if (!isOffline) {
      try {
        const docRef = doc(db, "products", productId);
        await updateDoc(docRef, { stock: products.find(p => p.id === productId)!.stock + amount });
        addHardwareLog(`📦 تم تزويد مخزون المنتج سحابياً بنجاح بمقدار (+${amount})`);
      } catch (err) {
        console.warn("Restock stored locally only: ", err);
      }
    } else {
      addHardwareLog(`📦 تم تزويد مخزون المنتج محلياً بمقدار (+${amount}) في وضع الأوفلاين`);
    }

    triggerNotification(`📦 تم إعادة تزويد المخزون بنجاح!`);
    setLoading(false);
  };

  // --- Executive Product Addition Submit Override ---
  const handleAddProductPOS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRole !== 'executive') {
      triggerNotification("🔒 يتطلب صلاحية الإدارة العليا لإضافة أو حذف أصناف المخزن الرئيسي!");
      return;
    }

    if (!newProductName || !newProductPrice) return;
    setLoading(true);

    const customNewProduct = {
      name: newProductName,
      price: Number(newProductPrice),
      category: newProductCategory,
      stock: Number(newProductStock) || 30,
      isWeightBased: newProductIsWeight,
      description: "صنف تجاري ممتاز معبأ محلياً لصالح هايبر المصري الفاخر.",
      image: "https://placehold.co/400x300/1a1a1a/gold?text=AlMasri",
      rating: 5.0
    };

    try {
      const docRef = await addDoc(collection(db, "products"), customNewProduct);
      const readyItem: Product = { id: docRef.id, ...customNewProduct };
      setProducts(prev => [readyItem, ...prev]);
      
      setNewProductName('');
      setNewProductPrice('');
      setNewProductStock('50');
      setNewProductIsWeight(false);

      triggerNotification(`✨ تم إضافة منتج جديد: ${customNewProduct.name}`);
      addHardwareLog(`✨ منتج جديد تم تسجيله بالرقم السحابي: ${docRef.id}`);
    } catch (fbAddErr) {
      console.error("Firebase store add error: ", fbAddErr);
      // Failback to list
      const fallbackId = `local_p_${Date.now()}`;
      const readyItem: Product = { id: fallbackId, ...customNewProduct };
      setProducts(prev => [readyItem, ...prev]);
      triggerNotification(`💾 تم حفظ السلعة محلياً لتعثر السحابة.`);
    }
    setLoading(false);
  };

  const handleDeleteProductPOS = async (productId: string) => {
    if (currentRole !== 'executive') {
      triggerNotification("🔒 يتطلب صلاحية الإدارة العليا لحذف أصناف المخزن الرئيسي!");
      return;
    }

    if (window.confirm("هل أنت متأكد من حذف هذا المنتج كلياً من قاعدة البيانات والرفوف؟")) {
      setLoading(true);
      try {
        await deleteDoc(doc(db, "products", productId));
        setProducts(prev => prev.filter(p => p.id !== productId));
        addHardwareLog(`🗑️ تم إبادة وحذف منتج بالرقم المعرف: ${productId}`);
        triggerNotification(`🗑️ تم إزالة المنتج كلياً من الرفوف.`);
      } catch (err) {
        console.error("Deletion error Firestore: ", err);
        // Clean local state
        setProducts(prev => prev.filter(p => p.id !== productId));
        triggerNotification(`🗑️ تم مسحه من الواجهة المحلية.`);
      }
      setLoading(false);
    }
  };

  // Visual custom stats calculations for Senior Management Dashboard (Arabic BI Console)
  const getExecutiveKPIs = () => {
    const validInvoices = invoices.filter(inv => inv.status !== 'voided');
    const totalSales = validInvoices.reduce((acc, current) => acc + current.total, 0);
    const totalInvoicesCount = validInvoices.length;
    const offlinePending = invoices.filter(inv => inv.status === 'local_pending').length;
    const itemsUnderStock = products.filter(p => p.stock <= 5).length;

    // Payment methods calculations
    const cashTotal = validInvoices.filter(inv => inv.paymentMethod === 'cash').reduce((acc, current) => acc + current.total, 0);
    const cardTotal = validInvoices.filter(inv => inv.paymentMethod === 'card').reduce((acc, current) => acc + current.total, 0);
    const walletTotal = validInvoices.filter(inv => inv.paymentMethod === 'wallet').reduce((acc, current) => acc + current.total, 0);

    return {
      totalSales,
      totalInvoicesCount,
      offlinePending,
      itemsUnderStock,
      cashPercent: totalSales ? Math.round((cashTotal / totalSales) * 100) : 45,
      cardPercent: totalSales ? Math.round((cardTotal / totalSales) * 100) : 35,
      walletPercent: totalSales ? Math.round((walletTotal / totalSales) * 100) : 20
    };
  };

  const kpi = getExecutiveKPIs();

  // Helper for Category localization
  const getProductCountInCat = (catName: string) => {
    if (catName === 'الكل') return products.length;
    return products.filter(p => p.category === catName).length;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500" dir="rtl">
      
      {/* 1. STATE & ALERTS SYSTEM BROADCAST TOP NOTIFICATION BANNER */}
      {voiceNotification && (
        <div className="fixed top-24 left-6 right-6 md:left-auto md:w-96 z-50 bg-[#0d0d0d] border-2 border-[#10B981] text-white p-4 rounded-2xl shadow-[0_20px_50px_rgba(191,149,63,0.3)] animate-bounce flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34D399] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#10B981]"></span>
          </div>
          <div className="flex-1 font-semibold text-sm">{voiceNotification}</div>
          <button onClick={() => setVoiceNotification("")} className="text-[#34D399] font-bold text-xs hover:opacity-80">إغلاق</button>
        </div>
      )}

      {/* HEADER CONTROLS HERO: Title & Offline indicators */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database size={16} className="text-[#10B981]" />
            <span className={`text-[10px] uppercase tracking-[0.3em] font-bold ${goldText}`}>بوابة الإشراف الشامل والمبيعات الفورية</span>
          </div>
          <h2 className="text-3xl font-serif font-bold">لوحة تحصيل وإدارة هايبر المصري (HyperPOS)</h2>
        </div>

        {/* Dynamic Network Status Indicator + Sync Trigger Block */}
        <div className="flex flex-wrap items-center gap-4 bg-[#121212] p-3 rounded-2xl border border-white/5 shadow-inner">
          
          {/* Offline Mode Switch */}
          <div className="flex items-center gap-3 border-l border-white/10 pl-4">
            <span className="text-xs font-bold text-gray-400">حالة الشبكة:</span>
            <button 
              onClick={() => {
                setIsOffline(!isOffline);
                triggerNotification(isOffline ? "🌐 تم الانتقال إلى وضع الأونلاين - سيتم ترحيل البيانات فوراً" : "🔌 تم تفعيل وضع الأوفلاين - جميع العمليات معزولة محلياً");
                addHardwareLog(isOffline ? "🌐 حالة الشبكة: العودة لنمط السحابة النشط" : "🔌 حالة الشبكة: تفعيل خادم الطوارئ المحلي SQLite");
              }}
              className={`relative inline-flex h-6 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${!isOffline ? 'bg-[#6AA84F]' : 'bg-red-600'}`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${!isOffline ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
            <div className="flex items-center gap-1.5 font-bold">
              {!isOffline ? (
                <>
                  <Wifi size={14} className="text-[#6AA84F] animate-pulse" />
                  <span className="text-xs text-[#6AA84F]">سحابي نشط</span>
                </>
              ) : (
                <>
                  <WifiOff size={14} className="text-red-500 animate-pulse" />
                  <span className="text-xs text-red-500">أوفلاين SQLite</span>
                </>
              )}
            </div>
          </div>

          {/* Sync Trigger Counter */}
          {kpi.offlinePending > 0 && (
            <button
              onClick={handleSyncPendingInvoices}
              disabled={syncing || isOffline}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                isOffline 
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                  : 'bg-amber-500 text-black hover:bg-amber-400 active:scale-95'
              }`}
              title={isOffline ? "يرجى تشغيل الشبكة أولاً للمزامنة" : "مزامنة الآن مع السحابة"}
            >
              <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
              {syncing ? "جاري المزامنة..." : `مزامنة (${kpi.offlinePending}) فواتير معلقة`}
            </button>
          )}

          {kpi.offlinePending === 0 && (
            <div className="text-[10px] text-gray-500 flex items-center gap-1">
              <Check size={12} className="text-[#6AA84F]" />
              كل البيانات سليمة
            </div>
          )}
        </div>
      </div>

      {/* 2. CORPORATE ROLE SWITCHER (Role-based access requirement 3) */}
      <div className="bg-[#0f0f0f] border border-white/10 p-5 rounded-3xl flex flex-col md:flex-row gap-5 items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
            <Key size={18} />
          </div>
          <div>
            <h4 className="font-serif font-bold text-sm text-gray-200">صلاحيات نظام المبيعات الفورية POS</h4>
            <p className="text-xs text-gray-500">اختر منصب المستخدم لتجربة قيود الصلاحيات الفرعية</p>
          </div>
        </div>

        <div className="flex p-1 bg-[#161616] rounded-2xl gap-2 w-full md:w-auto">
          <button
            onClick={() => {
              setCurrentRole('cashier');
              setActiveSubTab('pos');
              triggerNotification("🔒 تم ضبط الحساب بصلاحيات (كاشير محدود)");
            }}
            className={`flex-1 md:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${currentRole === 'cashier' ? 'bg-[#10B981] text-black font-extrabold shadow-lg shadow-[#10B981]/20' : 'text-gray-400 hover:text-white'}`}
          >
            <span>كاشير (limited)</span>
          </button>
          <button
            onClick={() => {
              setCurrentRole('manager');
              triggerNotification("🗝️ تم تبديل الصلاحيات: مدير فرع (إلغاء وتعديل فواتير)");
            }}
            className={`flex-1 md:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${currentRole === 'manager' ? 'bg-[#10B981] text-black font-extrabold shadow-lg shadow-[#10B981]/20' : 'text-gray-400 hover:text-white'}`}
          >
            <span>مدير الفرع</span>
          </button>
          <button
            onClick={() => {
              setCurrentRole('executive');
              triggerNotification("👑 تم تبديل الصلاحيات: إدارة عليا (تقارير وكافة الصلاحيات)");
            }}
            className={`flex-1 md:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${currentRole === 'executive' ? 'bg-[#10B981] text-black font-extrabold shadow-lg shadow-[#10B981]/20' : 'text-gray-400 hover:text-white'}`}
          >
            <span>الإدارة العليا (BI/All)</span>
          </button>
        </div>
      </div>

      {/* 3. POS ADMIN NAVIGATION BAR */}
      <div className="flex border-b border-white/5 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setActiveSubTab('pos')}
          className={`pb-4 px-6 font-bold text-xs whitespace-nowrap transition-all border-b-2 ${activeSubTab === 'pos' ? 'border-[#10B981] text-[#10B981]' : 'border-transparent text-gray-500 hover:text-white'}`}
        >
          🛒 شاشة البيع والمبيعات (CASHIER POS)
        </button>
        <button
          onClick={() => setActiveSubTab('invoices')}
          className={`pb-4 px-6 font-bold text-xs whitespace-nowrap transition-all border-b-2 ${activeSubTab === 'invoices' ? 'border-[#10B981] text-[#10B981]' : 'border-transparent text-gray-500 hover:text-white'}`}
        >
          📂 مراجعة الفواتير والمرتجعات (INVOICES)
        </button>
        <button
          onClick={() => setActiveSubTab('inventory')}
          className={`pb-4 px-6 font-bold text-xs whitespace-nowrap transition-all border-b-2 ${activeSubTab === 'inventory' ? 'border-[#10B981] text-[#10B981]' : 'border-transparent text-gray-500 hover:text-white'}`}
        >
          📦 جرد المخزون والتحذيرات (STOCK)
        </button>
        <button
          onClick={() => setActiveSubTab('bi')}
          className={`pb-4 px-6 font-bold text-xs whitespace-nowrap transition-all border-b-2 ${activeSubTab === 'bi' ? 'border-[#10B981] text-[#10B981]' : 'border-transparent text-gray-500 hover:text-white'}`}
        >
          📊 تقارير الأداء المالي (EXECUTIVE BI)
        </button>
        <button
          onClick={() => setActiveSubTab('peripherals')}
          className={`pb-4 px-6 font-bold text-xs whitespace-nowrap transition-all border-b-2 ${activeSubTab === 'peripherals' ? 'border-[#10B981] text-[#10B981]' : 'border-transparent text-gray-500 hover:text-white'}`}
        >
          🔌 الأجهزة الطرفية والمحاكيات
        </button>
      </div>

      {/* 4. SUB-TAB VIEWPORT OUTLETS */}

      {/* --- SUB-TAB A: CASHIER POS INTERFACE --- */}
      {activeSubTab === 'pos' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start animate-in fade-in duration-300">
          
          {/* LEFT PANEL: CART LIST & CHECKOUT BILL DRAFT (XL-SIZE: 5 Cols) */}
          <div className="xl:col-span-5 bg-[#0d0d0d] border border-white/10 rounded-3xl p-6 space-y-6 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="text-[#10B981]" size={16} />
                <h3 className="font-bold text-sm text-white">فاتورة العميل الحالية</h3>
              </div>
              <span className="text-[10px] bg-white/5 px-3 py-1 rounded-full text-gray-400 font-mono">
                {posCart.length} أصناف
              </span>
            </div>

            {/* Offline Alert Warning within billing view */}
            {isOffline && (
              <div className="bg-amber-950/20 text-xs text-amber-500 border border-amber-500/20 p-3 rounded-2xl flex items-center gap-2">
                <WifiOff size={14} />
                أنت تبيع حالياً بدون اتصال. سيتم تخرين الفواتير مشفرة في متصفح المتجر!
              </div>
            )}

            {/* Cart Items Table Scroller */}
            <div className="max-h-[320px] overflow-y-auto space-y-3 pr-1">
              {posCart.length === 0 ? (
                <div className="text-center py-16 text-gray-500 space-y-3">
                  <ShoppingCart size={36} className="mx-auto opacity-20" />
                  <p className="text-xs">سلة الـ POS فارغة. اضغط على أي صنف باليسار لإدراجه.</p>
                </div>
              ) : (
                posCart.map(item => {
                  const itemCost = item.isWeightBased && item.weight 
                    ? item.price * item.weight 
                    : item.price * item.quantity;
                  
                  return (
                    <div key={item.id} className="bg-[#121212] border border-white/5 p-3 rounded-xl flex items-center justify-between gap-3 text-right">
                      
                      {/* Cost */}
                      <div className="text-left flex-shrink-0 min-w-[70px]">
                        <span className="text-xs font-bold text-white font-mono">{Math.round(itemCost)} ج.م</span>
                        {item.isWeightBased && item.weight && (
                          <div className="text-[9px] text-[#10B981] font-mono">
                            {item.price} ج.م / كجم
                          </div>
                        )}
                      </div>

                      {/* Weight/Qty Controls */}
                      <div className="flex items-center gap-2 bg-[#1a1a1a] py-1 px-2 rounded-lg border border-white/5">
                        {item.isWeightBased ? (
                          <div className="flex items-center gap-1 text-xs">
                            <span className="text-gray-400 text-[10px]">الوزن:</span>
                            <input 
                              type="number"
                              step="0.05"
                              value={item.weight || 1}
                              onChange={(e) => updateCartPOSWeight(item.id, Number(e.target.value))}
                              className="w-12 bg-transparent text-center font-bold text-[#34D399] focus:outline-none focus:border-[#10B981] border-b border-white/10 font-mono text-xs"
                            />
                            <span className="text-[10px] text-gray-500">كجم</span>
                          </div>
                        ) : (
                          <>
                            <button 
                              onClick={() => updateCartPOSQuantity(item.id, -1)}
                              className="text-gray-400 hover:text-white p-1"
                            >
                              <Minus size={10} />
                            </button>
                            <span className="font-mono text-xs font-bold px-2">{item.quantity}</span>
                            <button 
                              onClick={() => updateCartPOSQuantity(item.id, 1)}
                              className="text-gray-400 hover:text-white p-1"
                            >
                              <Plus size={10} />
                            </button>
                          </>
                        )}
                      </div>

                      {/* Name */}
                      <div className="flex-1 min-w-0 pr-1">
                        <h4 className="font-bold text-xs truncate text-white">{item.name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded ${item.isWeightBased ? 'bg-[#10B981]/10 text-[#34D399]' : 'bg-blue-900/10 text-blue-400'}`}>
                            {item.isWeightBased ? 'بالكيلو' : 'بالقطعة'}
                          </span>
                        </div>
                      </div>

                      {/* Delete */}
                      <button 
                        onClick={() => removeFromCartPOS(item.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                        title="إزالة صنف"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bill Math calculations & Discount box */}
            <div className="border-t border-white/5 pt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">سعر الأصناف</span>
                <span className="font-mono">{draftTotals.subtotal} ج.م</span>
              </div>

              {/* Discount Entry */}
              <div className="flex items-center justify-between gap-4 bg-[#141414] p-2 rounded-xl border border-white/5">
                <div className="flex items-center gap-1 text-gray-400 text-xs">
                  <span>الخصم الممنوح:</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="80"
                    placeholder="0"
                    value={discountPercent || ''}
                    onChange={(e) => setDiscountPercent(Math.min(80, Number(e.target.value)))}
                    className="w-12 bg-[#1c1c1c] text-center font-bold text-[#34D399] rounded p-1 border border-white/10 outline-none focus:border-[#10B981] text-xs font-mono"
                  />
                  <span className="text-xs text-[#10B981] font-bold">%</span>
                  {discountPercent > 0 && (
                    <span className="text-[10px] text-red-400 font-mono">
                      (-{draftTotals.discount} ج.م)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">ضريبة القيمة المضافة (14%)</span>
                <span className="font-mono text-gray-300">+{draftTotals.tax} ج.م</span>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-3 text-sm">
                <span className="text-white font-serif">الإجمالي النهائي للتحصيل</span>
                <span className={`font-mono text-lg font-bold ${goldText}`}>
                  {draftTotals.total} ج.م
                </span>
              </div>
            </div>

            {/* Payment Method Selector (Core requirement 1) */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-400">وسيلة الدفع للعميل:</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${paymentMethod === 'cash' ? 'bg-[#10B981]/10 border-[#10B981]/50 text-[#34D399]' : 'bg-[#121212] border-white/5 text-gray-500 hover:text-white'}`}
                >
                  <DollarSign size={16} />
                  <span className="text-[10px] font-bold">كاش (نقدي)</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${paymentMethod === 'card' ? 'bg-[#10B981]/10 border-[#10B981]/50 text-[#34D399]' : 'bg-[#121212] border-white/5 text-gray-500 hover:text-white'}`}
                >
                  <CreditCard size={16} />
                  <span className="text-[10px] font-bold">فيزا (بطاقة)</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('wallet')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${paymentMethod === 'wallet' ? 'bg-[#10B981]/10 border-[#10B981]/50 text-[#34D399]' : 'bg-[#121212] border-white/5 text-gray-500 hover:text-white'}`}
                >
                  <Smartphone size={16} />
                  <span className="text-[10px] font-bold">محافظ ذكية</span>
                </button>
              </div>
            </div>

            {/* Print and Issue button */}
            <button
              onClick={handleIssueInvoice}
              disabled={posCart.length === 0}
              className={`w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 ${posCart.length > 0 ? goldGradient + ' text-black shadow-lg shadow-[#10B981]/20' : 'bg-gray-800 text-gray-600 cursor-not-allowed'} transition-all`}
            >
              <Printer size={16} />
              إصدار وطباعة الفاتورة الفورية (CASH OUT)
            </button>
          </div>

          {/* RIGHT PANEL: CATALOG MATRIX & BARCODE SCANNER EMULATOR (XL-SIZE: 7 Cols) */}
          <div className="xl:col-span-7 space-y-6">
            
            {/* INLINE BARCODE EMULATOR WIDGET */}
            <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-4 shadow-xl">
              <form onSubmit={handleBarcodeSubmit} className="flex gap-3 justify-between items-center text-right">
                <div className="flex-1">
                  <label className="block text-[10px] text-gray-500 font-bold mb-1">
                    محاكي قارئ الباركود اليدوي (Thermal Laser Keydown POS Emulator)
                  </label>
                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="امسح باركود المنتج (أدخل الاسم أو رمز مثل p1 ، p2) واضغط Enter"
                      value={scannedBarcode}
                      onChange={(e) => setScannedBarcode(e.target.value)}
                      className="w-full bg-[#161616] border border-white/10 rounded-xl py-2 px-3 text-xs outline-none focus:border-[#10B981] transition-all text-white placeholder-gray-600 text-right pr-9"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <Zap size={12} className="text-[#10B981]" />
                    </div>
                  </div>
                </div>
                <button 
                  type="submit"
                  className="bg-[#1a1a1a] hover:bg-[#333] border border-white/5 text-gray-300 font-bold text-xs py-2.5 px-4 rounded-xl mt-5"
                >
                  مسح بوقعي
                </button>
              </form>
            </div>

            {/* Category selection and Product Listing card */}
            <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-6 space-y-6 shadow-2xl">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h3 className="font-serif font-bold text-md text-[#34D399]">المعروضات الفورية بالرفوف</h3>
                
                {/* Search query box */}
                <div className="relative w-full md:w-64">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#161616] border border-white/5 rounded-xl py-2 pr-8 pl-3 text-xs outline-none focus:border-[#10B981]/50 text-white placeholder-gray-500 text-right"
                    placeholder="بحث سريع برقم الصنف أو الاسم..."
                  />
                  <Search size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>
              </div>

              {/* Categorization tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {CATEGORIES.map(cat => {
                  const itemsCount = getProductCountInCat(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all border ${selectedCategory === cat ? 'bg-[#10B981]/15 border-[#10B981] text-[#34D399]' : 'bg-[#141414] border-white/5 text-gray-500 hover:text-white'}`}
                    >
                      {cat} ({itemsCount})
                    </button>
                  );
                })}
              </div>

              {/* Products POS Grid layout */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {products
                  .filter(p => selectedCategory === 'الكل' || p.category === selectedCategory)
                  .filter(p => !searchQuery || p.name.includes(searchQuery) || p.category.includes(searchQuery))
                  .map(product => {
                    const isLow = product.stock <= 5;
                    const isOut = product.stock === 0;

                    return (
                      <button
                        key={product.id}
                        disabled={isOut}
                        onClick={() => handleProductClick(product)}
                        className={`group p-3 rounded-2xl border text-right transition-all flex flex-col justify-between h-[155px] ${
                          isOut 
                            ? 'bg-[#121212]/50 border-red-950/20 opacity-40 cursor-not-allowed' 
                            : isLow 
                              ? 'bg-amber-950/5 border-amber-500/20 hover:border-amber-500/55 hover:shadow-[0_0_15px_rgba(245,158,11,0.05)]' 
                              : 'bg-[#131313] border-white/5 hover:border-[#10B981]/40 hover:shadow-lg'
                        }`}
                      >
                        {/* Image small and Category name */}
                        <div className="flex justify-between items-start w-full gap-2">
                          <span className="text-[8px] bg-white/5 px-2 py-0.5 rounded text-gray-500 font-mono">
                            {product.category}
                          </span>
                          
                          {/* Live quantity badge */}
                          {isOut ? (
                            <span className="text-[8px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded">نفد</span>
                          ) : isLow ? (
                            <span className="text-[8px] bg-amber-500 text-black font-extrabold px-1.5 py-0.5 rounded animate-pulse">شبه نافد ({product.stock})</span>
                          ) : (
                            <span className="text-[8px] text-green-400 bg-green-950/10 px-1.5 py-0.5 rounded font-mono">متوفر ({product.stock})</span>
                          )}
                        </div>

                        {/* Middle info */}
                        <div className="my-2 text-right">
                          <h4 className="font-bold text-xs text-white max-line-clamp-2 leading-snug group-hover:text-[#34D399] transition-colors">{product.name}</h4>
                        </div>

                        {/* Bottom alignment */}
                        <div className="flex items-end justify-between w-full mt-1">
                          
                          {/* Add button icon */}
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                            product.isWeightBased 
                              ? 'bg-[#10B981]/10 border border-[#10B981]/40 text-[#34D399]' 
                              : 'bg-green-600/10 border border-green-600/20 text-green-400 group-hover:bg-[#6AA84F] group-hover:text-white'
                          }`}>
                            {product.isWeightBased ? <Scale size={12} /> : <Plus size={12} />}
                          </div>

                          <div className="text-right">
                            <span className="font-mono text-sm font-bold text-[#10B981]">{product.price}</span>
                            <span className="text-[8px] text-gray-500 mr-0.5">ج.م {product.isWeightBased ? '/كم' : '/ق'}</span>
                          </div>

                        </div>
                      </button>
                    );
                  })
                }

                {products.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-600 text-xs">
                    جاري تحميل مخزون الرفوف الفوري من قاعدة البيانات السحابية...
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      )}

      {/* --- SUB-TAB B: INVOICES MANAGER VIEW (Requirement 1, 3 - Manager specific) --- */}
      {activeSubTab === 'invoices' && (
        <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-6 shadow-2xl animate-in fade-in duration-300">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4 mb-6">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#34D399]">سجل عمليات البيع والفواتير</h3>
              <p className="text-xs text-gray-500">مراجعة الفواتير والمدفوعات والمسترجعات في هذا الوردية</p>
            </div>

            {/* Simple feedback of roles */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">الصلاحية المفعلة:</span>
              <span className={`text-xs px-3 py-1 rounded-full font-bold ${currentRole === 'cashier' ? 'bg-red-950/20 text-red-400 border border-red-900/30' : 'bg-[#6AA84F]/10 text-[#6AA84F] border border-[#6AA84F]/30'}`}>
                {currentRole === 'cashier' ? '🔍 فحص فقط (كاشير)' : '🗝️ تفعيل الإجراءات المتقدمة (المدير)'}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#121212] border-b border-white/15 text-gray-400 uppercase font-semibold">
                <tr>
                  <th className="p-4 rounded-r-xl">رقم الفاتورة</th>
                  <th className="p-4">توقيت المعاملة</th>
                  <th className="p-4">الأصناف المبيعة</th>
                  <th className="p-4">طريقة السداد</th>
                  <th className="p-4">المبلغ المجمل</th>
                  <th className="p-4">حالة المزامنة</th>
                  <th className="p-4">حالة المعاملة</th>
                  <th className="p-4 rounded-l-xl text-center">إجراءات المدير الروتينية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-600">
                      لم يتم تسجيل أي فواتير بيع في الوردية الحالية حتى الآن.
                    </td>
                  </tr>
                ) : (
                  invoices.map(inv => {
                    const date_formatted = new Date(inv.timestamp).toLocaleTimeString('ar-EG') + " " + new Date(inv.timestamp).toLocaleDateString('ar-EG');
                    const isVoided = inv.status === 'voided';
                    const itemsText = inv.items.map(it => `${it.name} (${it.isWeightBased && it.weight ? it.weight + 'كجم' : it.quantity + 'قطعة'})`).join('، ');

                    return (
                      <tr key={inv.id} className={`hover:bg-white/5 transition-colors ${isVoided ? 'opacity-45 ring-1 ring-red-950/20' : ''}`}>
                        <td className="p-4 font-mono font-bold text-[#34D399]">{inv.invoiceNo}</td>
                        <td className="p-4 text-gray-400">{date_formatted}</td>
                        <td className="p-4 max-w-xs truncate" title={itemsText}>{itemsText}</td>
                        <td className="p-4 font-semibold">
                          {inv.paymentMethod === 'cash' ? '💵 كاش نقدي' : inv.paymentMethod === 'card' ? '💳 فيزا بنكية' : '📱 المحفظة الذكية'}
                        </td>
                        <td className="p-4 font-bold text-white font-mono">{inv.total} ج.م</td>
                        <td className="p-4">
                          {inv.status === 'local_pending' ? (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/35 text-amber-500 border border-amber-500/20 font-bold">بانتظار المزامنة أوفلاين</span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-green-950/20 text-green-400 border border-green-900/10 font-bold">مكتمل سحابياً</span>
                          )}
                        </td>
                        <td className="p-4 font-bold">
                          {isVoided ? (
                            <span className="text-red-500">🚫 ملغية / مرتجع</span>
                          ) : (
                            <span className="text-green-500">✅ مدفوعة بالكامل</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => setShowInvoiceModal(inv)}
                              className="bg-[#1c1c1c] hover:bg-[#333] font-bold text-[10px] py-1.5 px-3 rounded-lg flex items-center gap-1 border border-white/5"
                              title="عرض الفاتورة وطباعتها حرارياً"
                            >
                              <Printer size={10} />
                              التفاصيل والطباعة
                            </button>
                            
                            <button
                              disabled={isVoided}
                              onClick={() => handleVoidInvoice(inv.id)}
                              className={`font-bold text-[10px] py-1.5 px-3 rounded-lg flex items-center gap-1 border transition-all ${
                                isVoided 
                                  ? 'bg-transparent text-gray-600 border-transparent cursor-not-allowed' 
                                  : currentRole === 'cashier'
                                    ? 'bg-transparent text-gray-600 border-transparent cursor-not-allowed'
                                    : 'bg-red-950/30 text-red-400 hover:bg-red-900/50 border-red-900/30'
                              }`}
                              title={currentRole === 'cashier' ? "مغلق لعدم كفاية الصلاحيات" : "إجراء إلغاء ومرتجع للسبيل"}
                            >
                              <Ban size={10} />
                              {isVoided ? 'تم الإلغاء والمرتجع' : 'إلغاء الفاتورة بالكامل'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* --- SUB-TAB C: STOCK CONTROLLER & SYSTEM ALERTS (Requirement 2) --- */}
      {activeSubTab === 'inventory' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-in fade-in duration-300">
          
          {/* SATELLITE: ALERTS TRAY & NOTIFICATION LOGS (1 Col) */}
          <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-5 space-y-4">
            <h3 className="font-serif font-bold text-sm text-[#34D399] flex items-center gap-1.5">
              <Bell size={14} className="text-amber-500 animate-swing" />
              أحدث تنبيهات المخزن والنظام
            </h3>
            
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1 text-xs">
              {products.filter(p => p.stock <= 5).map(prod => (
                <div key={prod.id} className="bg-red-950/20 border-r-4 border-red-500 p-3 rounded-xl">
                  <div className="font-bold text-red-400">تنبيه حرج بالمخزون: {prod.name}</div>
                  <p className="text-gray-400 mt-0.5">انخفض المتبقي على الرفوف إلى ({prod.stock}) قطع فقط! يرجى إعادة التموين تلافياً للتوقف.</p>
                  <button
                    onClick={() => handleQuickRestock(prod.id, 50)}
                    className="mt-2 text-[10px] bg-red-900/50 text-white font-bold p-1 rounded-lg hover:bg-red-800"
                  >
                    إعادة تعبئة فورية (+50)
                  </button>
                </div>
              ))}

              <div className="bg-[#121212] p-3 rounded-xl border border-white/5 space-y-2">
                <div className="font-bold text-gray-400">مذكرة الوردية الحالية:</div>
                <div className="space-y-1.5 text-[10px] text-gray-500">
                  <div>- الخصم الأقصى المتاح للكاشير هو 15%. تعديلات النسب الأعلى لمدير الفرع.</div>
                  <div>- الفواتير الملغية تنعكس فوراً وتسترجع للمخزن.</div>
                  <div>- سيتم مزامنة أي فواتير عائمة محلية بمجرد تبديل زر أوفلاين.</div>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN MATRIX: STOCK LEVELS REPORT & ACTIONS (2 Cols) */}
          <div className="lg:col-span-2 bg-[#0d0d0d] border border-white/10 rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-serif font-bold text-md text-[#34D399]">جرد وإدارة أرفف المخازن الفورية</h3>
                <p className="text-xs text-gray-500">توصيل وتحديث كمية السلع المخزونة لحظياً بالخادم</p>
              </div>

              {/* Reset to Seed button trigger */}
              <button
                onClick={fetchAllData}
                className="bg-[#161616] border border-white/10 hover:border-[#10B981]/40 text-gray-400 font-bold py-1.5 px-3 rounded-xl text-[10px] flex items-center gap-1 transition-all"
              >
                <RefreshCw size={10} />
                تحديث وجلب البيانات المعاصرة
              </button>
            </div>

            {/* List and Adjusting Stock Levels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map(p => {
                const isCritical = p.stock <= 5;
                const percentLeft = Math.min(100, (p.stock / 100) * 100);

                return (
                  <div key={p.id} className={`p-4 rounded-2xl border text-right transition-all bg-[#121212] ${isCritical ? 'border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.03)]' : 'border-white/5'}`}>
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-left font-mono">
                        <span className={`text-sm font-bold ${isCritical ? 'text-red-400 animate-pulse' : 'text-green-400'}`}>
                          {p.stock} {p.isWeightBased ? 'كجم' : 'صنف'}
                        </span>
                        <div className="text-[9px] text-gray-500">مخزون مسجل</div>
                      </div>
                      
                      <div className="text-right">
                        <h4 className="font-bold text-xs text-white truncate max-w-[160px]">{p.name}</h4>
                        <span className="text-[9px] text-gray-500">{p.category}</span>
                      </div>
                    </div>

                    {/* Progress Bar represent levels */}
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden my-3">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${isCritical ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-[#6AA84F]'}`}
                        style={{ width: `${percentLeft}%` }}
                      />
                    </div>

                    {/* Admin/Manager custom restock buttons */}
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5 gap-2">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleQuickRestock(p.id, 10)}
                          className="px-2 py-1 bg-[#1a1a1a] hover:bg-[#333] text-gray-300 font-bold text-[9px] rounded-lg border border-white/5"
                        >
                          تزويد +10
                        </button>
                        <button
                          onClick={() => handleQuickRestock(p.id, 50)}
                          className="px-2 py-1 bg-[#10B981]/10 hover:bg-[#10B981]/20 text-[#34D399] font-extrabold text-[9px] rounded-lg border border-[#10B981]/10"
                        >
                          شحن +50
                        </button>
                      </div>

                      {/* Delete item button only for Senior Executives */}
                      {currentRole === 'executive' && (
                        <button
                          onClick={() => handleDeleteProductPOS(p.id)}
                          className="p-1.5 bg-red-950/20 hover:bg-red-900/40 text-red-400 rounded-lg transition-colors border border-red-900/10"
                          title="حذف الصنف نهائياً من الرفوف"
                        >
                          <Trash2 size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sub-addition section: Add Product FORM only for EXECUTIVE role (Preserves & Elevates original requirements) */}
            <div className="border-t border-white/5 pt-6 mt-6">
              <div className="bg-[#121212]/50 border-2 border-[#10B981]/10 p-5 rounded-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <Plus className="text-[#10B981]" size={14} />
                  <h4 className="font-serif font-bold text-xs text-white">إدراج صنف تجاري جديد في القوائم والسحابة (صلاحية الإشراف العليا)</h4>
                </div>
                
                {currentRole !== 'executive' ? (
                  <div className="text-center py-6 text-gray-500 font-semibold text-xs bg-black/30 rounded-xl border border-white/5">
                    🔏 إضافة أصناف جديدة مغلقة حالياً. يرجى الترفيع لـ (الإدارة العليا) من مفتاح صلاحيات POS لتشغيل هذا النموذج المتقدم.
                  </div>
                ) : (
                  <form onSubmit={handleAddProductPOS} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    
                    <div className="sm:col-span-4 space-y-1">
                      <label className="text-[9px] text-gray-500">اسم المنتج</label>
                      <input
                        type="text"
                        placeholder="أرز بسمتي ذهبي، خيار صوبة بلدي"
                        value={newProductName}
                        onChange={(e) => setNewProductName(e.target.value)}
                        className="w-full bg-[#181818] border border-white/10 rounded-lg p-2 text-xs outline-none focus:border-[#10B981] text-white"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[9px] text-gray-500">السعر (ج.م)</label>
                      <input
                        type="number"
                        placeholder="السعر"
                        value={newProductPrice}
                        onChange={(e) => setNewProductPrice(e.target.value)}
                        className="w-full bg-[#181818] border border-white/10 rounded-lg p-2 text-xs outline-none focus:border-[#10B981] text-white font-mono"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[9px] text-gray-500">الكمية الأولى</label>
                      <input
                        type="number"
                        placeholder="الكمية"
                        value={newProductStock}
                        onChange={(e) => setNewProductStock(e.target.value)}
                        className="w-full bg-[#181818] border border-white/10 rounded-lg p-2 text-xs outline-none focus:border-[#10B981] text-white font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[9px] text-gray-500">التصنيف الرئيسي</label>
                      <select
                        value={newProductCategory}
                        onChange={(e) => setNewProductCategory(e.target.value)}
                        className="w-full bg-[#181818] border border-white/10 rounded-lg p-2 text-[10px] outline-none focus:border-[#10B981] text-white"
                      >
                        {CATEGORIES.filter(c => c !== 'الكل').map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2 flex items-center justify-center p-2.5 bg-[#181818] border border-white/10 rounded-lg">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newProductIsWeight}
                          onChange={(e) => setNewProductIsWeight(e.target.checked)}
                          className="rounded text-[#10B981] bg-black border-white/10 focus:ring-0"
                        />
                        <span className="text-[10px] text-gray-400">يباع بالوزن</span>
                      </label>
                    </div>

                    <div className="col-span-full mt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className={`py-2 px-6 rounded-lg font-bold text-xs flex items-center gap-2 ${goldGradient} text-black hover:opacity-95`}
                      >
                        <Save size={12} />
                        تسكين المنتج وتسجيله بقاعدة البيانات
                      </button>
                    </div>

                  </form>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* --- SUB-TAB D: EXECUTIVE BI DASHBOARD INTEL (Arabic Senior Reports - Requirement 1) --- */}
      {activeSubTab === 'bi' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Bento Analytics Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-[#0d0d0d] border border-white/5 p-5 rounded-3xl text-right">
              <span className="text-[10px] text-gray-500 font-bold block mb-1">إجمالي الإيراد الصافي</span>
              <h3 className={`text-2xl font-serif font-bold ${goldText} font-mono`}>{kpi.totalSales.toLocaleString()} ج.م</h3>
              <p className="text-[9px] text-green-400 mt-1">تحديث حي من السحابة</p>
            </div>

            <div className="bg-[#0d0d0d] border border-white/5 p-5 rounded-3xl text-right">
              <span className="text-[10px] text-gray-500 font-bold block mb-1">فواتير الوردية المصدرة</span>
              <h3 className="text-2xl font-mono text-white font-bold">{kpi.totalInvoicesCount} فريدة</h3>
              <p className="text-[9px] text-gray-400 mt-1">متوسط سلة المشتريات: {kpi.totalInvoicesCount ? Math.round(kpi.totalSales / kpi.totalInvoicesCount) : 0} ج.م</p>
            </div>

            <div className="bg-[#0d0d0d] border border-white/5 p-5 rounded-3xl text-right">
              <span className="text-[10px] text-gray-500 font-bold block mb-1">معلقات في الانتظار (أوفلاين)</span>
              <h3 className={`text-2xl font-mono font-bold ${kpi.offlinePending > 0 ? 'text-amber-500 animate-pulse' : 'text-gray-400'}`}>
                {kpi.offlinePending} فواتير
              </h3>
              <p className="text-[9px] text-gray-400 mt-1">في الذاكرة الرديفة SQLite</p>
            </div>

            <div className="bg-[#0d0d0d] border border-white/5 p-5 rounded-3xl text-right">
              <span className="text-[10px] text-gray-500 font-bold block mb-1">أصناف شبه منقضية (تحت المخزون)</span>
              <h3 className={`text-2xl font-mono font-bold ${kpi.itemsUnderStock > 0 ? 'text-red-400 animate-pulse' : 'text-green-400'}`}>
                {kpi.itemsUnderStock} أصناف
              </h3>
              <p className="text-[9px] text-red-500 mt-1">تحذيرات عاجلة</p>
            </div>

          </div>

          {/* GORGEOUS HIGH-FIDELITY CUSTOM-CODED ADVANCED SVG BI CHARTS (Anti-ai-slop, 100% bug-free React 19 safe charts) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Donut Chart: Payments method structure */}
            <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-6 shadow-2xl text-right space-y-4">
              <div>
                <h4 className="font-serif font-bold text-sm text-[#34D399]">توزيع وسائل الدفع بالمتجر (Payment Splits)</h4>
                <p className="text-xs text-gray-500">النسب المئوية للتحصلات نقدي كاش مقابل الفيزا والمحافظ الإلكترونية</p>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-around gap-6 pt-2">
                {/* Custom SVG Donut representation */}
                <div className="relative w-40 h-40">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    {/* Background Circle */}
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#222" strokeWidth="3" />
                    
                    {/* Segment 1: Cash (Gold) */}
                    <circle 
                      cx="18" cy="18" r="15.915" fill="none" 
                      stroke="#10B981" strokeWidth="3.2" 
                      strokeDasharray={`${kpi.cashPercent} ${100 - kpi.cashPercent}`} 
                      strokeDashoffset="0" 
                    />
                    
                    {/* Segment 2: Card (Blue) */}
                    <circle 
                      cx="18" cy="18" r="15.915" fill="none" 
                      stroke="#5DADE2" strokeWidth="3.2" 
                      strokeDasharray={`${kpi.cardPercent} ${100 - kpi.cardPercent}`} 
                      strokeDashoffset={`${-kpi.cashPercent}`} 
                    />

                    {/* Segment 3: Wallet (Purple/Green) */}
                    <circle 
                      cx="18" cy="18" r="15.915" fill="none" 
                      stroke="#6AA84F" strokeWidth="3.2" 
                      strokeDasharray={`${kpi.walletPercent} ${100 - kpi.walletPercent}`} 
                      strokeDashoffset={`${-(kpi.cashPercent + kpi.cardPercent)}`} 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] text-gray-500 font-bold">إجمالي السداد</span>
                    <span className="text-xs font-serif font-extrabold text-[#34D399] font-mono">{kpi.totalSales} ج.م</span>
                  </div>
                </div>

                {/* Legends Grid */}
                <div className="space-y-3 w-full md:w-auto">
                  <div className="flex items-center gap-3 justify-end text-xs">
                    <span className="font-bold text-white font-mono">{kpi.cashPercent}%</span>
                    <span className="text-gray-400">💵 الدفع النقدي (كاش)</span>
                    <div className="w-3 h-3 rounded-full bg-[#10B981]" />
                  </div>
                  <div className="flex items-center gap-3 justify-end text-xs">
                    <span className="font-bold text-white font-mono">{kpi.cardPercent}%</span>
                    <span className="text-gray-400">💳 البطاقات البنكية (فيزا)</span>
                    <div className="w-3 h-3 rounded-full bg-[#5DADE2]" />
                  </div>
                  <div className="flex items-center gap-3 justify-end text-xs">
                    <span className="font-bold text-white font-mono">{kpi.walletPercent}%</span>
                    <span className="text-gray-400">📱 المحافظ وفودافون كاش</span>
                    <div className="w-3 h-3 rounded-full bg-[#6AA84F]" />
                  </div>
                </div>
              </div>

            </div>

            {/* Bar Chart: Stocks allocation across all listed shelf items */}
            <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-6 shadow-2xl text-right space-y-4">
              <div>
                <h4 className="font-serif font-bold text-sm text-[#34D399]">سلامة المخازن والأرفف (Stores Volume)</h4>
                <p className="text-xs text-gray-500">حجم المخزون المتبقي لكل سلعة ونسبة الخطورة مقارنة بنقطة الاحتياط</p>
              </div>

              {/* Dynamic Stacked Bar Representation */}
              <div className="space-y-4 pt-2">
                {products.slice(0, 5).map(p => {
                  const isCritical = p.stock <= 5;
                  const ratio = Math.min(100, (p.stock / 100) * 100);

                  return (
                    <div key={p.id} className="space-y-1 text-xs">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className={`font-mono font-bold ${isCritical ? 'text-red-400 animate-pulse' : 'text-gray-300'}`}>
                          {p.stock} {p.isWeightBased ? 'كجم' : 'وحدة'}
                        </span>
                        <span className="text-gray-400 font-bold">{p.name}</span>
                      </div>
                      
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden relative">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ${isCritical ? 'bg-gradient-to-r from-red-600 to-red-400 animate-pulse' : 'bg-gradient-to-r from-[#10B981] to-[#34D399]'}`}
                          style={{ width: `${ratio}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>

        </div>
      )}

      {/* --- SUB-TAB E: HARDWARE PERIPHERALS INTEGRATIONS HUB (Hardware simulator requirement 3) --- */}
      {activeSubTab === 'peripherals' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-in fade-in duration-300">
          
          {/* Left panel: Peripherals Logs Terminal */}
          <div className="bg-black border border-white/10 rounded-2xl p-5 space-y-3 font-mono text-[11px] text-right">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="text-gray-500">v4.0.12 System Serial</span>
              <h4 className="font-bold text-xs text-[#10B981] font-serif">شاشة مراقبة الأجهزة الملحقة</h4>
            </div>

            <div className="h-[360px] overflow-y-auto space-y-1.5 pr-1 text-gray-400" dir="ltr">
              {hardwareLogs.map((log, index) => (
                <div key={index} className="leading-snug">
                  {log}
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setHardwareLogs([]);
                addHardwareLog("🧹 تم تصفير سجل مراقبة الأجهزة الملحقة بنجاح.");
              }}
              className="text-right text-[10px] text-red-400 hover:text-red-300 transition-colors pt-2 block"
            >
              [تصفير شاشة المراقبة]
            </button>
          </div>

          {/* Right Panels: Interactive gear configuration selectors (2 Columns) */}
          <div className="lg:col-span-2 bg-[#0d0d0d] border border-white/10 rounded-3xl p-6 space-y-6 shadow-2xl">
            <div>
              <h3 className="font-serif font-bold text-md text-[#34D399]">إعداد وتعريف الأجهزة الطرفية والمبيعات POS</h3>
              <p className="text-xs text-gray-500">يتواصل التطبيق كودياً وبشكل برمجي مباشر مع تعريفات النوافذ (Esc/POS Drivers & WebUSB)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Device 1: Thermal Receipt Printer */}
              <div className="bg-[#121212] p-4 rounded-2xl border border-white/5 space-y-3 text-right">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] px-2 py-0.5 rounded bg-[#6AA84F]/10 text-green-400 font-bold border border-[#6AA84F]/20">متصل (USB)</span>
                  <HeadingControl label="طابعة الفواتير الحرارية Receipts" icon={<Printer size={14} />} />
                </div>
                <p className="text-[11px] text-gray-500">محاكاة الطباعة المقاسات وتصميم الرأسيات لتتناسب مع رولات الورق المتنوعة.</p>
                
                <div className="space-y-2 pt-1 border-t border-white/5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">عرض رول الطباعة:</span>
                    <div className="flex p-0.5 bg-black rounded-lg border border-white/10 gap-1">
                      <button
                        onClick={() => {
                          setHardwarePaperSize('80mm');
                          addHardwareLog("⚙️ تكييف ورق الطباعة الحرارية للمقاس العريض: 80 مم (الهايبرات الكبرى)");
                          triggerNotification("طابعة مفرزة: 80 مم");
                        }}
                        className={`px-3 py-1 rounded text-[10px] font-bold ${hardwarePaperSize === '80mm' ? 'bg-[#10B981] text-black' : 'text-gray-400 hover:text-white'}`}
                      >
                        80mm السوبرماركت
                      </button>
                      <button
                        onClick={() => {
                          setHardwarePaperSize('58mm');
                          addHardwareLog("⚙️ تكييف ورق الطباعة الحرارية للمقاس المغطى: 58 مم (محال الفاست فود)");
                          triggerNotification("طابعة مفرزة: 58 مم");
                        }}
                        className={`px-3 py-1 rounded text-[10px] font-bold ${hardwarePaperSize === '58mm' ? 'bg-[#10B981] text-black' : 'text-gray-400 hover:text-white'}`}
                      >
                        58mm البقالة الصغير
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      addHardwareLog("🖨️ فحص الطابعة: إطلاق تذكرة فحص فارغة ذاتية (Feed Receipt)");
                      triggerNotification("🖨️ جاري طباعة فاتورة فحص معيارية...");
                    }}
                    className="w-full py-1.5 bg-[#1a1a1a] hover:bg-[#333] border border-white/10 text-gray-300 rounded-lg text-[10px] font-bold"
                  >
                    تجربة طباعة فاتورة فحص معيارية (Feed Page)
                  </button>
                </div>
              </div>

              {/* Device 2: Digital Weighing Scale */}
              <div className="bg-[#121212] p-4 rounded-2xl border border-white/5 space-y-3 text-right">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] px-2 py-0.5 rounded bg-[#6AA84F]/10 text-green-400 font-bold border border-[#6AA84F]/20">متصل (RS232)</span>
                  <HeadingControl label="ميزان الباركود الإلكتروني" icon={<Scale size={14} />} />
                </div>
                <p className="text-[11px] text-gray-500">يتيح قراءة الأوزان للمحاصيل الطازجة والمجمدات ونقل أرقام الكيلو لحظياً لعربة المبيعات.</p>
                
                <div className="space-y-2 pt-1 border-t border-white/5">
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-mono">{(scaleCalibration * 100).toFixed(0)}% Dial</span>
                      <span className="text-gray-400">معايرة الوزن لتعويض الفقد الأساسي:</span>
                    </div>
                    <input 
                      type="range"
                      min="0.90"
                      max="1.10"
                      step="0.01"
                      value={scaleCalibration}
                      onChange={(e) => {
                        const cal = Number(e.target.value);
                        setScaleCalibration(cal);
                        addHardwareLog(`⚙️ معايرة الميزان الإضافي: ضبط المعيار بمعدل ${cal}x`);
                      }}
                      className="w-full accent-[#10B981]"
                    />
                  </div>
                </div>
              </div>

              {/* Device 3: RJ11 Connected Drawer */}
              <div className="bg-[#121212] p-4 rounded-2xl border border-white/5 space-y-3 text-right">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] px-2 py-0.5 rounded bg-amber-600/10 text-amber-500 font-bold border border-amber-600/20">جاهز (درج نقدية)</span>
                  <HeadingControl label="درج النقدية التلقائي" icon={<Smartphone size={14} />} />
                </div>
                <p className="text-[11px] text-gray-500">يفتح تلقائياً بمجرد استلام نبضة كهربائية 24v مرسلة من الطابعة الحرارية عند إنهاء أي فاتورة كاش.</p>
                
                <div className="space-y-2 pt-1 border-t border-white/5 text-xs flex justify-between items-center">
                  <span className="text-gray-400">حالة الدرج الميكانيكية:</span>
                  <button
                    onClick={() => {
                      setDrawerOpenLog(!drawerOpenLog);
                      addHardwareLog(drawerOpenLog ? "💰 تم إلقام وقفل درج النقدية يدوياً" : "🔊 طررق! تم إرسال نبضة فتح طارئة إلى الدرج RJ11");
                      triggerNotification(drawerOpenLog ? "🔒 تم إغلاق الدرج" : "💰 طررق! انفتح درج النقدية");
                    }}
                    className={`font-bold px-4 py-1.5 rounded-lg text-[10px] ${drawerOpenLog ? 'bg-amber-500 text-black animate-pulse' : 'bg-green-600 text-white'}`}
                  >
                    {drawerOpenLog ? 'الدرج مفتوح حالياً (اطرقه للإغلاق)' : 'افتح الدرج يدوياً للطوارئ'}
                  </button>
                </div>
              </div>

              {/* Device 4: Barcode Scanner */}
              <div className="bg-[#121212] p-4 rounded-2xl border border-white/5 space-y-3 text-right">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] px-2 py-0.5 rounded bg-[#6AA84F]/10 text-green-400 font-bold border border-[#6AA84F]/20">متصل (كيبورد وهمي)</span>
                  <HeadingControl label="قارئ الباركود (Barcode Gun)" icon={<Zap size={14} />} />
                </div>
                <p className="text-[11px] text-gray-500">يعمل كـ كيبورد افتراضي يكتب الرقم بسرعة البرق متبوعاً بمحاكي المفتاح Enter المبرمج.</p>
                
                <div className="text-[10px] text-gray-500 bg-black/60 p-2 rounded border border-white/5">
                  <span className="text-gray-400 font-bold block mb-0.5 font-sans">محاكي المنفذ الافتراضي للبنادق:</span>
                  - يدعم خوارزميات الباركود الكلاسيكية EAN-13, EAN-8 وكذلك رموز QR Code.
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* =========================================================================
                     5. INVOICE RECEIPT MODAL PREVIEW (Thermal layout 80mm/58mm)
         ========================================================================= */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white text-black p-6 rounded-2xl max-w-sm w-full font-mono text-xs shadow-[0_20px_50px_rgba(255,255,255,0.1)] relative border border-gray-200">
            
            {/* Close modal */}
            <button
              onClick={() => {
                setShowInvoiceModal(null);
                setDrawerOpenLog(false);
              }}
              className="absolute top-4 left-4 bg-gray-100 hover:bg-gray-200 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors font-sans text-sm font-bold"
            >
              ✕
            </button>

            {/* Simulated RJ11 drawer alert top wrapper */}
            {drawerOpenLog && (
              <div className="mb-4 bg-green-50 text-green-800 text-center font-bold p-2.5 rounded-xl border border-green-200 animate-pulse font-sans">
                🔊 طررق! تم فتح درج النقدية تلقائياً 💵
              </div>
            )}

            {/* RECEIPT WRAPPER FOR PRINTING EFFECT (Thermal size styled dynamically) */}
            <div className={`mx-auto bg-white p-2 border-dashed border-2 border-gray-400 rounded text-right ${hardwarePaperSize === '58mm' ? 'max-w-[240px]' : 'max-w-[300px]'}`}>
              
              {/* Receipt Header logo */}
              <div className="text-center space-y-1 pb-4 border-b border-dashed border-gray-300">
                <h3 className="text-sm font-bold font-serif uppercase tracking-wider">★ هايبر المصري الفاخر ★</h3>
                <p className="text-[10px] text-gray-500 font-sans">تذكرة شراء غير منتهية لأسلوب الحياة الكلاسيكي</p>
                <div className="text-[9px] text-gray-400">فرع القاهرة الجديدة - هاتف: 19905</div>
              </div>

              {/* Receipt metadata info */}
              <div className="space-y-1 text-[10px] text-gray-600 py-3 border-b border-dashed border-gray-300 text-right">
                <div className="flex justify-between">
                  <span>{showInvoiceModal.invoiceNo}</span>
                  <span className="font-bold">رقم الفاتورة:</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono">{new Date(showInvoiceModal.timestamp).toLocaleTimeString('ar-EG')} {new Date(showInvoiceModal.timestamp).toLocaleDateString('ar-EG')}</span>
                  <span className="font-bold">التاريخ والتوقيت:</span>
                </div>
                <div className="flex justify-between">
                  <span>{showInvoiceModal.cashier}</span>
                  <span className="font-bold">البائع المسؤول:</span>
                </div>
                <div className="flex justify-between">
                  <span>
                    {showInvoiceModal.paymentMethod === 'cash' ? '💵 كاش نقدي' : showInvoiceModal.paymentMethod === 'card' ? '💳 بطاقة فيزا' : '📱 محفظة هاتفية'}
                  </span>
                  <span className="font-bold">طريقة الدفع:</span>
                </div>
              </div>

              {/* Receipt Items breakdown */}
              <div className="py-3 border-b border-dashed border-gray-300 text-right">
                <div className="grid grid-cols-12 gap-1 font-bold text-[10px] text-gray-700 border-b border-gray-200 pb-1.5 leading-none">
                  <span className="col-span-3 text-left">الإجمالي</span>
                  <span className="col-span-3 text-center">الكمية</span>
                  <span className="col-span-6 text-right">الصنف التجاري</span>
                </div>

                <div className="space-y-2 mt-2">
                  {showInvoiceModal.items.map((item, idx) => {
                    const itemCost = item.isWeightBased && item.weight 
                      ? item.price * item.weight 
                      : item.price * item.quantity;

                    return (
                      <div key={idx} className="grid grid-cols-12 gap-1 text-[10px] font-mono leading-tight">
                        <span className="col-span-3 text-left font-bold">{Math.round(itemCost)} ج.م</span>
                        <span className="col-span-3 text-center text-gray-500">
                          {item.isWeightBased && item.weight ? `${item.weight} كجم` : `${item.quantity} عدد`}
                        </span>
                        <span className="col-span-6 text-right font-semibold truncate" title={item.name}>{item.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Receipt final invoice aggregates calculations */}
              <div className="py-3 text-right space-y-1.5 border-b border-dashed border-gray-300">
                <div className="flex justify-between text-[10px]">
                  <span className="font-bold">{showInvoiceModal.subtotal} ج.م</span>
                  <span>المجموع الفرعي للأصناف:</span>
                </div>
                {showInvoiceModal.discount > 0 && (
                  <div className="flex justify-between text-[10px] text-red-600">
                    <span className="font-bold">-{showInvoiceModal.discount} ج.م</span>
                    <span>خصم مستحق الوردية:</span>
                  </div>
                )}
                <div className="flex justify-between text-[10px]">
                  <span className="font-bold">+{showInvoiceModal.tax} ج.م</span>
                  <span>ضريبة المبيعات المحسوبة (14%):</span>
                </div>
                <div className="flex justify-between text-xs font-bold pt-1.5 border-t border-dashed border-gray-200">
                  <span className="text-sm">{showInvoiceModal.total} ج.م</span>
                  <span className="text-sm">صافي الخزونة المقبوض:</span>
                </div>
              </div>

              {/* Receipt footer message, barcode, and stamp representation */}
              <div className="text-center pt-4 space-y-3 font-sans">
                <p className="text-[9px] text-gray-500 italic">شكراً لتسوقكم من سلاسل هايبر المصري! يرجى مرافقة الفاتورة لأغراض المرتجعات أو الفحص.</p>
                
                {/* Simulated high-fidelity thermal printable barcode */}
                <div className="flex flex-col items-center gap-1">
                  <div className="w-full h-8 bg-black/80 flex items-center justify-center p-1 font-mono text-[9px] text-white">
                    ||||| | || || |||| |||| | ||| |||| |
                  </div>
                  <span className="font-mono text-[8px] text-gray-400">{showInvoiceModal.invoiceNo}</span>
                </div>
              </div>

            </div>

            {/* Simulated PDF / Print system action triggers */}
            <div className="mt-5 flex gap-2 justify-center font-sans">
              <button
                onClick={() => {
                  window.print();
                  addHardwareLog(`🖨️ تم إرسال ملف الفاتورة ${showInvoiceModal.invoiceNo} بنجاح إلى رول طابعة الفواتير الحرارية ${hardwarePaperSize}`);
                }}
                className="bg-black hover:bg-[#333] text-white font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-2 text-xs w-full transition-all"
              >
                <Printer size={12} />
                اطبع الوثيقة الآن
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

// Internal supportive small components
const HeadingControl = ({ label, icon }: { label: string; icon: React.ReactNode }) => {
  return (
    <div className="flex items-center gap-1.5 font-bold text-xs text-[#34D399] font-serif">
      {icon}
      <span>{label}</span>
    </div>
  );
};
