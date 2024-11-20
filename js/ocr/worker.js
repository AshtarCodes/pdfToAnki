const { createWorker } = require("tesseract.js");
const worker = (async () => await createWorker("eng"))();
let promise = null;

// async function initWorker() {
//   if (isPromise(worker)) {
//     return await worker;
//   } else if (!worker) {
//     worker = await createWorker("eng");
//   }

//   return worker;
// }

// create a wait function
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
exports.analyzeImage = async function analyzeImage(blob) {
  let _worker;
  if (isPromise(worker)) {
    // await wait(4000);
    _worker = await worker;
  }
  //   console.log({ _worker });
  const ret = await _worker.recognize(blob);
  console.log("text ", ret.data.text);
  return ret.data.text;
};
exports.terminateWorker = async function terminateWorker() {
  const _worker = await worker;
  await _worker.terminate();
};

function isPromise(value) {
  return (
    !!value && (typeof value.then === "function" || value instanceof Promise)
  );
}
