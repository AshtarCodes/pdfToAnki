const {
  TextractClient,
  AnalyzeDocumentCommand,
} = require("@aws-sdk/client-textract");
const fs = require("fs");
const fsPromises = require("fs/promises");
const path = require("path");
const { fromIni } = require("@aws-sdk/credential-providers");
const { createDirIfMissing, checkExists } = require("../utils/fs-helpers.js");
const client = new TextractClient({
  region: "us-east-1",
  credentials: fromIni({ profile: "iamadmin-general" }),
});
const error = require("../utils/cli.js").error;

async function analyzeImage(imagePath) {
  try {
    // Read image as binary data
    const imageBytes = fs.readFileSync(imagePath);

    const params = {
      Document: { Bytes: imageBytes },
      FeatureTypes: ["TABLES", "FORMS"], // Specify to detect tables and forms
    };
    console.info("Analyzing image:", imagePath);
    const command = new AnalyzeDocumentCommand(params);
    const response = await client.send(command);

    // Extract and process text and table data
    const blocks = response.Blocks;

    let blockTypes = blocks.map((block) => block.BlockType);
    blockTypes = [...new Set(blockTypes)];
    console.log("Blocks:", blockTypes);
    // Extract detected text
    const detectedText = blocks
      .filter((block) => block.BlockType === "LINE")
      .map((line) => line.Text)
      .join("\n");

    // console.log("Extracted Text: \n", detectedText, "\n");
    // TODO: can I improve LLM output by reconstructing tables?
    // * Con is increase in tokens.
    // Extract table data
    const tables = blocks.filter((block) => block.BlockType === "TABLE");
    // console.log("Detected Tables:", tables?.length);

    return { detectedText };
  } catch (err) {
    error("Error:", err);
    return;
    // throw err;
  }
}

async function analyzeSinglePDF(pdfDoc) {
  let reuse = false;
  // TODO: remove
  const outputDir = path.resolve(`sandbox/pdf-textract/${pdfDoc.originalName}`);
  const fileName = `${outputDir}/page-${pdfDoc.pageNumber}.json`;

  if (await checkExists(fileName)) {
    reuse = true;
  }
  // Prepare the command parameters
  const params = {
    Document: {
      Bytes: pdfDoc.pdf,
    },
    FeatureTypes: ["LAYOUT"], // Optional features
  };

  try {
    let response;
    // Make the synchronous API call
    if (reuse === false) {
      console.info(
        `Analyzing PDF ${pdfDoc.originalName} at page ${pdfDoc.pageNumber}...`
      );
      const command = new AnalyzeDocumentCommand(params);
      response = await client.send(command);

      // if the directories do not exist, recursively create them
      await createDirIfMissing(outputDir);

      fsPromises.writeFile(
        path.join(fileName),
        JSON.stringify(response, null, 2)
      );
    } else if (reuse === true) {
      response = JSON.parse(await fsPromises.readFile(fileName, "utf8"));
      console.info(`Reusing previous document analysis from ${fileName}.`);
    }
    // Extract text blocks
    let detectedText = "";
    response.Blocks.forEach((block) => {
      if (block.BlockType === "LINE") {
        detectedText += block.Text + "\n";
      }
    });

    return { detectedText };
  } catch (err) {
    console.error("Error analyzing document:", err);
    error(`Error analyzing document: ${err.message}`);
    throw err;
  }
}

// const p = "C:/Users/ashta/Downloads/MONTEFIORE/ABG-images/Slide33.jpg";
// analyzeImage(p);

module.exports = {
  analyzeImage,
  analyzeSinglePDF,
};
