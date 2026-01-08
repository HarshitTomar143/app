import OMRSheet from '@/components/omr-sheet';

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-headline text-primary">
          Digital OMR Sheet
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Select your answers for the 100 questions below and click submit when you're done.
        </p>
      </div>
      <OMRSheet />
    </main>
  );
}
