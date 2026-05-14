'use client'

import { useState } from 'react'

type Status = 'pending' | 'approved' | 'denied'

interface Request {
  id: string
  workerName: string
  workerInitial: string
  platform: string
  status: Status
  date: string
  purpose: string
  score?: number
}

export function LenderRequestsUI() {
  const [tab, setTab] = useState<'incoming' | 'outgoing'>('incoming')

  const outgoing: Request[] = [
    { id: '1', workerName: 'Alex M.', workerInitial: 'A', platform: 'Uber, DoorDash', status: 'pending', date: '2 hours ago', purpose: 'Loan application review' },
    { id: '2', workerName: 'Jordan K.', workerInitial: 'J', platform: 'Fiverr, Upwork', status: 'approved', date: '3 days ago', purpose: 'Mortgage pre-approval', score: 680 },
  ]

  const incoming: Request[] = [
    { id: '3', workerName: 'Sam T.', workerInitial: 'S', platform: 'Lyft, Instacart', status: 'pending', date: '1 day ago', purpose: 'Auto loan application' },
  ]

  const renderList = (requests: Request[], isIncoming: boolean) => {
    if (requests.length === 0) {
      return (
        <div className="card-bordered px-8 py-12 text-center">
          <p className="text-mono-label text-slate">Empty state</p>
          <p className="mt-3 text-sm text-ink">
            {isIncoming ? 'No incoming requests.' : 'No outgoing requests.'}
          </p>
          <p className="mt-1 text-sm text-slate">
            {isIncoming
              ? 'Workers can request to share their score with you.'
              : 'Search workers and request access to their scores.'}
          </p>
        </div>
      )
    }

    return (
      <ul className="divide-y divide-hairline border-t border-hairline">
        {requests.map((req) => (
          <li
            key={req.id}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-6 py-6"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ink-black text-sm font-medium text-white">
              {req.workerInitial}
            </div>
            <div>
              <p className="text-base text-ink-black">{req.workerName}</p>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-mono-label text-slate">
                <span>{req.platform}</span>
                <span>·</span>
                <span>{req.date}</span>
                <span>·</span>
                <span>{req.purpose}</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className={
                  req.status === 'pending'
                    ? 'chip-coral-outline'
                    : req.status === 'approved'
                      ? 'chip-coral'
                      : 'chip-coral-outline'
                }>
                  {req.status[0].toUpperCase() + req.status.slice(1)}
                </span>
                {req.score && (
                  <span className="text-mono-label text-coral">Score {req.score}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {req.status === 'pending' && (
                <>
                  <button className="btn-pill-outline">
                    {isIncoming ? 'Approve' : 'Cancel'}
                  </button>
                  {isIncoming && (
                    <button
                      className="btn-pill-outline"
                      style={{ borderColor: 'var(--color-error-red)', color: 'var(--color-error-red)' }}
                    >
                      Deny
                    </button>
                  )}
                </>
              )}
              {req.status === 'approved' && (
                <button className="btn-primary">View score</button>
              )}
            </div>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="space-y-14">
      <div>
        <p className="text-mono-label text-slate">Lender</p>
        <h1 className="mt-3 font-display text-[44px] leading-none tracking-tight text-ink-black">
          Access requests.
        </h1>
        <p className="mt-3 text-body text-slate">
          Manage requests to view worker credit scores.
        </p>
      </div>

      {/* Tabs — pill-outline segmented */}
      <div className="inline-flex gap-2">
        <button
          onClick={() => setTab('incoming')}
          className="btn-pill-outline"
          data-active={tab === 'incoming'}
        >
          Incoming ({incoming.length})
        </button>
        <button
          onClick={() => setTab('outgoing')}
          className="btn-pill-outline"
          data-active={tab === 'outgoing'}
        >
          Outgoing ({outgoing.length})
        </button>
      </div>

      {tab === 'incoming' ? renderList(incoming, true) : renderList(outgoing, false)}
    </div>
  )
}
