"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/utils"
import { Edit, PlusCircle, Trash2 } from "lucide-react"
import { createBed, updateBed, updateBedStatus, deleteBed } from "../actions"
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

export default function BedsPage() {
  const [beds, setBeds] = useState([])
  const [dormitories, setDormitories] = useState([])
  const [loading, setLoading] = useState(true)
  const [editFormData, setEditFormData] = useState({
    _id: "",
    bed_number: "",
    bed_type: "",
    price: "",
  })
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const bedTypes = ["Single", "Double", "Bunk", "Dormitory"]

  useEffect(() => {
    async function fetchData() {
      try {
        const [bedsResponse, dormitoriesResponse] = await Promise.all([fetch("/api/beds"), fetch("/api/dormitories")])

        if (!bedsResponse.ok || !dormitoriesResponse.ok) {
          throw new Error("Failed to fetch data")
        }

        const bedsData = await bedsResponse.json()
        const dormitoriesData = await dormitoriesResponse.json()

        setBeds(bedsData)
        setDormitories(dormitoriesData)
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

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditSelectChange = (name, value) => {
    setEditFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEdit = (bed) => {
    setEditFormData({
      _id: bed._id,
      bed_number: bed.bed_number,
      bed_type: bed.bed_type,
      price: bed.price.toString(),
    })
    setIsEditDialogOpen(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()

    try {
      const formData = new FormData()
      formData.append("id", editFormData._id)
      formData.append("bed_number", editFormData.bed_number)
      formData.append("bed_type", editFormData.bed_type)
      formData.append("price", editFormData.price)

      const result = await updateBed(formData)

      if (result.success) {
        setBeds((prev) =>
          prev.map((bed) =>
            bed._id === editFormData._id
              ? {
                  ...bed,
                  bed_number: editFormData.bed_number,
                  bed_type: editFormData.bed_type,
                  price: Number.parseFloat(editFormData.price),
                }
              : bed,
          ),
        )

        toast({
          title: "Success",
          description: "Bed updated successfully",
        })

        setIsEditDialogOpen(false)
      } else {
        throw new Error(result.error || "Failed to update bed")
      }
    } catch (error) {
      console.error("Error updating bed:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update bed",
        variant: "destructive",
      })
    }
  }

  const handleDeleteBed = async (id) => {
    try {
      const result = await deleteBed(id)

      if (result.success) {
        setBeds((prev) => prev.filter((bed) => bed._id !== id))
        toast({
          title: "Success",
          description: "Bed deleted successfully",
        })
      } else {
        throw new Error(result.error || "Failed to delete bed")
      }
    } catch (error) {
      console.error("Error deleting bed:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete bed",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "available":
        return <Badge variant="success">Available</Badge>
      case "occupied":
        return <Badge variant="secondary">Occupied</Badge>
      case "needs_cleaning":
        return <Badge variant="warning">Needs Cleaning</Badge>
      case "maintenance":
        return <Badge variant="destructive">Maintenance</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      const result = await updateBedStatus(id, newStatus)

      if (result.success) {
        setBeds((prev) => prev.map((bed) => (bed._id === id ? { ...bed, status: newStatus } : bed)))
        toast({
          title: "Success",
          description: `Bed status updated to ${newStatus}`,
        })
      } else {
        throw new Error(result.error || "Failed to update bed status")
      }
    } catch (error) {
      console.error("Error updating bed status:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update bed status",
        variant: "destructive",
      })
    }
  }

  const handleCreateBed = async (formData) => {
    try {
      const result = await createBed(formData)

      if (result.success) {
        // Refresh the beds list
        const response = await fetch("/api/beds")
        if (!response.ok) throw new Error("Failed to fetch updated beds")
        const updatedBeds = await response.json()
        setBeds(updatedBeds)

        toast({
          title: "Success",
          description: "Bed created successfully",
        })

        // Reset the form
        formData.target.reset()
      } else {
        throw new Error(result.error || "Failed to create bed")
      }
    } catch (error) {
      console.error("Error creating bed:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create bed",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-3xl font-bold tracking-tight">Beds Management</h1>

      <Card>
        <CardHeader>
          <CardTitle>Add New Bed</CardTitle>
          <CardDescription>Create a new bed in a dormitory</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleCreateBed} className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="grid gap-2">
              <Label htmlFor="dormitory_id">Dormitory</Label>
              <Select name="dormitory_id" required>
                <SelectTrigger id="dormitory_id">
                  <SelectValue placeholder="Select dormitory" />
                </SelectTrigger>
                <SelectContent>
                  {dormitories.map((dormitory) => (
                    <SelectItem key={dormitory._id} value={dormitory._id}>
                      {dormitory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bed_number">Bed Number</Label>
              <Input id="bed_number" name="bed_number" placeholder="A-101" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bed_type">Bed Type</Label>
              <Select name="bed_type" required>
                <SelectTrigger id="bed_type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {bedTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="price">Price per Night (Ksh)</Label>
              <div className="flex gap-2">
                <Input id="price" name="price" type="number" step="0.01" min="0" placeholder="0.00" required />
                <Button type="submit" size="icon">
                  <PlusCircle className="h-4 w-4" />
                  <span className="sr-only">Add bed</span>
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bed Inventory</CardTitle>
          <CardDescription>Manage all beds and their status</CardDescription>
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
                    <TableHead>Bed Number</TableHead>
                    <TableHead>Dormitory</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {beds.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No beds found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    beds.map((bed) => (
                      <TableRow key={bed._id}>
                        <TableCell className="font-medium">{bed.bed_number}</TableCell>
                        <TableCell>{bed.dormitory_name}</TableCell>
                        <TableCell>{bed.bed_type}</TableCell>
                        <TableCell>{formatCurrency(bed.price)}</TableCell>
                        <TableCell>{getStatusBadge(bed.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(bed)}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete this bed. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteBed(bed._id)}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            {bed.status === "occupied" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusChange(bed._id, "needs_cleaning")}
                              >
                                Check Out
                              </Button>
                            )}

                            {bed.status === "needs_cleaning" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusChange(bed._id, "available")}
                              >
                                Mark Clean
                              </Button>
                            )}

                            {bed.status === "available" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusChange(bed._id, "occupied")}
                              >
                                Assign
                              </Button>
                            )}

                            {bed.status === "maintenance" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusChange(bed._id, "available")}
                              >
                                Mark Fixed
                              </Button>
                            )}
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Bed</DialogTitle>
            <DialogDescription>Update bed information</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit_bed_number">Bed Number</Label>
              <Input
                id="edit_bed_number"
                name="bed_number"
                value={editFormData.bed_number}
                onChange={handleEditChange}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit_bed_type">Bed Type</Label>
              <Select
                value={editFormData.bed_type}
                onValueChange={(value) => handleEditSelectChange("bed_type", value)}
                required
              >
                <SelectTrigger id="edit_bed_type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {bedTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit_price">Price per Night (Ksh)</Label>
              <Input
                id="edit_price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={editFormData.price}
                onChange={handleEditChange}
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
