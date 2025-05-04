import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function GuestDetailLoading() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Skeleton className="h-8 w-8 mr-2" />
        <h1 className="text-3xl font-bold">Guest Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Guest Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Name</div>
                <Skeleton className="h-6 w-full" />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">ID Number</div>
                <Skeleton className="h-6 w-full" />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Phone</div>
                <Skeleton className="h-6 w-full" />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Email</div>
                <Skeleton className="h-6 w-full" />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Check-in Date</div>
                <Skeleton className="h-6 w-full" />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Status</div>
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">Type</th>
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
                          <Skeleton className="h-6 w-28" />
                        </td>
                        <td className="py-3 px-4">
                          <Skeleton className="h-6 w-24" />
                        </td>
                        <td className="py-3 px-4">
                          <Skeleton className="h-6 w-20" />
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
