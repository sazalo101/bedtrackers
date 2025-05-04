"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  BedDouble,
  Calendar,
  CreditCard,
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  Settings,
  ShoppingBasket,
  User,
  UserPlus,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { logoutUser } from "@/app/actions"
import { useEffect, useState } from "react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Hostel Management</h2>
          <div className="space-y-1">
            <Button
              asChild
              variant={pathname === "/dashboard" ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Button asChild variant={pathname === "/guests" ? "secondary" : "ghost"} className="w-full justify-start">
              <Link href="/guests">
                <Users className="mr-2 h-4 w-4" />
                Guests
              </Link>
            </Button>
            <Button asChild variant={pathname === "/beds" ? "secondary" : "ghost"} className="w-full justify-start">
              <Link href="/beds">
                <BedDouble className="mr-2 h-4 w-4" />
                Beds
              </Link>
            </Button>
            <Button
              asChild
              variant={pathname === "/assignments" ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href="/assignments">
                <Home className="mr-2 h-4 w-4" />
                Assignments
              </Link>
            </Button>
            <Button
              asChild
              variant={pathname === "/transactions" ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href="/transactions">
                <CreditCard className="mr-2 h-4 w-4" />
                Transactions
              </Link>
            </Button>
            <Button asChild variant={pathname === "/bar" ? "secondary" : "ghost"} className="w-full justify-start">
              <Link href="/bar">
                <ShoppingBasket className="mr-2 h-4 w-4" />
                Bar
              </Link>
            </Button>
            <Button asChild variant={pathname === "/extras" ? "secondary" : "ghost"} className="w-full justify-start">
              <Link href="/extras">
                <BarChart3 className="mr-2 h-4 w-4" />
                Extra Services
              </Link>
            </Button>
            <Button asChild variant={pathname === "/expenses" ? "secondary" : "ghost"} className="w-full justify-start">
              <Link href="/expenses">
                <CreditCard className="mr-2 h-4 w-4" />
                Expenses
              </Link>
            </Button>
            <Button asChild variant={pathname === "/calendar" ? "secondary" : "ghost"} className="w-full justify-start">
              <Link href="/calendar">
                <Calendar className="mr-2 h-4 w-4" />
                Calendar
              </Link>
            </Button>
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Settings</h2>
          <div className="space-y-1">
            <Button
              asChild
              variant={pathname === "/dormitories" ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href="/dormitories">
                <Home className="mr-2 h-4 w-4" />
                Dormitories
              </Link>
            </Button>
            {user?.role === "admin" && (
              <Button asChild variant={pathname === "/admin" ? "secondary" : "ghost"} className="w-full justify-start">
                <Link href="/admin">
                  <Settings className="mr-2 h-4 w-4" />
                  Admin
                </Link>
              </Button>
            )}
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Account</h2>
          <div className="space-y-1">
            {!loading && (
              <>
                {user ? (
                  <>
                    <Button
                      asChild
                      variant={pathname === "/profile" ? "secondary" : "ghost"}
                      className="w-full justify-start"
                    >
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={async () => {
                        await logoutUser()
                        window.location.href = "/login"
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      asChild
                      variant={pathname === "/login" ? "secondary" : "ghost"}
                      className="w-full justify-start"
                    >
                      <Link href="/login">
                        <LogIn className="mr-2 h-4 w-4" />
                        Login
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant={pathname === "/signup" ? "secondary" : "ghost"}
                      className="w-full justify-start"
                    >
                      <Link href="/signup">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Sign Up
                      </Link>
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
