'use client';

import { motion } from 'motion/react';
import { Home, BarChart2, Briefcase, User, Bell } from 'lucide-react';

export default function BottomNav() {
  return (
    <nav className="pill-nav lg:hidden">
      <motion.button 
        whileTap={{ scale: 0.9 }}
        className="p-2 text-ink"
      >
        <Home size={24} />
      </motion.button>
      <motion.button 
        whileTap={{ scale: 0.9 }}
        className="p-2 text-ink/40 hover:text-ink transition-colors"
      >
        <BarChart2 size={24} />
      </motion.button>
      
      {/* Central Action Button */}
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 bg-ink text-canvas rounded-full flex items-center justify-center shadow-lg -mt-4 mb-4"
      >
        <Briefcase size={24} />
      </motion.button>

      <motion.button 
        whileTap={{ scale: 0.9 }}
        className="p-2 text-ink/40 hover:text-ink transition-colors"
      >
        <Bell size={24} />
      </motion.button>
      <motion.button 
        whileTap={{ scale: 0.9 }}
        className="p-2 text-ink/40 hover:text-ink transition-colors"
      >
        <User size={24} />
      </motion.button>
    </nav>
  );
}
