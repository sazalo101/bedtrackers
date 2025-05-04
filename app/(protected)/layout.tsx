import type React from "react"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r md:block">
          <Sidebar />
        </aside>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
