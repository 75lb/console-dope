require("../");

console.hideCursor();

console.log("console.log");
console.write("console.write\n");
console.error("console.error");

console.red.log("console.red.log");
console.red.write("console.red.write\n");
console.red.error("console.red.error");

console.red.underline.log("console.red.underline.log");
console.red.underline.write("console.red.underline.write\n");
console.red.underline.error("console.red.underline.error");

console.bold.log("console.bold.log");
console.bold.magenta.log("console.bold.magenta.log", "with", { multiple: "ARGS" });
console.bold.underline.blue.log("console.%s.underline.%s.log using format string", "bold", "blue");

console.log("console.log %underline{%s} inside format string", "underline");
console.error("console.error %underline{%s} inside %underline{format} string", "underline");
console.underline.log("console.underline.log with %blue{blue} inside the string");

console.column(10).log("console.column(10).log");
console.column(10).write("console.column(10).write\n");
console.column(10).error("console.column(10).error");

console.log(1);
console.write(2);
console.error(3);

console.showCursor();
