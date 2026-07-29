// const tax1 = 49.99 * 0.1;
// const tax2 = 89.99 * 0.1;
// const tax3 = 21.99 * 0.1;

// function calculateTax(value) {
//   return value * 0.1;
// }

// tax1 = calculateTax(34);
// tax2 = calculateTax(53);
// tax3 = calculateTax(32);

// // funciton declaration
// function greet(name) {
//   return `hello ${name}`;
// }

// // functoin expression
// const greet = function (name) {
//   return `helo ${name}`;
// };

// // arrow function
// const greet = (name) => {
//   return `helo ${name}`;
// };

// // parameters and arguments
// // num1 and num2 are parameter
// // passing value to the funciotons while defining them
// function learningParams(num1, num2) {
//   return num1 + num2;
// }

// //passing value to the funciton when calling is arguments
// console.log(learningParams(5, 6));

// // Default parameter
// function defValues(name = "sajjad") {
//   return name;
// }
// defValues("ali"); // output ali
// defValues(); // output sajjad

// // function without return value
// function sayHi() {
//   console.log("Hi"); // it'll print hi but will have undefined value
// }

const globalVar = "I'm everywhere.";

const scapeFunc = () => {
  const localVar = "I'm here locally I've no global existance";
  console.log(localVar);
  console.log(globalVar);
};

console.log(globalVar);
// console.log(localVar);

// block scope var let const and {}

if (true) {
  let blockScope = "I'm block scoped";
  const alsoBlock = "me too";
  var oldVar = "I leak out";
}

// console.log(blockScope); // Ref Error
// console.log(alsoBlock); // Ref Error
// console.log(oldVar); // i leak out // this ignores block scoope

function makeCounter() {
  let count = 0; // this variable is "closed over"

  return function () {
    count++;
    return count;
  };
}

const counter = makeCounter();
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3

function makeMultiplier(mul) {
  return (num) => num * mul;
}
const double = makeMultiplier(2);
const triple = makeMultiplier(3);

console.log("double: ", double(5));
console.log("triple", triple(5));

function createBackAccount(initialBalance) {
  let balance = initialBalance;
  return {
    deposit(amount) {
      if (balance > 0) {
        balance += amount;
        return `Deposit amount: ${amount}, New balance ${balance}`;
      }
      return "Invalid balance";
    },
    withdraw(amount) {
      if (amount > 0 && amount < balance) {
        balance -= amount;
        return `Withdrew amount: ${amount}, New Balance: ${balance}`;
      }
    },
    checkBalance() {
      return `Your balance is ${balance}`;
    },
  };
}

const myAcc = createBackAccount(1000);
console.log(myAcc.withdraw(200));
console.log(myAcc.checkBalance());
console.log(myAcc.deposit(900));
console.log(myAcc.checkBalance());

// Functions are values
const sayHi = () => console.log("Hi!");

const runTwice = (fn) => {
  fn();
  fn();
};

console.log(runTwice(sayHi));

// map filter and foreach
const numbers = [1, 2, 3, 4, 5];

numbers.forEach((num) => console.log(num * 2));

numbers.map((num) => console.log(num * num));

const evens = numbers.filter((num) => num % 2 == 0);
console.log(evens);

// temrature converter
const farhenhiet = (celcius) => (celcius * 9) / 5 + 32;

//
function aboveAverage(numbers) {
  const avg = numbers.reduce((sum, no) => sum + no, 0) / numbers.length;
  const filAvg = numbers.filter((n) => n > avg);
}

// count calls in the function
function countCall(fn) {
  let callCount = 0;
  return function (...args) {
    callCount++;
    console.log(`Function is called ${callCount} times`);
    return fn(...args);
  };
}
