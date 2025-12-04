'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getRestaurantById, getMenuByRestaurantId, Restaurant, Menu, ApiError } from '@/lib/api';
import RestaurantDetail from '@/components/organisms/RestaurantDetail';
import { ErrorAlert } from '@/components/molecules/StateComponents';
import Button from '@/components/atoms/Button';

interface RestaurantDetailPageProps {
  params: {
    id: string;
  };
}

export default function RestaurantDetailPage({ params }: RestaurantDetailPageProps) {
  const { id } = params;
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [isLoadingRestaurant, setIsLoadingRestaurant] = useState(true);
  const [isLoadingMenus, setIsLoadingMenus] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingRestaurant(true);
      setIsLoadingMenus(true);
      setError(null);

      try {
        // Fetch restaurant
        const restaurantData = await getRestaurantById(id);
        setRestaurant(restaurantData);

        // Fetch menus
        try {
          const menusData = await getMenuByRestaurantId(id);
          setMenus(menusData);
        } catch (menusErr) {
          console.error('Error fetching menus:', menusErr);
          // No es crítico si los menús no cargan
          setMenus([]);
        }
      } catch (err) {
        console.error('Error fetching restaurant:', err);
        if (err instanceof ApiError) {
          if (err.statusCode === 404) {
            setError('Restaurante no encontrado');
          } else {
            setError(`Error: ${err.message}`);
          }
        } else {
          setError('Error desconocido al cargar el restaurante');
        }
      } finally {
        setIsLoadingRestaurant(false);
        setIsLoadingMenus(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (error && !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <ErrorAlert message={error} />
            <div className="mt-6">
              <Link href="/restaurants">
                <Button variant="primary">Volver a Restaurantes</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>
            <span>/</span>
            <Link href="/restaurants" className="hover:text-blue-600">
              Restaurantes
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-semibold">
              {restaurant?.name || 'Cargando...'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {restaurant ? (
            <RestaurantDetail
              restaurant={restaurant}
              menus={menus}
              isLoadingRestaurant={isLoadingRestaurant}
              isLoadingMenus={isLoadingMenus}
              error={error}
            />
          ) : (
            isLoadingRestaurant && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Cargando restaurante...</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
