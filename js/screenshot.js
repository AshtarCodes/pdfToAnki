/**
 *
 * steps
 * 1. get the image
 * 2. form the question on front, and answer on back
 *      a. send image + prompt to LLM
 * 3. put image as answer on back
 *
 *
 *
 */

const fs = require("fs");
const path = require("path");
const error = require("./utils/cli.js").error;
const NOTE_TYPE = "Basic";
const questionObject = {
  slide: 0,
  question: "",
  answer: "",
  image: "",
};

function formFlashcards(directoryPath) {
  const images = getImages(directoryPath);
}

// read image files from a directory provided via the command line
exports.getImages = function getImages(imageDirPath) {
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
  const result = images.reduce((acc, image) => {
    // return an object with the image name and the path to the image, and the slide number. The image name is like so Slide10.png
    const match = image.match(/\d+/)?.[0];
    if (!match) {
      console.log(`No slide number found in the image name: ${image}`);
      return acc;
    }

    const slide = parseInt(match);
    const _path = path.join(imageDirPath, image);
    const data = packageImage(_path, image);
    // console.log({ _path, blob: data.imageBlob });
    const result = {
      name: image,
      slide,
      formData: data.formData,
      imageBlob: data.imageBlob,
      path: _path,
    };

    acc[slide] = result;
    return acc;
  }, {});
  return result;
};

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

function createAnkiNoteTemplate({ question: questionObj, deckName, tags }) {
  const { question, choices, answer, answerExtra, feedback } = questionObj;
  const fields = { Question: question.trim() };
  // fields.Answer = answer.trim();

  return {
    deckName: deckName,
    modelName: NOTE_TYPE, //"Anki Connect Basic",
    fields,
    tags,
    // audio,
    // video,
    // picture
  };
}
