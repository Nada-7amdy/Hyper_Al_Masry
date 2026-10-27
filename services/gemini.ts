import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

const getApiKey = (): string => {
  try {
    const metaEnv = (import.meta as any)?.env;
    if (metaEnv?.VITE_GEMINI_API_KEY) {
      return metaEnv.VITE_GEMINI_API_KEY;
    }
  } catch {
    // Ignore in non-Vite environments
  }
  try {
    if (typeof process !== 'undefined' && process.env?.API_KEY) {
      return process.env.API_KEY;
    }
  } catch {
    // Ignore
  }
  return '';
};

const SYSTEM_INSTRUCTION = `
أنت المساعد الذكي وكونسيرج التسوق الفاخر لـ "هايبر المصري" (Hyper Al Masri).
أسلوبك راقٍ، مهذب، سريع المساعدة، وتركز على تقديم أفضل جودة للأطعمة الطازجة واللحوم البلدية والمنتجات المستوردة.
تساعد العائلات في اقتراح أشهى الوصفات المصرية والعالمية، وحساب المكونات بدقة من كتالوج السوبر ماركت.
`;

/**
 * Intelligent Egyptian Culinary & Shopping Concierge Fallback
 * Provides instant authentic culinary advice and catalog guidance even when offline or without an API key.
 */
