const fs = require("fs");
const path = require("path");
const error = require("./utils/cli.js").error;
const writeCompletionToFile = require("./openai.js").writeCompletionToFile;
const { analyzeImage } = require("./ocr/textract.js");
const { generateStructuredOutput } = require("./openai.js");

//TODO: provide as cli command
const NOTE_TYPE = "Actually Basic Anki Connect";

// read image files from a directory provided via the command line
function getImages(imageDirPath) {
  if (!fs.existsSync(imageDirPath)) {
    error(`The provided path does not exist: ${imageDirPath}`);
    return;
  }
  const images = fs.readdirSync(imageDirPath);
  if (!images.length) {
    error(`No image files found in the provided directory: ${imageDirPath}`);
    return;
  }
  const result = images
    .map((image) => {
      const match = image.match(/\d+/)?.[0];
      if (!match) {
        console.log(`No slide number found in the image name: ${image}`);
        return null;
      }

      const slide = parseInt(match);
      const _path = path.join(imageDirPath, image);

      if (!isFile(_path)) {
        return null;
      }

      return {
        name: image,
        slide,
        path: _path,
      };
    })
    .filter((image) => image !== null);

  return result;
}

function isFile(imagePath) {
  const stats = fs.statSync(imagePath);
  // TODO: probably need to check files are actually images using mimetype
  if (!stats.isFile()) {
    console.error(
      `The provided path is not a file. Skipping. Path: ${imagePath}`
    );
    return false;
  }

  return true;
}

function createImageNoteTemplate({ card, deckName, tags }) {
  const { slide, content } = card;
  const { front, back, category } = content;
  const fields = {
    Front: `Slide ${slide}: ${front.trim()}`,
    Back: back.trim(),
  };
  // fields.Answer = answer.trim();
  const imagePath = card.image.path;
  const picture = {
    filename: path.basename(imagePath),
    path: imagePath,
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

function createImageNotes(cards, deckName) {
  return cards.map((card) => {
    return createImageNoteTemplate({ card, deckName });
  });
}

async function generateFlashCards(images, imageDir) {
  const systemPrompt = fs.readFileSync(
    path.resolve("prompts/singleFlashcardFromImage.md"),
    "utf8"
  );
  if (!systemPrompt) {
    error("System prompt not found.");
    return;
  }
  const flashcards = [];
  const imageDirName = path.basename(imageDir);

  for (let image of images) {
    const { slide, path } = image;
    // get the name of the directory of the image from the image path

    const { detectedText } = await analyzeImage(path);
    const completion = await generateStructuredOutput(
      detectedText,
      systemPrompt
    );
    const completionContent = completion?.choices?.[0]?.message?.content;
    if (!completionContent) {
      console.error(`No completion content found for ${slide} at ${path}.`);
      continue;
    }

    const customParser = (key, value) => {
      if (typeof value === "string") {
        return value.replace(/\n/g, "<br>"); // Re-add escaped newlines
      }
      return value;
    };
    const completionJSON = JSON.parse(completionContent, customParser);

    flashcards.push({ content: completionJSON, slide, image });

    // console.log({
    //   slide,
    //   detectedText,
    //   completion: completion.choices[0]?.message,
    //   usage: completion?.usage?.total_tokens,
    // });

    writeCompletionToFile(
      completion,
      `completions/${imageDirName}/Slide${slide}.json`
    );
  }
  return flashcards;
}

module.exports = {
  getImages,
  createImageNoteTemplate,
  createImageNotes,
  generateFlashCards,
};
