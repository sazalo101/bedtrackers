"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getDb } from "@/lib/db"
import { ObjectId } from "mongodb"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import type { Bed, Dormitory, Expense, Guest } from "@/lib/models"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const TOKEN_EXPIRY = "7d"

// Authentication actions
export async function registerUser({
  name,
  email,
  password,
}: {
  name: string
  email: string
  password: string
}) {
  try {
    const db = await getDb()

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email })
    if (existingUser) {
      return { success: false, error: "Email already in use" }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const result = await db.collection("users").insertOne({
      name,
      email,
      password: hashedPassword,
      role: "user", // Default role
      created_at: new Date(),
    })

    return { success: true, userId: result.insertedId }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, error: "Failed to create account" }
  }
}

export async function loginUser({
  email,
  password,
}: {
  email: string
  password: string
}) {
  try {
    const db = await getDb()

    // Find user
    const user = await db.collection("users").findOne({ email })
    if (!user) {
      return { success: false, error: "Invalid email or password" }
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password)
    if (!passwordValid) {
      return { success: false, error: "Invalid email or password" }
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY },
    )

    // Set cookie
    cookies().set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return { success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role } }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "Failed to log in" }
  }
}

export async function logoutUser() {
  cookies().delete("auth_token")
  cookies().delete("token")
  redirect("/login")
}

export async function getCurrentUser() {
  try {
    const token = cookies().get("auth_token")?.value

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string
      email: string
      name: string
      role: string
    }

    return {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
    }
  } catch (error) {
    console.error("Auth error:", error)
    return null
  }
}

// Guest actions
export async function createGuest(formData: FormData) {
  try {
    const db = await getDb()

    const guest = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      nationality: formData.get("nationality") as string,
      id_type: formData.get("id_type") as string,
      id_number: formData.get("id_number") as string,
      notes: formData.get("notes") as string,
      created_at: new Date(),
    }

    const result = await db.collection("guests").insertOne(guest)

    revalidatePath("/guests")
    return { success: true, id: result.insertedId }
  } catch (error) {
    console.error("Error creating guest:", error)
    return { success: false, error: "Failed to create guest" }
  }
}

export async function updateGuest(formData: FormData) {
  try {
    const db = await getDb()
    const id = formData.get("id") as string

    const guest = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      nationality: formData.get("nationality") as string,
      id_type: formData.get("id_type") as string,
      id_number: formData.get("id_number") as string,
      notes: formData.get("notes") as string,
    }

    await db.collection("guests").updateOne({ _id: new ObjectId(id) }, { $set: guest })

    revalidatePath(`/guests/${id}`)
    revalidatePath("/guests")
    return { success: true }
  } catch (error) {
    console.error("Error updating guest:", error)
    return { success: false, error: "Failed to update guest" }
  }
}

export async function deleteGuest(id: string) {
  try {
    const db = await getDb()
    await db.collection("guests").deleteOne({ _id: new ObjectId(id) })

    revalidatePath("/guests")
    return { success: true }
  } catch (error) {
    console.error("Error deleting guest:", error)
    return { success: false, error: "Failed to delete guest" }
  }
}

// Bed actions
export async function createBed(formData: FormData) {
  try {
    const db = await getDb()

    const bed = {
      bed_number: formData.get("bed_number") as string,
      dormitory_id: new ObjectId(formData.get("dormitory_id") as string),
      bed_type: formData.get("bed_type") as string,
      status: "available",
      price: Number.parseFloat(formData.get("price") as string),
      notes: formData.get("notes") as string,
    }

    const result = await db.collection("beds").insertOne(bed)

    revalidatePath("/beds")
    return { success: true, id: result.insertedId }
  } catch (error) {
    console.error("Error creating bed:", error)
    return { success: false, error: "Failed to create bed" }
  }
}

export async function updateBed(formData: FormData) {
  try {
    const db = await getDb()
    const id = formData.get("id") as string

    const bed = {
      bed_number: formData.get("bed_number") as string,
      bed_type: formData.get("bed_type") as string,
      price: Number.parseFloat(formData.get("price") as string),
      notes: formData.get("notes") as string,
    }

    await db.collection("beds").updateOne({ _id: new ObjectId(id) }, { $set: bed })

    revalidatePath("/beds")
    return { success: true }
  } catch (error) {
    console.error("Error updating bed:", error)
    return { success: false, error: "Failed to update bed" }
  }
}

