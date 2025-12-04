'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Star, ChevronRight, Utensils } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-3xl">
          {/* Badge */}
          <Badge className="mb-6 bg-orange-500 hover:bg-orange-600 text-white border-0 px-4 py-1.5">
            <Utensils className="w-3.5 h-3.5 mr-2" />
            +500 Restaurantes disponibles
          </Badge>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Descubre los mejores{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
              restaurantes
            </span>{' '}
            cerca de ti
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            Explora, reserva y disfruta de experiencias gastronómicas únicas. 
            Desde cocina tradicional hasta las últimas tendencias culinarias.
          </p>

          {/* Search Box */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 mb-8 border border-white/20">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1 flex items-center bg-white rounded-xl px-4 py-3">
                <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                <input
                  type="text"
                  placeholder="¿Dónde quieres comer?"
                  className="flex-1 outline-none text-gray-700 placeholder-gray-400"
                />
              </div>
              <div className="flex items-center bg-white rounded-xl px-4 py-3 md:w-48">
                <Clock className="w-5 h-5 text-gray-400 mr-3" />
                <select className="flex-1 outline-none text-gray-700 bg-transparent">
                  <option>Hoy</option>
                  <option>Mañana</option>
                  <option>Esta semana</option>
                </select>
              </div>
              <Button size="xl" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl">
                Buscar
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Star className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">4.8</p>
                <p className="text-sm text-gray-400">Valoración media</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <Utensils className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">500+</p>
                <p className="text-sm text-gray-400">Restaurantes</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">50+</p>
                <p className="text-sm text-gray-400">Ciudades</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-white/60 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}
