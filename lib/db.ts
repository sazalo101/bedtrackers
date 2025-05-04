import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { formatCurrency } from "@/lib/utils"
import type { Bed, BedStats, CheckIn, Dormitory, Expense, FinancialData, Guest, Transaction } from "@/lib/models"

export async function getDb() {
  const client = await clientPromise
  return client.db("bedtrackr")
}

export async function getDormitories(): Promise<Dormitory[]> {
  const db = await getDb()
  return db.collection("dormitories").find({}).sort({ name: 1 }).toArray() as Promise<Dormitory[]>
}

export async function getDormitoryById(id: string): Promise<Dormitory | null> {
  const db = await getDb()
  return db.collection("dormitories").findOne({ _id: new ObjectId(id) }) as Promise<Dormitory | null>
}

export async function getBeds(): Promise<Bed[]> {
  const db = await getDb()
  return db
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
        $unwind: {
          path: "$dormitory",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          bed_number: 1,
          dormitory_name: { $ifNull: ["$dormitory.name", "Unknown"] },
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
    .toArray() as Promise<Bed[]>
}

export async function getBedsByDormitory(dormitoryId: string): Promise<Bed[]> {
  const db = await getDb()
  return db
    .collection("beds")
    .aggregate([
      {
        $match: { dormitory_id: new ObjectId(dormitoryId) },
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
        $unwind: {
          path: "$dormitory",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          bed_number: 1,
          dormitory_name: { $ifNull: ["$dormitory.name", "Unknown"] },
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
    .toArray() as Promise<Bed[]>
}

export async function getAvailableBeds(): Promise<Bed[]> {
  const db = await getDb()
  return db
    .collection("beds")
    .aggregate([
      {
        $match: { status: "available" },
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
        $unwind: {
          path: "$dormitory",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          bed_number: 1,
          dormitory_name: { $ifNull: ["$dormitory.name", "Unknown"] },
          dormitory_id: 1,
          bed_type: 1,
          status: 1,
          price: 1,
        },
      },
      {
        $sort: { bed_number: 1 },
      },
    ])
    .toArray() as Promise<Bed[]>
}

export async function getGuests(): Promise<Guest[]> {
  const db = await getDb()
  return db.collection("guests").find({}).sort({ name: 1 }).toArray() as Promise<Guest[]>
}

export async function getGuestById(id: string) {
  const db = await getDb()
  return db.collection("guests").findOne({ _id: new ObjectId(id) }) as Promise<Guest | null>
}

export async function getGuestDetails(guestId: string) {
  const db = await getDb()
  const guest = await db.collection("guests").findOne({ _id: new ObjectId(guestId) })

  if (!guest) return null

  // Get current assignment if any
  const assignment = await db.collection("assignments").findOne({
    guest_id: new ObjectId(guestId),
    check_out: { $gte: new Date() },
  })

  let currentAssignment = null

  if (assignment) {
    const bed = await db.collection("beds").findOne({ _id: assignment.bed_id })
    const dormitory = bed?.dormitory_id ? await db.collection("dormitories").findOne({ _id: bed.dormitory_id }) : null

    currentAssignment = {
      bed_number: bed?.bed_number || "Unknown",
      dormitory_name: dormitory?.name || "Unknown",
      check_in: assignment.check_in,
      check_out: assignment.check_out,
      payment_status: assignment.payment_status || "not_paid",
    }
  }

  // Get all charges
  const bedCharges = []
  const barCharges = []
  const extraCharges = []

  // Bed charges
  const assignments = await db
    .collection("assignments")
    .find({ guest_id: new ObjectId(guestId) })
    .toArray()

  for (const assignment of assignments) {
    const bed = await db.collection("beds").findOne({ _id: assignment.bed_id })
    if (bed) {
      bedCharges.push({
        id: assignment._id,
        date: assignment.check_in,
        description: `Bed ${bed.bed_number}`,
        amount: assignment.price || 0,
        payment_status: assignment.payment_status || "not_paid",
      })
    }
  }

  // Bar charges
  const barTransactions = await db
    .collection("bar_transactions")
    .find({ guest_id: new ObjectId(guestId) })
    .toArray()

  for (const transaction of barTransactions) {
    barCharges.push({
      id: transaction._id,
      date: transaction.transaction_date,
      description: `${transaction.quantity}x ${transaction.item_name}`,
      amount: transaction.amount || transaction.quantity * transaction.price,
      payment_status: transaction.payment_status || "not_paid",
    })
  }

  // Extra services
  const extras = await db
    .collection("extra_services")
    .find({ guest_id: new ObjectId(guestId) })
    .toArray()

  for (const extra of extras) {
    extraCharges.push({
      id: extra._id,
      date: extra.service_date,
      description: extra.service_name,
      amount: extra.price,
      payment_status: extra.payment_status || "not_paid",
    })
  }

  // Calculate totals
  const allCharges = [...bedCharges, ...barCharges, ...extraCharges]
  const totalCharges = allCharges.reduce((sum, item) => sum + item.amount, 0)
  const totalPaid = allCharges
    .filter((item) => item.payment_status === "paid")
    .reduce((sum, item) => sum + item.amount, 0)
  const balanceDue = totalCharges - totalPaid

  // Combine all transactions for history
  const allTransactions = [
    ...bedCharges.map((charge) => ({
      id: charge.id,
      date: charge.date,
      type: "Bed",
      description: charge.description,
      amount: charge.amount,
      payment_status: charge.payment_status,
    })),
    ...barCharges.map((charge) => ({
      id: charge.id,
      type: "Bar",
      date: charge.date,
      description: charge.description,
      amount: charge.amount,
      payment_status: charge.payment_status,
    })),
    ...extraCharges.map((charge) => ({
      id: charge.id,
      type: "Extra",
      date: charge.date,
      description: charge.description,
      amount: charge.amount,
      payment_status: charge.payment_status,
    })),
  ]

  // Sort by date
  allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return {
    guest,
    currentAssignment,
    bedCharges,
    barCharges,
    extraCharges,
    totalCharges,
    totalPaid,
    balanceDue,
    allTransactions,
  }
}

export async function getTransactions(period = "today", referenceDate = new Date()): Promise<Transaction[]> {
  const db = await getDb()

  // Calculate date range based on period
  const today = new Date(referenceDate)
  today.setHours(0, 0, 0, 0)
  const todayEnd = new Date(referenceDate)
  todayEnd.setHours(23, 59, 59, 999)

  let dateStart, dateEnd

  if (period === "today") {
    dateStart = today
    dateEnd = todayEnd
  } else if (period === "week") {
    const day = today.getDay()
    const diff = today.getDate() - day + (day === 0 ? -6 : 1)
    dateStart = new Date(today)
    dateStart.setDate(diff)
    dateStart.setHours(0, 0, 0, 0)

    dateEnd = new Date(dateStart)
    dateEnd.setDate(dateStart.getDate() + 6)
    dateEnd.setHours(23, 59, 59, 999)
  } else if (period === "month") {
    dateStart = new Date(today.getFullYear(), today.getMonth(), 1)
    dateEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)
  } else {
    // All time - no date filtering
    dateStart = null
    dateEnd = null
  }

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

  return db.collection("transactions").aggregate(pipeline).toArray() as Promise<Transaction[]>
}

export async function getExpenses(): Promise<Expense[]> {
  const db = await getDb()
  return db.collection("expenses").find({}).sort({ date: -1 }).toArray() as Promise<Expense[]>
}

export async function getTodayCheckins(referenceDate = new Date()): Promise<CheckIn[]> {
  const db = await getDb()

  const today = new Date(referenceDate)
  today.setHours(0, 0, 0, 0)
  const todayEnd = new Date(referenceDate)
  todayEnd.setHours(23, 59, 59, 999)

  return db
    .collection("assignments")
    .aggregate([
      {
        $match: {
          check_in: { $gte: today, $lte: todayEnd },
        },
      },
      {
        $lookup: {
          from: "guests",
          localField: "guest_id",
          foreignField: "_id",
          as: "guest_data",
        },
      },
      {
        $unwind: { path: "$guest_data", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "beds",
          localField: "bed_id",
          foreignField: "_id",
          as: "bed_data",
        },
      },
      {
        $unwind: { path: "$bed_data", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "bar_transactions",
          let: { guest_id: "$guest_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$guest_id", "$$guest_id"] },
              },
            },
            {
              $group: { _id: null, total: { $sum: "$amount" } },
            },
          ],
          as: "bar_charges",
        },
      },
      {
        $lookup: {
          from: "extra_services",
          let: { guest_id: "$guest_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$guest_id", "$$guest_id"] },
              },
            },
            {
              $group: { _id: null, total: { $sum: "$price" } },
            },
          ],
          as: "extra_charges",
        },
      },
      {
        $project: {
          _id: 1,
          guest_id: "$guest_id",
          name: { $ifNull: ["$guest_data.name", "Unknown Guest"] },
          bed_number: { $ifNull: ["$bed_data.bed_number", "Unknown"] },
          check_in: 1,
          check_out: 1,
          bed_charges: { $ifNull: ["$price", 0] },
          bar_charges: { $ifNull: [{ $arrayElemAt: ["$bar_charges.total", 0] }, 0] },
          extra_charges: { $ifNull: [{ $arrayElemAt: ["$extra_charges.total", 0] }, 0] },
          total_charges: {
            $add: [
              { $ifNull: ["$price", 0] },
              { $ifNull: [{ $arrayElemAt: ["$bar_charges.total", 0] }, 0] },
              { $ifNull: [{ $arrayElemAt: ["$extra_charges.total", 0] }, 0] },
            ],
          },
          payment_status: { $ifNull: ["$payment_status", "not_paid"] },
        },
      },
    ])
    .toArray() as Promise<CheckIn[]>
}

