'use client';

import { useMemo, useState } from 'react';
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
} from "@/components/ui/alert-dialog";
import { useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import type { ExamSection } from '@/lib/types';
import { answerKey } from '@/data/answerKey';


type Answers = { [key: string]: string };
const options = ['A', 'B', 'C', 'D'];

interface OMRSheetProps {
    sections: ExamSection[];
}

export default function OMRSheet({ sections }: OMRSheetProps) {
  const [answers, setAnswers] = useState<Answers>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const questionsPerSection = useMemo(() => {
    return sections.reduce((acc, section) => {
      acc[section.id] = Array.from({ length: section.questionCount }, (_, i) => i + 1);
      return acc;
    }, {} as Record<string, number[]>);
  }, [sections]);

  const totalQuestions = useMemo(() => {
    return sections.reduce((total, section) => total + section.questionCount, 0);
  }, [sections]);


  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const processSubmission = async () => {
    if (!firestore) return;
    setIsSubmitting(true);

    try {
      // Evaluation logic
      let correct = 0;
      const attemptedKeys = Object.keys(answers);
      const attempted = attemptedKeys.length;

      for (const questionCompositeKey of attemptedKeys) {
        const [sectionId, questionNumStr] = questionCompositeKey.split('-');
        let questionBaseIndex = 0;
        
        for (const sec of sections) {
          if (sec.id === sectionId) break;
          questionBaseIndex += sec.questionCount;
        }
        
        const globalQuestionIndex = questionBaseIndex + parseInt(questionNumStr, 10);
        
        if (answerKey[globalQuestionIndex] === answers[questionCompositeKey]) {
          correct++;
        }
      }

      const wrong = attempted - correct;
      const score = correct; // Assuming 1 point per correct answer
      const percentage = totalQuestions > 0 ? (correct / totalQuestions) * 100 : 0;

      const results = {
        totalQuestions,
        attempted,
        correct,
        wrong,
        score,
        percentage,
      };

      const submissionData = {
        answers: JSON.stringify(answers),
        submittedAt: serverTimestamp(),
        score,
        correctCount: correct,
        incorrectCount: wrong,
        attemptedCount: attempted,
        percentage,
      };

      const submissionsCollection = collection(firestore, 'submissions');
      await addDocumentNonBlocking(submissionsCollection, submissionData);
      
      const params = new URLSearchParams();
      Object.entries(results).forEach(([key, value]) => {
        params.append(key, value.toString());
      });
      
      router.push(`/result?${params.toString()}`);

    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred during submission.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  if (!sections || sections.length === 0) {
    return (
        <div className="text-center p-10 bg-secondary/30 rounded-lg">
            <h2 className="text-2xl font-semibold text-primary">No Exam Found</h2>
            <p className="text-muted-foreground mt-2">
                It looks like no exam sections have been configured. Please visit the admin panel to set up the exam.
            </p>
            <Button asChild className="mt-6">
                <a href="/admin">Go to Admin Panel</a>
            </Button>
        </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {sections.map(section => (
          <div key={section.id}>
            <h2 className="text-2xl font-bold tracking-tight text-primary mb-4">{section.name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {questionsPerSection[section.id]?.map((q) => (
                <Card key={`${section.id}-${q}`} className="shadow-sm hover:shadow-lg transition-shadow duration-300 bg-card border">
                  <CardHeader className="flex-row items-center justify-between p-4">
                    <CardTitle className="text-lg text-primary font-bold">Question {q}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <RadioGroup
                      value={answers[`${section.id}-${q}`] || ''}
                      onValueChange={(value) => handleAnswerChange(`${section.id}-${q}`, value)}
                      disabled={isSubmitting}
                      className="flex space-x-6"
                    >
                      {options.map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`q${section.id}-${q}-${option}`} aria-label={`Question ${q} Option ${option}`} className="w-5 h-5"/>
                          <Label htmlFor={`q${section.id}-${q}-${option}`} className="text-base">{option}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold w-full max-w-sm text-lg py-6 rounded-full shadow-lg hover:shadow-xl transition-shadow"
              disabled={isSubmitting || Object.keys(answers).length === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Evaluating...
                </>
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
