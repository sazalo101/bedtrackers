"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCalendarEvents() {
      try {
        const month = date ? date.getMonth() : new Date().getMonth()
        const year = date ? date.getFullYear() : new Date().getFullYear()

        const response = await fetch(`/api/calendar?month=${month}&year=${year}`)
        if (!response.ok) throw new Error("Failed to fetch calendar events")

        const data = await response.json()
        setEvents(data)
      } catch (error) {
        console.error("Error fetching calendar events:", error)
        toast({
          title: "Error",
          description: "Failed to load calendar events. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCalendarEvents()
  }, [date])

  // Function to get events for a specific date
  const getEventsForDate = (day: Date) => {
    if (!day) return []

    const dateStr = day.toISOString().split("T")[0]
    return events.filter((event) => event.date === dateStr)
  }

  // Function to render calendar day content
  const renderDay = (day: Date | undefined) => {
    if (!day) return null

    const dayEvents = getEventsForDate(day)
    if (dayEvents.length === 0) return null

    return (
      <div className="flex flex-col items-center">
        {dayEvents.map((event, index) => (
          <Badge
            key={index}
            variant={event.type === "check_in" ? "success" : "destructive"}
            className="mt-1 text-[10px] px-1"
          >
            {event.type === "check_in" ? "In" : "Out"}: {event.count}
          </Badge>
        ))}
      </div>
    )
  }

  // Get selected date events
  const selectedDateEvents = date ? getEventsForDate(date) : []

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Hostel Calendar</CardTitle>
            <CardDescription>View check-ins and check-outs by date</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
                components={{
                  DayContent: (props) => (
                    <div className="flex flex-col items-center justify-center">
                      {props.day?.day}
                      {props.day?.date && renderDay(props.day.date)}
                    </div>
                  ),
                }}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Events for {date ? formatDate(date) : "Selected Date"}</CardTitle>
            <CardDescription>Details of check-ins and check-outs</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : selectedDateEvents.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No events scheduled for this date.</p>
            ) : (
              <div className="space-y-6">
                {selectedDateEvents.map((event, index) => (
                  <div key={index} className="space-y-2">
                    <h3 className="font-medium flex items-center gap-2">
                      <Badge variant={event.type === "check_in" ? "success" : "destructive"}>
                        {event.type === "check_in" ? "Check In" : "Check Out"}
                      </Badge>
                      <span>{event.count} guest(s)</span>
                    </h3>
                    <div className="rounded-md border">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="p-2 text-left font-medium">Guest</th>
                            <th className="p-2 text-left font-medium">Bed</th>
                            <th className="p-2 text-left font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {event.guests.map((guest) => (
                            <tr key={guest.id} className="border-b">
                              <td className="p-2">{guest.name}</td>
                              <td className="p-2">{guest.bed}</td>
                              <td className="p-2">
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/guests/${guest.id}`}>View Details</Link>
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
