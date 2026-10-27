import { describe, it, expect } from 'vitest';
import { generateCulinaryFallback } from '../services/gemini';

describe('Egyptian Culinary & Shopping Concierge Engine', () => {
  it('provides butchery recommendations when meat-related keywords are queried', () => {
    const meatQueries = ['لحمة بلدي', 'عايز ستيك ريب آي', 'لحم موزة', 'كفتة للشوي', 'جزارة'];

    meatQueries.forEach(query => {
      const response = generateCulinaryFallback(query);
      expect(response).toContain('قسم الجزارة');
      expect(response).toContain('لحم');
    });
  });

  it('suggests authentic Egyptian recipes and ingredients for cooking inquiries', () => {
    const recipeQueries = ['طريقة عمل الملوخية', 'وصفة غدا سريعة', 'طبيخ اليوم', 'بامية باللحمة'];

    recipeQueries.forEach(query => {
      const response = generateCulinaryFallback(query);
      expect(response).toContain('اقتراح الكونسيرج');
      expect(response).toContain('المكونات المتوفرة');
    });
  });

  it('guides users on fresh fruits and vegetables', () => {
    const produceQueries = ['فاكهة طازجة', 'خضار اليوم', 'فراولة بلدي', 'طماطم'];

    produceQueries.forEach(query => {
      const response = generateCulinaryFallback(query);
      expect(response).toContain('الخضروات والفواكه');
      expect(response).toContain('طازجة');
    });
  });

  it('highlights current deals and discounts', () => {
    const dealQueries = ['أقوى العروض', 'هل يوجد خصم اليوم؟', 'تخفيضات'];

    dealQueries.forEach(query => {
      const response = generateCulinaryFallback(query);
      expect(response).toContain('عروض');
      expect(response).toContain('خصم');
    });
  });

  it('explains live delivery and cold-chain tracking mechanism', () => {
    const trackingQueries = ['أين طلبي الآن؟', 'كيف أتبع التوصيل؟', 'الشحن المبرد'];

    trackingQueries.forEach(query => {
      const response = generateCulinaryFallback(query);
      expect(response).toContain('تتبع');
      expect(response).toContain('تبريد');
    });
  });

  it('returns a polite and helpful luxury concierge greeting for generic inquiries', () => {
    const genericResponse = generateCulinaryFallback('مساء الخير، بتفتحوا لحد الساعة كام؟');
    expect(genericResponse).toContain('هايبر المصري');
    expect(genericResponse.length).toBeGreaterThan(30);
  });
});
