You are tasked with analyzing and summarizing a medical text to create flashcards for a nursing student whose first language is not English. The goal is to generate clear, categorized flashcards that aid learning, and to make the information clear and easy to understand while preserving critical medical terminology to help them recognize and learn these terms. Follow these steps to create a structured response:

1. **Category**: Identify the topic or section (optional) to organize the flashcards by theme. Only provide one category ever.
2. **Front (Question)**:
   - Create a clear question or prompt based on the text.
   - It should summarize the main concept in a way that challenges the student to recall or understand the information.
3. **Back (Answer)**:
   - Provide a detailed yet simplified explanation of the answer.
   - Include medical terminology in parentheses after simpler terms to connect plain language to technical language.
   - Maintain as much detail as possible to support understanding.
   - Use formatting to make it easier to read the output. For example, using bullet points where it makes sense to do so.
   - Use valid html elements to format instead of using markdown syntax. This is extremely important to me. For example, use the "strong" html tag instead of using two asterisks for bold text. Another example, use the "br" tag instead of newlines.

**Format the response as JSON**:

```json
{
  "flashcard": {
    "category": "Topic or Section Name (optional, e.g., 'ABG Analysis')",
    "front": "The question or prompt for the front of the card.",
    "back": "The detailed explanation or answer for the back of the card."
  }
}
```

**Example Input**:
"Step 6: Analyze the pO2 and the O2 saturation. Efficiency of oxygenation can be assessed by examining PaO2 and SaO2. Oxygenation lower limit normal: PaO2 80 mmHg, SaO2 95%. Upper limit normal: PaO2 100 mmHg, SaO2 100%. The normal values for PaO2 are at sea level. PaO2 is the partial pressure of oxygen in arterial blood. PaO2 creates the gradient for oxygen diffusion from the alveoli into the blood and from the blood into the capillaries and tissue. If below normal, the patient is hypoxemic."

**Expected Output**:
\`\`\`json
{
"category": "ABG Analysis",
"back": "To check how well oxygen is working in the body (oxygenation efficiency), look at: PaO2 (partial pressure of oxygen in arterial blood): This measures the pressure of oxygen in the blood. Normal range: 80–100 mmHg. SaO2 (arterial oxygen saturation): This shows the percentage of oxygen bound to hemoglobin in the blood. Normal range: 95–100%. At sea level, PaO2 helps determine how oxygen moves from the lungs (alveoli) into the blood and from the blood into the body’s tissues. If PaO2 is below normal levels, the patient may not have enough oxygen in the blood, which is called hypoxemia.",
"front": "How do pO2 (PaO2) and oxygen saturation (SaO2) help measure oxygenation in the body, and what are their normal values?"
}
\`\`\`
