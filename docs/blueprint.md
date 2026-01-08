# **App Name**: OMR Eval

## Core Features:

- OMR Sheet UI: Display a 100-question OMR sheet with radio options A, B, C, D for each question. Only one option can be selected per question.
- Answer Submission: Submit the user's answers to a Next.js API route upon clicking the 'Submit' button.
- Evaluation API: Evaluate the submitted answers against a predefined answer key stored as JSON.
- Score Calculation: Calculate the total score, number of correct, incorrect, and attempted questions, and the overall percentage.
- Result Display: Display the calculated results on a dedicated result page with a clean and minimal UI.

## Style Guidelines:

- Primary color: Dark blue (#1E3A8A) for a professional and exam-like feel.
- Background color: Light gray (#F9FAFB) for a clean and neutral interface.
- Accent color: Orange (#EA580C) for highlighting important elements such as the submit button and result metrics.
- Body and headline font: 'Inter', sans-serif, for a modern, objective feel. This will provide readability and a clean aesthetic for both questions and results.
- Compact grid layout for the OMR sheet to resemble a real exam sheet. Ensure proper spacing and alignment for ease of use.
- Use a subtle loading animation while evaluating the answers to provide feedback to the user during the calculation process.