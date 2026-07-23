export function generateBookingNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BK-${timestamp}-${random}`;
}

export function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `INV-${year}${month}-${random}`;
}

export function generateContractNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `CTR-${timestamp}-${random}`;
}

export function calculateRentalDays(startDate: Date, endDate: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = endDate.getTime() - startDate.getTime();
  return Math.max(1, Math.ceil(diff / msPerDay));
}

export function calculateRentalPrice({
  dailyRate,
  weeklyRate,
  monthlyRate,
  days,
}: {
  dailyRate: number;
  weeklyRate?: number | null;
  monthlyRate?: number | null;
  days: number;
}): number {
  let total = 0;
  let remainingDays = days;

  if (monthlyRate && remainingDays >= 30) {
    const months = Math.floor(remainingDays / 30);
    total += months * monthlyRate;
    remainingDays %= 30;
  }

  if (weeklyRate && remainingDays >= 7) {
    const weeks = Math.floor(remainingDays / 7);
    total += weeks * weeklyRate;
    remainingDays %= 7;
  }

  total += remainingDays * dailyRate;
  return Math.round(total * 100) / 100;
}

export function applyDiscount({
  amount,
  discountType,
  discountValue,
  maxDiscount,
}: {
  amount: number;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  maxDiscount?: number;
}): number {
  let discount = 0;

  if (discountType === 'PERCENTAGE') {
    discount = (amount * discountValue) / 100;
  } else {
    discount = discountValue;
  }

  if (maxDiscount && discount > maxDiscount) {
    discount = maxDiscount;
  }

  return Math.min(discount, amount);
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  return formatDate(date, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj } as Omit<T, K>;
  for (const key of keys) {
    delete (result as Record<string, unknown>)[key as string];
  }
  return result;
}

export function hasPermission(
  userRole: string,
  requiredPermission: string,
  rolePermissions: Record<string, string[]>
): boolean {
  const permissions = rolePermissions[userRole] || [];
  return permissions.includes(requiredPermission);
}

export function hasAnyPermission(
  userRole: string,
  requiredPermissions: string[],
  rolePermissions: Record<string, string[]>
): boolean {
  const permissions = rolePermissions[userRole] || [];
  return requiredPermissions.some((p) => permissions.includes(p));
}

export function hasAllPermissions(
  userRole: string,
  requiredPermissions: string[],
  rolePermissions: Record<string, string[]>
): boolean {
  const permissions = rolePermissions[userRole] || [];
  return requiredPermissions.every((p) => permissions.includes(p));
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
