'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


type Answers = { [key: string]: string };

const questions = Array.from({ length: 100 }, (_, i) => i + 1);
const options = ['A', 'B', 'C', 'D'];

export default function OMRSheet() {
  const [answers, setAnswers] = useState<Answers>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const processSubmission = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(answers),
      });

      if (!response.ok) {
        throw new Error('Evaluation failed. Please try again.');
      }

      const results = await response.json();
      setIsSubmitted(true);

      const params = new URLSearchParams();
      for (const key in results) {
        params.append(key, results[key].toString());
      }
      
      router.push(`/result?${params.toString()}`);

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {questions.map((q) => (
          <Card key={q} className="shadow-sm hover:shadow-lg transition-shadow duration-300 bg-card border">
            <CardHeader className="flex-row items-center justify-between p-4">
              <CardTitle className="text-lg text-primary font-bold">Question {q}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <RadioGroup
                value={answers[q] || ''}
                onValueChange={(value) => handleAnswerChange(q.toString(), value)}
                disabled={isSubmitted || isSubmitting}
                className="flex space-x-6"
              >
                {options.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`q${q}-${option}`} aria-label={`Question ${q} Option ${option}`} className="w-5 h-5"/>
                    <Label htmlFor={`q${q}-${option}`} className="text-base">{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-10 flex justify-center">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold w-full max-w-sm text-lg py-6 rounded-full shadow-lg hover:shadow-xl transition-shadow"
              disabled={isSubmitting || isSubmitted}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Evaluating...
                </>
              ) : isSubmitted ? (
                'Submitted Successfully'
              ) : (
                'Submit & View Results'
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Submission</AlertDialogTitle>
              <AlertDialogDescription>
                You are about to submit your answers. This action cannot be undone. Are you sure you want to proceed?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={processSubmission} className="bg-primary hover:bg-primary/90">
                Confirm & Submit
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
