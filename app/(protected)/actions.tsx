"use server"

import { revalidatePath } from "next/cache"
import { getDb } from "@/lib/db"
import { ObjectId } from "mongodb"

// Guest actions
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

    revalidatePath("/dormitories")
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

    revalidatePath("/dormitories")
    return { success: true }
  } catch (error) {
    console.error("Error deleting dormitory:", error)
    return { success: false, error: "Failed to delete dormitory" }
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

    revalidatePath("/bar")
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

    revalidatePath("/bar")
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

    revalidatePath("/bar")
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

    revalidatePath("/extras")
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

    revalidatePath("/extras")
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

    revalidatePath("/extras")
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

    revalidatePath("/expenses")
    return { success: true }
  } catch (error) {
    console.error("Error deleting expense:", error)
    return { success: false, error: "Failed to delete expense" }
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
