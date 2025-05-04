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
import { createExtraService, deleteExtraService, updateExtraServicePaymentStatus } from "../actions"
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

export default function ExtrasPage() {
  const [extras, setExtras] = useState([])
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [extrasRes, guestsRes] = await Promise.all([fetch("/api/extra-services"), fetch("/api/guests")])

        if (!extrasRes.ok || !guestsRes.ok) {
          throw new Error("Failed to fetch data")
        }

        const extrasData = await extrasRes.json()
        const guestsData = await guestsRes.json()

        setExtras(extrasData)
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

  const handleCreateExtraService = async (formData) => {
    try {
      const result = await createExtraService(formData)

      if (result.success) {
        // Refresh the extras list
        const response = await fetch("/api/extra-services")
        if (!response.ok) throw new Error("Failed to fetch updated extra services")
        const updatedExtras = await response.json()
        setExtras(updatedExtras)

        toast({
          title: "Success",
          description: "Extra service created successfully",
        })

        // Reset the form
        formData.target.reset()
      } else {
        throw new Error(result.error || "Failed to create extra service")
      }
    } catch (error) {
      console.error("Error creating extra service:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create extra service",
        variant: "destructive",
      })
    }
  }

  const handleDeleteExtraService = async (id) => {
    try {
      const result = await deleteExtraService(id)

      if (result.success) {
        setExtras((prev) => prev.filter((extra) => extra._id !== id))
        toast({
          title: "Success",
          description: "Extra service deleted successfully",
        })
      } else {
        throw new Error(result.error || "Failed to delete extra service")
      }
    } catch (error) {
      console.error("Error deleting extra service:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete extra service",
        variant: "destructive",
      })
    }
  }

  const updatePaymentStatus = async (id, status) => {
    try {
      const result = await updateExtraServicePaymentStatus(id, status)

      if (result.success) {
        setExtras((prev) => prev.map((extra) => (extra._id === id ? { ...extra, payment_status: status } : extra)))
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
      <h1 className="text-3xl font-bold tracking-tight">Extra Services</h1>

      <Card>
        <CardHeader>
          <CardTitle>Add Extra Service</CardTitle>
          <CardDescription>Record additional services provided to guests</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleCreateExtraService} className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
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
              <Label htmlFor="service_name">Service</Label>
              <Input id="service_name" name="service_name" placeholder="Laundry, Transfer, etc." required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="price">Price</Label>
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
                  <span className="sr-only">Add service</span>
                </Button>
              </div>
            </div>
          </form>
          {guests.length === 0 && (
            <div className="mt-4 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
              No guests available. Please add guests before creating extra services.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Extra Services</CardTitle>
          <CardDescription>All additional services and their payment status</CardDescription>
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
                    <TableHead>Service</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {extras.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No extra services found. Add a service to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    extras.map((extra) => (
                      <TableRow key={extra._id}>
                        <TableCell>{new Date(extra.service_date).toLocaleString()}</TableCell>
                        <TableCell>{extra.guest_name}</TableCell>
                        <TableCell>{extra.service_name}</TableCell>
                        <TableCell>{formatCurrency(extra.price)}</TableCell>
                        <TableCell>
                          <Badge variant={extra.payment_status === "paid" ? "success" : "destructive"}>
                            {extra.payment_status === "paid" ? "Paid" : "Unpaid"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {extra.payment_status === "not_paid" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updatePaymentStatus(extra._id, "paid")}
                              >
                                Mark as Paid
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updatePaymentStatus(extra._id, "not_paid")}
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
                                    This will permanently delete this service. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteExtraService(extra._id)}
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
