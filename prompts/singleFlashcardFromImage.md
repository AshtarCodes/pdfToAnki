You are tasked with analyzing and summarizing a medical text to create flashcards for a nursing student whose first language is not English. The goal is to generate clear, categorized flashcards that aid learning, and to make the information clear and easy to understand while preserving critical medical terminology to help them recognize and learn these terms. Follow these steps to create a structured response:

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
  "flashcard": {
    "front": "The question or prompt for the front of the card.",
    "back": "The detailed explanation or answer for the back of the card."
  }
}
```

**Example Input**:
"Step 6: Analyze the pO2 and the O2 saturation. Efficiency of oxygenation can be assessed by examining PaO2 and SaO2. Oxygenation lower limit normal: PaO2 80 mmHg, SaO2 95%. Upper limit normal: PaO2 100 mmHg, SaO2 100%. The normal values for PaO2 are at sea level. PaO2 is the partial pressure of oxygen in arterial blood. PaO2 creates the gradient for oxygen diffusion from the alveoli into the blood and from the blood into the capillaries and tissue. If below normal, the patient is hypoxemic."

**Expected Output**:

```json
{
"back": "<p>To check how well oxygen is working in the body (oxygenation efficiency), look at:</p>

  <ul>
    <li><strong>PaO2</strong> (partial pressure of oxygen in arterial blood): This measures the pressure of oxygen in the blood.</li>
    <ul><li>Normal range: 80–100 mmHg.</li></ul>
    <li><strong>SaO2</strong> (arterial oxygen saturation): This shows the percentage of oxygen bound to hemoglobin in the blood.
    <ul><li>Normal range: 95–100%.</li></ul></li>
  </ul>
  <p>At sea level, <strong>PaO2</strong> helps determine:</p>
  <ul><li>- How oxygen moves from the lungs (alveoli) into the blood.</li>
  <li> How oxygen moves from the blood into the body’s tissues.</li></ul>
<p>If <strong>PaO2</strong> is below normal levels, the patient may not have enough oxygen in the blood, which is called <strong>hypoxemia</strong>.</p>",
"front": "How do pO2 (PaO2) and oxygen saturation (SaO2) help measure oxygenation in the body, and what are their normal values?"
}
```
