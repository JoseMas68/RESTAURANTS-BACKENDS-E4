'use client';

import { useEffect, useState } from 'react';
import { getRestaurants, Restaurant } from '@/lib/api';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturedRestaurants } from '@/components/landing/FeaturedRestaurants';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { CTASection } from '@/components/landing/CTASection';
import { RestaurantListSkeleton } from '@/components/landing/RestaurantSkeleton';

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setIsLoading(true);
        const response = await getRestaurants(1, 6);
        console.log('API Response:', response);
        setRestaurants(response.data || []);
      } catch (err) {
        console.error('Error fetching restaurants:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar restaurantes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Restaurants Section */}
      {isLoading ? (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">
                Destacados
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3 mb-4">
                Restaurantes{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
                  populares
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Descubre los lugares favoritos de nuestra comunidad
              </p>
            </div>
            <RestaurantListSkeleton count={6} />
          </div>
        </section>
      ) : error ? (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
              <p className="text-red-600 font-medium mb-4">Error: {error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        </section>
      ) : restaurants.length > 0 ? (
        <FeaturedRestaurants restaurants={restaurants} />
      ) : null}

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                RestaurantApp
              </h3>
              <p className="text-gray-400">
                La mejor plataforma para descubrir y reservar en los mejores restaurantes.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Explorar</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/restaurants" className="hover:text-white transition-colors">Restaurantes</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cuisines</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Ciudades</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre nosotros</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Términos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacidad</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
            <p>© 2025 RestaurantApp. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
