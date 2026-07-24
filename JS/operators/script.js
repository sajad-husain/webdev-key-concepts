const carTotal = 89;
const isMember = true;
const couponCode = null;

const discount = isMember ? carTotal * 0.2 : 0;

const coupon = couponCode ?? "NO_COUPON";

const finalTotal = carTotal - discount;

const shipping = finalTotal > 100 || isMember ? 0 : 10;

console.log(`Discount: $${discount}`);
console.log(`Coupon: $${coupon}`);
console.log(`Total: $${finalTotal}`);
console.log(`Shipping: $${shipping}`);
