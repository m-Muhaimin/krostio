import Link from 'next/link';

const teamMembers = [
  { initials: 'AK', name: 'Alex Kim', role: 'CEO & Co-Founder' },
  { initials: 'SR', name: 'Sarah Reyes', role: 'CTO & Co-Founder' },
  { initials: 'MJ', name: 'Marcus Johnson', role: 'Head of Product' },
  { initials: 'LT', name: 'Lena Torres', role: 'Head of Engineering' },
  { initials: 'DP', name: 'David Park', role: 'Head of Design' },
  { initials: 'CW', name: 'Chloe Wu', role: 'Head of Growth' },
];

export default function AboutPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 md:pb-36">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-mono-label text-ink/40 mb-5 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-coral inline-block" />
            About Krostio
          </p>
          <h1 className="font-display text-[clamp(36px,7vw,68px)] font-medium tracking-tight leading-[1.02]">
            Financial identity for the gig economy
          </h1>
          <p className="text-body-lg text-ink/60 mt-6 max-w-2xl mx-auto leading-relaxed">
            We're building the infrastructure that lets gig workers own, control, and share
            their earnings data — turning fragmented platform income into a portable
            financial identity.
          </p>
        </div>

        {/* Stats band */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="card-cohere p-6 text-center">
            <p className="font-display text-3xl font-medium tracking-tight text-ink">64M+</p>
            <p className="text-caption text-ink/50 mt-1">US gig workers</p>
          </div>
          <div className="card-cohere p-6 text-center">
            <p className="font-display text-3xl font-medium tracking-tight text-ink">$1.2T</p>
            <p className="text-caption text-ink/50 mt-1">Annual gig earnings</p>
          </div>
          <div className="card-cohere p-6 text-center">
            <p className="font-display text-3xl font-medium tracking-tight text-ink">8+</p>
            <p className="text-caption text-ink/50 mt-1">Platforms supported</p>
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="bg-soft-stone py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-mono-label text-ink/30 mb-3">OUR MISSION</p>
            <blockquote className="font-display text-[clamp(24px,4vw,40px)] font-medium tracking-tight leading-[1.15] text-ink">
              &ldquo;We believe gig income is real income. The system hasn't caught up yet.&rdquo;
            </blockquote>
            <p className="text-body text-ink/60 mt-8 leading-relaxed">
              For decades, financial infrastructure has been built around a single assumption:
              that everyone has a W-2 employer. That assumption excludes 64 million Americans
              who earn through gig platforms. Krostio was founded to close that gap — giving
              gig workers the same access to credit, housing, and financial opportunity as
              traditional employees.
            </p>
          </div>
        </div>
      </section>

      {/* ── How it started / How it's going ── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-mono-label text-ink/30 mb-3">OUR STORY</p>
            <h2 className="font-display text-[clamp(28px,5vw,48px)] font-medium tracking-tight leading-[1.05]">
              How it started / How it's going
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="card-cohere p-8">
              <div className="w-10 h-10 rounded-cohere-sm bg-coral/20 text-coral flex items-center justify-center font-display text-lg font-medium mb-5">
                ①
              </div>
              <h3 className="font-display text-xl font-medium tracking-tight mb-3">
                How it started
              </h3>
              <p className="text-body text-ink/60 leading-relaxed">
                Our co-founders met at a fintech hackathon in 2024. One had been denied a
                car loan despite earning $80K/year across Uber and DoorDash. The other had
                spent years building verification systems at a traditional credit bureau.
                They realized the problem wasn't gig workers' creditworthiness — it was the
                infrastructure. No one had built a way for multi-platform gig income to be
                verified, scored, and shared. So they decided to build it themselves.
              </p>
            </div>

            <div className="card-cohere p-8">
              <div className="w-10 h-10 rounded-cohere-sm bg-action-blue/20 text-action-blue flex items-center justify-center font-display text-lg font-medium mb-5">
                ②
              </div>
              <h3 className="font-display text-xl font-medium tracking-tight mb-3">
                How it's going
              </h3>
              <p className="text-body text-ink/60 leading-relaxed">
                Today, Krostio connects to 8+ platforms, scores income across 9 factors,
                and generates lender-ready reports — all from a single dashboard.
                Thousands of gig workers are building their Krost Scores. Multiple lenders
                are piloting Krostio Verifier in their underwriting workflows. We've
                expanded from a two-person team to twelve, backed by Top-Tier Capital
                and a mission that resonates with everyone who's ever been told their
                income "doesn't count."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="bg-soft-stone py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-mono-label text-ink/30 mb-3">OUR TEAM</p>
            <h2 className="font-display text-[clamp(28px,5vw,48px)] font-medium tracking-tight leading-[1.05]">
              People behind the mission
            </h2>
            <p className="text-body text-ink/50 mt-4 max-w-lg mx-auto">
              A small team building big infrastructure for the future of work.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 max-w-4xl mx-auto">
            {teamMembers.map((member) => (
              <div key={member.initials} className="text-center">
                <div className="w-20 h-20 mx-auto rounded-cohere-full bg-brand-black text-white flex items-center justify-center font-display text-xl font-medium tracking-tight mb-3">
                  {member.initials}
                </div>
                <p className="text-sm font-medium text-ink">{member.name}</p>
                <p className="text-micro text-ink/50">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA band ── */}
      <section className="bg-brand-black text-white py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-mono-label text-white/40 mb-4">JOIN US</p>
          <h2 className="font-display text-[clamp(28px,5vw,48px)] font-medium tracking-tight leading-[1.05]">
            Ready to build your financial identity?
          </h2>
          <p className="text-body-lg text-white/60 mt-5 max-w-lg mx-auto">
            Join thousands of gig workers who are taking control of their earnings data.
            Private beta is open now.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-10 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-white text-brand-black px-8 py-4 rounded-cohere-pill font-medium text-[15px] transition-all hover:opacity-90"
            >
              Get early access
            </Link>
            <Link
              href="/check-score"
              className="inline-flex items-center justify-center gap-2 bg-transparent text-white border border-white/30 px-8 py-4 rounded-cohere-pill font-medium text-[15px] transition-all hover:bg-white/10"
            >
              Check your score
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
