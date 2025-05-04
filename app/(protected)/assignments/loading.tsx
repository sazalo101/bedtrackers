import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AssignmentsLoading() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Bed Assignments</h1>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>New Bed Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Guest</th>
                    <th className="text-left py-3 px-4">Bed</th>
                    <th className="text-left py-3 px-4">Check-in Date</th>
                    <th className="text-left py-3 px-4">Check-out Date</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <tr key={i} className="border-b">
                        <td className="py-3 px-4">
                          <Skeleton className="h-6 w-32" />
                        </td>
                        <td className="py-3 px-4">
                          <Skeleton className="h-6 w-24" />
                        </td>
                        <td className="py-3 px-4">
                          <Skeleton className="h-6 w-28" />
                        </td>
                        <td className="py-3 px-4">
                          <Skeleton className="h-6 w-28" />
                        </td>
                        <td className="py-3 px-4">
                          <Skeleton className="h-6 w-20" />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Skeleton className="h-8 w-8 rounded-md" />
                            <Skeleton className="h-8 w-8 rounded-md" />
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
