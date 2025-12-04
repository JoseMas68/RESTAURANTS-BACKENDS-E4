'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Laura Fernández',
    role: 'Foodie profesional',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    rating: 5,
    comment: 'La mejor plataforma para descubrir restaurantes. Encontré lugares increíbles que nunca hubiera conocido de otra forma. ¡Las reseñas son muy precisas!',
  },
  {
    id: 2,
    name: 'Diego Morales',
    role: 'Chef ejecutivo',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    rating: 5,
    comment: 'Como chef, valoro mucho las plataformas que respetan la gastronomía. Esta app muestra los restaurantes de forma auténtica y profesional.',
  },
  {
    id: 3,
    name: 'Carmen López',
    role: 'Blogger gastronómica',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    rating: 5,
    comment: 'La interfaz es preciosa y muy fácil de usar. Me encanta poder ver los menús completos y hacer reservas en segundos. ¡Totalmente recomendada!',
  },
  {
    id: 4,
    name: 'Alejandro Ruiz',
    role: 'Empresario',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    rating: 5,
    comment: 'Uso esta plataforma para todas mis cenas de negocios. Nunca me ha fallado. Los filtros de búsqueda son exactamente lo que necesito.',
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">
            Testimonios
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3 mb-4">
            Lo que dicen nuestros{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
              usuarios
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Miles de amantes de la gastronomía confían en nosotros para sus experiencias culinarias
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial) => (
            <Card 
              key={testimonial.id} 
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-white"
            >
              <CardContent className="p-6">
                {/* Quote Icon */}
                <div className="mb-4">
                  <Quote className="w-8 h-8 text-orange-500/20" />
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Comment */}
                <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                  "{testimonial.comment}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <Avatar className="h-12 w-12 ring-2 ring-orange-100">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback className="bg-orange-100 text-orange-600">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-gray-400">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="text-gray-600 font-medium">4.9/5 en App Store</span>
          </div>
          <div className="w-px h-6 bg-gray-200" />
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="text-gray-600 font-medium">4.8/5 en Google Play</span>
          </div>
          <div className="w-px h-6 bg-gray-200" />
          <span className="text-gray-600 font-medium">+100,000 descargas</span>
        </div>
      </div>
    </section>
  );
}
