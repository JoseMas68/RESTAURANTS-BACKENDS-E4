'use client';

import React, { useEffect, useState } from 'react';
import { getRestaurants, Restaurant } from '@/lib/api';
import RestaurantList from '@/components/organisms/RestaurantList';

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchRestaurants = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getRestaurants(page, 10, searchQuery || undefined);
        setRestaurants(response.data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar restaurantes';
        setError(errorMessage);
        console.error('Error fetching restaurants:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();
  }, [page, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <section className="bg-white border-b py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Todos los Restaurantes</h1>
          <p className="text-gray-600">Explora nuestro catálogo completo de opciones gastronómicas</p>
        </div>
      </section>

      {/* Search Section */}
      <section className="bg-white shadow-sm py-6">
        <div className="container mx-auto px-4">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Buscar restaurante..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 py-12">
        <RestaurantList
          restaurants={restaurants}
          isLoading={isLoading}
          error={error}
          title="Restaurantes Disponibles"
        />

        {/* Pagination */}
        {!isLoading && restaurants.length > 0 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="px-4 py-2 text-gray-900">Página {page}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={restaurants.length < 10}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
