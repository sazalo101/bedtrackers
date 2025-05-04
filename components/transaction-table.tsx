"use client"

import { formatCurrency, formatDateTime } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface Transaction {
  _id: string
  date: string
  type: string
  guest_name: string
  guest_id?: string
  description: string
  amount: number
  payment_status: string
}

interface TransactionTableProps {
  transactions: Transaction[]
  title?: string
}

export function TransactionTable({ transactions, title }: TransactionTableProps) {
  return (
    <div className="space-y-4">
      {title && <h3 className="text-lg font-medium">{title}</h3>}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Guest</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction._id}>
                  <TableCell>{formatDateTime(transaction.date)}</TableCell>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell>
                    {transaction.guest_id ? (
                      <Link href={`/guests/${transaction.guest_id}`} className="text-blue-600 hover:underline">
                        {transaction.guest_name}
                      </Link>
                    ) : (
                      transaction.guest_name
                    )}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                  <TableCell>
                    <Badge variant={transaction.payment_status === "paid" ? "success" : "destructive"}>
                      {transaction.payment_status === "paid" ? "Paid" : "Unpaid"}
                    </Badge>
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
