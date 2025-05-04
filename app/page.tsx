import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bed, Calendar, CreditCard, DollarSign, Home, Users } from "lucide-react"
import Link from "next/link"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default function LandingPage() {
  // Check if user is already logged in
  const cookieStore = cookies()
  const token = cookieStore.get("token")

  // If logged in, redirect to dashboard
  if (token) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-1/2">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Hostel Management System</h1>
              <p className="text-xl mb-8">
                A complete solution for managing your hostel operations efficiently. Track beds, guests, payments, and
                more in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="bg-white p-6 rounded-lg shadow-xl">
                <img
                  src="/images/hostel-landing.png"
                  alt="Hostel Management Dashboard Preview"
                  className="w-full h-auto rounded"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Bed className="h-10 w-10 text-blue-500" />}
              title="Bed Management"
              description="Track bed availability, assignments, and maintenance status in real-time."
            />
            <FeatureCard
              icon={<Users className="h-10 w-10 text-blue-500" />}
              title="Guest Management"
              description="Maintain comprehensive guest records with payment history and preferences."
            />
            <FeatureCard
              icon={<CreditCard className="h-10 w-10 text-blue-500" />}
              title="Payment Tracking"
              description="Record and track all payments including bed charges, bar tabs, and extra services."
            />
            <FeatureCard
              icon={<DollarSign className="h-10 w-10 text-blue-500" />}
              title="Financial Reports"
              description="Generate detailed financial reports with revenue breakdown by category."
            />
            <FeatureCard
              icon={<Calendar className="h-10 w-10 text-blue-500" />}
              title="Calendar View"
              description="Visualize check-ins, check-outs, and occupancy rates on an interactive calendar."
            />
            <FeatureCard
              icon={<Home className="h-10 w-10 text-blue-500" />}
              title="Dormitory Management"
              description="Organize beds by dormitories and track occupancy rates by room."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to streamline your hostel operations?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join hundreds of hostel managers who have simplified their operations and improved their bottom line.
          </p>
          <Button size="lg" variant="outline" className="bg-white text-blue-700 hover:bg-blue-50" asChild>
            <Link href="/signup">Get Started Today</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-800 text-gray-300 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold">Hostel Management System</h3>
              <p className="text-sm">© {new Date().getFullYear()} All rights reserved.</p>
            </div>
            <div className="flex gap-4">
              <Link href="/login" className="hover:text-white">
                Login
              </Link>
              <Link href="/signup" className="hover:text-white">
                Sign Up
              </Link>
              <Link href="/dashboard" className="hover:text-white">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="mb-4">{icon}</div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}
