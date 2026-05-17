import Sidebar from '@/components/dashboard/Sidebar';
import ChatAssistant from '@/components/ChatAssistant';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:pl-64 pt-16 lg:pt-0">{children}</main>
      <ChatAssistant />
    </div>
  );
}
