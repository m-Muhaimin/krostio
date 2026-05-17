import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas p-6 text-center">
      <div className="card-stadium max-w-md w-full">
        <h2 className="text-4xl font-medium tracking-tight mb-4">404</h2>
        <p className="text-ink/40 mb-8 font-medium">This page doesn&apos;t exist on Krostio.</p>
        <Link 
          href="/" 
          className="btn-ink inline-block"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
