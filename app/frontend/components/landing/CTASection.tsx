'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, ChevronRight, Sparkles } from 'lucide-react';

export function CTASection() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/95 to-red-600/95" />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2" />

      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-white/20">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-white/90 text-sm font-medium">Reserva en menos de 2 minutos</span>
          </div>

          {/* Heading */}
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            ¿Listo para tu próxima{' '}
            <span className="text-yellow-300">experiencia culinaria</span>?
          </h2>

          {/* Description */}
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Reserva mesa en los mejores restaurantes de tu ciudad. 
            Sin llamadas, sin esperas. Solo unos clics.
          </p>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            <div className="flex items-center gap-2 text-white/90">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <span>Reserva instantánea</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <span>Confirmación inmediata</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <span>Grupos de cualquier tamaño</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/restaurants">
              <Button 
                size="xl" 
                className="bg-white text-orange-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-full px-8"
              >
                Ver restaurantes
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
            <Button 
              size="xl" 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white/10 rounded-full px-8 bg-transparent"
            >
              ¿Tienes un restaurante?
            </Button>
          </div>

          {/* Trust text */}
          <p className="mt-8 text-white/60 text-sm">
            Sin comisiones ocultas • Cancelación gratuita • Atención 24/7
          </p>
        </div>
      </div>
    </section>
  );
}