export async function getActiveAssignments(): Promise<CheckIn[]> {
  const db = await getDb()
  const now = new Date()

  return db
    .collection("assignments")
    .aggregate([
      {
        $match: {
          check_in: { $lte: now },
          check_out: { $gte: now },
        },
      },
      {
        $lookup: {
          from: "guests",
          localField: "guest_id",
          foreignField: "_id",
          as: "guest_data",
        },
      },
      {
        $unwind: { path: "$guest_data", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "beds",
          localField: "bed_id",
          foreignField: "_id",
          as: "bed_data",
        },
      },
      {
        $unwind: { path: "$bed_data", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "bar_transactions",
          let: { guest_id: "$guest_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$guest_id", "$$guest_id"] },
              },
            },
            {
              $group: { _id: null, total: { $sum: "$amount" } },
            },
          ],
          as: "bar_charges",
        },
      },
      {
        $lookup: {
          from: "extra_services",
          let: { guest_id: "$guest_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$guest_id", "$$guest_id"] },
              },
            },
            {
              $group: { _id: null, total: { $sum: "$price" } },
            },
          ],
          as: "extra_charges",
        },
      },
      {
        $project: {
          _id: 1,
          guest_id: "$guest_id",
          name: { $ifNull: ["$guest_data.name", "Unknown Guest"] },
          bed_number: { $ifNull: ["$bed_data.bed_number", "Unknown"] },
          check_in: 1,
          check_out: 1,
          bed_charges: { $ifNull: ["$price", 0] },
          bar_charges: { $ifNull: [{ $arrayElemAt: ["$bar_charges.total", 0] }, 0] },
          extra_charges: { $ifNull: [{ $arrayElemAt: ["$extra_charges.total", 0] }, 0] },
          total_charges: {
            $add: [
              { $ifNull: ["$price", 0] },
              { $ifNull: [{ $arrayElemAt: ["$bar_charges.total", 0] }, 0] },
              { $ifNull: [{ $arrayElemAt: ["$extra_charges.total", 0] }, 0] },
            ],
          },
          payment_status: { $ifNull: ["$payment_status", "not_paid"] },
        },
      },
    ])
    .toArray() as Promise<CheckIn[]>
}

