const fs = require("fs");
const fsPromises = require("fs/promises");
const path = require("path");
const error = require("./utils/cli.js").error;
const writeCompletionToFile = require("./openai.js").writeCompletionToFile;
const { analyzeSinglePDF } = require("./ocr/textract.js");
const {
  generateStructuredOutput,
  extractContentFromCompletion,
} = require("./openai.js");
const { splitPDF } = require("./utils/pdf.js");
const pdf2pic = require("pdf2pic");
const { createDirIfMissing } = require("./utils/fs-helpers.js");

//TODO: provide as cli command
const NOTE_TYPE = "Actually Basic Anki Connect";

async function generateFlashCardsFromPdf(pdfPath, outputDir) {
  const systemPrompt = await fsPromises.readFile(
    path.resolve("prompts/singleFlashcardFromImage.md"),
    "utf8"
  );
  if (!systemPrompt) {
    error("System prompt not found.");
    return;
  }
  // read pdf
  //   const dataBuffer = await fsPromises.readFile(pdfPath);
  const pdfPages = await splitPDF(
    pdfPath,
    `sandbox/split-pdfs` /* outputDir */
  );

  // extract text using textract
  const promises = pdfPages.map(async (page) => {
    let completion;
    try {
      const completionFileName = `sandbox/pdf-completions/${page.originalName}/page-${page.pageNumber}.json`;

      const { detectedText: pdfText } = await analyzeSinglePDF(page);
      completion = await generateStructuredOutput(
        pdfText,
        systemPrompt,
        completionFileName
      );

      const completionJSON = await extractContentFromCompletion(
        completion,
        page
      );

      return {
        content: completionJSON,
        pageNumber: page.pageNumber,
        originalName: page.originalName,
        pagePath: page.pagePath,
      };
    } catch (err) {
      return error(`Error generating flashcards from PDF: ${err.message}`);
    }
  });

  // send to LLM for processing
  //   const output = generateStructuredOutput(pdf);

  //   writeCompletionToFile(output, outputDir);
  // send to Anki
  const flashcards = await Promise.all(promises);
  return flashcards;
}

async function createPDFNoteTemplate({ card, deckName, tags }) {
  const { pageNumber, content, pagePath, originalName } = card;
  const { front, back } = content;
  const fields = {
    Front: `Page ${pageNumber}: ${front.trim()}`,
    Back: back.trim(),
  };
  // fields.Answer = answer.trim();
  const pdfPath = pagePath;
  const imagePath = await pdfToImageBuffer(pdfPath, pageNumber);
  const picture = {
    filename: path.basename(pdfPath, ".pdf") + ".png",
    path: imagePath,
    // data: imageData,
    fields: ["Back"],
  };
  console.log("picture ", picture.filename);
  return {
    deckName: deckName,
    modelName: NOTE_TYPE, //"Anki Connect Basic",
    fields,
    tags,
    // audio,
    // video,
    picture,
  };
}

// * tested
async function pdfToImageBuffer(pdfPath, pageNumber) {
  const dirName = path.dirname(path.normalize(pdfPath)).split(path.sep).at(-1);
  console.log("image dirName: ", dirName);
  console.log(path.sep);
  const outputDir = path.join(`sandbox/pdf-temp-images/${dirName}`);
  await createDirIfMissing(outputDir);

  const options = {
    density: 300,
    format: "png",
    preserveAspectRatio: true,
    quality: 100,
    height: 3300,
    width: 2550,
    // width: 2000,
    // height: 2000,
    saveFilename: path.join(`${outputDir}/page-${pageNumber}`), // Still required but won't be used
  };

  const convert = pdf2pic.fromPath(pdfPath, options);

  try {
    // Convert first page and get buffer
    const pageData = await convert(1, { responseType: "image" });
    // console.log(path.resolve(pageData.path));
    return path.resolve(pageData.path);
    // return pageData.buffer;
  } catch (error) {
    console.error("Error converting PDF to image:", error);
    throw error;
  }
}

async function createNotesFromPDF(cards, deckName) {
  const notes = cards.map(async (card) => {
    return await createPDFNoteTemplate({ card, deckName });
  });
  return Promise.all(notes);
}

// pdfToImageBuffer("sandbox/output/diabetes-critical-care/page-1.pdf", 1).then(
//   (res) => console.log("fulfilled: ", res !== undefined),
//   (rej) => console.log("rejected: ", rej)
// );

module.exports = {
  generateFlashCardsFromPdf,
  createNotesFromPDF,
};
