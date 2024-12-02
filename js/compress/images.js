const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const { trackWrite } = require("../utils/fs-helpers.js");
// const pLimit = require("p-limit");
// const imageUploadLimit = pLimit(10);
const error = require("../utils/cli.js").error;

async function compressImage(
  inputPath,
  outputPath,
  quality = 90,
  maxWidth = 1024,
  maxHeight = 768
) {
  try {
    // TODO: Consider streaming results to avoid memory issues. PRofiler showed 110mb of memory use for 33 small images.
    // TODO: not sure if conversion is working.
    const compressedImage = await sharp(inputPath)
      .toFormat("png", { quality })
      .resize({ maxWidth, maxHeight, fit: "inside", withoutEnlargement: true })
      .toBuffer();

    trackWrite(
      fs.writeFile(outputPath, compressedImage, (err) => {
        if (err) {
          throw err;
        }
      })
    );

    return compressedImage;
  } catch (error) {
    return error(`Error processing ${inputPath}: ${error.message}`);
  }
}

async function processImageUploads(uploadedImagesDir, outputDir) {
  try {
    const pLimit = await import("p-limit");
    const imageUploadLimit = pLimit.default(10);
    const files = fs.readdirSync(uploadedImagesDir);

    // * profile start
    // const usageStart = process.resourceUsage();

    // Compress images in batches
    const tasks = files.map((file) => {
      const inputPath = path.join(uploadedImagesDir, file);
      const outputPath = path.join(outputDir, file);
      return imageUploadLimit(() => compressImage(inputPath, outputPath));
    });

    const results = await Promise.all(tasks);
    /**
     * * Profile end
     */
    // const usageEnd = process.resourceUsage();
    // * Profile results. For 33 small jpgs, 9ms CPU time, 110MB max RSS
    // console.log(
    //   "User CPU time (ms):",
    //   (usageEnd.userCPUTime - usageStart.userCPUTime) / 1e6
    // );
    // console.log("Max RSS (MB):", usageEnd.maxRSS / 1024);

    console.log("All images processed:", results.length);
    return results;
  } catch (err) {
    console.error("Error during processing:", err);
  }
}

// Example usage
const directoryPath = path.resolve(__dirname, "../../sandbox/input");
const outDir = path.resolve(__dirname, "../../sandbox/output");
processImageUploads(directoryPath, outDir);

module.exports = {
  processImageUploads,
};
