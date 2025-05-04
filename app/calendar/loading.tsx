export default function Loading() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-[400px] rounded-md border bg-muted/20 animate-pulse"></div>
        <div className="h-[400px] rounded-md border bg-muted/20 animate-pulse"></div>
      </div>
    </div>
  )
}
