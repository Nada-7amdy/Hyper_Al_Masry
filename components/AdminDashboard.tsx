import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Product } from '../types';

export const AdminDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [loading, setLoading] = useState(false);

  // دالة لجلب المنتجات من الداتابيز
  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
      setProducts(productsList);
    } catch (error) {
      console.error("Error fetching products: ", error);
    }
  };

  // أول ما الصفحة تفتح، هات المنتجات
  useEffect(() => {
    fetchProducts();
  }, []);

  // دالة إضافة منتج جديد
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice) return;
    
    setLoading(true);
    try {
      await addDoc(collection(db, "products"), {
        name: newName,
        price: Number(newPrice),
        image: "https://placehold.co/400x300/1a1a1a/gold?text=Product", // صورة مؤقتة شيك
        category: "عام",
        description: "منتج جديد",
        rating: 5,
        stock: 10
      });
      setNewName('');
      setNewPrice('');
      fetchProducts(); // تحديث القائمة فوراً
      alert("تمت إضافة المنتج للمخزن! 🥩");
    } catch (error) {
      console.error("Error:", error);
      alert("حصل مشكلة في الاتصال بالداتابيز");
    }
    setLoading(false);
  };

  // دالة مسح منتج
  const handleDelete = async (id: string) => {
    if (window.confirm("أكيد عايزة تمسحي المنتج ده؟")) {
      try {
        await deleteDoc(doc(db, "products", id));
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white p-8" dir="rtl">
      <h1 className="text-3xl font-bold text-[#BF953F] mb-8 border-b border-white/10 pb-4">
        لوحة تحكم هايبر المصري 👑
      </h1>

      {/* فورم الإضافة */}
      <div className="bg-[#121212] p-6 rounded-xl border border-[#BF953F]/20 mb-10 shadow-lg">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
          <span>➕</span> إضافة منتج جديد
        </h2>
        <form onSubmit={handleAddProduct} className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="اسم المنتج (مثلاً: كباب حلة)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 p-3 rounded-lg bg-[#1a1a1a] border border-white/10 focus:border-[#BF953F] outline-none transition-all text-white placeholder-gray-500"
          />
          <input
            type="number"
            placeholder="السعر (ج.م)"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            className="w-full md:w-32 p-3 rounded-lg bg-[#1a1a1a] border border-white/10 focus:border-[#BF953F] outline-none transition-all text-white placeholder-gray-500"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="bg-[#BF953F] hover:bg-[#AA771C] text-black font-bold py-3 px-8 rounded-lg transition-transform active:scale-95 disabled:opacity-50"
          >
            {loading ? "جاري الحفظ..." : "حفظ المنتج"}
          </button>
        </form>
      </div>

      {/* قائمة المنتجات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((item: any) => (
          <div key={item.id} className="bg-[#121212] rounded-xl overflow-hidden border border-white/10 hover:border-[#BF953F]/50 transition-all group">
            <div className="p-4 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg mb-1 text-white">{item.name}</h3>
                <p className="text-[#BF953F] font-mono text-xl">{item.price} ج.م</p>
              </div>
              <button 
                onClick={() => handleDelete(item.id)}
                className="text-red-400 hover:bg-red-900/30 p-2 rounded-full transition-colors"
                title="حذف"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {products.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-20">
          <p className="text-xl">المخزن فاضي يا ريسة.. ضيفي أول منتج! 🚀</p>
        </div>
      )}
    </div>
  );
};