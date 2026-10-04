"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/button-link";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80",
    tagline: "Modern boutique essentials.",
    heading: "Modern boutique essentials, made for movement.",
  },
  {
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80",
    tagline: "New season, new staples.",
    heading: "Effortless pieces for everyday elegance.",
  },
  {
    image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1600&q=80",
    tagline: "Curated, not cluttered.",
    heading: "Fewer, better things — thoughtfully sourced.",
  },
];

export function HeroCarousel() {
  const [active, setActive] = useState(0);

  const next = useCallback(() => {
    setActive((i) => (i + 1) % slides.length);
  }, []);

  useEffect(() => {
    const id = setInterval(next, 8000);
    return () => clearInterval(id);
  }, [next]);

  return (
    <section className="relative min-h-[75vh] overflow-hidden">
      {/* Sliding track */}
      <div
        className="absolute inset-0 flex transition-transform duration-[1800ms] ease-in-out"
        style={{ transform: `translateX(-${active * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div key={slide.image} className="relative h-[75vh] w-full flex-shrink-0 overflow-hidden">
            <div
              className={`relative h-full w-full ${i === active ? "animate-kenburns" : ""}`}
            >
              <Image
                src={slide.image}
                alt=""
                fill
                priority={i === 0}
                className="object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-black/30" />
          </div>
        ))}
      </div>

      {/* Text content */}
      <div className="relative z-10 flex min-h-[75vh] flex-col items-center justify-center px-4 text-center text-white">
        <p
          key={`tagline-${active}`}
          className="text-xs uppercase tracking-[0.2em] transition-opacity duration-700"
        >
          {slides[active].tagline}
        </p>
        <h1
          key={`heading-${active}`}
          className="mx-auto mt-4 max-w-2xl text-4xl transition-opacity duration-700 md:text-5xl"
        >
          {slides[active].heading}
        </h1>
        <div className="mt-8 flex justify-center gap-4">
          <ButtonLink href="/shop">Shop new arrivals</ButtonLink>
          <ButtonLink href="/categories" variant="secondary">Explore collections</ButtonLink>
        </div>

        <div className="mt-10 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 w-2 rounded-full transition-all duration-500 ${
                i === active ? "w-6 bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}