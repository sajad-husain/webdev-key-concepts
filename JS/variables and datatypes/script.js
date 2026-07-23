const productName = "       Wireless Keyboard   ";
const price = 9.99;
const quantity = 3;
const stock = true;

console.log(productName.trim());
console.log(productName.trim().toUpperCase());
console.log(`Price: $${price}`);
console.log(`Total: $${price * quantity}`);
console.log(`Total (rounded): $${(price * quantity).toFixed(2)}`);

console.log("Type of is ", typeof stock);
console.log(stock === true);
console.log(stock == "true");
