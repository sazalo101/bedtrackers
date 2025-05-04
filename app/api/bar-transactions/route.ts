import { getDb } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const db = await getDb()
    const transactions = await db
      .collection("bar_transactions")
      .aggregate([
        {
          $lookup: {
            from: "guests",
            localField: "guest_id",
            foreignField: "_id",
            as: "guest",
          },
        },
        {
          $unwind: {
            path: "$guest",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            guest_id: 1,
            guest_name: "$guest.name",
            transaction_date: 1,
            item_name: 1,
            quantity: 1,
            price: 1,
            amount: { $multiply: ["$quantity", "$price"] },
            payment_status: 1,
          },
        },
        {
          $sort: { transaction_date: -1 },
        },
      ])
      .toArray()

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching bar transactions:", error)
    return NextResponse.json({ error: "Failed to fetch bar transactions" }, { status: 500 })
  }
}
