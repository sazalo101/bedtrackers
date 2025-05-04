import { calculateFinancialData, getTransactions } from "@/lib/db"
import { formatCurrency } from "@/lib/utils"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "today"

    // Fetch real transaction data from MongoDB
    const transactions = await getTransactions(period)

    // Calculate financial data based on real transactions
    const financialData = await calculateFinancialData(transactions)

    // Calculate net revenue (income - expenses)
    const netRevenue = financialData.income - financialData.expenses

    return NextResponse.json({
      bedIncome: financialData.bedIncome,
      barIncome: financialData.barIncome,
      extraIncome: financialData.extraIncome,
      totalIncome: financialData.income,
      expenses: financialData.expenses,
      netRevenue: netRevenue,
      bedIncomeFormatted: financialData.bedIncomeFormatted,
      barIncomeFormatted: financialData.barIncomeFormatted,
      extraIncomeFormatted: financialData.extraIncomeFormatted,
      incomeFormatted: financialData.incomeFormatted,
      expensesFormatted: financialData.expensesFormatted,
      netRevenueFormatted: formatCurrency(netRevenue),
    })
  } catch (error) {
    console.error("Error fetching revenue data:", error)
    return NextResponse.json({ error: "Failed to fetch revenue data" }, { status: 500 })
  }
}
