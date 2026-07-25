// printing table of 7

for (i = 1; i <= 10; i++) {
  console.log(`7 x ${i} = ${7 * i}`);
}

// looping through Array
const names = ["Ali", "Sara", "Ahmed", "Zara", "Abdullah", "Omar"];
for (const name of names) {
  if (name.length > 3) {
    console.log(name);
  }
}

// find total price
const cart = [
  { item: "Shirt", price: 25 },
  { item: "Shoes", price: 60 },
  { item: "Belt", price: 15 },
  { item: "Cap", price: 10 },
];

let total = 0;
for (const tprice of cart) {
  total += tprice.price;
}

console.log(total);
