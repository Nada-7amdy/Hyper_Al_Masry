import { Product } from "../types";

// SIMULATING: NoSQL Database (MongoDB) for Products
// Colors implied by category logic in frontend:
// Produce -> Green, Frozen -> Blue, Butchery -> Red, Pantry -> Gold/Beige

const PRODUCTS_DB: Product[] = [
  {
    id: "p1",
    name: "أرز مصري فاخر (5 كجم)",
    category: "بقالة ومؤن",
    price: 180,
    rating: 4.9,
    stock: 50,
    description: "أرز مصري عريض الحبة، فرز أول، طبخ مثالي لكل العزايم.",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "p2",
    name: "طماطم بلدي طازجة (1 كجم)",
    category: "خضروات وفواكه",
    price: 15,
    rating: 4.8,
    stock: 100,
    description: "طماطم حمراء طازجة من المزرعة إليك مباشرة.",
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "p3",
    name: "لحم مفروم بلدي (1 كجم)",
    category: "لحوم ومجمدات",
    price: 320,
    rating: 4.7,
    stock: 20,
    description: "لحم بقري صافي قليل الدسم، مثالي للكفتة والبشاميل.",
    image: "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "p4",
    name: "سمك بلطي منظف (1 كجم)",
    category: "لحوم ومجمدات",
    price: 90,
    rating: 4.6,
    stock: 30,
    description: "سمك نيللي طازج، منظف ومغلف بعناية.",
    image: "https://images.unsplash.com/photo-1615141982901-f748f65aa694?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "p5",
    name: "طقم توابل مشكل (7 أصناف)",
    category: "عطارة",
    price: 120,
    rating: 5.0,
    stock: 45,
    description: "كمون، فلفل أسود، كزبرة، شطة، بابريكا، كركم، وبصل بودر.",
    image: "https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "p6",
    name: "سمن بلدي جاموسي (1 كجم)",
    category: "بقالة ومؤن",
    price: 450,
    rating: 5.0,
    stock: 10,
    description: "سمن بلدي فلاحي أصلي، طعم وريحة زمان.",
    image: "https://images.unsplash.com/photo-1620662776269-61b4020a5963?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "p7",
    name: "دجاج مجمد كامل (1200 جم)",
    category: "لحوم ومجمدات",
    price: 130,
    rating: 4.5,
    stock: 60,
    description: "دجاج فاخر مذبوح حلال، خالي من الهرمونات.",
    image: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "p8",
    name: "مانجو عويس فاخر (1 كجم)",
    category: "خضروات وفواكه",
    price: 60,
    rating: 4.9,
    stock: 25,
    description: "مانجو اسمعلاوي درجة أولى، حلاوة وريحة.",
    image: "https://images.unsplash.com/photo-1553279768-1154378111af?auto=format&fit=crop&q=80&w=400"
  }
];

// SIMULATING: Elasticsearch / Algolia
export const searchProducts = async (query: string): Promise<Product[]> => {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 300));
  
  if (!query) return PRODUCTS_DB;

  const lowerQuery = query.toLowerCase();
  return PRODUCTS_DB.filter(p => 
    p.name.toLowerCase().includes(lowerQuery) || 
    p.category.toLowerCase().includes(lowerQuery)
  );
};

// SIMULATING: Analytics API
export const getSalesStats = async () => {
    return {
        dailyRevenue: 45000,
        activeOrders: 85,
        topItem: "أرز مصري فاخر"
    }
};