const {
  TextractClient,
  AnalyzeDocumentCommand,
} = require("@aws-sdk/client-textract");
const fs = require("fs");
const path = require("path");
const { fromIni } = require("@aws-sdk/credential-providers");
const client = new TextractClient({
  region: "us-east-1",
  credentials: fromIni({ profile: "iamadmin-general" }),
});
const error = require("../utils/cli.js").error;
// console.log({ client });
const analyzeImage = async (imagePath) => {
  try {
    // Read image as binary data
    const imageBytes = fs.readFileSync(imagePath);

    const params = {
      Document: { Bytes: imageBytes },
      FeatureTypes: ["TABLES", "FORMS"], // Specify to detect tables and forms
    };

    const command = new AnalyzeDocumentCommand(params);
    const response = await client.send(command);

    // Extract and process text and table data
    const blocks = response.Blocks;

    // get
    let blockTypes = blocks.map((block) => block.BlockType);
    blockTypes = [...new Set(blockTypes)];
    console.log("Blocks:", blockTypes);
    // Extract detected text
    const detectedText = blocks
      .filter((block) => block.BlockType === "LINE")
      .map((line) => line.Text)
      .join("\n");

    console.log("Extracted Text: \n", detectedText, "\n");

    // Extract table data
    const tables = blocks.filter((block) => block.BlockType === "TABLE");
    console.log("Detected Tables:", tables);

    return { detectedText };
  } catch (error) {
    error("Error:", error);
    throw error;
  }
};

// const p = "C:/Users/ashta/Downloads/MONTEFIORE/ABG-images/Slide33.jpg";
// Provide the path to your image
// analyzeImage(p);
module.exports = {
  analyzeImage,
};
