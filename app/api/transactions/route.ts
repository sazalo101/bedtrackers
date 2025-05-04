import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get("period") || "daily"
    const dateParam = searchParams.get("date")

    const referenceDate = dateParam ? new Date(dateParam) : new Date()

    // Calculate date range based on period
    const today = new Date(referenceDate)
    today.setHours(0, 0, 0, 0)
    const todayEnd = new Date(referenceDate)
    todayEnd.setHours(23, 59, 59, 999)

    let dateStart, dateEnd

    if (period === "daily") {
      dateStart = today
      dateEnd = todayEnd
    } else if (period === "weekly") {
      const day = today.getDay()
      const diff = today.getDate() - day + (day === 0 ? -6 : 1)
      dateStart = new Date(today)
      dateStart.setDate(diff)
      dateStart.setHours(0, 0, 0, 0)

      dateEnd = new Date(dateStart)
      dateEnd.setDate(dateStart.getDate() + 6)
      dateEnd.setHours(23, 59, 59, 999)
    } else if (period === "monthly") {
      dateStart = new Date(today.getFullYear(), today.getMonth(), 1)
      dateEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)
    } else {
      // All time - no date filtering
      dateStart = null
      dateEnd = null
    }

    const db = await getDb()

    // Build the aggregation pipeline
    const pipeline = []

    // Date filters if applicable
    if (dateStart && dateEnd) {
      pipeline.push({
        $match: {
          date: { $gte: dateStart, $lte: dateEnd },
        },
      })
    }

    // Combine all transaction types
    pipeline.push(
      // Bed payments
      {
        $unionWith: {
          coll: "assignments",
          pipeline: [
            dateStart && dateEnd
              ? {
                  $match: {
                    $or: [
                      { check_in: { $gte: dateStart, $lte: dateEnd } },
                      { payment_date: { $gte: dateStart, $lte: dateEnd } },
                    ],
                  },
                }
              : { $match: {} },
            {
              $lookup: {
                from: "guests",
                localField: "guest_id",
                foreignField: "_id",
                as: "guest",
              },
            },
            {
              $unwind: { path: "$guest", preserveNullAndEmptyArrays: true },
            },
            {
              $lookup: {
                from: "beds",
                localField: "bed_id",
                foreignField: "_id",
                as: "bed",
              },
            },
            {
              $unwind: { path: "$bed", preserveNullAndEmptyArrays: true },
            },
            {
              $project: {
                _id: 1,
                date: { $ifNull: ["$payment_date", "$check_in"] },
                type: { $literal: "Bed Payment" },
                guest_name: { $ifNull: ["$guest.name", "Unknown Guest"] },
                description: { $concat: ["Bed ", { $ifNull: ["$bed.bed_number", "Unknown"] }] },
                amount: { $ifNull: ["$price", 0] },
                payment_status: { $ifNull: ["$payment_status", "not_paid"] },
              },
            },
          ],
        },
      },
      // Bar transactions
      {
        $unionWith: {
          coll: "bar_transactions",
          pipeline: [
            dateStart && dateEnd
              ? {
                  $match: {
                    transaction_date: { $gte: dateStart, $lte: dateEnd },
                  },
                }
              : { $match: {} },
            {
              $lookup: {
                from: "guests",
                localField: "guest_id",
                foreignField: "_id",
                as: "guest",
              },
            },
            {
              $unwind: { path: "$guest", preserveNullAndEmptyArrays: true },
            },
            {
              $project: {
                _id: 1,
                date: "$transaction_date",
                type: { $literal: "Bar Purchase" },
                guest_name: { $ifNull: ["$guest.name", "Bar Customer"] },
                description: { $concat: [{ $toString: "$quantity" }, "x ", "$item_name"] },
                amount: { $ifNull: ["$amount", { $multiply: ["$quantity", "$price"] }] },
                payment_status: { $ifNull: ["$payment_status", "not_paid"] },
              },
            },
          ],
        },
      },
      // Extra services
      {
        $unionWith: {
          coll: "extra_services",
          pipeline: [
            dateStart && dateEnd
              ? {
                  $match: {
                    service_date: { $gte: dateStart, $lte: dateEnd },
                  },
                }
              : { $match: {} },
            {
              $lookup: {
                from: "guests",
                localField: "guest_id",
                foreignField: "_id",
                as: "guest",
              },
            },
            {
              $unwind: { path: "$guest", preserveNullAndEmptyArrays: true },
            },
            {
              $project: {
                _id: 1,
                date: "$service_date",
                type: { $literal: "Extra Service" },
                guest_name: { $ifNull: ["$guest.name", "Service Customer"] },
                description: "$service_name",
                amount: { $ifNull: ["$price", 0] },
                payment_status: { $ifNull: ["$payment_status", "not_paid"] },
              },
            },
          ],
        },
      },
      // Expenses
      {
        $unionWith: {
          coll: "expenses",
          pipeline: [
            dateStart && dateEnd
              ? {
                  $match: {
                    date: { $gte: dateStart, $lte: dateEnd },
                  },
                }
              : { $match: {} },
            {
              $project: {
                _id: 1,
                date: "$date",
                type: { $literal: "Expense" },
                guest_name: { $literal: "N/A" },
                description: { $concat: ["$category", ": ", "$description"] },
                amount: "$amount",
                payment_status: { $literal: "paid" },
              },
            },
          ],
        },
      },
      // Sort by date descending
      {
        $sort: { date: -1 },
      },
    )

    const transactions = await db.collection("transactions").aggregate(pipeline).toArray()

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}
