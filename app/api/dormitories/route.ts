import { getDb } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const db = await getDb()
    const dormitories = await db.collection("dormitories").find({}).sort({ name: 1 }).toArray()

    return NextResponse.json(dormitories)
  } catch (error) {
    console.error("Error fetching dormitories:", error)
    return NextResponse.json({ error: "Failed to fetch dormitories" }, { status: 500 })
  }
}
