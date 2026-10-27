import { describe, it, expect } from 'vitest';
import { CustomerAddressDetails, PaymentMethodType } from '../types';
import { 
  normalizeArabicNumerals, 
  normalizeEgyptianPhone, 
  isValidEgyptianPhone, 
  EGY_PHONE_REGEX 
} from '../utils/phone';

describe('Egyptian Realistic Checkout Validation', () => {
  interface CheckoutFormInput {
    customerName: string;
    customerPhone: string;
    governorate: string;
    district: string;
    street: string;
    building: string;
    floor: string;
    apartment: string;
    landmark?: string;
    paymentMethod: PaymentMethodType;
  }

  const validateCheckout = (input: CheckoutFormInput): { valid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};

    if (!input.customerName.trim() || input.customerName.trim().length < 3) {
      errors.customerName = 'الرجاء إدخال الاسم الكامل (٣ أحرف على الأقل)';
    }

    const cleanPhone = normalizeEgyptianPhone(input.customerPhone);
    if (!cleanPhone) {
      errors.customerPhone = 'رقم الموبايل إلزامي للتواصل أثناء التوصيل';
    } else if (!EGY_PHONE_REGEX.test(cleanPhone)) {
      errors.customerPhone = 'رقم الموبايل يجب أن يتكون من ١١ رقماً ويبدأ بـ 010 أو 011 أو 012 أو 015';
    }

    if (!input.street.trim() || input.street.trim().length < 3) {
      errors.street = 'الرجاء كتابة اسم الشارع والموقع بالتفصيل';
    }

    if (!input.building.trim()) {
      errors.building = 'رقم العمارة مطلوب';
    }

    if (!input.floor.trim()) {
      errors.floor = 'رقم الدور مطلوب';
    }

    if (!input.apartment.trim()) {
      errors.apartment = 'رقم الشقة مطلوب';
    }

    const validPaymentMethods: PaymentMethodType[] = ['CASH_ON_DELIVERY', 'CARD_ON_DELIVERY'];
    if (!validPaymentMethods.includes(input.paymentMethod)) {
      errors.paymentMethod = 'طريقة الدفع غير مدعومة';
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  };

  it('accepts valid 11-digit Egyptian mobile numbers with prefixes 010, 011, 012, 015', () => {
    const validPhones = [
      '01012345678', // Vodafone
      '01123456789', // Etisalat
      '01234567890', // Orange
      '01555566677'  // WE
    ];

    validPhones.forEach(phone => {
      expect(EGY_PHONE_REGEX.test(phone)).toBe(true);
    });
  });

  it('rejects invalid Egyptian phone numbers (invalid prefix, wrong length, letters)', () => {
    const invalidPhones = [
      '01312345678',  // Invalid prefix 013
      '01412345678',  // Invalid prefix 014
      '01612345678',  // Invalid prefix 016
      '0101234567',   // 10 digits
      '010123456789', // 12 digits
      '0223456789',   // Landline 02
      '0101234abcd',  // Non-numeric characters
      ''
    ];

    invalidPhones.forEach(phone => {
      expect(EGY_PHONE_REGEX.test(phone)).toBe(false);
    });
  });

  it('normalizes and accepts Eastern Arabic numerals (٠١٢٧٦٧٥٩٦٠٠) and Persian numerals', () => {
    // User's exact phone from mobile keyboard
    const arabicIndicPhone = '٠١٢٧٦٧٥٩٦٠٠';
    expect(normalizeEgyptianPhone(arabicIndicPhone)).toBe('01276759600');
    expect(isValidEgyptianPhone(arabicIndicPhone)).toBe(true);

    // Persian numeral variation
    const persianPhone = '۰۱۱۵۵۵۵۴۴۳۳';
    expect(normalizeEgyptianPhone(persianPhone)).toBe('01155554433');
    expect(isValidEgyptianPhone(persianPhone)).toBe(true);

    // Checkout form with Arabic numerals succeeds
    const arabicPayload: CheckoutFormInput = {
      customerName: 'كريم عبد العزيز',
      customerPhone: '٠١٢٧٦٧٥٩٦٠٠',
      governorate: 'القاهرة',
      district: 'القاهرة الجديدة (التجمع الخامس)',
      street: 'شارع التسعين',
      building: '٤٥',
      floor: '٣',
      apartment: '١٢',
      paymentMethod: 'CASH_ON_DELIVERY'
    };

    const res = validateCheckout(arabicPayload);
    expect(res.valid).toBe(true);
    expect(res.errors.customerPhone).toBeUndefined();
  });

  it('normalizes spaces, dashes, and international prefixes (+20, 0020, 20)', () => {
    expect(normalizeEgyptianPhone('+201276759600')).toBe('01276759600');
    expect(normalizeEgyptianPhone('+20 12 7675 9600')).toBe('01276759600');
    expect(normalizeEgyptianPhone('00201012345678')).toBe('01012345678');
    expect(normalizeEgyptianPhone('201123456789')).toBe('01123456789');
    expect(normalizeEgyptianPhone('012-7675-9600')).toBe('01276759600');
    expect(normalizeEgyptianPhone(' ٠١٥ ٥٥٥ ٦٦٦ ٧٧ ')).toBe('01555566677');
  });

  it('successfully validates complete Egyptian checkout payload', () => {
    const validPayload: CheckoutFormInput = {
      customerName: 'أحمد محمود',
      customerPhone: '01098765432',
      governorate: 'القاهرة',
      district: 'القاهرة الجديدة (التجمع الخامس)',
      street: 'شارع التسعين الشمالي',
      building: 'عمارة ٤٥',
      floor: 'الدور الثالث',
      apartment: 'شقة ٧',
      landmark: 'بجوار مول كايرو فيستيفال سيتي',
      paymentMethod: 'CASH_ON_DELIVERY'
    };

    const result = validateCheckout(validPayload);
    expect(result.valid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it('flags missing required Egyptian address fields', () => {
    const incompletePayload: CheckoutFormInput = {
      customerName: 'م', // too short
      customerPhone: '01899999999', // invalid prefix
      governorate: 'القاهرة',
      district: 'المعادي',
      street: '',       // missing
      building: '',     // missing
      floor: '',        // missing
      apartment: '',    // missing
      paymentMethod: 'CARD_ON_DELIVERY'
    };

    const result = validateCheckout(incompletePayload);
    expect(result.valid).toBe(false);
    expect(result.errors.customerName).toBeDefined();
    expect(result.errors.customerPhone).toBeDefined();
    expect(result.errors.street).toBeDefined();
    expect(result.errors.building).toBeDefined();
    expect(result.errors.floor).toBeDefined();
    expect(result.errors.apartment).toBeDefined();
  });

  it('supports genuine payment options: Cash on Delivery and POS Card on Delivery', () => {
    const cashMethod: PaymentMethodType = 'CASH_ON_DELIVERY';
    const cardMethod: PaymentMethodType = 'CARD_ON_DELIVERY';

    const base: CheckoutFormInput = {
      customerName: 'سارة المصري',
      customerPhone: '01155554433',
      governorate: 'الجيزة',
      district: 'الشيخ زايد',
      street: 'شارع البستان',
      building: '12',
      floor: '2',
      apartment: '4',
      paymentMethod: cashMethod
    };

    expect(validateCheckout({ ...base, paymentMethod: cashMethod }).valid).toBe(true);
    expect(validateCheckout({ ...base, paymentMethod: cardMethod }).valid).toBe(true);
  });
});
