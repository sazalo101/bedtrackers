import { getCalendarEvents } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const monthParam = searchParams.get("month")
    const yearParam = searchParams.get("year")

    const month = monthParam ? Number.parseInt(monthParam) : new Date().getMonth()
    const year = yearParam ? Number.parseInt(yearParam) : new Date().getFullYear()

    const events = await getCalendarEvents(month, year)

    return NextResponse.json(events)
  } catch (error) {
    console.error("Error fetching calendar events:", error)
    return NextResponse.json({ error: "Failed to fetch calendar events" }, { status: 500 })
  }
}
