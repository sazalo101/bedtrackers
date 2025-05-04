"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface RevenueData {
  bedIncome: number
  barIncome: number
  extraIncome: number
  totalIncome: number
  expenses: number
  netRevenue: number
  bedIncomeFormatted: string
  barIncomeFormatted: string
  extraIncomeFormatted: string
  incomeFormatted: string
  expensesFormatted: string
  netRevenueFormatted: string
}

export function RevenueChartClient({ period }: { period: string }) {
  const [data, setData] = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const chartRef = useRef<HTMLDivElement>(null)

  // Format period name for display
  const periodName =
    period === "today" ? "Today" : period === "week" ? "This Week" : period === "month" ? "This Month" : period

  useEffect(() => {
    async function fetchRevenueData() {
      try {
        setLoading(true)
        const response = await fetch(`/api/dashboard/revenue?period=${period}`)

        if (!response.ok) {
          throw new Error("Failed to fetch revenue data")
        }

        const revenueData = await response.json()
        setData(revenueData)
        setError(null)
      } catch (err) {
        console.error("Error fetching revenue data:", err)
        setError("Failed to load revenue data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchRevenueData()
  }, [period])

  useEffect(() => {
    if (!chartRef.current || !data) return

    // Calculate percentages
    const total = data.bedIncome + data.barIncome + data.extraIncome
    const bedPercent = total > 0 ? (data.bedIncome / total) * 100 : 0
    const barPercent = total > 0 ? (data.barIncome / total) * 100 : 0
    const extraPercent = total > 0 ? (data.extraIncome / total) * 100 : 0

    // Update chart bars
    const bedBar = chartRef.current.querySelector(".bed-bar") as HTMLElement
    const barBar = chartRef.current.querySelector(".bar-bar") as HTMLElement
    const extraBar = chartRef.current.querySelector(".extra-bar") as HTMLElement

    if (bedBar) bedBar.style.width = `${bedPercent}%`
    if (barBar) barBar.style.width = `${barPercent}%`
    if (extraBar) extraBar.style.width = `${extraPercent}%`
  }, [data])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Breakdown</CardTitle>
          <CardDescription>Loading revenue data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Breakdown</CardTitle>
          <CardDescription>Revenue by category for {periodName}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-6 text-center text-red-500">{error}</div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Breakdown</CardTitle>
          <CardDescription>Revenue by category for {periodName}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-6 text-center text-muted-foreground">No revenue data available.</div>
        </CardContent>
      </Card>
    )
  }

  // Calculate percentages for display
  const total = data.bedIncome + data.barIncome + data.extraIncome
  const bedPercent = total > 0 ? (data.bedIncome / total) * 100 : 0
  const barPercent = total > 0 ? (data.barIncome / total) * 100 : 0
  const extraPercent = total > 0 ? (data.extraIncome / total) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Breakdown</CardTitle>
        <CardDescription>Revenue by category for {periodName}</CardDescription>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="py-6 text-center text-muted-foreground">No revenue data available for this period.</div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
              <div className="flex flex-col gap-1">
                <div className="text-sm font-medium text-muted-foreground">Bed Revenue</div>
                <div className="text-2xl font-bold text-green-500">{data.bedIncomeFormatted}</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-sm font-medium text-muted-foreground">Bar Revenue</div>
                <div className="text-2xl font-bold text-blue-500">{data.barIncomeFormatted}</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-sm font-medium text-muted-foreground">Extra Services</div>
                <div className="text-2xl font-bold text-purple-500">{data.extraIncomeFormatted}</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-sm font-medium text-muted-foreground">Total Income</div>
                <div className="text-2xl font-bold text-green-600">{data.incomeFormatted}</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-sm font-medium text-muted-foreground">Expenses</div>
                <div className="text-2xl font-bold text-red-500">{data.expensesFormatted}</div>
              </div>
              <div className="flex flex-col gap-1 border-l pl-4">
                <div className="text-sm font-medium">Net Revenue</div>
                <div className="text-2xl font-bold text-green-600">{data.netRevenueFormatted}</div>
              </div>
            </div>

            <div ref={chartRef} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div>Bed Revenue</div>
                <div>{bedPercent.toFixed(1)}%</div>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div className="bed-bar h-full rounded-full bg-green-500" style={{ width: `${bedPercent}%` }}></div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div>Bar Revenue</div>
                <div>{barPercent.toFixed(1)}%</div>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div className="bar-bar h-full rounded-full bg-blue-500" style={{ width: `${barPercent}%` }}></div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div>Extra Services</div>
                <div>{extraPercent.toFixed(1)}%</div>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className="extra-bar h-full rounded-full bg-purple-500"
                  style={{ width: `${extraPercent}%` }}
                ></div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium">Net Revenue Calculation</div>
                <div className="text-sm text-muted-foreground">(Bed + Bar + Extra) - Expenses = Net Revenue</div>
              </div>
              <div className="mt-2 flex justify-between items-center">
                <div className="text-sm">
                  ({data.bedIncomeFormatted} + {data.barIncomeFormatted} + {data.extraIncomeFormatted}) -{" "}
                  {data.expensesFormatted}
                </div>
                <div className="text-lg font-bold text-green-600">{data.netRevenueFormatted}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
