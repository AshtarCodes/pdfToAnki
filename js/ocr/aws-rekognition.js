const { RekognitionClient } = require("@aws-sdk/client-rekognition");
const { DetectLabelsCommand } = require("@aws-sdk/client-rekognition");
const fs = require("fs");
// const provider = require("@aws-sdk/credential-provider-node");

const client = new RekognitionClient({
  region: "us-east-1", // e.g., 'us-east-1'
  //   credentials: {
  //     accessKeyId: "your-access-key-id",
  //     secretAccessKey: "your-secret-access-key",
  //   },
});

console.log({ client });

const analyzeImage = async (imagePath) => {
  try {
    const imageBytes = fs.readFileSync(imagePath);
    const params = {
      Image: { Bytes: imageBytes },
      MaxLabels: 10, // Maximum number of labels to return
      MinConfidence: 75, // Minimum confidence level for labels
    };
    const command = new DetectLabelsCommand(params);
    const response = await client.send(command);
    console.log("Detected labels:", response.Labels);
  } catch (error) {
    console.error("Error analyzing image:", error);
  }
};

// analyzeImage("path/to/your/image.jpg");
