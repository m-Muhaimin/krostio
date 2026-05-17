'use client';

import { motion } from 'motion/react';
import {
  Home,
  BarChart2,
  Wallet,
  FileText,
  IdCard,
  Bell,
  User,
  Settings,
  CreditCard,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

const navItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: BarChart2, label: 'Score', href: '/dashboard/score' },
  { icon: Wallet, label: 'Ledger', href: '/dashboard/ledger' },
  { icon: FileText, label: 'Reports', href: '/dashboard/reports' },
  { icon: IdCard, label: 'Passport', href: '/dashboard/passport' },
  { icon: CreditCard, label: 'Billing', href: '/dashboard/billing' },
  { icon: User, label: 'Lenders', href: '/dashboard/lenders' },
  { icon: Bell, label: 'Notifications', href: '/dashboard/notifications' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-hairline flex items-center justify-between px-6 z-50">
        <span className="font-display font-medium text-xl tracking-tight">Krostio</span>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-white border-r border-hairline z-50 transform transition-transform duration-300 lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full p-6">
          <div className="mb-10 lg:block hidden">
            <Link href="/dashboard">
              <h1 className="font-display font-medium text-2xl tracking-tighter">Krostio</h1>
              <p className="text-[11px] text-ink/40 font-mono uppercase tracking-widest mt-1">Financial Identity</p>
            </Link>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-hairline">
            <button className="sidebar-link sidebar-link-inactive w-full">
              <LogOut size={20} />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
