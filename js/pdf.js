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
const os = require("os");
const { APP_TEMP_DIR } = require("./utils/constants.js");

//TODO: provide as cli command
const NOTE_TYPE = "Actually Basic Anki Connect";

async function getSystemPrompt(mode) {
  let systemPrompt;

  if (mode === "single") {
    systemPrompt = await fsPromises.readFile(
      path.resolve("prompts/singleFlashcardFromImage.md"),
      "utf8"
    );
  } else if (mode === "multiple") {
    systemPrompt = await fsPromises.readFile(
      path.resolve("prompts/flashcardsFromPDF.md"),
      "utf8"
    );
  }
  return systemPrompt;
}

async function generateFlashCardsFromPdf({
  pdfPath,
  mode = "single",
  outputDir,
}) {
  const systemPrompt = await getSystemPrompt(mode);

  if (!systemPrompt) {
    error("System prompt not found.");
    return;
  }
  // read pdf
  //   const dataBuffer = await fsPromises.readFile(pdfPath);
  const pdfPages = await splitPDF(pdfPath, APP_TEMP_DIR /* outputDir */);

  // extract text using textract
  const promises = pdfPages.map(async (page) => {
    let completion;
    try {
      const completionFileName = `sandbox/pdf-completions/${page.originalName}/page-${page.pageNumber}.json`;

      const { detectedText: pdfText } = await analyzeSinglePDF(page);
      completion = await generateStructuredOutput(
        pdfText,
        systemPrompt,
        completionFileName,
        mode
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
        cardMode: mode,
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

async function createPDFNoteTemplate({ card, deckName, tags, imagePath }) {
  const { pageNumber, content, pagePath, originalName } = card;
  const { front, back } = content;
  const fields = {
    Front: `Page ${pageNumber}: ${front.trim()}`,
    Back: back.trim(),
  };

  const picture = {
    filename: originalName + path.basename(pagePath, ".pdf") + ".png", // diabetes-page-1.png
    path: imagePath,
    // data: imageData,
    fields: ["Back"],
  };

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
async function pdfToImageBuffer(pdfPath, pageNumber, originalFileName) {
  const dirName = originalFileName;
  const outputDir = path.join(`${APP_TEMP_DIR}/${dirName}`); // /tmp/agent-flash/diabetes
  await createDirIfMissing(outputDir);

  const options = {
    density: 300,
    format: "png",
    preserveAspectRatio: true,
    quality: 100,
    height: 3300,
    width: 2550,
    saveFilename: `page-${pageNumber}`,
    savePath: outputDir,
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
    console.error("PDF Path:", pdfPath);
    console.error("Page Number:", pageNumber);
    throw new Error(
      `pdfToImageBuffer:: Error converting pdf to image at ${pdfPath}, page ${pageNumber}: ${error.message}`,
      { cause: error }
    );
  }
}

async function createNotesFromPDF(cards, deckName) {
  try {
    // Validate inputs first
    if (!Array.isArray(cards) || !deckName) {
      throw new Error(
        "Invalid input: cards must be an array and deckName is required"
      );
    }

    // Process all cards
    const notes = await Promise.all(
      cards.map(async (card) => {
        try {
          // Get image buffer first
          const imagePath = await pdfToImageBuffer(
            card.pagePath,
            card.pageNumber,
            card.originalName
          );

          if (card.cardMode === "multiple") {
            // Validate multiple card content structure
            if (
              !card.content?.flashcards ||
              !Array.isArray(card.content.flashcards)
            ) {
              throw new Error(
                `Invalid multiple card content structure for card from ${card.pagePath}`
              );
            }

            // Process all subcards
            const subCards = await Promise.all(
              card.content.flashcards.map((singleCard) =>
                createPDFNoteTemplate({
                  card: { ...card, content: singleCard },
                  deckName,
                  imagePath,
                })
              )
            );
            return subCards;
          }

          // Process single card
          return await createPDFNoteTemplate({ card, deckName, imagePath });
        } catch (error) {
          // Add context to the error
          throw new Error(
            `Failed processing card from ${card.pagePath}: ${error.message}`,
            { cause: error }
          );
        }
      })
    );

    // Flatten and return results
    return notes.flat();
  } catch (error) {
    // Rethrow to maintain atomic behavior
    throw new Error(
      `createNotesFromPDF:: Failed to create notes from PDF: ${error.message}`,
      { cause: error }
    );
  }
}

// pdfToImageBuffer("sandbox/split-pdfs/neuro-assessment/page-1.pdf", 1).then(
//   (res) => console.log("fulfilled: ", res !== undefined),
//   (rej) => console.log("rejected: ", rej)
// );

module.exports = {
  generateFlashCardsFromPdf,
  createNotesFromPDF,
};