export async function deleteBed(id: string) {
  try {
    const db = await getDb()
    await db.collection("beds").deleteOne({ _id: new ObjectId(id) })

    revalidatePath("/beds")
    return { success: true }
  } catch (error) {
    console.error("Error deleting bed:", error)
    return { success: false, error: "Failed to delete bed" }
  }
}

export async function updateBedStatus(id: string, status: string) {
  try {
    const db = await getDb()

    await db.collection("beds").updateOne({ _id: new ObjectId(id) }, { $set: { status } })

    revalidatePath("/beds")
    return { success: true }
  } catch (error) {
    console.error("Error updating bed status:", error)
    return { success: false, error: "Failed to update bed status" }
  }
}

// Assignment actions
export async function createAssignment(formData: FormData) {
  try {
    const db = await getDb()

    const guestId = formData.get("guest_id") as string
    const bedId = formData.get("bed_id") as string
    const checkIn = new Date(formData.get("check_in") as string)
    const checkOut = new Date(formData.get("check_out") as string)
    const price = Number.parseFloat(formData.get("price") as string)
    const paymentStatus = formData.get("payment_status") as string

    const assignment = {
      guest_id: new ObjectId(guestId),
      bed_id: new ObjectId(bedId),
      check_in: checkIn,
      check_out: checkOut,
      price,
      payment_status: paymentStatus,
      notes: formData.get("notes") as string,
    }

    // Update bed status to occupied
    await db.collection("beds").updateOne({ _id: new ObjectId(bedId) }, { $set: { status: "occupied" } })

    const result = await db.collection("assignments").insertOne(assignment)

    revalidatePath("/")
    revalidatePath("/guests")
    revalidatePath("/beds")
    revalidatePath("/calendar")
    return { success: true, id: result.insertedId }
  } catch (error) {
    console.error("Error creating assignment:", error)
    return { success: false, error: "Failed to create assignment" }
  }
}

export async function deleteAssignment(id: string) {
  try {
    const db = await getDb()

    // Get the assignment to find the bed_id
    const assignment = await db.collection("assignments").findOne({ _id: new ObjectId(id) })

    if (assignment) {
      // Update bed status back to available
      await db.collection("beds").updateOne({ _id: assignment.bed_id }, { $set: { status: "needs_cleaning" } })
    }

    await db.collection("assignments").deleteOne({ _id: new ObjectId(id) })

    revalidatePath("/")
    revalidatePath("/guests")
    revalidatePath("/calendar")
    return { success: true }
  } catch (error) {
    console.error("Error deleting assignment:", error)
    return { success: false, error: "Failed to delete assignment" }
  }
}

export async function updateAssignmentPaymentStatus(id: string, status: string) {
  try {
    const db = await getDb()

    await db
      .collection("assignments")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { payment_status: status, payment_date: status === "paid" ? new Date() : null } },
      )

    revalidatePath("/")
    revalidatePath("/guests")
    revalidatePath("/transactions")
    return { success: true }
  } catch (error) {
    console.error("Error updating assignment payment status:", error)
    return { success: false, error: "Failed to update payment status" }
  }
}

// Bar transaction actions
export async function createBarTransaction(formData: FormData) {
  try {
    const db = await getDb()

    const guestId = formData.get("guest_id") as string
    const itemName = formData.get("item_name") as string
    const quantity = Number.parseInt(formData.get("quantity") as string)
    const price = Number.parseFloat(formData.get("price") as string)
    const paymentStatus = formData.get("payment_status") as string

    const transaction = {
      guest_id: new ObjectId(guestId),
      transaction_date: new Date(),
      item_name: itemName,
      quantity,
      price,
      amount: quantity * price,
      payment_status: paymentStatus,
      notes: formData.get("notes") as string,
    }

    const result = await db.collection("bar_transactions").insertOne(transaction)

    revalidatePath("/")
    revalidatePath("/bar")
    revalidatePath("/transactions")
    revalidatePath(`/guests/${guestId}`)
    return { success: true, id: result.insertedId }
  } catch (error) {
    console.error("Error creating bar transaction:", error)
    return { success: false, error: "Failed to create bar transaction" }
  }
}

