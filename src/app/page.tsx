'use client';
import { useState } from 'react';
import Link from 'next/link';
import OMRSheet from '@/components/omr-sheet';
import { useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import type { ExamConfig, ExamSection } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, Layers } from 'lucide-react';


export default function HomePage() {
    const [userChoice, setUserChoice] = useState<'single' | 'multi' | null>(null);
    const firestore = useFirestore();

    const configDocRef = useMemoFirebase(
      () => (firestore ? doc(firestore, 'examConfig', 'main') : null),
      [firestore]
    );
    const { data: examConfig, isLoading: isLoadingConfig } = useDoc<ExamConfig>(configDocRef);

    const sectionsQuery = useMemoFirebase(
        () => (firestore ? query(collection(firestore, 'examSections'), orderBy('order')) : null),
        [firestore]
    );
    const { data: sections, isLoading: isLoadingSections } = useCollection<ExamSection>(sectionsQuery);
    
    // Determine the final exam type based on admin config and user's choice
    const examType = examConfig?.activeExamType;

    if (isLoadingConfig || isLoadingSections) {
        return (
          <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-lg text-muted-foreground">Loading Exam Configuration...</p>
          </div>
        );
    }
    
    if (!examConfig) {
        return (
             <main className="container mx-auto px-4 py-12 text-center">
                <Card className="max-w-lg mx-auto">
                    <CardHeader>
                        <CardTitle className="text-destructive">Configuration Missing</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-6">The exam has not been configured yet. Please visit the admin panel to set it up.</p>
                        <Button asChild>
                            <Link href="/admin">Go to Admin Panel</Link>
                        </Button>
                    </CardContent>
                </Card>
            </main>
        )
    }
    
    // Render the OMR page if a specific exam type has been resolved by user choice or admin setting
    const resolvedExamType = userChoice || (examType !== 'choice' ? examType : null);

    if (resolvedExamType === 'single') {
        const singleSection: ExamSection[] = [{
            id: 'single',
            name: 'OMR Exam',
            questionCount: examConfig.singleSectionQuestionCount,
            order: 1,
        }];
        return <OMRPage sections={singleSection} />;
    }

    if (resolvedExamType === 'multi') {
        if (!sections || sections.length === 0) {
             return (
                <main className="container mx-auto px-4 py-12 text-center">
                    <Card className="max-w-lg mx-auto">
                        <CardHeader>
                            <CardTitle>No Sections Found</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-6">The multi-section exam is active, but no sections have been added. Please configure them in the admin panel.</p>
                            <Button asChild>
                                <Link href="/admin">Go to Admin Panel</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </main>
            );
        }
        return <OMRPage sections={sections} />;
    }

    // Default to the choice screen if activeExamType is 'choice' and user hasn't chosen
    return (
        <main className="container mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary">
                Choose Your Exam
                </h1>
                <p className="text-muted-foreground mt-3 text-lg max-w-2xl mx-auto">
                Select the type of exam you would like to take.
                </p>
            </div>
            <div className="flex flex-col md:flex-row justify-center items-center gap-8">
                <Card className="w-full max-w-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                    <CardHeader className="text-center">
                        <FileText className="w-12 h-12 mx-auto text-primary"/>
                        <CardTitle className="mt-4">Single Section Exam</CardTitle>
                        <CardDescription>An exam with {examConfig.singleSectionQuestionCount} questions in one continuous section.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <Button size="lg" onClick={() => setUserChoice('single')}>
                            Start Single Section Exam
                        </Button>
                    </CardContent>
                </Card>

                <Card className="w-full max-w-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                    <CardHeader className="text-center">
                        <Layers className="w-12 h-12 mx-auto text-accent"/>
                        <CardTitle className="mt-4">Multi-Section Exam</CardTitle>
                        <CardDescription>An exam divided into multiple timed sections based on subjects.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                         <Button size="lg" onClick={() => setUserChoice('multi')} disabled={!sections || sections.length === 0} variant="secondary">
                            Start Multi-Section Exam
                        </Button>
                        {(!sections || sections.length === 0) && (
                            <p className="text-xs text-muted-foreground mt-2">Not available. Please add sections in admin panel.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
             <div className='text-center p-4 mt-8'>
                <Button variant="link" asChild>
                    <Link href="/admin">Go to Admin Panel</Link>
                </Button>
            </div>
        </main>
    );
}

function OMRPage({ sections }: { sections: ExamSection[] }) {
    const totalQuestions = sections.reduce((acc, sec) => acc + sec.questionCount, 0);
    return (
        <main className="container mx-auto px-4 py-12">
            <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary">
                Digital OMR Evaluation
                </h1>
                <p className="text-muted-foreground mt-3 text-lg max-w-2xl mx-auto">
                Mark your answers for the {totalQuestions} questions below. Once you're finished, click the submit button to see your results.
                </p>
            </div>
            <OMRSheet sections={sections} />
        </main>
    );
}
