import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Restaurant } from '@/lib/api';
import Button from '@/components/atoms/Button';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Imagen */}
      <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
        {restaurant.imageUrl ? (
          <Image
            src={restaurant.imageUrl}
            alt={restaurant.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Sin imagen
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{restaurant.name}</h3>
        
        {/* Cuisine */}
        {restaurant.cuisine && (
          <p className="text-sm text-gray-600 mb-2">{restaurant.cuisine}</p>
        )}

        {/* Rating */}
        {restaurant.averageRating && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-yellow-500">★</span>
            <span className="font-semibold text-gray-900">
              {restaurant.averageRating.toFixed(1)}
            </span>
            <span className="text-sm text-gray-600">
              ({restaurant.totalReviews || 0} reseñas)
            </span>
          </div>
        )}

        {/* Descripción */}
        {restaurant.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {restaurant.description}
          </p>
        )}

        {/* Ubicación */}
        {restaurant.address && (
          <p className="text-xs text-gray-500 mb-4">{restaurant.address}</p>
        )}

        {/* Botones */}
        <div className="flex gap-2">
          <Link href={`/restaurants/${restaurant.id}`} className="flex-1">
            <Button variant="primary" size="sm" className="w-full">
              Ver Detalle
            </Button>
          </Link>
          <Link href={`/restaurants/${restaurant.id}#reserve`} className="flex-1">
            <Button variant="secondary" size="sm" className="w-full">
              Reservar
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
