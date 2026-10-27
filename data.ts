import { Product, StructuredRecipe } from "./types";
export type { Product, StructuredRecipe };

export interface Category {
  id: string;
  name: string;
  icon: string;
  image: string;
  productCount: number;
  description: string;
  isComingSoon?: boolean;
}

export const CATEGORIES: Category[] = [
  {
    id: "cat_meat",
    name: "لحوم ومجمدات",
    icon: "🥩",
    image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&auto=format&fit=crop&q=80",
    productCount: 14,
    description: "لحوم بلدية طازجة ومجمدات ممتازة خاضعة للرقابة الصحية الدقيقة."
  },
  {
    id: "cat_dairy",
    name: "ألبان وأجبان",
    icon: "🥛",
    image: "https://images.unsplash.com/photo-1528498033373-3c6c08e93d79?w=600&auto=format&fit=crop&q=80",
    productCount: 18,
    description: "ألبان طازجة، زبدة فلاحي، وأجبان طبيعية 100% من مزارعنا."
  },
  {
    id: "cat_produce",
    name: "خضروات وفواكه",
    icon: "🍎",
    image: "https://images.unsplash.com/photo-1610832958506-ee5633619141?w=600&auto=format&fit=crop&q=80",
    productCount: 22,
    description: "ثمار ناضجة مقطوفة يومياً لضمان النضارة والقيمة الغذائية."
  },
  {
    id: "cat_bakery",
    name: "مخبوزات",
    icon: "🍞",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
    productCount: 12,
    description: "خبز دافئ، معجنات فرنسية، وحلويات شرقية تخبز على مدار الساعة."
  },
  {
    id: "cat_drinks",
    name: "مشروبات",
    icon: "🥤",
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80",
    productCount: 15,
    description: "عصائر طبيعية، مياه غازية، ومشروبات ساخنة من علاماتك المفضلة."
  },
  {
    id: "cat_cleansers",
    name: "منظفات ورعاية",
    icon: "🧴",
    image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&auto=format&fit=crop&q=80",
    productCount: 20,
    description: "أدوات تعقيم، مستحضرات رعاية شخصية، ومنظفات آمنة لمنزلك."
  },
  {
    id: "cat_pantry",
    name: "بقالة ومؤن",
    icon: "🧂",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80",
    productCount: 35,
    description: "أعشاب طبيعية نادرة، بهارات متميزة، ومواد تموينية أساسية."
  },
  {
    id: "cat_household_appliances",
    name: "أدوات منزلية",
    icon: "🍳",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80",
    productCount: 0,
    description: "أدوات ومستلزمات المطبخ والطهي الحديثة التي تسهل حياتكم اليومية.",
    isComingSoon: true
  },
  {
    id: "cat_pets",
    name: "مستلزمات حيوانات",
    icon: "🐱",
    image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&auto=format&fit=crop&q=80",
    productCount: 0,
    description: "أغذية ومستلزمات العناية المتكاملة بحيواناتكم الأليفة المدللة.",
    isComingSoon: true
  }
];

