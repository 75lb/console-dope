require("../");

console.log("console.log");
console.red.log("console.red.log");
console.red.underline.log("console.red.underline.log");
console.red.underline.error("console.red.underline.error");
console.green.write("console.green.write");
console.write("\n");
console.bold.log("console.bold.log");
console.bold.magenta.log("console.bold.magenta.log", "with", { multiple: "ARGS" });
console.bold.underline.blue.log("console.%s.underline.%s.log using format string", "bold", "blue");
console.log("console.log %underline{%s} inside format string", "underline");
console.error("console.error %underline{%s} inside %underline{format} string", "underline");
console.underline.log("console.underline.log with %blue{blue} inside the string");
