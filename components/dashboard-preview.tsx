"use client"

import { ArrowDown, ArrowUp, Bed, CreditCard, DollarSign } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatsCard } from "@/components/stats-card"
import { TransactionTable } from "@/components/transaction-table"
import { CheckInTable } from "@/components/checkin-table"
import { ExpenseTable } from "@/components/expense-table"

export function DashboardPreview() {
  // Sample data for preview
  const financialData = {
    incomeFormatted: "$1,250.00",
    unpaidFormatted: "$350.00",
    expensesFormatted: "$425.00",
    profitFormatted: "$825.00",
    profitMargin: 66,
  }

  const bedStats = {
    total: 30,
    available: 18,
    occupied: 10,
    needsCleaning: 2,
  }

  const transactions = [
    {
      _id: "1",
      date: new Date().toISOString(),
      type: "Bed Payment",
      guest_name: "John Doe",
      amount: 50,
      payment_status: "paid",
    },
    {
      _id: "2",
      date: new Date().toISOString(),
      type: "Bar Purchase",
      guest_name: "Jane Smith",
      amount: 15,
      payment_status: "not_paid",
    },
    {
      _id: "3",
      date: new Date().toISOString(),
      type: "Extra Service",
      guest_name: "Bob Johnson",
      amount: 25,
      payment_status: "paid",
    },
  ]

  const checkins = [
    {
      _id: "1",
      name: "John Doe",
      bed_number: "A-101",
      check_in: new Date().toISOString(),
      check_out: new Date(Date.now() + 86400000 * 3).toISOString(),
      bed_charges: 50,
      bar_charges: 15,
      extra_charges: 0,
      total_charges: 65,
      payment_status: "not_paid",
    },
    {
      _id: "2",
      name: "Jane Smith",
      bed_number: "B-201",
      check_in: new Date().toISOString(),
      check_out: new Date(Date.now() + 86400000 * 2).toISOString(),
      bed_charges: 75,
      bar_charges: 0,
      extra_charges: 0,
      total_charges: 75,
      payment_status: "paid",
    },
  ]

  const expenses = [
    {
      _id: "1",
      date: new Date().toISOString(),
      category: "Utilities",
      description: "Electricity bill",
      amount: 150,
    },
    {
      _id: "2",
      date: new Date(Date.now() - 86400000).toISOString(),
      category: "Supplies",
      description: "Cleaning supplies",
      amount: 75,
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Revenue"
              value={financialData.incomeFormatted}
              icon={DollarSign}
              iconColor="text-green-500"
            />
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

            <StatsCard title="Total Beds" value={bedStats.total} icon={Bed} />
            <StatsCard title="Available Beds" value={bedStats.available} icon={Bed} iconColor="text-green-500" />
            <StatsCard title="Occupied Beds" value={bedStats.occupied} icon={Bed} iconColor="text-blue-500" />
            <StatsCard title="Needs Cleaning" value={bedStats.needsCleaning} icon={Bed} iconColor="text-yellow-500" />

            <div className="md:col-span-2 lg:col-span-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Latest financial activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <TransactionTable transactions={transactions} />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="week" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard title="Total Revenue" value="$3,750.00" icon={DollarSign} iconColor="text-green-500" />
            <StatsCard title="Unpaid Invoices" value="$850.00" icon={CreditCard} iconColor="text-yellow-500" />
            <StatsCard title="Total Expenses" value="$1,125.00" icon={ArrowDown} iconColor="text-red-500" />
            <StatsCard
              title="Net Profit"
              value="$2,625.00"
              description="70% profit margin"
              icon={ArrowUp}
              iconColor="text-green-500"
            />
          </div>
        </TabsContent>

        <TabsContent value="month" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard title="Total Revenue" value="$12,500.00" icon={DollarSign} iconColor="text-green-500" />
            <StatsCard title="Unpaid Invoices" value="$2,350.00" icon={CreditCard} iconColor="text-yellow-500" />
            <StatsCard title="Total Expenses" value="$4,250.00" icon={ArrowDown} iconColor="text-red-500" />
            <StatsCard
              title="Net Profit"
              value="$8,250.00"
              description="66% profit margin"
              icon={ArrowUp}
              iconColor="text-green-500"
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Today's Check-ins</CardTitle>
            <CardDescription>Guests who checked in today</CardDescription>
          </CardHeader>
          <CardContent>
            <CheckInTable checkins={checkins} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>Latest hostel expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <ExpenseTable expenses={expenses} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
