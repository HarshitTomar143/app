import OMRSheet from '@/components/omr-sheet';

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary">
          Digital OMR Evaluation
        </h1>
        <p className="text-muted-foreground mt-3 text-lg max-w-2xl mx-auto">
          Mark your answers for the 100 questions below. Once you're finished, click the submit button to see your results.
        </p>
      </div>
      <OMRSheet />
    </main>
  );
}
