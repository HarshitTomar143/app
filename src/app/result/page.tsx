'use client';
import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Target, Percent, Award } from 'lucide-react';
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
    const generatedPrompt = `As an expert career counselor and college admissions advisor, please analyze the following student profile and provide a detailed report on their potential college admission prospects and expected rank.

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

Please provide a comprehensive and encouraging response to help the student and their family make informed decisions.`;
    setPrompt(generatedPrompt);
    setIsFormOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-4 text-xl text-muted-foreground">Calculating Results...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-3xl shadow-xl animate-in fade-in-50 zoom-in-95 bg-card">
        <CardHeader className="text-center border-b pb-6 bg-secondary/30 rounded-t-lg">
           <Award className="w-16 h-16 mx-auto text-accent" />
          <CardTitle className="text-4xl font-extrabold text-primary mt-2">Exam Results</CardTitle>
          <CardDescription className="text-lg mt-2 text-muted-foreground">
            A detailed summary of your performance.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <div className="text-center p-6 bg-primary/5 rounded-xl mb-8 border border-primary/10">
            <h3 className="text-lg font-semibold text-primary/80">Your Score</h3>
            <p className="text-7xl font-bold text-primary mt-2">
              {results.score}
              <span className="text-4xl text-muted-foreground"> / {results.totalQuestions}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <ResultCard
              icon={<Percent className="w-8 h-8 text-indigo-500" />}
              label="Percentage"
              value={`${results.percentage}%`}
              color="text-indigo-500"
            />
            <ResultCard
              icon={<Target className="w-8 h-8 text-sky-500" />}
              label="Attempted"
              value={`${results.attempted}`}
              color="text-sky-500"
            />
            <ResultCard
              icon={<CheckCircle className="w-8 h-8 text-emerald-500" />}
              label="Correct"
              value={results.correct.toString()}
              color="text-emerald-500"
            />
            <ResultCard
              icon={<XCircle className="w-8 h-8 text-rose-500" />}
              label="Wrong"
              value={results.wrong.toString()}
              color="text-rose-500"
            />
          </div>
          
          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button asChild size="lg" className="font-semibold w-full sm:w-auto">
              <Link href="/">Take Another Test</Link>
            </Button>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button size="lg" variant="outline" className="font-semibold w-full sm:w-auto border-primary/50 text-primary hover:bg-primary/5">Predict My Rank</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Enter Your Details for Analysis</DialogTitle>
                </DialogHeader>
                <PredictionForm onSubmit={handleFormSubmit} />
              </DialogContent>
            </Dialog>
          </div>

          {prompt && (
            <Card className="mt-10 bg-secondary/30">
              <CardHeader>
                <CardTitle>Generated AI Prompt</CardTitle>
                <CardDescription>Use this prompt with any AI assistant for a detailed analysis.</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-background p-4 rounded-md border text-muted-foreground whitespace-pre-wrap font-sans">{prompt}</pre>
              </CardContent>
            </Card>
          )}

        </CardContent>
      </Card>
      <footer className='text-center p-4 mt-8'>
        <p className='text-muted-foreground text-sm'>Powered by Digital OMR</p>
      </footer>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-4 text-xl text-muted-foreground">Loading...</p>
      </div>
    }>
      <ResultsDisplay />
    </Suspense>
  )
}
