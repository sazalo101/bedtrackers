"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle, Trash2 } from "lucide-react"
import { createDormitory, deleteDormitory } from "../actions"
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
import Link from "next/link"

export default function DormitoriesPage() {
  const [dormitories, setDormitories] = useState([])
  const [loading, setLoading] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editFormData, setEditFormData] = useState({
    _id: "",
    name: "",
    description: "",
    capacity: "",
  })

  useEffect(() => {
    async function fetchDormitories() {
      try {
        const response = await fetch("/api/dormitories")
        if (!response.ok) throw new Error("Failed to fetch dormitories")
        const data = await response.json()
        setDormitories(data)
      } catch (error) {
        console.error("Error fetching dormitories:", error)
        toast({
          title: "Error",
          description: "Failed to load dormitories. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDormitories()
  }, [])

  const handleCreateDormitory = async (formData) => {
    try {
      const result = await createDormitory(formData)

      if (result.success) {
        // Refresh the dormitories list
        const response = await fetch("/api/dormitories")
        if (!response.ok) throw new Error("Failed to fetch updated dormitories")
        const updatedDormitories = await response.json()
        setDormitories(updatedDormitories)

        toast({
          title: "Success",
          description: "Dormitory created successfully",
        })

        // Reset the form
        formData.target.reset()
      } else {
        throw new Error(result.error || "Failed to create dormitory")
      }
    } catch (error) {
      console.error("Error creating dormitory:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create dormitory",
        variant: "destructive",
      })
    }
  }

  const handleDeleteDormitory = async (id) => {
    try {
      const result = await deleteDormitory(id)

      if (result.success) {
        setDormitories((prev) => prev.filter((dorm) => dorm._id !== id))
        toast({
          title: "Success",
          description: "Dormitory deleted successfully",
        })
      } else {
        throw new Error(result.error || "Failed to delete dormitory")
      }
    } catch (error) {
      console.error("Error deleting dormitory:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete dormitory",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-3xl font-bold tracking-tight">Dormitories</h1>

      <Card>
        <CardHeader>
          <CardTitle>Add New Dormitory</CardTitle>
          <CardDescription>Create a new dormitory for your hostel</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleCreateDormitory} className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="name">Dormitory Name</Label>
              <Input id="name" name="name" placeholder="Main Building" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input id="capacity" name="capacity" type="number" min="1" placeholder="20" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <div className="flex gap-2">
                <Input id="description" name="description" placeholder="Brief description" />
                <Button type="submit" size="icon">
                  <PlusCircle className="h-4 w-4" />
                  <span className="sr-only">Add dormitory</span>
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dormitories</CardTitle>
          <CardDescription>Manage your hostel dormitories</CardDescription>
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
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Beds</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dormitories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No dormitories found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    dormitories.map((dormitory) => (
                      <TableRow key={dormitory._id}>
                        <TableCell className="font-medium">{dormitory.name}</TableCell>
                        <TableCell>{dormitory.description || "—"}</TableCell>
                        <TableCell>{dormitory.capacity}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/beds?dormitory=${dormitory._id}`}>View Beds</Link>
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
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
                                    This will permanently delete this dormitory. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteDormitory(dormitory._id)}
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