export async function getBedStats(): Promise<BedStats> {
  const db = await getDb()

  const total = await db.collection("beds").countDocuments({})
  const available = await db.collection("beds").countDocuments({ status: "available" })
  const occupied = await db.collection("beds").countDocuments({ status: "occupied" })
  const needsCleaning = await db.collection("beds").countDocuments({ status: "needs_cleaning" })

  return {
    total,
    available,
    occupied,
    needsCleaning,
  }
}

export async function calculateFinancialData(transactions: Transaction[]): Promise<FinancialData> {
  let income = 0
  let bedIncome = 0
  let barIncome = 0
  let extraIncome = 0
  let expenses = 0
  let unpaid = 0

  // Process all transactions
  for (const t of transactions) {
    if (t.type === "Expense") {
      expenses += t.amount || 0
    } else {
      if (t.payment_status === "paid") {
        income += t.amount || 0

        // Categorize income by type
        if (t.type === "Bed Payment") {
          bedIncome += t.amount || 0
        } else if (t.type === "Bar Purchase") {
          barIncome += t.amount || 0
        } else if (t.type === "Extra Service") {
          extraIncome += t.amount || 0
        }
      } else {
        unpaid += t.amount || 0
      }
    }
  }

  // Calculate profit and other metrics
  const profit = income - expenses
  const profitMargin = income > 0 ? (profit / income) * 100 : 0

  return {
    income,
    bedIncome,
    barIncome,
    extraIncome,
    expenses,
    profit,
    unpaid,
    profitMargin: Math.round(profitMargin * 100) / 100,
    incomeFormatted: formatCurrency(income),
    bedIncomeFormatted: formatCurrency(bedIncome),
    barIncomeFormatted: formatCurrency(barIncome),
    extraIncomeFormatted: formatCurrency(extraIncome),
    expensesFormatted: formatCurrency(expenses),
    profitFormatted: formatCurrency(profit),
    unpaidFormatted: formatCurrency(unpaid),
  }
}

