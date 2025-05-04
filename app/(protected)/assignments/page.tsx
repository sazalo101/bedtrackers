"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/date-picker"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createAssignment } from "../actions"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AssignmentPage() {
  const router = useRouter()
  const [guests, setGuests] = useState([])
  const [beds, setBeds] = useState([])
  const [selectedBed, setSelectedBed] = useState(null)
  const [checkIn, setCheckIn] = useState<Date>(new Date())
  const [checkOut, setCheckOut] = useState<Date>(new Date(Date.now() + 86400000)) // Tomorrow
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const [guestsResponse, bedsResponse] = await Promise.all([fetch("/api/guests"), fetch("/api/beds/available")])

        if (!guestsResponse.ok || !bedsResponse.ok) {
          throw new Error("Failed to fetch data")
        }

        const guestsData = await guestsResponse.json()
        const bedsData = await bedsResponse.json()

        setGuests(guestsData)
        setBeds(bedsData)
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

  const handleBedChange = (bedId) => {
    const bed = beds.find((b) => b._id === bedId)
    setSelectedBed(bed)
  }

  const handleSubmit = async (formData) => {
    setIsSubmitting(true)
    try {
      const result = await createAssignment(formData)

      if (result.success) {
        toast({
          title: "Success",
          description: "Guest assigned to bed successfully",
        })
        router.push("/")
      } else {
        throw new Error(result.error || "Failed to assign guest to bed")
      }
    } catch (error) {
      console.error("Error assigning guest:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to assign guest to bed",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Assign Bed to Guest</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bed Assignment</CardTitle>
          <CardDescription>Assign an available bed to a guest</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <form action={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="guest_id">Guest</Label>
                    <Select name="guest_id" required>
                      <SelectTrigger id="guest_id">
                        <SelectValue placeholder="Select guest" />
                      </SelectTrigger>
                      <SelectContent>
                        {guests.map((guest) => (
                          <SelectItem key={guest._id} value={guest._id}>
                            {guest.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="bed_id">Bed</Label>
                    <Select name="bed_id" required onValueChange={handleBedChange}>
                      <SelectTrigger id="bed_id">
                        <SelectValue placeholder="Select bed" />
                      </SelectTrigger>
                      <SelectContent>
                        {beds.map((bed) => (
                          <SelectItem key={bed._id} value={bed._id}>
                            {bed.bed_number} ({bed.dormitory_name}) - {bed.bed_type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Check-in Date</Label>
                    <input
                      type="hidden"
                      name="check_in"
                      value={checkIn ? checkIn.toISOString() : new Date().toISOString()}
                    />
                    <DatePicker date={checkIn} setDate={setCheckIn} />
                  </div>

                  <div>
                    <Label>Check-out Date</Label>
                    <input
                      type="hidden"
                      name="check_out"
                      value={checkOut ? checkOut.toISOString() : new Date(Date.now() + 86400000).toISOString()}
                    />
                    <DatePicker date={checkOut} setDate={setCheckOut} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="price">Price (Ksh)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue={selectedBed?.price || ""}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="payment_status">Payment Status</Label>
                    <Select name="payment_status" defaultValue="not_paid" required>
                      <SelectTrigger id="payment_status">
                        <SelectValue placeholder="Select payment status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="partially_paid">Partially Paid</SelectItem>
                        <SelectItem value="not_paid">Not Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" name="notes" rows={4} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" asChild>
                  <Link href="/">Cancel</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Assigning..." : "Assign Bed"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
