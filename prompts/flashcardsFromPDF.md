You are tasked with analyzing and summarizing a medical text to create flashcards for a nursing student whose first language is not English. The goal is to generate flashcards that aid learning, and to make the information clear and easy to understand while preserving critical medical terminology to help them recognize and learn these terms.

Given a body of text, create a few question and answer pairs that comprehensively cover the content provided. Follow these steps to create a structured response:

1. **Front (Question)**:
   - Create a clear question or prompt based on the text.
   - It should summarize the main concept in a way that challenges the student to recall or understand the information.
2. **Back (Answer)**:
   - Provide a detailed yet simplified explanation of the answer.
   - Include medical terminology in parentheses after simpler terms to connect plain language to technical language.
   - Maintain as much detail as possible to support understanding.
   - Use valid HTML elements to format the output and make it easier to read the output. This is extremely important to me. Examples include: 1. use the "strong" html tag for bold text. 2. use the "br" tag to put content on a new line.

**Format the response as JSON**:

```json
{
  "flashcards": [
    {
      "front": "The question or prompt for the front of the card.",
      "back": "The detailed explanation or answer for the back of the card."
    }
  ]
}
```

**Example Input**:
"Step 6: Analyze the pO2 and the O2 saturation. Efficiency of oxygenation can be assessed by examining PaO2 and SaO2. Oxygenation lower limit normal: PaO2 80 mmHg, SaO2 95%. Upper limit normal: PaO2 100 mmHg, SaO2 100%. The normal values for PaO2 are at sea level. PaO2 is the partial pressure of oxygen in arterial blood. PaO2 creates the gradient for oxygen diffusion from the alveoli into the blood and from the blood into the capillaries and tissue. If below normal, the patient is hypoxemic."

**Expected Output**:

```json
{
  "flashcards": [
    {
      "front": "What is PaO2 and why is it important?",
      "back": "<p><strong>PaO2</strong> (partial pressure of oxygen in arterial blood) measures the pressure of oxygen in the blood.</p> <p>It is important because it:</p> <ul><li>Creates the gradient for oxygen to move from the lungs (alveoli) into the blood.</li> <li>Helps oxygen transfer from blood into tissues.</li></ul> <p>Normal range: <strong>80–100 mmHg</strong>.</p>"
    },
    {
      "front": "What is SaO2, and what does it indicate about oxygenation?",
      "back": "<p><strong>SaO2</strong> (arterial oxygen saturation) shows the percentage of oxygen attached to hemoglobin in the blood.</p> <p>It helps assess how efficiently oxygen is being carried through the bloodstream.</p> <p>Normal range: <strong>95–100%</strong>.</p>"
    },
    {
      "front": "What do PaO2 and SaO2 levels indicate about oxygenation in the body?",
      "back": "<p>Both <strong>PaO2</strong> and <strong>SaO2</strong> are indicators of how well oxygen is moving through the body:</p> <ul><li><strong>PaO2</strong>: Measures the pressure of oxygen in the blood (Normal: 80–100 mmHg).</li> <li><strong>SaO2</strong>: Shows the percentage of hemoglobin carrying oxygen (Normal: 95–100%).</li></ul> <p>If these values are below normal, the patient may have <strong>hypoxemia</strong> (low oxygen levels in the blood).</p>"
    },
    {
      "front": "What are the normal values for PaO2 and SaO2, and what happens if they are below normal?",
      "back": "<p><strong>Normal values:</strong></p> <ul><li><strong>PaO2</strong>: 80–100 mmHg</li> <li><strong>SaO2</strong>: 95–100%</li></ul> <p>If below normal:</p> <ul><li><strong>PaO2</strong>: Indicates low oxygen in the blood, called <strong>hypoxemia</strong>.</li> <li><strong>SaO2</strong>: Suggests inadequate oxygen transport in the blood.</li></ul>"
    }
  ]
}
```
