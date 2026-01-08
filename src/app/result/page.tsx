
'use client';
import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Target, Percent } from 'lucide-react';
import ResultCard from '@/components/result-card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import PredictionForm from '@/components/prediction-form';
import { Loader2 } from 'lucide-react';

function ResultsDisplay() {
  const searchParams = useSearchParams();
  const [prompt, setPrompt] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [results, setResults] = useState({
    totalQuestions: 100,
    attempted: 0,
    correct: 0,
    wrong: 0,
    score: 0,
    percentage: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const totalQuestions = parseInt(searchParams.get('totalQuestions') || '100');
    const attempted = parseInt(searchParams.get('attempted') || '0');
    const correct = parseInt(searchParams.get('correct') || '0');
    const wrong = parseInt(searchParams.get('wrong') || '0');
    const score = parseInt(searchParams.get('score') || '0');
    const percentage = parseFloat(searchParams.get('percentage') || '0');
    
    setResults({ totalQuestions, attempted, correct, wrong, score, percentage });
    setIsLoading(false);
  }, [searchParams]);

  const handleFormSubmit = (data: any) => {
    const generatedPrompt = `
As an expert career counselor and college admissions advisor, please analyze the following student profile and provide a detailed report on their potential college admission prospects and expected rank.

**Student Profile:**
- **Name:** ${data.name}
- **Exam Score:** ${results.score} out of ${results.totalQuestions} (${results.percentage}%)
- **Gender:** ${data.gender}
- **Category:** ${data.category}
- **State of Domicile:** ${data.state}
- **Disability Status (PwD):** ${data.pwd === 'yes' ? 'Yes' : 'No'}

**Analysis Required:**
1.  **Expected Rank Range:** Based on the score, category, and other details, estimate a realistic rank range (e.g., 5,000-7,000).
2.  **College Admission Possibilities:**
    *   List top-tier, mid-tier, and safety colleges this student could realistically target.
    *   Mention specific branches or courses where they might have a better chance.
3.  **Strengths and Weaknesses:** Briefly analyze their score. Is it competitive for their category?
4.  **Strategic Advice:** Provide actionable advice on the next steps, such as which college counseling portals to watch, document preparation, and any state-specific advantages they might have.

Please provide a comprehensive and encouraging response to help the student and their family make informed decisions.
`;
    setPrompt(generatedPrompt);
    setIsFormOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading results...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-2xl shadow-2xl animate-in fade-in-50 zoom-in-95">
        <CardHeader className="text-center border-b pb-6">
          <CardTitle className="text-4xl font-extrabold text-primary">Your Exam Result</CardTitle>
          <CardDescription className="text-lg mt-2 text-muted-foreground">
            Here's a summary of your performance.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <div className="text-center p-6 bg-primary/5 rounded-lg mb-8">
            <h3 className="text-xl font-semibold text-primary/80">Total Score</h3>
            <p className="text-6xl font-bold text-accent mt-1">
              {results.score}
              <span className="text-3xl text-primary/70"> / {results.totalQuestions}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
            <ResultCard
              icon={<Percent className="w-8 h-8 text-accent" />}
              label="Percentage"
              value={`${results.percentage}%`}
              color="text-accent"
            />
            <ResultCard
              icon={<Target className="w-8 h-8" style={{color: '#3b82f6'}} />}
              label="Attempted"
              value={`${results.attempted} / ${results.totalQuestions}`}
              color="text-blue-500"
            />
            <ResultCard
              icon={<CheckCircle className="w-8 h-8" style={{color: '#22c55e'}}/>}
              label="Correct"
              value={results.correct.toString()}
              color="text-green-500"
            />
            <ResultCard
              icon={<XCircle className="w-8 h-8" style={{color: '#ef4444'}} />}
              label="Wrong"
              value={results.wrong.toString()}
              color="text-red-500"
            />
          </div>
          
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              <Link href="/">Take Another Test</Link>
            </Button>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button size="lg" variant="outline">Predict Rank and Possibilities</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Provide Your Details</DialogTitle>
                </DialogHeader>
                <PredictionForm onSubmit={handleFormSubmit} />
              </DialogContent>
            </Dialog>
          </div>

          {prompt && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Generated Prompt for AI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans">{prompt}</pre>
              </CardContent>
            </Card>
          )}

        </CardContent>
      </Card>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading results...</p>
      </div>
    }>
      <ResultsDisplay />
    </Suspense>
  )
}
