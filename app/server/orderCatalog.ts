export type CheckoutItemInput = {
  id?: unknown;
  variation?: unknown;
  quantity?: unknown;
};

export type ResolvedOrderItem = {
  itemKey: string;
  name: string;
  category: string;
  variation: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

const products = {
  "elementor-pro": ["Elementor Pro", 300],
  crocoblock: ["Crocoblock", 600],
  "astra-pro-essential": ["Astra Pro Essential", 600],
  "rank-math-pro": ["Rank Math Pro", 500],
  "tutor-lms-pro": ["Tutor LMS Pro", 500],
  "wp-rocket": ["WP Rocket", 400],
  "fluent-forms-pro": ["Fluent Forms Pro", 450],
  "essential-addons": ["Essential Addons", 350],
  "cartflows-pro": ["CartFlows Pro", 500],
  "wp-social-ninja-pro": ["WP Social Ninja Pro", 450],
  "divi-theme": ["Divi Theme", 550],
  "learndash-lms": ["LearnDash LMS", 700],
  "wpforms-pro": ["WPForms Pro", 450],
  perfmatters: ["Perfmatters", 400],
  "yoast-seo-premium": ["Yoast SEO Premium", 450],
} as const;

const themes = {
  "corporate-pro": ["Corporate Pro", 8500],
  "shop-essential": ["Shop Essential", 12500],
  "service-expert": ["Service Expert", 7500],
  "news-portal": ["News Portal", 15000],
  "clinic-care": ["Clinic Care", 12000],
  "course-academy": ["Course Academy", 18000],
} as const;

const productMultipliers: Record<string, number> = {
  "01 Site": 1,
  "05 Sites": 1.5,
  "10 Sites": 2,
  "50 Sites": 3,
  "100 Sites": 4,
};

function normaliseProductVariation(value: string) {
  const compact = value.trim().toLowerCase().replace(/[-_]+/g, " ");
  const match = Object.keys(productMultipliers).find(
    (label) => label.toLowerCase() === compact,
  );
  return match ?? null;
}

function normaliseThemePack(value: string) {
  const match = value.match(/pack\s*0?([123])/i);
  return match ? `Pack 0${match[1]}` : null;
}

function safeQuantity(value: unknown) {
  const quantity = Number(value ?? 1);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    throw new Error("Invalid item quantity.");
  }
  return quantity;
}

export function resolveCheckoutItems(
  inputs: CheckoutItemInput[],
  completedCommerceSales: number,
): ResolvedOrderItem[] {
  if (!Array.isArray(inputs) || inputs.length === 0 || inputs.length > 25) {
    throw new Error("Your cart is empty or contains too many items.");
  }

  return inputs.map((input) => {
    const id = String(input.id ?? "").trim().toLowerCase();
    const requestedVariation = String(input.variation ?? "").trim();
    const quantity = safeQuantity(input.quantity);

    if (id === "mr-commerce-pro-license") {
      const unitPrice = completedCommerceSales < 20 ? 3000 : 5000;
      return {
        itemKey: "mr-commerce-pro-license",
        name: "MR Commerce Pro",
        category: "MR Exclusive",
        variation: "Lifetime",
        unitPrice,
        quantity,
        lineTotal: unitPrice * quantity,
      };
    }

    if (id.startsWith("theme-")) {
      const themeKey = Object.keys(themes)
        .sort((a, b) => b.length - a.length)
        .find((key) => id === `theme-${key}` || id.startsWith(`theme-${key}-`));
      if (!themeKey) throw new Error(`Unknown Ready Theme item: ${id}`);
      const pack = normaliseThemePack(requestedVariation || id);
      if (!pack) throw new Error("Invalid Ready Theme package.");
      const [name, basePrice] = themes[themeKey as keyof typeof themes];
      const multiplier = pack === "Pack 01" ? 1 : pack === "Pack 02" ? 1.45 : 1.9;
      const unitPrice =
        pack === "Pack 01" ? basePrice : Math.ceil((basePrice * multiplier) / 500) * 500;
      return {
        itemKey: themeKey,
        name,
        category: "Ready Theme",
        variation: pack,
        unitPrice,
        quantity,
        lineTotal: unitPrice * quantity,
      };
    }

    const productKey = Object.keys(products)
      .sort((a, b) => b.length - a.length)
      .find((key) => id === key || id.startsWith(`${key}-`));
    if (!productKey) throw new Error(`Unknown product item: ${id}`);
    const variation = normaliseProductVariation(requestedVariation || id);
    if (!variation) throw new Error("Invalid product variation.");
    const [name, basePrice] = products[productKey as keyof typeof products];
    const multiplier = productMultipliers[variation];
    const unitPrice =
      multiplier === 1 ? basePrice : Math.ceil((basePrice * multiplier) / 50) * 50;
    return {
      itemKey: productKey,
      name,
      category: "Pro Tool",
      variation,
      unitPrice,
      quantity,
      lineTotal: unitPrice * quantity,
    };
  });
}

export function calculateOrderTotals(
  items: ResolvedOrderItem[],
  couponCode: string,
  paymentMethod: string,
) {
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const normalisedCoupon = couponCode.trim().toUpperCase();
  const discount = normalisedCoupon === "MR10" ? Math.round(subtotal * 0.1) : 0;
  const afterDiscount = subtotal - discount;
  const paymentCharge =
    paymentMethod === "bkash" ? Math.round(afterDiscount * 0.0185) : 0;
  return {
    subtotal,
    discount,
    paymentCharge,
    total: afterDiscount + paymentCharge,
    couponCode: normalisedCoupon === "MR10" ? "MR10" : "",
  };
}
