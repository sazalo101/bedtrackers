import { recordPayment } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const guestId = params.id
    const { amount } = await request.json()

    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid payment amount" }, { status: 400 })
    }

    const result = await recordPayment(guestId, amount)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error recording payment:", error)
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 })
  }
}
