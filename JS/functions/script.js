const tax1 = 49.99 * 0.1;
const tax1 = 89.99 * 0.1;
const tax1 = 21.99 * 0.1;

function calculateTax(value) {
  return value * 0.1;
}

const tax1 = calculateTax(34);
const tax2 = calculateTax(53);
const tax3 = calculateTax(32);

// funciton declaration
function greet(name) {
  return `hello ${name}`;
}

// functoin expression
const greet = function (name) {
  return `helo ${name}`;
};

// arrow function
const greet = (name) => {
  return `helo ${name}`;
};

// parameters and arguments
// num1 and num2 are parameter
// passing value to the funciotons while defining them
function learningParams(num1, num2) {
  return num1 + num2;
}

//passing value to the funciton when calling is arguments
console.log(learningParams(5, 6));
