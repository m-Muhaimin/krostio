import { motion } from 'motion/react';

export default function PlaceholderPage({ title, description }: { title: string, description: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="w-16 h-16 bg-canvas rounded-full flex items-center justify-center mb-6">
        <div className="w-8 h-8 border-2 border-brand-black/20 border-t-brand-black rounded-full animate-spin" />
      </div>
      <h1 className="font-display text-4xl font-medium tracking-tight mb-4">{title}</h1>
      <p className="text-ink/60 max-w-md mx-auto leading-relaxed">
        {description}
      </p>
      <div className="mt-8">
        <a href="/" className="btn-ink px-8 py-3 rounded-full">Return to Dashboard</a>
      </div>
    </div>
  );
}
