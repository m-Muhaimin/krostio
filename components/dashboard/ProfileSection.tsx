'use client';

import { motion, AnimatePresence } from 'motion/react';
import { X, User, Bell, Shield, Wallet, Save, LogOut } from 'lucide-react';
import Image from 'next/image';

interface ProfileSectionProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileSection({ isOpen, onClose }: ProfileSectionProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/20 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-xl bg-canvas z-[70] shadow-2xl overflow-y-auto"
          >
            <div className="p-8 md:p-12">
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-3xl font-medium tracking-tight">Account Settings</h2>
                <button 
                  onClick={onClose}
                  className="p-3 rounded-full hover:bg-ink/5 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Profile Bio */}
              <section className="mb-12">
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative w-24 h-24">
                    <div className="absolute inset-0 rounded-full border-2 border-ink" />
                    <div className="absolute inset-1 rounded-full overflow-hidden">
                      <Image 
                        src="https://picsum.photos/seed/krostio/200/200" 
                        alt="Profile" 
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium">Alex Chen</h3>
                    <p className="text-ink/40 text-sm font-medium">Joined May 2024 • Pro Member</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-ink/30 block">Full Name</label>
                    <input 
                      type="text" 
                      defaultValue="Alex Chen"
                      className="w-full bg-white border border-ink/10 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-1 focus:ring-ink outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-ink/30 block">Email Address</label>
                    <input 
                      type="email" 
                      defaultValue="alex.chen@example.com"
                      className="w-full bg-white border border-ink/10 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-1 focus:ring-ink outline-none transition-all"
                    />
                  </div>
                </div>
              </section>

              {/* Preferences */}
              <section className="space-y-8 mb-12">
                <div className="flex items-center gap-3">
                  <Bell size={18} className="text-ink/40" />
                  <h4 className="text-sm font-bold uppercase tracking-widest text-ink">Notifications</h4>
                </div>
                
                <div className="space-y-4">
                  {[
                    { label: 'Weekly Performance Report', desc: 'Summary of earnings and score updates' },
                    { label: 'Lender Match Alerts', desc: 'Notifications when you match with a lender' },
                    { label: 'Security Alerts', desc: 'Login attempts and sensitive account changes' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-ink/40 font-medium">{item.desc}</p>
                      </div>
                      <button className="w-10 h-6 bg-emerald-500 rounded-full relative">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Security & Multi-actor Auth */}
              <section className="space-y-8 mb-12">
                <div className="flex items-center gap-3">
                  <Shield size={18} className="text-ink/40" />
                  <h4 className="text-sm font-bold uppercase tracking-widest text-ink">Security</h4>
                </div>
                
                <div className="flex justify-between items-center p-6 rounded-3xl bg-ink text-canvas">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-canvas/10 flex items-center justify-center">
                      <Wallet size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Blockchain Passport</p>
                      <p className="text-xs opacity-60">Identity linked to 0x4a...92f1</p>
                    </div>
                  </div>
                  <button className="text-[10px] font-bold uppercase tracking-widest border border-canvas/20 px-4 py-2 rounded-full hover:bg-canvas hover:text-ink transition-all">
                    Update Root Key
                  </button>
                </div>
              </section>

              <div className="flex gap-4 pt-8 border-t border-ink/5">
                <button className="flex-1 btn-ink flex items-center justify-center gap-2">
                  <Save size={18} />
                  Save Changes
                </button>
                <button className="px-6 py-4 rounded-2xl bg-signal/10 text-signal font-bold text-sm flex items-center gap-2 hover:bg-signal/20 transition-all">
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
