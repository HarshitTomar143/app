import { NextResponse } from 'next/server';
import { answerKey } from '@/data/answerKey';

export async function POST(req: Request) {
  try {
    const userAnswers: { [key: string]: string } = await req.json();

    const totalQuestions = Object.keys(answerKey).length;
    let correct = 0;
    let attempted = 0;
    
    const attemptedKeys = Object.keys(userAnswers);
    attempted = attemptedKeys.length;

    for (const questionId of attemptedKeys) {
      if (answerKey[parseInt(questionId)] === userAnswers[questionId]) {
        correct++;
      }
    }

    const wrong = attempted - correct;
    const score = correct;
    const percentage = totalQuestions > 0 ? (correct / totalQuestions) * 100 : 0;

    const results = {
      totalQuestions,
      attempted,
      correct,
      wrong,
      score,
      percentage: percentage.toFixed(2),
    };

    // Simulate network delay for loading state
    await new Promise(resolve => setTimeout(resolve, 1500));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Evaluation error:", error);
    return NextResponse.json({ message: 'Error evaluating answers' }, { status: 500 });
  }
}
