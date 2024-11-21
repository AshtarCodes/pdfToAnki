const fs = require("fs");
const path = require("path");
const error = require("./utils/cli.js").error;

const NOTE_TYPE = "Actually Basic Anki Connect";

function formFlashcards(directoryPath) {
  const images = getImages(directoryPath);
}

// read image files from a directory provided via the command line
function getImages(imageDirPath) {
  if (!fs.existsSync(imageDirPath)) {
    error(`The provided path does not exist: ${imageDirPath}`);
    return;
  }
  const images = fs.readdirSync(imageDirPath);
  if (!images.length) {
    // TODO: probably need to check files are actually images and filter for them
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
      const data = packageImage(_path, image);

      return {
        name: image,
        slide,
        formData: data.formData,
        imageBlob: data.imageBlob,
        path: _path,
      };
    })
    .filter((image) => image !== null);

  return result;
}

function packageImage(imagePath, imageName) {
  const stats = fs.statSync(imagePath);
  if (!stats.isFile()) {
    throw new Error(`The provided path is not a file. Path: ${imagePath}`);
  }
  // Read the image as a buffer
  const imageBuffer = fs.readFileSync(imagePath);

  // Create a Blob from the buffer (node-fetch FormData requires this)
  const imageBlob = new Blob([imageBuffer], { type: "image/jpeg" });

  // Create a FormData instance
  const formData = new FormData();
  formData.append("file", imageBlob, imageName);
  return { formData, imageBlob };
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
module.exports = {
  getImages,
  formFlashcards,
  createImageNoteTemplate,
  createImageNotes,
};
