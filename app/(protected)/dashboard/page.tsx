import { Suspense } from "react"
import { ArrowDown, ArrowUp, Bed, CreditCard, PlusCircle, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatsCard } from "@/components/stats-card"
import { TransactionTable } from "@/components/transaction-table"
import { CheckInTable } from "@/components/checkin-table"
import { ExpenseTable } from "@/components/expense-table"
import {
  getBedStats,
  getTransactions,
  calculateFinancialData,
  getTodayCheckins,
  getExpenses,
  getActiveAssignments,
} from "@/lib/db"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Import the client version of the revenue chart
import { RevenueChartClient } from "@/components/revenue-chart-client"

export const dynamic = "force-dynamic"

export default async function Dashboard() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/assignments">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Assignment
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dormitories">
              <Bed className="mr-2 h-4 w-4" />
              Manage Dormitories
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <Suspense fallback={<div>Loading stats...</div>}>
            <DashboardStats period="today" />
          </Suspense>
        </TabsContent>

        <TabsContent value="week" className="space-y-4">
          <Suspense fallback={<div>Loading stats...</div>}>
            <DashboardStats period="week" />
          </Suspense>
        </TabsContent>

        <TabsContent value="month" className="space-y-4">
          <Suspense fallback={<div>Loading stats...</div>}>
            <DashboardStats period="month" />
          </Suspense>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Current Guests</CardTitle>
              <CardDescription>Guests currently staying at the hostel</CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link href="/guests">
                <Users className="mr-2 h-4 w-4" />
                All Guests
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading current guests...</div>}>
              <CurrentGuests />
            </Suspense>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>Latest hostel expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading expenses...</div>}>
              <RecentExpenses />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today's Check-ins</CardTitle>
            <CardDescription>Guests who checked in today</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading check-ins...</div>}>
              <TodayCheckins />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest financial activities</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading transactions...</div>}>
              <RecentTransactions />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

async function DashboardStats({ period }: { period: string }) {
  // Fetch real transaction data from MongoDB
  const transactions = await getTransactions(period)
  // Calculate financial data based on real transactions
  const financialData = await calculateFinancialData(transactions)
  // Fetch real bed statistics from MongoDB
  const bedStats = await getBedStats()

  return (
    <div className="grid gap-4">
      {/* Use the client component that fetches real data directly from the API */}
      <RevenueChartClient period={period} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Unpaid Invoices"
          value={financialData.unpaidFormatted}
          icon={CreditCard}
          iconColor="text-yellow-500"
        />
        <StatsCard
          title="Total Expenses"
          value={financialData.expensesFormatted}
          icon={ArrowDown}
          iconColor="text-red-500"
        />
        <StatsCard
          title="Net Profit"
          value={financialData.profitFormatted}
          description={`${financialData.profitMargin}% profit margin`}
          icon={ArrowUp}
          iconColor="text-green-500"
        />
        <StatsCard
          title="Occupancy Rate"
          value={`${bedStats.total > 0 ? Math.round((bedStats.occupied / bedStats.total) * 100) : 0}%`}
          description={`${bedStats.occupied}/${bedStats.total} beds`}
          icon={Bed}
          iconColor="text-blue-500"
        />

        <StatsCard title="Total Beds" value={bedStats.total} icon={Bed} />
        <StatsCard title="Available Beds" value={bedStats.available} icon={Bed} iconColor="text-green-500" />
        <StatsCard title="Occupied Beds" value={bedStats.occupied} icon={Bed} iconColor="text-blue-500" />
        <StatsCard title="Needs Cleaning" value={bedStats.needsCleaning} icon={Bed} iconColor="text-yellow-500" />
      </div>
    </div>
  )
}

async function TodayCheckins() {
  const checkins = await getTodayCheckins()
  return <CheckInTable checkins={checkins} />
}

async function CurrentGuests() {
  const activeAssignments = await getActiveAssignments()
  return <CheckInTable checkins={activeAssignments} />
}

async function RecentExpenses() {
  const expenses = await getExpenses()
  return <ExpenseTable expenses={expenses.slice(0, 5)} />
}

async function RecentTransactions() {
  const transactions = await getTransactions("today")
  return <TransactionTable transactions={transactions.slice(0, 5)} />
}
