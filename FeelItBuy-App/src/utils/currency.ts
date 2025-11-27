const inrFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
});

export function formatINR(value: number | string): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '₹0.00';
    return inrFormatter.format(num);
}
