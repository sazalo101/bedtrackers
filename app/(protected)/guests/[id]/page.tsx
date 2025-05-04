"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ArrowLeft, Bed, CreditCard, Receipt, Trash2, Wine } from "lucide-react"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { deleteAssignment, updateAssignmentPaymentStatus } from "@/app/actions"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateBarTransactionPaymentStatus, updateExtraServicePaymentStatus } from "@/app/actions"

export default function GuestDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [guest, setGuest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [paymentAmount, setPaymentAmount] = useState("")
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)

  useEffect(() => {
    async function fetchGuestDetails() {
      try {
        const response = await fetch(`/api/guests/${id}`)
        if (!response.ok) throw new Error("Failed to fetch guest details")
        const data = await response.json()
        setGuest(data)
      } catch (error) {
        console.error("Error fetching guest details:", error)
        toast({
          title: "Error",
          description: "Failed to load guest details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchGuestDetails()
    }
  }, [id])

  const handleUpdatePaymentStatus = async (id, type, status) => {
    try {
      let result

      if (type === "bed") {
        result = await updateAssignmentPaymentStatus(id, status)
      } else if (type === "bar") {
        result = await updateBarTransactionPaymentStatus(id, status)
      } else if (type === "extra") {
        result = await updateExtraServicePaymentStatus(id, status)
      }

      if (result.success) {
        // Refresh guest details
        const response = await fetch(`/api/guests/${guest.guest._id}`)
        if (!response.ok) throw new Error("Failed to fetch updated guest details")
        const updatedData = await response.json()
        setGuest(updatedData)

        toast({
          title: "Success",
          description: "Payment status updated successfully",
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

  const handleDeleteAssignment = async (assignmentId) => {
    try {
      const result = await deleteAssignment(assignmentId)

      if (result.success) {
        // Refresh guest details
        const response = await fetch(`/api/guests/${guest.guest._id}`)
        if (!response.ok) throw new Error("Failed to fetch updated guest details")
        const updatedData = await response.json()
        setGuest(updatedData)

        toast({
          title: "Success",
          description: "Assignment deleted successfully",
        })
      } else {
        throw new Error(result.error || "Failed to delete assignment")
      }
    } catch (error) {
      console.error("Error deleting assignment:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete assignment",
        variant: "destructive",
      })
    }
  }

  const handleRecordPayment = async () => {
    setIsProcessingPayment(true)
    try {
      const response = await fetch(`/api/guests/${guest.guest._id}/payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: Number(paymentAmount) }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to record payment")
      }

      const result = await response.json()

      toast({
        title: "Success",
        description: `Payment of ${formatCurrency(Number(paymentAmount))} recorded successfully`,
      })

      setPaymentAmount("")
      setIsPaymentDialogOpen(false)

      // Refresh guest details
      const detailsResponse = await fetch(`/api/guests/${guest.guest._id}`)
      if (!detailsResponse.ok) throw new Error("Failed to fetch updated guest details")
      const updatedData = await detailsResponse.json()
      setGuest(updatedData)
    } catch (error) {
      console.error("Error recording payment:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to record payment",
        variant: "destructive",
      })
    } finally {
      setIsProcessingPayment(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/guests">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Loading Guest Details...</h1>
        </div>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!guest) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/guests">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Guest Not Found</h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">The requested guest could not be found.</p>
            <Button className="mt-4" asChild>
              <Link href="/guests">Back to Guests</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/guests">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{guest.guest.name}</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Guest Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Email</div>
              <div>{guest.guest.email || "—"}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Phone</div>
              <div>{guest.guest.phone || "—"}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Nationality</div>
              <div>{guest.guest.nationality || "—"}</div>
            </div>
            {guest.currentAssignment && (
              <>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Current Bed</div>
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4" />
                    {guest.currentAssignment.bed_number} ({guest.currentAssignment.dormitory_name})
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Check In/Out</div>
                  <div>
                    {formatDate(guest.currentAssignment.check_in)} - {formatDate(guest.currentAssignment.check_out)}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">Total Charges</div>
              <div className="font-medium">{formatCurrency(guest.totalCharges)}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">Total Paid</div>
              <div className="font-medium text-green-500">{formatCurrency(guest.totalPaid)}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">Balance Due</div>
              <div className="font-medium text-red-500">{formatCurrency(guest.balanceDue)}</div>
            </div>
            <div className="pt-2">
              <Button className="w-full" onClick={() => setIsPaymentDialogOpen(true)} disabled={guest.balanceDue <= 0}>
                <CreditCard className="mr-2 h-4 w-4" />
                Record Payment
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Charges Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bed className="h-4 w-4" />
                <div className="text-sm font-medium">Bed Charges</div>
              </div>
              <div className="font-medium">
                {formatCurrency(guest.bedCharges.reduce((sum, item) => sum + item.amount, 0))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wine className="h-4 w-4" />
                <div className="text-sm font-medium">Bar Charges</div>
              </div>
              <div className="font-medium">
                {formatCurrency(guest.barCharges.reduce((sum, item) => sum + item.amount, 0))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                <div className="text-sm font-medium">Extra Charges</div>
              </div>
              <div className="font-medium">
                {formatCurrency(guest.extraCharges.reduce((sum, item) => sum + item.amount, 0))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Transaction History</TabsTrigger>
          <TabsTrigger value="bed">Bed Charges</TabsTrigger>
          <TabsTrigger value="bar">Bar Charges</TabsTrigger>
          <TabsTrigger value="extra">Extra Charges</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>Complete history of all guest transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-2 text-left font-medium">Date</th>
                      <th className="p-2 text-left font-medium">Type</th>
                      <th className="p-2 text-left font-medium">Description</th>
                      <th className="p-2 text-left font-medium">Amount</th>
                      <th className="p-2 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guest.allTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-muted-foreground">
                          No transactions found.
                        </td>
                      </tr>
                    ) : (
                      guest.allTransactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b">
                          <td className="p-2">{formatDate(transaction.date)}</td>
                          <td className="p-2">{transaction.type}</td>
                          <td className="p-2">{transaction.description}</td>
                          <td className="p-2">{formatCurrency(transaction.amount)}</td>
                          <td className="p-2">
                            <Badge variant={transaction.payment_status === "paid" ? "success" : "destructive"}>
                              {transaction.payment_status === "paid" ? "Paid" : "Unpaid"}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bed Charges</CardTitle>
              <CardDescription>All bed-related charges for this guest</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-2 text-left font-medium">Date</th>
                      <th className="p-2 text-left font-medium">Description</th>
                      <th className="p-2 text-left font-medium">Amount</th>
                      <th className="p-2 text-left font-medium">Status</th>
                      <th className="p-2 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guest.bedCharges.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-muted-foreground">
                          No bed charges found.
                        </td>
                      </tr>
                    ) : (
                      guest.bedCharges.map((charge) => (
                        <tr key={charge.id} className="border-b">
                          <td className="p-2">{formatDate(charge.date)}</td>
                          <td className="p-2">{charge.description}</td>
                          <td className="p-2">{formatCurrency(charge.amount)}</td>
                          <td className="p-2">
                            <Badge variant={charge.payment_status === "paid" ? "success" : "destructive"}>
                              {charge.payment_status === "paid" ? "Paid" : "Unpaid"}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <div className="flex gap-2">
                              {charge.payment_status !== "paid" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdatePaymentStatus(charge.id, "bed", "paid")}
                                >
                                  Mark as Paid
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
                                      This will permanently delete this bed assignment. This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteAssignment(charge.id)}
                                      className="bg-red-500 hover:bg-red-600"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bar Charges</CardTitle>
              <CardDescription>All bar-related charges for this guest</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-2 text-left font-medium">Date</th>
                      <th className="p-2 text-left font-medium">Description</th>
                      <th className="p-2 text-left font-medium">Amount</th>
                      <th className="p-2 text-left font-medium">Status</th>
                      <th className="p-2 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guest.barCharges.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-muted-foreground">
                          No bar charges found.
                        </td>
                      </tr>
                    ) : (
                      guest.barCharges.map((charge) => (
                        <tr key={charge.id} className="border-b">
                          <td className="p-2">{formatDate(charge.date)}</td>
                          <td className="p-2">{charge.description}</td>
                          <td className="p-2">{formatCurrency(charge.amount)}</td>
                          <td className="p-2">
                            <Badge variant={charge.payment_status === "paid" ? "success" : "destructive"}>
                              {charge.payment_status === "paid" ? "Paid" : "Unpaid"}
                            </Badge>
                          </td>
                          <td className="p-2">
                            {charge.payment_status !== "paid" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdatePaymentStatus(charge.id, "bar", "paid")}
                              >
                                Mark as Paid
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="extra" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Extra Charges</CardTitle>
              <CardDescription>All additional charges for this guest</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-2 text-left font-medium">Date</th>
                      <th className="p-2 text-left font-medium">Description</th>
                      <th className="p-2 text-left font-medium">Amount</th>
                      <th className="p-2 text-left font-medium">Status</th>
                      <th className="p-2 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guest.extraCharges.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-muted-foreground">
                          No extra charges found.
                        </td>
                      </tr>
                    ) : (
                      guest.extraCharges.map((charge) => (
                        <tr key={charge.id} className="border-b">
                          <td className="p-2">{formatDate(charge.date)}</td>
                          <td className="p-2">{charge.description}</td>
                          <td className="p-2">{formatCurrency(charge.amount)}</td>
                          <td className="p-2">
                            <Badge variant={charge.payment_status === "paid" ? "success" : "destructive"}>
                              {charge.payment_status === "paid" ? "Paid" : "Unpaid"}
                            </Badge>
                          </td>
                          <td className="p-2">
                            {charge.payment_status !== "paid" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdatePaymentStatus(charge.id, "extra", "paid")}
                              >
                                Mark as Paid
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>Enter the payment amount received from the guest.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="payment-amount">Payment Amount (Ksh)</Label>
              <Input
                id="payment-amount"
                type="number"
                min="0"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            <div className="text-sm text-muted-foreground">Balance due: {formatCurrency(guest.balanceDue)}</div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleRecordPayment}
              disabled={!paymentAmount || isProcessingPayment || Number(paymentAmount) <= 0}
            >
              {isProcessingPayment ? "Processing..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
