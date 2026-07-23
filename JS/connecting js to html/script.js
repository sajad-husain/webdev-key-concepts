console.log("Hello There! ");
const heading = document.getElementById("greeting");
const button = document.getElementById("btn");

button.addEventListener("click", () => {
  heading.textContent = "Good Evening!";
});

const button2 = document.getElementById("countBtn");
const heading2 = document.getElementById("h2");
let count = 0;

button2.addEventListener("click", function () {
  count += 1;
  heading2.textContent = "Count: " + count;
});
