"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ExpenseTable } from "@/components/expense-table"
import { PlusCircle } from "lucide-react"
import { createExpense, deleteExpense } from "../actions"
import { toast } from "@/components/ui/use-toast"

const EXPENSE_CATEGORIES = [
  "Utilities",
  "Maintenance",
  "Supplies",
  "Staff",
  "Food",
  "Beverages",
  "Marketing",
  "Rent",
  "Insurance",
  "Other",
]

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchExpenses() {
      try {
        const response = await fetch("/api/expenses")
        if (!response.ok) throw new Error("Failed to fetch expenses")
        const data = await response.json()
        setExpenses(data)
      } catch (error) {
        console.error("Error fetching expenses:", error)
        toast({
          title: "Error",
          description: "Failed to load expenses. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchExpenses()
  }, [])

  const handleDelete = async (id) => {
    try {
      const result = await deleteExpense(id)

      if (result.success) {
        setExpenses((prev) => prev.filter((expense) => expense._id !== id))
        toast({
          title: "Success",
          description: "Expense deleted successfully",
        })
      } else {
        throw new Error(result.error || "Failed to delete expense")
      }
    } catch (error) {
      console.error("Error deleting expense:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete expense",
        variant: "destructive",
      })
    }
  }

  const handleCreateExpense = async (formData) => {
    try {
      const result = await createExpense(formData)

      if (result.success) {
        // Refresh the expenses list
        const response = await fetch("/api/expenses")
        if (!response.ok) throw new Error("Failed to fetch updated expenses")
        const updatedExpenses = await response.json()
        setExpenses(updatedExpenses)

        toast({
          title: "Success",
          description: "Expense created successfully",
        })

        // Reset the form
        formData.target.reset()
      } else {
        throw new Error(result.error || "Failed to create expense")
      }
    } catch (error) {
      console.error("Error creating expense:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create expense",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>

      <Card>
        <CardHeader>
          <CardTitle>Add New Expense</CardTitle>
          <CardDescription>Record a new hostel expense</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleCreateExpense} className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split("T")[0]} required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (Ksh)</Label>
              <Input id="amount" name="amount" type="number" step="0.01" min="0" placeholder="0.00" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <div className="flex gap-2">
                <Input id="description" name="description" placeholder="Brief description" required />
                <Button type="submit" size="icon">
                  <PlusCircle className="h-4 w-4" />
                  <span className="sr-only">Add expense</span>
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expense History</CardTitle>
          <CardDescription>All recorded hostel expenses</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ExpenseTable expenses={expenses} onDelete={handleDelete} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
