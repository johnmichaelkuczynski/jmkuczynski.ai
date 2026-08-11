import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="font-serif text-8xl text-primary mb-2">404</h1>
        <h2 className="font-serif text-3xl text-foreground">Record Not Found</h2>
        <p className="text-muted-foreground leading-relaxed">
          The dossier you are looking for does not exist or has been removed from the archives.
        </p>
        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium uppercase tracking-wider text-sm transition-colors hover:bg-primary/90 rounded-none border border-primary">
          <ArrowLeft className="w-4 h-4" /> Return to Dossier
        </Link>
      </div>
    </div>
  );
}
