export default function SettingsPage() {
  return (
    <div className="space-y-14">
      <div>
        <p className="text-mono-label text-slate">Account</p>
        <h1 className="mt-3 font-display text-[44px] leading-none tracking-tight text-ink-black">
          Settings.
        </h1>
        <p className="mt-3 text-body text-slate">Manage your account and preferences.</p>
      </div>

      {/* Profile */}
      <section className="border-t border-hairline pt-10">
        <div className="grid gap-12 md:grid-cols-[1fr_2fr]">
          <div>
            <p className="text-mono-label text-slate">Profile</p>
            <h2 className="mt-3 text-heading-feature text-ink-black">Your account details</h2>
          </div>
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-mono-label text-slate">Full name</label>
              <input type="text" placeholder="Your name" className="input-rect" />
            </div>
            <div>
              <label className="mb-2 block text-mono-label text-slate">Email</label>
              <input type="email" placeholder="you@example.com" className="input-rect" />
            </div>
            <div>
              <label className="mb-2 block text-mono-label text-slate">
                Wallet address (for on-chain attestations)
              </label>
              <input type="text" placeholder="0x…" className="input-rect" />
            </div>
            <button className="btn-primary">Save changes</button>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="border-t border-hairline pt-10">
        <div className="grid gap-12 md:grid-cols-[1fr_2fr]">
          <div>
            <p className="text-mono-label text-slate">Notifications</p>
            <h2 className="mt-3 text-heading-feature text-ink-black">
              Pick what reaches you
            </h2>
          </div>
          <ul className="divide-y divide-hairline">
            {[
              { label: 'Score changes', desc: 'Get notified when your credit score updates' },
              { label: 'Lender requests', desc: 'When a lender requests access to your score' },
              { label: 'Billing alerts', desc: 'Payment failures, subscription changes' },
              { label: 'Platform sync', desc: 'When your gig platforms sync new data' },
            ].map((item) => (
              <li key={item.label} className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-medium text-ink-black">{item.label}</p>
                  <p className="text-xs text-slate">{item.desc}</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" className="peer sr-only" defaultChecked />
                  <div className="h-6 w-11 rounded-full bg-hairline after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-ink-black peer-checked:after:translate-x-full" />
                </label>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="border-t border-hairline pt-10">
        <div className="grid gap-12 md:grid-cols-[1fr_2fr]">
          <div>
            <p className="text-mono-label" style={{ color: 'var(--color-error-red)' }}>
              Danger zone
            </p>
            <h2 className="mt-3 text-heading-feature text-ink-black">Delete your account</h2>
          </div>
          <div>
            <p className="text-sm text-slate">
              Permanently delete your account and all associated data. This cannot be undone.
            </p>
            <button
              className="mt-6 rounded-full border px-6 py-3 text-sm font-medium"
              style={{ borderColor: 'var(--color-error-red)', color: 'var(--color-error-red)' }}
            >
              Delete account
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
