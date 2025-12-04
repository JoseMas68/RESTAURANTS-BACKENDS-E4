import React from 'react';
import { Restaurant } from '@/lib/api';
import RestaurantCard from './RestaurantCard';
import { SkeletonLoader, EmptyState, ErrorAlert } from '@/components/molecules/StateComponents';

interface RestaurantListProps {
  restaurants: Restaurant[];
  isLoading: boolean;
  error?: string | null;
  title?: string;
}

export default function RestaurantList({
  restaurants,
  isLoading,
  error,
  title = 'Restaurantes',
}: RestaurantListProps) {
  if (error) {
    return <ErrorAlert message={error} />;
  }

  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <SkeletonLoader />
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <EmptyState
          title="No hay restaurantes disponibles"
          description="Intenta cambiar los filtros o búsqueda."
        />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">
        {title} ({restaurants.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>
    </div>
  );
}
