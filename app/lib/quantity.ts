export function quantityLimit(stock: number) {
  return Number.isFinite(stock)
    ? Math.max(0, Math.min(99, Math.floor(stock)))
    : 0;
}
export function validQuantity(value: number, max: number) {
  return Number.isSafeInteger(value) && value >= 1 && value <= max;
}