export const PRODUCTS: Product[] = [
  // --- Today's Deals ---
  {
    id: "p_deal_1",
    name: "لحم موزة بقري بلدي طازج (1 كجم)",
    category: "لحوم ومجمدات",
    price: 360,
    oldPrice: 420,
    discount: "خصم 14%",
    rating: 4.9,
    reviews: 142,
    stock: 8,
    stockStatus: "low",
    description: "لحم بقري بلدي مميز مقطع بعناية من الفخذ، مثالي للسلق والطهي البطيء مع الخضار.",
    image: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=500&auto=format&fit=crop&q=80",
    deliveryEstimate: "توصيل خلال 45 دقيقة",
    badge: "عرض اليوم المميز",
    isDeal: true,
    isBestSeller: true,
    isWeightBased: true
  },
  {
    id: "p_deal_2",
    name: "زيت زيتون بكر ممتاز معصور بارد (1 لتر)",
    category: "بقالة ومؤن",
    price: 185,
    oldPrice: 240,
    discount: "خصم 23%",
    rating: 4.8,
    reviews: 95,
    stock: 25,
    stockStatus: "high",
    description: "عصرة أولى على البارد من أنقى ثمار الزيتون السيناوي، غني بنسبة حموضة أقل من 0.8%.",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80",
    deliveryEstimate: "توصيل خلال 45 دقيقة",
    badge: "توفير فائق",
    isDeal: true,
    isRecommended: true
  },
  {
    id: "p_deal_3",
    name: "فراولة بلدي طازجة سوبر (1 كجم)",
    category: "خضروات وفواكه",
    price: 35,
    oldPrice: 48,
    discount: "خصم 27%",
    rating: 4.7,
    reviews: 210,
    stock: 50,
    stockStatus: "high",
    description: "مقطوفة طازجة في الصباح الباكر، حمراء يانعة وغنية بالسكريات الطبيعية والفيتامينات.",
    image: "https://images.unsplash.com/photo-1518635017498-87f514b751ba?w=500&auto=format&fit=crop&q=80",
    deliveryEstimate: "توصيل خلال 45 دقيقة",
    badge: "طازج اليوم",
    isDeal: true,
    isFresh: true,
    isWeightBased: true
  },
  {
    id: "p_deal_4",
    name: "جبنة شيدر أيرلندي معتقة (250 جم)",
    category: "ألبان وأجبان",
    price: 110,
    oldPrice: 150,
    discount: "خصم 26%",
    rating: 4.9,
    reviews: 64,
    stock: 12,
    stockStatus: "high",
    description: "جبنة شيدر طبيعية مستوردة، قوام غني وطعم متوازن يناسب السندوتشات وأطباق المكرونة.",
    image: "https://images.unsplash.com/photo-1618164435735-413d3b066c9a?w=500&auto=format&fit=crop&q=80",
    deliveryEstimate: "توصيل خلال 45 دقيقة",
    badge: "مستورد فاخر",
    isDeal: true,
    isSeasonal: true
  },

  // --- Best Sellers ---
  {
    id: "p_best_1",
    name: "أرز مصري بسمتي حبة طويلة فاخر (5 كجم)",
    category: "بقالة ومؤن",
    price: 195,
    rating: 4.9,
    reviews: 388,
    stock: 120,
    stockStatus: "high",
    description: "أرز أبيض فاخر منقى ومغسول بالكامل، يمنحك قواماً مثالياً حبة بحبة مع كافة الوصفات.",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80",
    deliveryEstimate: "توصيل خلال 45 دقيقة",
    badge: "الأكثر مبيعاً",
    isBestSeller: true
  },
  {
    id: "p_best_2",
    name: "دجاج فيليه صدور طازج (1 كجم)",
    category: "لحوم ومجمدات",
    price: 245,
    rating: 4.8,
    reviews: 412,
    stock: 4,
    stockStatus: "low",
    description: "صدور دجاج مخلية ونظيفة تماماً من الدهون، مذبوحة حلال ومبردة لضمان أقصى طراوة.",
    image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500&auto=format&fit=crop&q=80",
    deliveryEstimate: "توصيل خلال 45 دقيقة",
    badge: "طلب مرتفع",
    isBestSeller: true,
    isRecommended: true,
    isWeightBased: true
  },
  {
    id: "p_best_3",
    name: "عسل سدر جبلي أصلي طبيعي (500 جم)",
    category: "بقالة ومؤن",
    price: 320,
    rating: 5.0,
    reviews: 177,
    stock: 15,
    stockStatus: "high",
    description: "عسل طبيعي ونقي 100% مستخلص من زهور السدر الجبلية، يعمل كبديل صحي رائع للسكر ومقوي للمناعة.",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&auto=format&fit=crop&q=80",
    deliveryEstimate: "توصيل خلال 45 دقيقة",
    badge: "تقييم كامل",
    isBestSeller: true
  },

  // --- Recommended For You ---
  {
    id: "p_rec_1",
    name: "كرواسون فرنسي بالزبدة طبيعي (4 قطع)",
    category: "مخبوزات",
    price: 65,
    rating: 4.8,
    reviews: 82,
    stock: 18,
    stockStatus: "high",
    description: "مخبوز من أجود أنواع الزبدة النيوزيلندية، رقائق مقرمشة من الخارج وهشة وطرية من الداخل.",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=80",
    deliveryEstimate: "مخبوز اليوم طازج",
    badge: "توصية ذكية",
    isRecommended: true,
    isFresh: true
  },
  {
    id: "p_rec_2",
    name: "قهوة عربي هيل وزعفران فاخرة (250 جم)",
    category: "بقالة ومؤن",
    price: 140,
    rating: 4.9,
    reviews: 110,
    stock: 30,
    stockStatus: "high",
    description: "خلطة بن عربي أصيل مطحون بعناية مع حبوب الهيل الفاخرة وخيوط الزعفران الحر لنكهة تراثية ممتازة.",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80",
    deliveryEstimate: "توصيل خلال 45 دقيقة",
    isRecommended: true
  },

  // --- Fresh Arrivals ---
  {
    id: "p_fresh_1",
    name: "طماطم شيري بلدي عنقودية (500 جم)",
    category: "خضروات وفواكه",
    price: 24,
    rating: 4.6,
    reviews: 35,
    stock: 40,
    stockStatus: "high",
    description: "طماطم كرزية حلوة المذاق، مثالية للسلطات والمقبلات وتزيين الأطباق الفاخرة.",
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80",
    deliveryEstimate: "قطاف الصباح",
    badge: "جديد قطاف اليوم",
    isFresh: true,
    isWeightBased: true
  },
  {
    id: "p_fresh_2",
    name: "حليب بقري مبستر كامل الدسم (1 لتر)",
    category: "ألبان وأجبان",
    price: 38,
    rating: 4.8,
    reviews: 245,
    stock: 60,
    stockStatus: "high",
    description: "حليب طازج نقي غير مضاف إليه مياه أو مواد حافظة، معبأ ومعقم بأحدث الطرق الصحية.",
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=80",
    deliveryEstimate: "مبرّد طازج",
    isFresh: true
  },
  {
    id: "p_fresh_3",
    name: "مشروب رمان طبيعي غازي (330 مل)",
    category: "مشروبات",
    price: 18,
    rating: 4.5,
    reviews: 115,
    stock: 80,
    stockStatus: "high",
    description: "عصير رمان فوار طبيعي ومنعش بدون سكر مضاف أو ألوان صناعية.",
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80",
    deliveryEstimate: "توصيل خلال 45 دقيقة",
    isFresh: true,
    isSeasonal: true
  },

  // --- Seasonal / Household Cleansers ---
  {
    id: "p_clean_1",
    name: "سائل غسيل الأطباق بالليمون المركز (1 لتر)",
    category: "منظفات ورعاية",
    price: 48,
    rating: 4.7,
    reviews: 190,
    stock: 35,
    stockStatus: "high",
    description: "تركيبة فائقة القوة تقضي على الدهون الصعبة وتترك الأطباق برائحة الليمون المنعشة وتحمي اليدين.",
    image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500&auto=format&fit=crop&q=80",
    deliveryEstimate: "توصيل خلال 45 دقيقة",
    badge: "المنزل النظيف",
    isSeasonal: true
  }
];