export async function getCalendarEvents(month: number, year: number) {
  const db = await getDb()

  // Calculate start and end dates for the month
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999)

  // Get check-ins for the month
  const checkIns = await db
    .collection("assignments")
    .aggregate([
      {
        $match: {
          check_in: { $gte: startDate, $lte: endDate },
        },
      },
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
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$check_in" } },
          count: { $sum: 1 },
          guests: {
            $push: {
              id: "$guest._id",
              name: { $ifNull: ["$guest.name", "Unknown Guest"] },
              bed: { $ifNull: ["$bed.bed_number", "Unknown"] },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          type: "check_in",
          count: 1,
          guests: 1,
        },
      },
    ])
    .toArray()

  // Get check-outs for the month
  const checkOuts = await db
    .collection("assignments")
    .aggregate([
      {
        $match: {
          check_out: { $gte: startDate, $lte: endDate },
        },
      },
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
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$check_out" } },
          count: { $sum: 1 },
          guests: {
            $push: {
              id: "$guest._id",
              name: { $ifNull: ["$guest.name", "Unknown Guest"] },
              bed: { $ifNull: ["$bed.bed_number", "Unknown"] },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          type: "check_out",
          count: 1,
          guests: 1,
        },
      },
    ])
    .toArray()

  // Combine both events
  return [...checkIns, ...checkOuts]
}

export async function recordPayment(guestId: string, amount: number) {
  const db = await getDb()

  // Get all unpaid charges for the guest
  const unpaidBedCharges = await db
    .collection("assignments")
    .find({
      guest_id: new ObjectId(guestId),
      payment_status: "not_paid",
    })
    .sort({ check_in: 1 })
    .toArray()

  const unpaidBarCharges = await db
    .collection("bar_transactions")
    .find({
      guest_id: new ObjectId(guestId),
      payment_status: "not_paid",
    })
    .sort({ transaction_date: 1 })
    .toArray()

  const unpaidExtraCharges = await db
    .collection("extra_services")
    .find({
      guest_id: new ObjectId(guestId),
      payment_status: "not_paid",
    })
    .sort({ service_date: 1 })
    .toArray()

  // Apply payment to charges in order (bed charges first, then bar, then extras)
  let remainingAmount = amount

  // Process bed charges
  for (const charge of unpaidBedCharges) {
    if (remainingAmount <= 0) break

    if (remainingAmount >= charge.price) {
      // Full payment
      await db.collection("assignments").updateOne(
        { _id: charge._id },
        {
          $set: {
            payment_status: "paid",
            payment_date: new Date(),
          },
        },
      )
      remainingAmount -= charge.price
    } else {
      // Partial payment (mark as partially paid)
      await db.collection("assignments").updateOne(
        { _id: charge._id },
        {
          $set: {
            payment_status: "partially_paid",
            payment_date: new Date(),
            paid_amount: remainingAmount,
          },
        },
      )
      remainingAmount = 0
      break
    }
  }

  // Process bar charges
  if (remainingAmount > 0) {
    for (const charge of unpaidBarCharges) {
      if (remainingAmount <= 0) break

      const chargeAmount = charge.amount || charge.quantity * charge.price

      if (remainingAmount >= chargeAmount) {
        // Full payment
        await db.collection("bar_transactions").updateOne(
          { _id: charge._id },
          {
            $set: {
              payment_status: "paid",
              payment_date: new Date(),
            },
          },
        )
        remainingAmount -= chargeAmount
      } else {
        // Partial payment (not supported for bar charges, so we'll leave it unpaid)
        break
      }
    }
  }

  // Process extra charges
  if (remainingAmount > 0) {
    for (const charge of unpaidExtraCharges) {
      if (remainingAmount <= 0) break

      if (remainingAmount >= charge.price) {
        // Full payment
        await db.collection("extra_services").updateOne(
          { _id: charge._id },
          {
            $set: {
              payment_status: "paid",
              payment_date: new Date(),
            },
          },
        )
        remainingAmount -= charge.price
      } else {
        // Partial payment (not supported for extra charges, so we'll leave it unpaid)
        break
      }
    }
  }

  // Record the payment transaction
  await db.collection("payments").insertOne({
    guest_id: new ObjectId(guestId),
    amount: amount,
    date: new Date(),
    remaining_amount: remainingAmount,
  })

  return {
    success: true,
    amountPaid: amount,
    remainingAmount: remainingAmount,
  }
}
