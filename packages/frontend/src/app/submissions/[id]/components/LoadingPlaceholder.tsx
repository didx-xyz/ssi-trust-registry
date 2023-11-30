import { Label } from '@/common/components/Label'

export function LoadingPlaceholder() {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-4">
        <div className="h-20 w-20 bg-slate-200 animate-pulse rounded-full" />
        <div className="h-8 w-40 bg-slate-200 animate-pulse rounded-sm" />
      </div>
      <div className="w-full text-left flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Label>Entity Name</Label>
          <div className="h-4 w-20 bg-slate-200 animate-pulse rounded-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <Label>DIDs</Label>
          <div className="h-4 w-40 bg-slate-200 animate-pulse rounded-sm" />
          <div className="h-4 w-40 bg-slate-200 animate-pulse rounded-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Domain</Label>
          <div className="h-4 w-28 bg-slate-200 animate-pulse rounded-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Role(s)</Label>
          <div className="h-4 w-20 bg-slate-200 animate-pulse rounded-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Schema IDs</Label>
          <div className="h-4 w-40 bg-slate-200 animate-pulse rounded-sm" />
          <div className="h-4 w-40 bg-slate-200 animate-pulse rounded-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Logo URL (SVG Format)</Label>
          <div className="h-4 w-28 bg-slate-200 animate-pulse rounded-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Submitter&apos;s Email Address</Label>
          <div className="h-4 w-28 bg-slate-200 animate-pulse rounded-sm" />
        </div>
      </div>
    </div>
  )
}
