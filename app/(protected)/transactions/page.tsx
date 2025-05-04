"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePicker } from "@/components/date-picker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TransactionTable } from "@/components/transaction-table"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import type { Transaction } from "@/lib/models"

export default function TransactionsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const periodParam = searchParams.get("period") || "daily"
  const dateParam = searchParams.get("date") || new Date().toISOString().split("T")[0]
  const { toast } = useToast()

  const [date, setDate] = useState<Date>(new Date(dateParam))
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  const handleDateChange = (newDate: Date) => {
    setDate(newDate)
    const dateStr = newDate.toISOString().split("T")[0]
    router.push(`/transactions?period=${periodParam}&date=${dateStr}`)
  }

  const handlePeriodChange = (newPeriod: string) => {
    router.push(`/transactions?period=${newPeriod}&date=${date.toISOString().split("T")[0]}`)
  }

  useEffect(() => {
    async function fetchTransactions() {
      try {
        setLoading(true)
        const dateStr = date.toISOString().split("T")[0]
        const response = await fetch(`/api/transactions?period=${periodParam}&date=${dateStr}`)

        if (!response.ok) {
          throw new Error("Failed to fetch transactions")
        }

        const data = await response.json()
        setTransactions(data)
      } catch (error) {
        console.error("Error fetching transactions:", error)
        toast({
          title: "Error",
          description: "Failed to load transactions. Please try again.",
          variant: "destructive",
        })
        setTransactions([])
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [date, periodParam, toast])

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <DatePicker date={date} setDate={handleDateChange} />
      </div>

      <Tabs defaultValue={periodParam} className="space-y-4" onValueChange={handlePeriodChange}>
        <TabsList>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Transactions</CardTitle>
              <CardDescription>All transactions for {date.toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : transactions.length > 0 ? (
                <TransactionTable transactions={transactions} />
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No transactions found for this date.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Transactions</CardTitle>
              <CardDescription>
                All transactions for {date.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : transactions.length > 0 ? (
                <TransactionTable transactions={transactions} />
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No transactions found for this month.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
