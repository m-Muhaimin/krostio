import Link from 'next/link';
import { getBlogPost, getAllSlugs } from '../_data/posts';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPost(params.slug);

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 md:py-28 text-center">
        <p className="text-mono-label text-ink/30 mb-4">BLOG</p>
        <h1 className="font-display text-3xl font-medium tracking-tight text-ink mb-4">
          Post coming soon
        </h1>
        <p className="text-body text-ink/50 max-w-md mx-auto">
          We&rsquo;re working on something great. This article will be published soon.
          Check back later or{' '}
          <a href="mailto:hello@krostio.com" className="link-editorial">subscribe</a> for updates.
        </p>
        <Link href="/blog" className="btn-primary mt-8 inline-flex">
          ← Back to blog
        </Link>
      </div>
    );
  }

  // Render body with simple paragraph splitting
  const bodyHtml = post.body
    .split('\n\n')
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      if (block.startsWith('### ')) {
        return `<h3 class="font-display text-lg md:text-xl font-medium tracking-tight text-ink mt-8 mb-3 leading-[1.2]">${block.replace(/^### /, '')}</h3>`;
      }
      if (block.startsWith('## ')) {
        return `<h2 class="font-display text-xl md:text-2xl font-medium tracking-tight text-ink mt-10 mb-4 leading-[1.15]">${block.replace(/^## /, '')}</h2>`;
      }
      if (block.startsWith('**') && block.endsWith('**')) {
        return `<p class="font-semibold text-ink mt-6 mb-2">${block.replace(/^\*\*/, '').replace(/\*\*$/, '')}</p>`;
      }
      if (block.startsWith('- ')) {
        const items = block.split('\n').map((l) => l.replace(/^- /, ''));
        return `<ul class="list-disc pl-6 space-y-1.5 my-4 text-ink/70">${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
      }
      if (/^\d+\. /.test(block)) {
        const items = block.split('\n').map((l) => l.replace(/^\d+\. /, ''));
        return `<ol class="list-decimal pl-6 space-y-1.5 my-4 text-ink/70">${items.map((i) => `<li>${i}</li>`).join('')}</ol>`;
      }
      if (block.startsWith('*') && block.endsWith('*')) {
        return `<p class="text-caption text-ink/40 italic mt-6">${block.replace(/^\*/, '').replace(/\*$/, '')}</p>`;
      }
      return `<p class="text-body text-ink/70 leading-relaxed mb-4">${block}</p>`;
    })
    .join('');

  return (
    <article className="max-w-3xl mx-auto px-6 py-20 md:py-28">
      {/* Back link */}
      <Link
        href="/blog"
        className="text-sm font-medium text-ink/40 hover:text-ink transition-colors inline-flex items-center gap-1 mb-10"
      >
        <span className="text-lg leading-none">←</span> Back to blog
      </Link>

      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-3 text-micro text-ink/40 mb-4">
          <span>{post.date}</span>
          <span className="w-1 h-1 rounded-full bg-ink/20" />
          <span>{post.readingTime}</span>
          <span className="w-1 h-1 rounded-full bg-ink/20" />
          <span>{post.author}</span>
        </div>
        <h1 className="font-display text-[clamp(28px,5vw,48px)] font-medium tracking-tight leading-[1.05] text-ink">
          {post.title}
        </h1>
        <p className="text-body-lg text-ink/50 mt-4 leading-relaxed">
          {post.description}
        </p>
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-6">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-micro text-ink/40 bg-ink/5 px-3 py-1 rounded-cohere-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </header>

      {/* Body */}
      <div
        className="prose-custom"
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />

      {/* Footer */}
      <div className="rule-hairline mt-16 pt-8">
        <p className="text-caption text-ink/40">
          *Krostio is not a credit bureau, lender, or financial institution. Krost Scores are informational only and not a guarantee of credit approval.*
        </p>
      </div>
    </article>
  );
}
