import React from 'react';
import Image from 'next/image';
import { Restaurant, Menu } from '@/lib/api';
import { LoadingSpinner, ErrorAlert } from '@/components/molecules/StateComponents';
import Button from '@/components/atoms/Button';

interface RestaurantDetailProps {
  restaurant: Restaurant;
  menus: Menu[];
  isLoadingRestaurant: boolean;
  isLoadingMenus: boolean;
  error?: string | null;
}

export default function RestaurantDetail({
  restaurant,
  menus,
  isLoadingRestaurant,
  isLoadingMenus,
  error,
}: RestaurantDetailProps) {
  if (error) {
    return <ErrorAlert message={error} />;
  }

  if (isLoadingRestaurant) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative w-full h-96 bg-gray-300 rounded-lg overflow-hidden">
        {restaurant.imageUrl ? (
          <Image
            src={restaurant.imageUrl}
            alt={restaurant.name}
            fill
            className="object-cover"
            priority={true}
            sizes="100vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-300">
            Sin imagen
          </div>
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
          <div className="p-8 text-white w-full">
            <h1 className="text-4xl font-bold mb-2">{restaurant.name}</h1>
            <div className="flex items-center gap-2">
              {restaurant.averageRating && (
                <>
                  <span className="text-yellow-300">★</span>
                  <span className="font-semibold">{restaurant.averageRating.toFixed(1)}</span>
                  <span className="text-sm">({restaurant.totalReviews || 0} reseñas)</span>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Info Bar */}
      <section className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Address */}
          {restaurant.address && (
            <div>
              <p className="text-sm text-gray-600 font-semibold mb-1">Dirección</p>
              <p className="text-gray-900">{restaurant.address}</p>
            </div>
          )}

          {/* Phone */}
          {restaurant.phone && (
            <div>
              <p className="text-sm text-gray-600 font-semibold mb-1">Teléfono</p>
              <a href={`tel:${restaurant.phone}`} className="text-blue-600 hover:underline">
                {restaurant.phone}
              </a>
            </div>
          )}

          {/* Email */}
          {restaurant.email && (
            <div>
              <p className="text-sm text-gray-600 font-semibold mb-1">Email</p>
              <a href={`mailto:${restaurant.email}`} className="text-blue-600 hover:underline">
                {restaurant.email}
              </a>
            </div>
          )}

          {/* Cuisine */}
          {restaurant.cuisine && (
            <div>
              <p className="text-sm text-gray-600 font-semibold mb-1">Tipo de Cocina</p>
              <p className="text-gray-900">{restaurant.cuisine}</p>
            </div>
          )}
        </div>
      </section>

      {/* Description */}
      {restaurant.description && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Sobre el Restaurante</h2>
          <p className="text-gray-700 leading-relaxed">{restaurant.description}</p>
        </section>
      )}

      {/* Schedule */}
      {restaurant.schedule && restaurant.schedule.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Horarios</h2>
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {restaurant.schedule.map((sch, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">{sch.day}:</span>
                  <span className={sch.isClosed ? 'text-red-600' : 'text-gray-700'}>
                    {sch.isClosed ? 'Cerrado' : `${sch.openTime} - ${sch.closeTime}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Menus Section */}
      {!isLoadingMenus && menus.length > 0 && (
        <section id="menu">
          <h2 className="text-2xl font-bold mb-4">Menú</h2>
          <div className="space-y-4">
            {menus.map((menu) => (
              <div key={menu.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{menu.name}</h3>
                {menu.description && (
                  <p className="text-gray-600 text-sm">{menu.description}</p>
                )}
                {menu.products && menu.products.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {menu.products.map((product) => (
                      <div key={product.id} className="flex justify-between items-start pb-3 border-b border-gray-200 last:border-b-0">
                        <div>
                          <p className="font-semibold text-gray-900">{product.name}</p>
                          {product.description && (
                            <p className="text-sm text-gray-600">{product.description}</p>
                          )}
                        </div>
                        <span className="text-blue-600 font-bold ml-4">${product.price}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {isLoadingMenus && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Menú</h2>
          <LoadingSpinner />
        </section>
      )}

      {/* Reservation Section */}
      <section id="reserve" className="bg-blue-50 rounded-lg p-8 border border-blue-200">
        <h2 className="text-2xl font-bold mb-4">Reservar Mesa</h2>
        <p className="text-gray-700 mb-6">
          Contacta con el restaurante para realizar una reserva.
        </p>
        {restaurant.phone && (
          <a href={`tel:${restaurant.phone}`}>
            <Button variant="primary">Llamar para Reservar</Button>
          </a>
        )}
      </section>
    </div>
  );
}
