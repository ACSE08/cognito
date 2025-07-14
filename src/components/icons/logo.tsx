import { BookOpen, Lightbulb } from 'lucide-react';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <div className="relative">
        <BookOpen className="h-8 w-8 text-primary" />
        <Lightbulb className="absolute -top-2 -right-2 h-5 w-5 text-yellow-400" />
      </div>
      <h1 className="text-2xl font-bold font-headline text-primary">EduAI</h1>
    </div>
  );
}
