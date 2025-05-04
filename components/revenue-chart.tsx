"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface RevenueChartProps {
  bedIncome: number
  barIncome: number
  extraIncome: number
  totalIncome: number
  period: string
}

export function RevenueChart({ bedIncome, barIncome, extraIncome, totalIncome, period }: RevenueChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Calculate percentages
    const total = bedIncome + barIncome + extraIncome
    const bedPercent = total > 0 ? (bedIncome / total) * 100 : 0
    const barPercent = total > 0 ? (barIncome / total) * 100 : 0
    const extraPercent = total > 0 ? (extraIncome / total) * 100 : 0

    // Update chart bars
    const bedBar = chartRef.current.querySelector(".bed-bar") as HTMLElement
    const barBar = chartRef.current.querySelector(".bar-bar") as HTMLElement
    const extraBar = chartRef.current.querySelector(".extra-bar") as HTMLElement

    if (bedBar) bedBar.style.width = `${bedPercent}%`
    if (barBar) barBar.style.width = `${barPercent}%`
    if (extraBar) extraBar.style.width = `${extraPercent}%`
  }, [bedIncome, barIncome, extraIncome])

  // Calculate percentages for display
  const total = bedIncome + barIncome + extraIncome
  const bedPercent = total > 0 ? (bedIncome / total) * 100 : 0
  const barPercent = total > 0 ? (barIncome / total) * 100 : 0
  const extraPercent = total > 0 ? (extraIncome / total) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Breakdown</CardTitle>
        <CardDescription>Revenue by category for {period}</CardDescription>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="py-6 text-center text-muted-foreground">No revenue data available for this period.</div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="flex flex-col gap-1">
                <div className="text-sm font-medium text-muted-foreground">Bed Revenue</div>
                <div className="text-2xl font-bold text-green-500">{formatCurrency(bedIncome)}</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-sm font-medium text-muted-foreground">Bar Revenue</div>
                <div className="text-2xl font-bold text-blue-500">{formatCurrency(barIncome)}</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-sm font-medium text-muted-foreground">Extra Services</div>
                <div className="text-2xl font-bold text-purple-500">{formatCurrency(extraIncome)}</div>
              </div>
              <div className="flex flex-col gap-1 border-l pl-4">
                <div className="text-sm font-medium">Total Revenue</div>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
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
          </div>
        )}
      </CardContent>
    </Card>
  )
}
