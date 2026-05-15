import Link from 'next/link'
import type { ReactNode } from 'react'

type ArticleShellProps = {
  eyebrow: string
  title: ReactNode
  intro: ReactNode
  children: ReactNode
  readTime?: string
}

export function ArticleShell({ eyebrow, title, intro, children, readTime }: ArticleShellProps) {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16 lg:py-24">
      <header className="border-b border-hairline pb-10">
        <p className="text-mono-label text-slate">
          <span className="eyebrow-dot" />
          {eyebrow}
        </p>
        <h1 className="text-display-hero mt-6">{title}</h1>
        <p className="mt-6 text-body-lg text-slate">{intro}</p>
        {readTime ? (
          <p className="mt-6 text-mono-label text-slate">{readTime}</p>
        ) : null}
      </header>

      <div className="prose-editorial mt-12 space-y-12 text-ink">{children}</div>

      <footer className="mt-20 border-t border-hairline pt-10">
        <div className="card-stone">
          <p className="text-mono-label text-slate">Get started</p>
          <h2 className="mt-3 font-display text-3xl tracking-tight text-ink-black">
            Turn your gig income into a lender-ready report.
          </h2>
          <p className="mt-4 max-w-xl text-body text-slate">
            Connect your platforms, get an income consistency score, and share a verified report with
            lenders in minutes. No paper pay stubs. No screenshots. You control who sees what.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link href="/register" className="btn-primary">
              Get started free
            </Link>
            <Link href="/learn" className="link-editorial text-sm">
              Back to all guides →
            </Link>
          </div>
        </div>
      </footer>
    </article>
  )
}

export function H2({ children }: { children: ReactNode }) {
  return <h2 className="font-display text-3xl tracking-tight text-ink-black">{children}</h2>
}

export function P({ children }: { children: ReactNode }) {
  return <p className="mt-4 text-body text-slate">{children}</p>
}

export function UL({ children }: { children: ReactNode }) {
  return <ul className="mt-4 list-disc space-y-2 pl-6 text-body text-slate">{children}</ul>
}
