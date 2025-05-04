import { getGuestDetails } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const guestId = params.id
    const guestDetails = await getGuestDetails(guestId)

    if (!guestDetails) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 })
    }

    return NextResponse.json(guestDetails)
  } catch (error) {
    console.error("Error fetching guest details:", error)
    return NextResponse.json({ error: "Failed to fetch guest details" }, { status: 500 })
  }
}
