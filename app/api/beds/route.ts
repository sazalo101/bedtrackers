import { getDb } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const db = await getDb()
    const beds = await db
      .collection("beds")
      .aggregate([
        {
          $lookup: {
            from: "dormitories",
            localField: "dormitory_id",
            foreignField: "_id",
            as: "dormitory",
          },
        },
        {
          $unwind: "$dormitory",
        },
        {
          $project: {
            _id: 1,
            bed_number: 1,
            dormitory_name: "$dormitory.name",
            dormitory_id: 1,
            bed_type: 1,
            status: 1,
            price: 1,
            notes: 1,
          },
        },
        {
          $sort: { bed_number: 1 },
        },
      ])
      .toArray()

    return NextResponse.json(beds)
  } catch (error) {
    console.error("Error fetching beds:", error)
    return NextResponse.json({ error: "Failed to fetch beds" }, { status: 500 })
  }
}
