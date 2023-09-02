import Card from './card'
import { clsxMerge } from '@/src/utils/tailwind-helper'

export function AboutSkeleton() {
  return (
    <Card>
      <SkeletonLine className="mb-4 h-6 w-1/3" />

      <div className="space-y-2">
        <SkeletonLine />

        <SkeletonLine className="w-2/3" />
      </div>
    </Card>
  )
}

export function ArticleSkeleton() {
  return (
    <Card size="medium">
      <SkeletonLine className="mb-6 h-8 w-1/2" />

      <div className="space-y-3">
        <SkeletonLine />

        <SkeletonLine />

        <SkeletonLine className="w-9/12" />
      </div>
    </Card>
  )
}

export function CommunitySkeleton() {
  return (
    <Card className="flex items-center gap-4">
      <SkeletonCircle />

      <div className="flex-1 space-y-2">
        <SkeletonLine />

        <SkeletonLine className="w-9/12" />
      </div>
    </Card>
  )
}

export function CommunityInfoSkeleton() {
  return (
    <div className="mt-3 space-y-2">
      <SkeletonLine className="w-1/2" />

      <SkeletonLine />
    </div>
  )
}

export function ActivitySkeleton() {
  return (
    <div className="flex gap-4 py-4 md:px-3">
      <div className="h-8 w-8 animate-pulse rounded-xl bg-strong "></div>

      <div className="flex-1 space-y-2">
        <SkeletonLine />

        <SkeletonLine className="w-9/12" />
      </div>
    </div>
  )
}

export function InfoCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-base bg-white shadow-base">
      <div className="space-y-3 p-4 md:p-5">
        <SkeletonLine className="h-6 w-3/4" />

        <SkeletonLine className="h-16" />
      </div>

      <div className="border-t border-base bg-base px-4 pb-4 pt-3 md:px-5">
        <SkeletonLine className="h-10 w-1/4" />
      </div>
    </div>
  )
}

export function SidebarInfoSkeleton() {
  return (
    <Card>
      <SkeletonLine className="mb-4 h-6 w-1/3" />

      <div className="mb-5 space-y-2">
        <SkeletonLine />

        <SkeletonLine className="w-2/3" />
      </div>

      <div className="space-y-2">
        <SkeletonLine />

        <SkeletonLine className="w-2/3" />
      </div>
    </Card>
  )
}

export function SkeletonLine(props: { className?: string }) {
  const { className } = props

  return (
    <div
      className={clsxMerge(
        'animate-pulse h-4 bg-strong w-full rounded-xl',
        className,
      )}
    ></div>
  )
}

export function SkeletonCircle(props: { size?: number; className?: string }) {
  const { size = 60, className } = props

  return (
    <div
      className={clsxMerge('animate-pulse bg-strong rounded-full', className)}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    ></div>
  )
}
