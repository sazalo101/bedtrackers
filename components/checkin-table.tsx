"use client"

import { formatCurrency, formatDate } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "./ui/button"

interface CheckIn {
  _id: string
  guest_id: string
  name: string
  bed_number: string
  check_in: string
  check_out: string
  bed_charges: number
  bar_charges: number
  extra_charges: number
  total_charges: number
  payment_status: string
}

interface CheckInTableProps {
  checkins: CheckIn[]
  title?: string
}

export function CheckInTable({ checkins, title }: CheckInTableProps) {
  return (
    <div className="space-y-4">
      {title && <h3 className="text-lg font-medium">{title}</h3>}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guest</TableHead>
              <TableHead>Bed</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {checkins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No check-ins found.
                </TableCell>
              </TableRow>
            ) : (
              checkins.map((checkin) => (
                <TableRow key={checkin._id}>
                  <TableCell>
                    <Link href={`/guests/${checkin.guest_id}`} className="text-blue-600 hover:underline">
                      {checkin.name}
                    </Link>
                  </TableCell>
                  <TableCell>{checkin.bed_number}</TableCell>
                  <TableCell>{formatDate(checkin.check_in)}</TableCell>
                  <TableCell>{formatDate(checkin.check_out)}</TableCell>
                  <TableCell>{formatCurrency(checkin.total_charges)}</TableCell>
                  <TableCell>
                    <Badge variant={checkin.payment_status === "paid" ? "success" : "destructive"}>
                      {checkin.payment_status === "paid" ? "Paid" : "Unpaid"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/guests/${checkin.guest_id}`}>View Details</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
