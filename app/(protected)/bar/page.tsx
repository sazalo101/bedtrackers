"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { PlusCircle, Trash2 } from "lucide-react"
import { createBarTransaction, deleteBarTransaction, updateBarTransactionPaymentStatus } from "../actions"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function BarPage() {
  const [transactions, setTransactions] = useState([])
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [transactionsRes, guestsRes] = await Promise.all([fetch("/api/bar-transactions"), fetch("/api/guests")])

        if (!transactionsRes.ok || !guestsRes.ok) {
          throw new Error("Failed to fetch data")
        }

        const transactionsData = await transactionsRes.json()
        const guestsData = await guestsRes.json()

        setTransactions(transactionsData)
        setGuests(guestsData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleCreateTransaction = async (formData) => {
    try {
      const result = await createBarTransaction(formData)

      if (result.success) {
        // Refresh the transactions list
        const response = await fetch("/api/bar-transactions")
        if (!response.ok) throw new Error("Failed to fetch updated transactions")
        const updatedTransactions = await response.json()
        setTransactions(updatedTransactions)

        toast({
          title: "Success",
          description: "Bar transaction created successfully",
        })

        // Reset the form
        formData.target.reset()
      } else {
        throw new Error(result.error || "Failed to create bar transaction")
      }
    } catch (error) {
      console.error("Error creating bar transaction:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create bar transaction",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTransaction = async (id) => {
    try {
      const result = await deleteBarTransaction(id)

      if (result.success) {
        setTransactions((prev) => prev.filter((transaction) => transaction._id !== id))
        toast({
          title: "Success",
          description: "Bar transaction deleted successfully",
        })
      } else {
        throw new Error(result.error || "Failed to delete bar transaction")
      }
    } catch (error) {
      console.error("Error deleting bar transaction:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete bar transaction",
        variant: "destructive",
      })
    }
  }

  const updatePaymentStatus = async (id, status) => {
    try {
      const result = await updateBarTransactionPaymentStatus(id, status)

      if (result.success) {
        setTransactions((prev) =>
          prev.map((transaction) =>
            transaction._id === id ? { ...transaction, payment_status: status } : transaction,
          ),
        )
        toast({
          title: "Success",
          description: `Payment status updated to ${status === "paid" ? "paid" : "unpaid"}`,
        })
      } else {
        throw new Error(result.error || "Failed to update payment status")
      }
    } catch (error) {
      console.error("Error updating payment status:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update payment status",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-3xl font-bold tracking-tight">Bar Management</h1>

      <Card>
        <CardHeader>
          <CardTitle>Add Bar Transaction</CardTitle>
          <CardDescription>Record a new bar purchase</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleCreateTransaction} className="grid gap-4 sm:grid-cols-2 md:grid-cols-5">
            <div className="grid gap-2">
              <Label htmlFor="guest_id">Guest</Label>
              <Select name="guest_id" required>
                <SelectTrigger id="guest_id">
                  <SelectValue placeholder="Select guest" />
                </SelectTrigger>
                <SelectContent>
                  {guests.length === 0 ? (
                    <SelectItem value="no-guests" disabled>
                      No guests available
                    </SelectItem>
                  ) : (
                    guests.map((guest) => (
                      <SelectItem key={guest._id} value={guest._id}>
                        {guest.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="item_name">Item</Label>
              <Input id="item_name" name="item_name" placeholder="Beer, Wine, etc." required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" name="quantity" type="number" min="1" defaultValue="1" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="price">Price (per item)</Label>
              <Input id="price" name="price" type="number" step="0.01" min="0" placeholder="0.00" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="payment_status">Payment Status</Label>
              <div className="flex gap-2">
                <Select name="payment_status" defaultValue="not_paid" required>
                  <SelectTrigger id="payment_status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="not_paid">Not Paid</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit" size="icon" disabled={guests.length === 0}>
                  <PlusCircle className="h-4 w-4" />
                  <span className="sr-only">Add transaction</span>
                </Button>
              </div>
            </div>
          </form>
          {guests.length === 0 && (
            <div className="mt-4 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
              No guests available. Please add guests before creating bar transactions.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bar Transactions</CardTitle>
          <CardDescription>All bar purchases and their payment status</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No transactions found. Add a bar transaction to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((transaction) => (
                      <TableRow key={transaction._id}>
                        <TableCell>{new Date(transaction.transaction_date).toLocaleString()}</TableCell>
                        <TableCell>{transaction.guest_name}</TableCell>
                        <TableCell>{transaction.item_name}</TableCell>
                        <TableCell>{transaction.quantity}</TableCell>
                        <TableCell>{formatCurrency(transaction.price)}</TableCell>
                        <TableCell>{formatCurrency(transaction.quantity * transaction.price)}</TableCell>
                        <TableCell>
                          <Badge variant={transaction.payment_status === "paid" ? "success" : "destructive"}>
                            {transaction.payment_status === "paid" ? "Paid" : "Unpaid"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {transaction.payment_status === "not_paid" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updatePaymentStatus(transaction._id, "paid")}
                              >
                                Mark as Paid
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updatePaymentStatus(transaction._id, "not_paid")}
                              >
                                Mark as Unpaid
                              </Button>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete this transaction. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteTransaction(transaction._id)}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
