const OpenAI = require("openai");
require("dotenv").config();
const { z } = require("zod");
const { zodResponseFormat } = require("openai/helpers/zod");

// const { OpenAI } = require("openai");

// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });
const prompt1 = `**Prompt:**

You are tasked with analyzing and summarizing a medical text for a nursing student whose first language is not English. The goal is to make the information clear and easy to understand while preserving critical medical terminology to help them recognize and learn these terms. Follow these steps to create a structured response:

1. **Heading**: Create a title that captures the main focus of the text.

2. **Content**:
   - Rewrite the information from the text in simple, clear language.
   - Include medical terms in parentheses after simpler explanations to help the student connect common language with technical terminology.
   - Keep as much detail as possible while ensuring the explanation remains easy to follow.

3. **Question**: Create a question that summarizes the content of the text. The question should help the student reflect on the key points and check their understanding.

**Example Input**:
"Step 6: Analyze the pO2 and the O2 saturation. Efficiency of oxygenation can be assessed by examining PaO2 and SaO2. Oxygenation lower limit normal: PaO2 80 mmHg, SaO2 95%. Upper limit normal: PaO2 100 mmHg, SaO2 100%. The normal values for PaO2 are at sea level. PaO2 is the partial pressure of oxygen in arterial blood. PaO2 creates the gradient for oxygen diffusion from the alveoli into the blood and from the blood into the capillaries and tissue. If below normal, the patient is hypoxemic."

**Expected Output**:
### Heading::
Step 6: Analyze the pO2 and the O2 Saturation

### Content::
- To check how well oxygen is working in the body (oxygenation efficiency), look at:
  - **PaO2** (partial pressure of oxygen in arterial blood): This measures the pressure of oxygen in the blood.
    - Normal range: 80–100 mmHg.
  - **SaO2** (arterial oxygen saturation): This shows the percentage of oxygen bound to hemoglobin in the blood.
    - Normal range: 95–100%.
- At sea level, **PaO2** helps determine:
  - How oxygen moves from the lungs (alveoli) into the blood.
  - How oxygen moves from the blood into the body’s tissues.
- If **PaO2** is below normal levels, the patient may not have enough oxygen in the blood, which is called **hypoxemia**.

### Question::
How do pO2 (PaO2) and oxygen saturation (SaO2) help measure oxygenation in the body, and what are their normal values?`;
const prompt2 = `Here\’s the updated prompt that returns structured JSON as the output:

---

**Prompt:**

You are tasked with analyzing and summarizing a medical text for a nursing student whose first language is not English. The goal is to make the information clear and easy to understand while preserving critical medical terminology to help them recognize and learn these terms. Follow these steps to create a structured JSON response:

1. **Heading**: Provide a concise title that summarizes the main focus of the text.

2. **Content**:
   - Rewrite the text in simple, clear language.
   - Use parentheses to include medical terminology after simpler explanations to help the student connect common language with technical terms.
   - Include as much detail as possible while ensuring the explanation is easy to follow.

3. **Question**: Create a question summarizing the main content to help the student reflect on the key points and check their understanding.

**Format the response as JSON with the following structure**:
\`\`\`json
{
  "heading": "Provide the title or main focus here",
  "content": "Rewrite the content in simple and clear language, including medical terms in parentheses for clarity.",
  "question": "Create a question summarizing the content to check understanding."
}
\`\`\`

**Example Input**:
"Step 6: Analyze the pO2 and the O2 saturation. Efficiency of oxygenation can be assessed by examining PaO2 and SaO2. Oxygenation lower limit normal: PaO2 80 mmHg, SaO2 95%. Upper limit normal: PaO2 100 mmHg, SaO2 100%. The normal values for PaO2 are at sea level. PaO2 is the partial pressure of oxygen in arterial blood. PaO2 creates the gradient for oxygen diffusion from the alveoli into the blood and from the blood into the capillaries and tissue. If below normal, the patient is hypoxemic."

**Expected Output**:
\`\`\`json
{
  "heading": "Step 6: Analyze the pO2 and the O2 Saturation",
  "content": "To check how well oxygen is working in the body (oxygenation efficiency), look at: PaO2 (partial pressure of oxygen in arterial blood): This measures the pressure of oxygen in the blood. Normal range: 80–100 mmHg. SaO2 (arterial oxygen saturation): This shows the percentage of oxygen bound to hemoglobin in the blood. Normal range: 95–100%. At sea level, PaO2 helps determine how oxygen moves from the lungs (alveoli) into the blood and from the blood into the body’s tissues. If PaO2 is below normal levels, the patient may not have enough oxygen in the blood, which is called hypoxemia.",
  "question": "How do pO2 (PaO2) and oxygen saturation (SaO2) help measure oxygenation in the body, and what are their normal values?"
}
\`\`\`
`;

const FlashcardExtraction = z.object({
  front: z.string(),
  back: z.string(),
  category: z.array(z.string()),
});

// console.log(FlashcardExtraction);

async function generateStructuredOutput(userPrompt, systemPrompt) {
  const openai = new OpenAI();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: zodResponseFormat(
      FlashcardExtraction,
      "flash_card_extraction"
    ),
  });
  return completion;
}

module.exports = {
  generateStructuredOutput,
};
