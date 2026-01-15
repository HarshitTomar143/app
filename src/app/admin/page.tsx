'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm, useForm as useSingleSectionForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  useAuth,
  useUser,
  useFirestore,
  useCollection,
  useDoc,
  addDocumentNonBlocking,
  setDocumentNonBlocking,
  initiateAnonymousSignIn,
  useMemoFirebase,
} from '@/firebase';
import { collection, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Trash2, Settings } from 'lucide-react';
import type { ExamSection, ExamConfig } from '@/lib/types';
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
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


const multiSectionFormSchema = z.object({
  name: z.string().min(3, { message: 'Section name is required.' }),
  questionCount: z.coerce
    .number()
    .min(1, { message: 'Must have at least 1 question.' }),
});

const singleSectionFormSchema = z.object({
    singleSectionQuestionCount: z.coerce.number().min(1, { message: 'Must have at least 1 question.' }),
    activeExamType: z.enum(['single', 'multi', 'choice']),
    numberOfSets: z.coerce.number().min(1, { message: 'Must have at least 1 set.' }),
});


export default function AdminPage() {
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfigSubmitting, setIsConfigSubmitting] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);
  
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

  const multiSectionForm = useForm<z.infer<typeof multiSectionFormSchema>>({
    resolver: zodResolver(multiSectionFormSchema),
    defaultValues: {
      name: '',
      questionCount: 25,
    },
  });

  const singleSectionForm = useSingleSectionForm<z.infer<typeof singleSectionFormSchema>>({
    resolver: zodResolver(singleSectionFormSchema),
    defaultValues: {
        singleSectionQuestionCount: 100,
        activeExamType: 'choice',
        numberOfSets: 3,
    }
  });

  useEffect(() => {
    if (examConfig) {
      singleSectionForm.reset({
        singleSectionQuestionCount: examConfig.singleSectionQuestionCount || 100,
        activeExamType: examConfig.activeExamType || 'choice',
        numberOfSets: examConfig.numberOfSets || 3,
      });
    }
  }, [examConfig, singleSectionForm]);


  const onMultiSectionSubmit = async (values: z.infer<typeof multiSectionFormSchema>) => {
    if (!firestore) return;
    setIsSubmitting(true);

    try {
      const newOrder = sections ? sections.length + 1 : 1;
      const sectionData: Omit<ExamSection, 'id'> = {
        name: values.name,
        questionCount: values.questionCount,
        order: newOrder,
      };

      const sectionsCollection = collection(firestore, 'examSections');
      await addDocumentNonBlocking(sectionsCollection, sectionData);

      toast({
        title: 'Success',
        description: `Section "${values.name}" has been added.`,
      });
      multiSectionForm.reset();
    } catch (error) {
      console.error('Error adding section: ', error);
      toast({
        title: 'Error',
        description: 'Could not add the section. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const onSingleSectionSubmit = async (values: z.infer<typeof singleSectionFormSchema>) => {
    if (!firestore || !configDocRef) return;
    setIsConfigSubmitting(true);

    try {
      const configData: Omit<ExamConfig, 'id'> = {
        singleSectionQuestionCount: values.singleSectionQuestionCount,
        activeExamType: values.activeExamType,
        numberOfSets: values.numberOfSets,
      };

      await setDocumentNonBlocking(configDocRef, configData, { merge: true });

      toast({
        title: 'Success',
        description: 'Exam configuration has been updated.',
      });
    } catch (error) {
      console.error('Error updating config: ', error);
      toast({
        title: 'Error',
        description: 'Could not update the configuration. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsConfigSubmitting(false);
    }
  };


  const handleDeleteSection = async (sectionId: string, sectionName: string) => {
    if (!firestore) return;

    try {
      const sectionRef = doc(firestore, 'examSections', sectionId);
      await deleteDoc(sectionRef); 
      toast({
        title: 'Success',
        description: `Section "${sectionName}" has been deleted.`,
      });
    } catch (error) {
      console.error('Error deleting section: ', error);
      toast({
        title: 'Error',
        description: 'Could not delete the section. Please try again.',
        variant: 'destructive',
      });
    }
  };


  if (isUserLoading || isLoadingConfig) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary">
          Admin Panel
        </h1>
        <p className="text-muted-foreground mt-3 text-lg max-w-2xl mx-auto">
          Manage exam settings, sections, and questions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-10">
            <Card>
            <CardHeader>
                <CardTitle>Multi-Section Exam</CardTitle>
                <CardDescription>Add or remove sections for the multi-part exam.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...multiSectionForm}>
                <form onSubmit={multiSectionForm.handleSubmit(onMultiSectionSubmit)} className="space-y-4">
                    <FormField
                    control={multiSectionForm.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Section Name</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Physics" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={multiSectionForm.control}
                    name="questionCount"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Number of Questions</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="e.g., 25" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" className="w-full" disabled={isSubmitting || !user}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Section
                    </Button>
                </form>
                </Form>
            </CardContent>
            </Card>
            <Card>
            <CardHeader>
                <CardTitle>Existing Sections</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoadingSections ? (
                <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
                ) : sections && sections.length > 0 ? (
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Questions</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {sections.map((section) => (
                        <TableRow key={section.id}>
                        <TableCell>{section.order}</TableCell>
                        <TableCell className="font-medium">{section.name}</TableCell>
                        <TableCell>{section.questionCount}</TableCell>
                        <TableCell className="text-right">
                            <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete the "{section.name}" section. This action cannot be undone.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    className="bg-destructive hover:bg-destructive/90"
                                    onClick={() => handleDeleteSection(section.id, section.name)}
                                >
                                    Delete
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                ) : (
                <p className="text-muted-foreground">No sections added yet.</p>
                )}
            </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
             <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'><Settings className='w-6 h-6' /> Global Exam Settings</CardTitle>
                    <CardDescription>Configure the single-section exam and choose the default mode for users.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...singleSectionForm}>
                    <form onSubmit={singleSectionForm.handleSubmit(onSingleSectionSubmit)} className="space-y-6">
                         <FormField
                            control={singleSectionForm.control}
                            name="activeExamType"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Active Exam for Users</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an exam type" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="choice">Let User Choose</SelectItem>
                                        <SelectItem value="single">Single Section Only</SelectItem>
                                        <SelectItem value="multi">Multi-Section Only</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={singleSectionForm.control}
                            name="singleSectionQuestionCount"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Single-Section Question Count</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="e.g., 100" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={singleSectionForm.control}
                            name="numberOfSets"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Number of Question Sets</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="e.g., 3" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isConfigSubmitting || !user}>
                        {isConfigSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Configuration
                        </Button>
                    </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
      </div>
    </main>
  );
}
