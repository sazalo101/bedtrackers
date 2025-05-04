import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const db = await getDb()

    // Check if any users exist
    const usersCount = await db.collection("users").countDocuments()

    if (usersCount > 0) {
      return NextResponse.json({ message: "Setup already completed" })
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 10)

    await db.collection("users").insertOne({
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
      created_at: new Date(),
    })

    return NextResponse.json({ message: "Admin user created successfully" })
  } catch (error) {
    console.error("Setup error:", error)
    return NextResponse.json({ error: "Failed to complete setup" }, { status: 500 })
  }
}