export async function deleteBarTransaction(id: string) {
  try {
    const db = await getDb()
    await db.collection("bar_transactions").deleteOne({ _id: new ObjectId(id) })

    revalidatePath("/")
    revalidatePath("/bar")
    revalidatePath("/transactions")
    return { success: true }
  } catch (error) {
    console.error("Error deleting bar transaction:", error)
    return { success: false, error: "Failed to delete bar transaction" }
  }
}

export async function updateBarTransactionPaymentStatus(id: string, status: string) {
  try {
    const db = await getDb()

    await db.collection("bar_transactions").updateOne({ _id: new ObjectId(id) }, { $set: { payment_status: status } })

    revalidatePath("/")
    revalidatePath("/bar")
    revalidatePath("/transactions")
    return { success: true }
  } catch (error) {
    console.error("Error updating bar transaction payment status:", error)
    return { success: false, error: "Failed to update payment status" }
  }
}

// Extra service actions
export async function createExtraService(formData: FormData) {
  try {
    const db = await getDb()

    const guestId = formData.get("guest_id") as string
    const serviceName = formData.get("service_name") as string
    const price = Number.parseFloat(formData.get("price") as string)
    const paymentStatus = formData.get("payment_status") as string

    const service = {
      guest_id: new ObjectId(guestId),
      service_date: new Date(),
      service_name: serviceName,
      price,
      payment_status: paymentStatus,
      notes: formData.get("notes") as string,
    }

    const result = await db.collection("extra_services").insertOne(service)

    revalidatePath("/")
    revalidatePath("/extras")
    revalidatePath("/transactions")
    revalidatePath(`/guests/${guestId}`)
    return { success: true, id: result.insertedId }
  } catch (error) {
    console.error("Error creating extra service:", error)
    return { success: false, error: "Failed to create extra service" }
  }
}

export async function deleteExtraService(id: string) {
  try {
    const db = await getDb()
    await db.collection("extra_services").deleteOne({ _id: new ObjectId(id) })

    revalidatePath("/")
    revalidatePath("/extras")
    revalidatePath("/transactions")
    return { success: true }
  } catch (error) {
    console.error("Error deleting extra service:", error)
    return { success: false, error: "Failed to delete extra service" }
  }
}

export async function updateExtraServicePaymentStatus(id: string, status: string) {
  try {
    const db = await getDb()

    await db.collection("extra_services").updateOne({ _id: new ObjectId(id) }, { $set: { payment_status: status } })

    revalidatePath("/")
    revalidatePath("/extras")
    revalidatePath("/transactions")
    return { success: true }
  } catch (error) {
    console.error("Error updating extra service payment status:", error)
    return { success: false, error: "Failed to update payment status" }
  }
}

// Expense actions
export async function createExpense(formData: FormData) {
  try {
    const db = await getDb()

    const expense = {
      date: new Date(formData.get("date") as string),
      category: formData.get("category") as string,
      description: formData.get("description") as string,
      amount: Number.parseFloat(formData.get("amount") as string),
      notes: formData.get("notes") as string,
    }

    const result = await db.collection("expenses").insertOne(expense)

    revalidatePath("/")
    revalidatePath("/expenses")
    return { success: true, id: result.insertedId }
  } catch (error) {
    console.error("Error creating expense:", error)
    return { success: false, error: "Failed to create expense" }
  }
}

export async function deleteExpense(id: string) {
  try {
    const db = await getDb()

    await db.collection("expenses").deleteOne({ _id: new ObjectId(id) })

    revalidatePath("/")
    revalidatePath("/expenses")
    return { success: true }
  } catch (error) {
    console.error("Error deleting expense:", error)
    return { success: false, error: "Failed to delete expense" }
  }
}

// Dormitory actions
export async function createDormitory(formData: FormData) {
  try {
    const db = await getDb()

    const dormitory = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      capacity: Number.parseInt(formData.get("capacity") as string),
    }

    const result = await db.collection("dormitories").insertOne(dormitory)

    revalidatePath("/beds")
    return { success: true, id: result.insertedId }
  } catch (error) {
    console.error("Error creating dormitory:", error)
    return { success: false, error: "Failed to create dormitory" }
  }
}

