import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

export function RestaurantCardSkeleton() {
  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      {/* Image skeleton */}
      <Skeleton className="h-48 w-full rounded-none" />
      
      <CardContent className="p-5">
        {/* Badge skeleton */}
        <div className="flex gap-2 mb-3">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        
        {/* Title skeleton */}
        <Skeleton className="h-7 w-3/4 mb-2" />
        
        {/* Description skeleton */}
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3 mb-4" />
        
        {/* Info skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </CardContent>
      
      <CardFooter className="px-5 pb-5 pt-0">
        <Skeleton className="h-10 w-full rounded-lg" />
      </CardFooter>
    </Card>
  );
}

export function RestaurantListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <RestaurantCardSkeleton key={i} />
      ))}
    </div>
  );
}
