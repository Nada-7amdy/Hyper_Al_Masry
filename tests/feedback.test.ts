import { describe, it, expect } from 'vitest';

describe('Order Feedback & Tracking Validation', () => {
  interface FeedbackPayload {
    orderId: string;
    deliveryRating: number;
    productRating: number;
    tags: string[];
    comment: string;
  }

  const validateFeedbackPayload = (payload: FeedbackPayload): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Order ID check
    if (!payload.orderId || !/^ORD-\d{4}-EG$/.test(payload.orderId)) {
      errors.push('Invalid orderId format');
    }

    // Delivery Rating check (1 - 5)
    if (typeof payload.deliveryRating !== 'number' || payload.deliveryRating < 1 || payload.deliveryRating > 5) {
      errors.push('Delivery rating must be between 1 and 5');
    }

    // Product Rating check (1 - 5)
    if (typeof payload.productRating !== 'number' || payload.productRating < 1 || payload.productRating > 5) {
      errors.push('Product rating must be between 1 and 5');
    }

    // Tags check
    if (!Array.isArray(payload.tags)) {
      errors.push('Tags must be an array');
    }

    // Comment check
    if (typeof payload.comment !== 'string' || payload.comment.length > 1000) {
      errors.push('Comment must be string with max 1000 characters');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  };

  it('validates a standard luxury order feedback payload successfully', () => {
    const feedback: FeedbackPayload = {
      orderId: 'ORD-7421-EG',
      deliveryRating: 5,
      productRating: 5,
      tags: ['سريع جداً ⚡', 'منتجات طازجة 🥬', 'تغليف فاخر 🎁'],
      comment: 'خدمة راقية جداً والتغليف ممتاز ومبرد بعناية.'
    };

    const result = validateFeedbackPayload(feedback);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects ratings outside the 1 to 5 range', () => {
    const invalidRatingFeedback: FeedbackPayload = {
      orderId: 'ORD-1234-EG',
      deliveryRating: 6, // invalid
      productRating: 0,  // invalid
      tags: [],
      comment: ''
    };

    const result = validateFeedbackPayload(invalidRatingFeedback);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Delivery rating must be between 1 and 5');
    expect(result.errors).toContain('Product rating must be between 1 and 5');
  });

  it('validates orderId matches Egyptian retail standard ORD-XXXX-EG', () => {
    const validIds = ['ORD-1000-EG', 'ORD-8821-EG', 'ORD-9999-EG'];
    const invalidIds = ['123', 'ORD-12-EG', 'ORD-1234', 'ORDER-1234-EG', ''];

    validIds.forEach(id => {
      const res = validateFeedbackPayload({
        orderId: id,
        deliveryRating: 5,
        productRating: 5,
        tags: [],
        comment: ''
      });
      expect(res.valid).toBe(true);
    });

    invalidIds.forEach(id => {
      const res = validateFeedbackPayload({
        orderId: id,
        deliveryRating: 5,
        productRating: 5,
        tags: [],
        comment: ''
      });
      expect(res.valid).toBe(false);
      expect(res.errors).toContain('Invalid orderId format');
    });
  });

  it('prevents excessively long comment payloads (>1000 chars)', () => {
    const longComment = 'أ'.repeat(1001);
    const result = validateFeedbackPayload({
      orderId: 'ORD-5555-EG',
      deliveryRating: 4,
      productRating: 4,
      tags: [],
      comment: longComment
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Comment must be string with max 1000 characters');
  });
});
