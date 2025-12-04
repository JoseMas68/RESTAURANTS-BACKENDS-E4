'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Restaurant } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Clock, ChevronRight } from 'lucide-react';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export function RestaurantCardNew({ restaurant }: RestaurantCardProps) {
  return (
    <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white">
      {/* Image Container */}
      <div className="relative h-52 overflow-hidden">
        <Image
          src={restaurant.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop'}
          alt={restaurant.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {restaurant.cuisine && (
            <Badge className="bg-white/90 text-gray-800 hover:bg-white border-0 backdrop-blur-sm">
              {restaurant.cuisine}
            </Badge>
          )}
        </div>

        {/* Open Status */}
        <div className="absolute top-4 right-4">
          <Badge variant={restaurant.isOpen ? "success" : "secondary"} className="backdrop-blur-sm">
            <span className={`w-2 h-2 rounded-full mr-1.5 ${restaurant.isOpen ? 'bg-white' : 'bg-gray-400'}`} />
            {restaurant.isOpen ? 'Abierto' : 'Cerrado'}
          </Badge>
        </div>

        {/* Rating */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-white font-semibold">{restaurant.averageRating || restaurant.rating || '4.5'}</span>
          <span className="text-white/70 text-sm">({restaurant.totalReviews || restaurant.reviewCount || 0})</span>
        </div>
      </div>

      <CardContent className="p-5">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
          {restaurant.name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {restaurant.description}
        </p>

        {/* Info */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
          {restaurant.address && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span className="truncate max-w-[150px]">{restaurant.address}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-orange-500" />
            <span>12:00 - 23:00</span>
          </div>
        </div>

        {/* CTA Button */}
        <Link href={`/restaurants/${restaurant.id}`} className="block">
          <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg group/btn">
            Ver detalles
            <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

interface FeaturedRestaurantsProps {
  restaurants: Restaurant[];
}

export function FeaturedRestaurants({ restaurants }: FeaturedRestaurantsProps) {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
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

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {restaurants.map((restaurant) => (
            <RestaurantCardNew key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link href="/restaurants">
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-orange-500 text-orange-500 hover:bg-orange-50 rounded-full px-8"
            >
              Ver todos los restaurantes
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
