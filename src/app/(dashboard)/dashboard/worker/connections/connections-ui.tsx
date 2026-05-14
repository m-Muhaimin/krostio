'use client'

import { useState } from 'react'

const platforms = [
  { id: 'uber', name: 'Uber', initial: 'U', connected: false },
  { id: 'lyft', name: 'Lyft', initial: 'L', connected: false },
  { id: 'doordash', name: 'DoorDash', initial: 'D', connected: false },
  { id: 'fiverr', name: 'Fiverr', initial: 'F', connected: false },
  { id: 'upwork', name: 'Upwork', initial: 'U', connected: false },
  { id: 'instacart', name: 'Instacart', initial: 'I', connected: false },
  { id: 'taskrabbit', name: 'TaskRabbit', initial: 'T', connected: false },
  { id: 'amazonflex', name: 'Amazon Flex', initial: 'A', connected: false },
]

export function ConnectionsUI() {
  const [conns, setConns] = useState(platforms)

  const toggle = (id: string) => {
    setConns((prev) =>
      prev.map((p) => (p.id === id ? { ...p, connected: !p.connected } : p))
    )
  }

  const connected = conns.filter((p) => p.connected)
  const disconnected = conns.filter((p) => !p.connected)

  return (
    <div className="space-y-14">
      <div>
        <p className="text-mono-label text-slate">Worker</p>
        <h1 className="mt-3 font-display text-[44px] leading-none tracking-tight text-ink-black">
          Platform connections.
        </h1>
        <p className="mt-3 text-body text-slate">
          Connect your gig platforms to verify your income and build your credit score.
        </p>
      </div>

      {/* Connected */}
      <section>
        <div className="mb-5 flex items-baseline gap-3">
          <h2 className="text-heading-feature text-ink-black">Connected</h2>
          <span className="text-mono-label text-coral">{connected.length}</span>
        </div>
        {connected.length === 0 ? (
          <div className="card-bordered px-8 py-12 text-center">
            <p className="text-mono-label text-slate">Empty state</p>
            <p className="mt-3 text-sm text-ink">No platforms connected yet.</p>
            <p className="mt-1 text-sm text-slate">
              Connect platforms below to start building your credit score.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {connected.map((platform) => (
              <div
                key={platform.id}
                className="card-bordered flex items-center justify-between p-5"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-ink-black text-sm font-medium text-white">
                    {platform.initial}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink-black">{platform.name}</p>
                    <p className="text-xs text-slate">Connected · Auto-sync on</p>
                  </div>
                </div>
                <button
                  onClick={() => toggle(platform.id)}
                  className="btn-pill-outline"
                  style={{ borderColor: 'var(--color-error-red)', color: 'var(--color-error-red)' }}
                >
                  Disconnect
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Available */}
      <section>
        <div className="mb-5 flex items-baseline gap-3">
          <h2 className="text-heading-feature text-ink-black">Available platforms</h2>
          <span className="text-mono-label text-slate">{disconnected.length}</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {disconnected.map((platform) => (
            <button
              key={platform.id}
              onClick={() => toggle(platform.id)}
              className="card-bordered flex items-center gap-4 p-5 text-left transition hover:border-ink-black"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-ink-black text-sm font-medium text-white">
                {platform.initial}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-ink-black">{platform.name}</p>
                <p className="text-xs text-slate">Not connected</p>
              </div>
              <span className="link-editorial text-sm">Connect →</span>
            </button>
          ))}
        </div>
      </section>

      {/* Sync */}
      <section className="border-t border-hairline pt-10">
        <div className="grid gap-12 md:grid-cols-[1fr_2fr]">
          <div>
            <p className="text-mono-label text-slate">Data sync</p>
            <h2 className="mt-3 text-heading-feature text-ink-black">Keep platforms fresh</h2>
          </div>
          <ul className="divide-y divide-hairline">
            <li className="flex items-center justify-between py-4">
              <div>
                <p className="text-sm font-medium text-ink-black">Auto-sync</p>
                <p className="text-xs text-slate">
                  Automatically sync income data every 24 hours
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" defaultChecked />
                <div className="h-6 w-11 rounded-full bg-hairline after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-ink-black peer-checked:after:translate-x-full" />
              </label>
            </li>
            <li className="flex items-center justify-between py-4">
              <div>
                <p className="text-sm font-medium text-ink-black">Last sync</p>
                <p className="text-xs text-slate">Never</p>
              </div>
              <button className="btn-pill-outline">Sync now</button>
            </li>
          </ul>
        </div>
      </section>
    </div>
  )
}