export const generateCulinaryFallback = (message: string): string => {
  const query = message.toLowerCase().trim();

  // 1. Recipes, Cooking, and Meal Suggestions
  if (
    query.includes('وصفة') || 
    query.includes('طريقة') || 
    query.includes('ملوخية') || 
    query.includes('بامية') || 
    query.includes('طبيخ') || 
    query.includes('طبخ') || 
    query.includes('مقادير') || 
    query.includes('غدا') || 
    query.includes('وجبة') || 
    query.includes('اكل')
  ) {
    return `🥘 اقتراح الكونسيرج لوجبة اليوم:
**طاجن اللحم البلدي بالبامية أو الملوخية الخضراء بالطشة:**
المكونات المتوفرة طازجة اليوم في هايبر المصري:
1. 1 كجم لحم موزة بقري أو بتلو بلدي.
2. ملوخية فلاحي خضراء مقطوفة ومغسولة بعناية.
3. ثوم بلدي ناعم وكزبرة جافة مطحونة طازجة من قسم العطارة.
4. أرز مصري فاخر حبة عريضة وسمن بلدي أصلي.
🛒 كل المكونات متوفرة في قسم "خضروات وفواكه" و"لحوم ومجمدات" وجاهزة للإضافة إلى سلتك فوراً!`;
  }

  // 2. Butchery & Fresh Poultry
  if (
    query.includes('لحم') || 
    query.includes('ستيك') || 
    query.includes('موزة') || 
    query.includes('كباب') || 
    query.includes('كفتة') || 
    query.includes('جزار') || 
    query.includes('فيليه') || 
    query.includes('دجاج') || 
    query.includes('فراخ')
  ) {
    return `🥩 أهلاً بك في قسم الجزارة الفاخرة بهايبر المصري!
نقدم قطعيات لحوم بلدية طازجة يومياً خاضعة لأعلى معايير الرقابة الصحية:
• لحم موزة بقري بلدي (سعر الكيلو 395 ج.م) — مثالية لطواجن الفرن والفتة.
• ستيك ريب آي بلدي معتق (سعر الكيلو 420 ج.م).
• لحم مفروم بلدي مخصوص بنسبة دهن محددة حسب رغبتك.
💡 نصيحة الكونسيرج: يمكنك طلب تقطيع اللحم وتغليفه مفرغاً من الهواء للحفاظ على النضارة لأطول فترة!`;
  }

  // 3. Fresh Produce & Fruits
  if (
    query.includes('خضار') || 
    query.includes('فاكهة') || 
    query.includes('فواكه') || 
    query.includes('فراولة') || 
    query.includes('طماطم') || 
    query.includes('تفاح') || 
    query.includes('طازج')
  ) {
    return `🍎 قسم الخضروات والفواكه الطازجة في هايبر المصري:
نستلم المحاصيل يومياً في الصباح الباكر مباشرة من المزارع المعتمدة:
• فراولة بلدي سوبر (سعر الكيلو 45 ج.م).
• طماطم بلدي شيري وطماطم طبيخ ناضجة.
• ليمون أضاليا وبرتقال صيفي عصير.
✨ جميع الخضار والفاكهة تخضع لفرز يدوي دقيق لضمان وصول أعلى جودة لمنزلك في شاحنات مبردة.`;
  }

  // 4. Deals, Offers & Discounts
  if (
    query.includes('عرض') || 
    query.includes('عروض') || 
    query.includes('خصم') || 
    query.includes('خصومات') || 
    query.includes('وفر') || 
    query.includes('توفير') || 
    query.includes('اسعار') || 
    query.includes('تخفيض') || 
    query.includes('تخفيضات')
  ) {
    return `🎁 عروض اليوم الحصرية في هايبر المصري:
• خصم حتى 30% على زيوت الزيتون البكر الممتازة والأجبان المستوردة.
• توصيل مجاني سريع مبرّد لجميع الطلبات التي تتجاوز قيمتها 150 ج.م!
• عروض خاصة على قطعيات اللحوم العائلية وقسم العطارة والمؤن.
تفضل بزيارة تبويب "السوق" أو "الرئيسية" للاطلاع على عروض الصفقات السريعة الحية.`;
  }

  // 5. Tracking, Delivery & Logistics
  if (
    query.includes('تتبع') || 
    query.includes('أتبع') || 
    query.includes('طلب') || 
    query.includes('طلبي') || 
    query.includes('فين') || 
    query.includes('دليفري') || 
    query.includes('سائق') || 
    query.includes('مندوب') || 
    query.includes('توصيل') || 
    query.includes('شحن') || 
    query.includes('تبريد')
  ) {
    return `🚚 تتبع الطلبات والشحن الفوري:
يمكنك متابعة خط سير مندوبك لحظة بلحظة عبر رادار التوصيل المباشر في تبويب "تتبع" (Tracking).
شاحناتنا مجهزة بنظام تبريد حراري (4 درجات مئوية) لضمان وصول اللحوم والمجمدات والألبان بأعلى درجات الأمان الغذائي.`;
  }

  // 6. Greetings & Welcome
  if (
    query.includes('مرحبا') || 
    query.includes('أهلا') || 
    query.includes('اهلا') || 
    query.includes('سلام') || 
    query.includes('صباح') || 
    query.includes('مساء')
  ) {
    return `مرحباً بك في هايبر المصري! 🌟 يسعدني جداً مساعدتك اليوم.
يمكنني مساعدتك في:
1. اختيار مقادير وصفاتك المفضلة وإضافتها للسلة.
2. التعرف على عروض اليوم والخصومات الطازجة.
3. تفاصيل قطعيات اللحوم والمنتجات العضوية.
ما الذي تود تحضيره أو البحث عنه اليوم؟`;
  }

  return `يسعدنا دائماً خدمتك في هايبر المصري! 🛒
منتجاتنا الطازجة من اللحوم البلدية، الخضروات، الألبان، والمؤن متوفرة بأعلى جودة مع توصيل سريع مبرّد خلال 45 دقيقة.
هل تبحث عن صنف معين أو تود اقتراح وصفة شهية لغداء اليوم؟`;
};

export const sendMessageToConcierge = async (
  history: ChatMessage[], 
  newMessage: string
): Promise<string> => {
  const apiKey = getApiKey();

  // If no API key is provided, gracefully serve the authentic culinary concierge engine
  if (!apiKey) {
    return generateCulinaryFallback(newMessage);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-2.5-flash';
    
    const chat = ai.chats.create({
      model,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || generateCulinaryFallback(newMessage);
  } catch (error) {
    console.warn("Concierge API call failed, falling back to local culinary engine:", error);
    return generateCulinaryFallback(newMessage);
  }
};
