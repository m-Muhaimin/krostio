'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useKrostData } from '@/hooks/use-krost-data';
import {
  User,
  Link2,
  Bell,
  Shield,
  Plug,
  RefreshCw,
} from 'lucide-react';

interface Connection {
  id: string;
  platform: string;
  connection_status: string;
  last_sync_at: string | null;
}

export default function SettingsPage() {
  const { isLoading: dataLoading, refresh } = useKrostData();

  const [connections, setConnections] = useState<Connection[]>([]);
  const [connectionsLoading, setConnectionsLoading] = useState(true);
  const [connectionsError, setConnectionsError] = useState<string | null>(null);

  // Notification toggles
  const [notifScore, setNotifScore] = useState(true);
  const [notifReports, setNotifReports] = useState(true);
  const [notifLenders, setNotifLenders] = useState(false);
  const [notifMarketing, setNotifMarketing] = useState(false);

  useEffect(() => {
    async function fetchConnections() {
      try {
        setConnectionsLoading(true);
        const res = await fetch('/api/platform/connections');
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || 'Failed to load connections');
        }
        const data = await res.json();
        setConnections(data.connections || []);
      } catch (err: any) {
        setConnectionsError(err.message);
      } finally {
        setConnectionsLoading(false);
      }
    }
    fetchConnections();
  }, []);

  const platformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      plaid: '🏦',
      stripe: '💳',
      uber: '🚗',
      lyft: '🚗',
      doordash: '🛵',
      instacart: '🛒',
      upwork: '💼',
      fiverr: '🎨',
    };
    return icons[platform.toLowerCase()] || '🔗';
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium uppercase tracking-wider text-green-600 bg-green-50 px-2 py-0.5 rounded-cohere-pill">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Connected
          </span>
        );
      case 'disconnected':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium uppercase tracking-wider text-ink/40 bg-ink/5 px-2 py-0.5 rounded-cohere-pill">
            <span className="w-1.5 h-1.5 rounded-full bg-ink/20" />
            Disconnected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-cohere-pill">
            {status}
          </span>
        );
    }
  };

  if (dataLoading) {
    return (
      <div className="p-6 pt-24 lg:pt-10 max-w-6xl">
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pt-24 lg:pt-10 max-w-6xl">
      <header className="mb-10">
        <h2 className="font-display text-4xl font-medium tracking-tight">Settings</h2>
        <p className="text-ink/60 mt-1">Manage your account, connected platforms, notification preferences, and privacy controls.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Section */}
        <div className="card-cohere p-6">
          <div className="flex items-center gap-2 mb-6">
            <User size={18} className="text-ink/40" />
            <h3 className="font-display text-lg font-medium tracking-tight">Profile</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-ink/60 uppercase tracking-wider mb-1.5">Name</label>
              <div className="w-full px-4 py-2.5 rounded-cohere-sm border border-hairline bg-soft-stone text-ink/60 text-sm">
                User
              </div>
              <p className="text-[11px] text-ink/40 mt-1">Name changes coming soon.</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink/60 uppercase tracking-wider mb-1.5">Email</label>
              <div className="w-full px-4 py-2.5 rounded-cohere-sm border border-hairline bg-soft-stone text-ink/60 text-sm">
                user@example.com
              </div>
              <p className="text-[11px] text-ink/40 mt-1">Email changes coming soon.</p>
            </div>
          </div>
        </div>

        {/* Connected Platforms */}
        <div className="card-cohere p-6">
          <div className="flex items-center gap-2 mb-6">
            <Plug size={18} className="text-ink/40" />
            <h3 className="font-display text-lg font-medium tracking-tight">Connected Platforms</h3>
          </div>

          {connectionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
            </div>
          ) : connectionsError ? (
            <div className="p-3 rounded-cohere-sm bg-coral/5 border border-coral/20 text-sm text-coral">
              {connectionsError}
            </div>
          ) : connections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Link2 size={24} className="text-ink/20 mb-2" />
              <p className="text-ink/60 text-sm">No platforms connected yet.</p>
              <p className="text-ink/40 text-xs mt-1">
                Link your gig economy accounts from the dashboard.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {connections.map((conn) => (
                <div
                  key={conn.id}
                  className="flex items-center justify-between p-3 rounded-cohere-sm bg-soft-stone border border-hairline"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{platformIcon(conn.platform)}</span>
                    <div>
                      <p className="text-sm font-medium capitalize">{conn.platform}</p>
                      {conn.last_sync_at && (
                        <p className="text-[11px] text-ink/40 mt-0.5">
                          Last sync: {new Date(conn.last_sync_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  {statusBadge(conn.connection_status)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notification Preferences */}
        <div className="card-cohere p-6">
          <div className="flex items-center gap-2 mb-6">
            <Bell size={18} className="text-ink/40" />
            <h3 className="font-display text-lg font-medium tracking-tight">Notifications</h3>
          </div>

          <div className="space-y-4">
            <ToggleRow
              label="Score Changes"
              description="Get notified when your Krost Score changes"
              checked={notifScore}
              onChange={setNotifScore}
            />
            <ToggleRow
              label="Report Views"
              description="When a lender views your shared report"
              checked={notifReports}
              onChange={setNotifReports}
            />
            <ToggleRow
              label="Lender Offers"
              description="New lending opportunities matching your profile"
              checked={notifLenders}
              onChange={setNotifLenders}
            />
            <ToggleRow
              label="Product Updates"
              description="New features and improvements"
              checked={notifMarketing}
              onChange={setNotifMarketing}
            />
          </div>
        </div>

        {/* Privacy Section */}
        <div className="card-cohere p-6">
          <div className="flex items-center gap-2 mb-6">
            <Shield size={18} className="text-ink/40" />
            <h3 className="font-display text-lg font-medium tracking-tight">Privacy</h3>
          </div>

          <div className="space-y-6">
            <div className="p-4 rounded-cohere-sm bg-soft-stone border border-hairline">
              <h4 className="text-sm font-medium mb-1">Data Sharing</h4>
              <p className="text-xs text-ink/50 leading-relaxed">
                Your financial data is used exclusively to compute your Krost Score and generate
                verification reports. We never sell your data to third parties. Lenders only see
                the reports you explicitly choose to share.
              </p>
            </div>

            <div className="p-4 rounded-cohere-sm bg-soft-stone border border-hairline">
              <h4 className="text-sm font-medium mb-1">Account Deletion</h4>
              <p className="text-xs text-ink/50 leading-relaxed">
                You can request account deletion at any time. All your data will be permanently
                removed within 30 days. Email support to initiate the process.
              </p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-cohere-sm bg-soft-stone border border-hairline">
              <div>
                <h4 className="text-sm font-medium">Data Export</h4>
                <p className="text-xs text-ink/50">Download all your data as JSON</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-cohere-pill border border-hairline text-xs font-medium hover:bg-black/5 transition-all">
                <RefreshCw size={14} />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-ink/40 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ml-4 ${
          checked ? 'bg-brand-black' : 'bg-ink/15'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
