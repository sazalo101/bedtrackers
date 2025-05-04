import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Authentication - Hostel Management System",
  description: "Authentication pages for the Hostel Management System",
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // Check if user is already logged in
  const cookieStore = cookies()
  const token = cookieStore.get("token")

  // If logged in, redirect to dashboard
  if (token) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-4 px-6 bg-white border-b">
        <div className="container mx-auto">
          <Link href="/" className="text-xl font-bold text-blue-600">
            Hostel Management System
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="py-4 px-6 bg-white border-t text-center text-sm text-gray-500">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} Hostel Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
