import Link from 'next/link';
import { getBlogPosts } from './_data/posts';

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <>
      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 md:pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-mono-label text-ink/30 mb-3">BLOG</p>
          <h1 className="font-display text-[clamp(36px,7vw,68px)] font-medium tracking-tight leading-[1.02]">
            Stories from the gig economy
          </h1>
          <p className="text-body-lg text-ink/60 mt-5 max-w-xl mx-auto leading-relaxed">
            Insights on gig worker financial identity, income verification, and the
            future of work — from the team building the infrastructure.
          </p>
        </div>
      </section>

      {/* ── Posts grid ── */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="card-cohere p-6 md:p-8 flex flex-col hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-center gap-3 text-micro text-ink/40 mb-4">
                <span>{post.date}</span>
                <span className="w-1 h-1 rounded-full bg-ink/20" />
                <span>{post.readingTime}</span>
              </div>
              <h2 className="font-display text-xl md:text-2xl font-medium tracking-tight text-ink group-hover:text-coral transition-colors leading-[1.15]">
                {post.title}
              </h2>
              <p className="text-caption text-ink/60 mt-3 leading-relaxed flex-1">
                {post.excerpt}
              </p>
              <div className="flex items-center gap-2 mt-5 text-sm font-medium text-ink/50 group-hover:text-ink transition-colors">
                Read article
                <span className="text-lg leading-none transition-transform group-hover:translate-x-1">→</span>
              </div>
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-body text-ink/40">No posts yet. Check back soon.</p>
          </div>
        )}
      </section>

      {/* ── Subscribe CTA ── */}
      <section className="bg-brand-black text-white py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-mono-label text-white/40 mb-4">STAY UPDATED</p>
          <h2 className="font-display text-[clamp(28px,5vw,48px)] font-medium tracking-tight leading-[1.05]">
            Never miss a story
          </h2>
          <p className="text-body-lg text-white/60 mt-5 max-w-lg mx-auto">
            Get the latest on gig economy financial identity, product updates, and
            industry insights delivered to your inbox.
          </p>
          <div className="mt-10 max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="you@email.com"
              className="input-pill flex-1 !bg-white/10 !text-white !border-white/20 placeholder:!text-white/40"
              readOnly
            />
            <a
              href="mailto:hello@krostio.com?subject=Subscribe me to the blog"
              className="btn-primary bg-white text-brand-black hover:opacity-90 !px-6 !py-3"
            >
              Subscribe
            </a>
          </div>
          <p className="text-micro text-white/30 mt-4">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </section>
    </>
  );
}
