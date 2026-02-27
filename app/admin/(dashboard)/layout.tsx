import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#232323]">
      <AdminSidebar />
      <main className="ml-64 min-h-screen">
        {children}
      </main>
    </div>
  )
}