export async function deleteDormitory(id: string) {
  try {
    const db = await getDb()

    // Check if there are any beds in this dormitory
    const bedsCount = await db.collection("beds").countDocuments({ dormitory_id: new ObjectId(id) })

    if (bedsCount > 0) {
      return {
        success: false,
        error: "Cannot delete dormitory that contains beds. Please delete or reassign all beds first.",
      }
    }

    await db.collection("dormitories").deleteOne({ _id: new ObjectId(id) })

    revalidatePath("/beds")
    return { success: true }
  } catch (error) {
    console.error("Error deleting dormitory:", error)
    return { success: false, error: "Failed to delete dormitory" }
  }
}

// Data seeding for demo purposes
export async function seedDemoData() {
  try {
    const db = await getDb()

    // Check if data already exists
    const dormCount = await db.collection("dormitories").countDocuments()
    if (dormCount > 0) {
      return { success: true, message: "Demo data already exists" }
    }

    // Create dormitories
    const dormitories: Partial<Dormitory>[] = [
      { name: "Main Building", description: "Main hostel building", capacity: 20 },
      { name: "Annex", description: "Annex building with private rooms", capacity: 10 },
    ]

    const dormResult = await db.collection("dormitories").insertMany(dormitories)

    // Create beds
    const beds: Partial<Bed>[] = [
      {
        bed_number: "A-101",
        dormitory_id: dormResult.insertedIds[0],
        bed_type: "Single",
        status: "available",
        price: 1500,
        notes: "Standard single bed",
      },
      {
        bed_number: "A-102",
        dormitory_id: dormResult.insertedIds[0],
        bed_type: "Single",
        status: "available",
        price: 1500,
        notes: "Standard single bed",
      },
      {
        bed_number: "A-103",
        dormitory_id: dormResult.insertedIds[0],
        bed_type: "Double",
        status: "available",
        price: 2500,
        notes: "Double bed with window",
      },
      {
        bed_number: "B-201",
        dormitory_id: dormResult.insertedIds[1],
        bed_type: "Double",
        status: "available",
        price: 3000,
        notes: "Premium double bed",
      },
      {
        bed_number: "B-202",
        dormitory_id: dormResult.insertedIds[1],
        bed_type: "Single",
        status: "available",
        price: 2000,
        notes: "Premium single bed",
      },
    ]

    await db.collection("beds").insertMany(beds)

    // Create guests
    const guests: Partial<Guest>[] = [
      {
        name: "John Kamau",
        email: "john@example.com",
        phone: "+254 712 345 678",
        nationality: "Kenya",
        created_at: new Date(),
      },
      {
        name: "Jane Wambui",
        email: "jane@example.com",
        phone: "+254 723 456 789",
        nationality: "Kenya",
        created_at: new Date(),
      },
      {
        name: "Bob Johnson",
        email: "bob@example.com",
        phone: "+1 (555) 456-7890",
        nationality: "UK",
        created_at: new Date(),
      },
    ]

    const guestResult = await db.collection("guests").insertMany(guests)

    // Create some expenses
    const expenses: Partial<Expense>[] = [
      {
        date: new Date(),
        category: "Utilities",
        description: "Electricity bill",
        amount: 5000,
      },
      {
        date: new Date(Date.now() - 86400000),
        category: "Supplies",
        description: "Cleaning supplies",
        amount: 2500,
      },
      {
        date: new Date(Date.now() - 172800000),
        category: "Maintenance",
        description: "Plumbing repair",
        amount: 7000,
      },
    ]

    await db.collection("expenses").insertMany(expenses)

    revalidatePath("/")
    return { success: true, message: "Demo data seeded successfully" }
  } catch (error) {
    console.error("Error seeding demo data:", error)
    return { success: false, error: "Failed to seed demo data" }
  }
}

// Clear all data - for testing purposes
export async function clearAllData() {
  try {
    const db = await getDb()

    // Clear all collections
    await db.collection("dormitories").deleteMany({})
    await db.collection("beds").deleteMany({})
    await db.collection("guests").deleteMany({})
    await db.collection("assignments").deleteMany({})
    await db.collection("bar_transactions").deleteMany({})
    await db.collection("extra_services").deleteMany({})
    await db.collection("expenses").deleteMany({})
    await db.collection("payments").deleteMany({})
    await db.collection("transactions").deleteMany({})

    revalidatePath("/")
    return { success: true, message: "All data cleared successfully" }
  } catch (error) {
    console.error("Error clearing data:", error)
    return { success: false, error: "Failed to clear data" }
  }
}