export const POPULAR_SEARCHES = [
  "زيت زيتون",
  "دجاج طازج",
  "حليب كامل الدسم",
  "أرز بسمتي",
  "كرواسون بالزبدة",
  "طماطم بلدي"
];

export const RECENT_SEARCHES = [
  "لحم بقري موزة",
  "عسل سدر جبلي",
  "فراولة طازجة"
];

export const SUGGESTIONS = [
  { text: "أرز مصري بسمتي حبة طويلة فاخر", category: "بقالة ومؤن" },
  { text: "لحم موزة بقري بلدي طازج", category: "لحوم ومجمدات" },
  { text: "فراولة بلدي طازجة سوبر", category: "خضروات وفواكه" },
  { text: "جبنة شيدر أيرلندي معتقة", category: "ألبان وأجبان" },
  { text: "عسل سدر جبلي أصلي طبيعي", category: "بقالة ومؤن" }
];

export const POPULAR_RECIPES: StructuredRecipe[] = [
  {
    id: "recipe_bamia",
    title: "طاجن البامية باللحم البقري البلدي والأرز البسمتي",
    description: "وجبة مصرية أصيلة محضرة بقطعيات اللحم البقري الطازج من جزارة هايبر المصري مع أرز بسمتي فاخر.",
    prepTime: "٤٥ دقيقة",
    servings: "٤ أفراد",
    ingredients: [
      {
        name: "لحم موزة بقري بلدي طازج",
        amount: "1 كجم",
        productId: "p_deal_1",
        productName: "لحم موزة بقري بلدي طازج (1 كجم)",
        price: 360,
        isWeightBased: true,
        requiredWeightOrQty: 1,
        isAvailable: true
      },
      {
        name: "أرز مصري بسمتي حبة طويلة فاخر",
        amount: "5 كجم (كيس عائلي)",
        productId: "p_best_1",
        productName: "أرز مصري بسمتي حبة طويلة فاخر (5 كجم)",
        price: 195,
        isWeightBased: false,
        requiredWeightOrQty: 1,
        isAvailable: true
      },
      {
        name: "طماطم شيري بلدي عنقودية للصلصة",
        amount: "500 جم",
        productId: "p_fresh_1",
        productName: "طماطم شيري بلدي عنقودية (500 جم)",
        price: 24,
        isWeightBased: true,
        requiredWeightOrQty: 0.5,
        isAvailable: true
      },
      {
        name: "زيت زيتون بكر ممتاز سيناوي",
        amount: "1 لتر",
        productId: "p_deal_2",
        productName: "زيت زيتون بكر ممتاز معصور بارد (1 لتر)",
        price: 185,
        isWeightBased: false,
        requiredWeightOrQty: 1,
        isAvailable: true
      }
    ]
  },
  {
    id: "recipe_chicken",
    title: "صدور الدجاج المشوية بصوص العسل وزيت الزيتون",
    description: "وجبة صحية غنية بالبروتين ومتبلة بالعسل الجبلي الطبيعي وزيت الزيتون البكر.",
    prepTime: "٣٠ دقيقة",
    servings: "٣ أفراد",
    ingredients: [
      {
        name: "دجاج فيليه صدور طازج",
        amount: "1 كجم",
        productId: "p_best_2",
        productName: "دجاج فيليه صدور طازج (1 كجم)",
        price: 245,
        isWeightBased: true,
        requiredWeightOrQty: 1,
        isAvailable: true
      },
      {
        name: "عسل سدر جبلي أصلي طبيعي",
        amount: "500 جم",
        productId: "p_best_3",
        productName: "عسل سدر جبلي أصلي طبيعي (500 جم)",
        price: 320,
        isWeightBased: false,
        requiredWeightOrQty: 1,
        isAvailable: true
      },
      {
        name: "زيت زيتون بكر ممتاز",
        amount: "1 لتر",
        productId: "p_deal_2",
        productName: "زيت زيتون بكر ممتاز معصور بارد (1 لتر)",
        price: 185,
        isWeightBased: false,
        requiredWeightOrQty: 1,
        isAvailable: true
      }
    ]
  },
  {
    id: "recipe_breakfast",
    title: "إفطار كونسيرج هايبر المصري: جبنة شيدر وفراولة طازجة",
    description: "طبق إفطار أوروبي راقٍ يجمع بين الفراولة البلدي الطازجة وجبنة الشيدر المعتقة والحليب الطازج.",
    prepTime: "١٠ دقائق",
    servings: "فردين",
    ingredients: [
      {
        name: "فراولة بلدي طازجة سوبر",
        amount: "1 كجم",
        productId: "p_deal_3",
        productName: "فراولة بلدي طازجة سوبر (1 كجم)",
        price: 35,
        isWeightBased: true,
        requiredWeightOrQty: 1,
        isAvailable: true
      },
      {
        name: "جبنة شيدر أيرلندي معتقة",
        amount: "250 جم",
        productId: "p_deal_4",
        productName: "جبنة شيدر أيرلندي معتقة (250 جم)",
        price: 110,
        isWeightBased: false,
        requiredWeightOrQty: 1,
        isAvailable: true
      },
      {
        name: "حليب بقري مبستر كامل الدسم",
        amount: "1 لتر",
        productId: "p_fresh_2",
        productName: "حليب بقري مبستر كامل الدسم (1 لتر)",
        price: 38,
        isWeightBased: false,
        requiredWeightOrQty: 1,
        isAvailable: true
      }
    ]
  }
];

export const findRecipeByQuery = (query: string): StructuredRecipe | null => {
  const q = query.toLowerCase();
  if (q.includes('بامية') || q.includes('ملوخية') || q.includes('طاجن') || q.includes('لحم') || q.includes('طبيخ') || q.includes('غدا')) {
    return POPULAR_RECIPES[0];
  }
  if (q.includes('دجاج') || q.includes('فراخ') || q.includes('فيليه') || q.includes('مشوي')) {
    return POPULAR_RECIPES[1];
  }
  if (q.includes('فطار') || q.includes('إفطار') || q.includes('فراولة') || q.includes('شيدر') || q.includes('جبنة')) {
    return POPULAR_RECIPES[2];
  }
  return null;
};

