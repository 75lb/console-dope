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
console.log("console.log %u{%s} inside format string", "underline");
console.error("console.error %u{%s} inside %u{format} string", "underline");
