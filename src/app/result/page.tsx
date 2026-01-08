import { Suspense } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Target, Percent } from 'lucide-react';
import ResultCard from '@/components/result-card';

function ResultsDisplay({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const totalQuestions = parseInt(searchParams?.totalQuestions as string) || 100;
  const attempted = parseInt(searchParams?.attempted as string) || 0;
  const correct = parseInt(searchParams?.correct as string) || 0;
  const wrong = parseInt(searchParams?.wrong as string) || 0;
  const score = parseInt(searchParams?.score as string) || 0;
  const percentage = parseFloat(searchParams?.percentage as string) || 0;

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
              {score}
              <span className="text-3xl text-primary/70"> / {totalQuestions}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
            <ResultCard
              icon={<Percent className="w-8 h-8 text-accent" />}
              label="Percentage"
              value={`${percentage}%`}
              color="text-accent"
            />
            <ResultCard
              icon={<Target className="w-8 h-8" style={{color: '#3b82f6'}} />}
              label="Attempted"
              value={`${attempted} / ${totalQuestions}`}
              color="text-blue-500"
            />
            <ResultCard
              icon={<CheckCircle className="w-8 h-8" style={{color: '#22c55e'}}/>}
              label="Correct"
              value={correct.toString()}
              color="text-green-500"
            />
            <ResultCard
              icon={<XCircle className="w-8 h-8" style={{color: '#ef4444'}} />}
              label="Wrong"
              value={wrong.toString()}
              color="text-red-500"
            />
          </div>
          
          <div className="mt-8 flex justify-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              <Link href="/">Take Another Test</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResultPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading results...</p>
      </div>
    }>
      <ResultsDisplay searchParams={searchParams} />
    </Suspense>
  )
}

// Add a loader component for better UX
function Loader2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
