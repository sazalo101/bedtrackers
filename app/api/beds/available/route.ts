import { getDb } from "@/lib/db"
import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dormitoryId = searchParams.get("dormitory")

    const db = await getDb()

    const query = { status: "available" }

    // If dormitory ID is provided, filter by it
    if (dormitoryId) {
      query.dormitory_id = new ObjectId(dormitoryId)
    }

    const beds = await db
      .collection("beds")
      .aggregate([
        {
          $match: query,
        },
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
    console.error("Error fetching available beds:", error)
    return NextResponse.json({ error: "Failed to fetch available beds" }, { status: 500 })
  }
}
