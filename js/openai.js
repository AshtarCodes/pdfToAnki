const OpenAI = require("openai");
require("dotenv").config();
const path = require("path");
const { z } = require("zod");
const { zodResponseFormat } = require("openai/helpers/zod");
const formatTime = require("./utils/time.js").formatTime;
const fsPromises = require("fs/promises");
const {
  createDirIfMissing,
  checkExists,
  trackWrite,
} = require("./utils/fs-helpers.js");
const { error } = require("./utils/cli.js");

const FlashcardExtraction = z.object({
  front: z.string(),
  back: z.string(),
  // category: z.array(z.string()),
});

const ManyFlashCardExtractions = z.object({
  flashcards: z.array(FlashcardExtraction),
});

async function generateStructuredOutput(
  userPrompt,
  systemPrompt,
  completionFileName,
  cardsPerFile = "single",
  retry = 3
) {
  let responseFormat = getResponseFormat(cardsPerFile);
  let completion;
  let reused = false;
  if (completionFileName && (await checkExists(completionFileName))) {
    completion = JSON.parse(await fsPromises.readFile(completionFileName));
    reused = true;
    console.info(`Reusing completion from ${completionFileName}`);
    return completion;
  }

  // TODO: Do I need to create a new OpenAI instance every time?
  try {
    const openai = new OpenAI();
    console.info("Generating structured output...");
    completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: responseFormat,
    });
    return completion;
  } catch (err) {
    const page = path.basename(completionFileName);

    if (retry > 0) {
      // TODO: improve this retry logic. We often hit the API rate limit of 30k tokens per minute: https://platform.openai.com/docs/guides/rate-limits?context=tier-two
      console.error(
        `Error generating structured output for ${page}. Retry ${4 - retry}: ${
          err.message
        }. Retrying...`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000 * 30)); // Wait 30 seconds before retrying

      return await generateStructuredOutput(
        userPrompt,
        systemPrompt,
        completionFileName,
        cardsPerFile,
        retry - 1
      );
    }

    error(
      `Error generating structured output for ${page}: ${err.message}. Stack: ${err.stack}`
    );
  } finally {
    if (completion && !reused) {
      writeCompletionToFile(completion, completionFileName); // `completions/${imageDirName}/Slide${slide}.json`
    }
  }
}

function getResponseFormat(mode) {
  if (mode === "single") {
    return zodResponseFormat(FlashcardExtraction, "flash_card_extraction");
  } else if (mode === "multiple") {
    return zodResponseFormat(
      ManyFlashCardExtractions,
      "many_flash_card_extraction"
    );
  } else {
    throw new Error("Invalid cardsPerSlide value.");
  }
}

async function writeCompletionToFile(completion, fileName) {
  const format = {
    id: completion.id,
    created: formatTime(new Date(completion.created * 1000)),
    model: completion.model,
    usage: completion?.usage?.total_tokens,
    choices: completion.choices,
  };
  const formattedData = JSON.stringify(format, null, 2);

  const outputDirName = path.dirname(fileName);

  await createDirIfMissing(outputDirName);

  // append the data to a file
  trackWrite(
    fsPromises
      .writeFile(fileName, formattedData, { flag: "a" })
      .catch(console.error)
  );
}

async function extractContentFromCompletion(
  completion,
  { pageNumber, pagePath }
) {
  const completionContent = completion?.choices?.[0]?.message?.content;
  if (!completionContent) {
    console.error(
      `No completion content found for page ${pageNumber} at ${pagePath}.`
    );
    return;
  }

  const customParser = (key, value) => {
    if (typeof value === "string") {
      return value.replace(/\n/g, "<br>"); // Re-add escaped newlines
    }
    return value;
  };
  const completionJSON = JSON.parse(completionContent, customParser);

  return completionJSON;
}

module.exports = {
  generateStructuredOutput,
  writeCompletionToFile,
  extractContentFromCompletion,
};
