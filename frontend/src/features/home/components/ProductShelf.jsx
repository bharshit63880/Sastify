import React, { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { Button } from "../../../components/ui/Button";
import { ProductCardSkeleton, SkeletonRegion } from "../../../components/ui/Skeleton";
import { ProductCard } from "../../products/components/ProductCard";

export const ProductShelf = ({ id, eyebrow, title, description, products = [], loading = false }) => {
  const railRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const move = (direction) => railRef.current?.scrollBy({
    left: direction * Math.min(railRef.current.clientWidth * 0.82, 900),
    behavior: reduceMotion ? "auto" : "smooth",
  });

  if (!loading && !products.length) return null;

  return (
    <section id={id} aria-labelledby={`${id}-title`} className="mx-auto w-full max-w-[1440px] px-4 py-14 sm:px-6 md:py-20 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: reduceMotion ? 0 : 0.5 }}
        className="mb-7 flex flex-col gap-5 md:flex-row md:items-end md:justify-between"
      >
        <div className="max-w-2xl">
          <p className="text-label text-text-accent">{eyebrow}</p>
          <h2 id={`${id}-title`} className="mt-3 text-section-title text-primary">{title}</h2>
          {description ? <p className="mt-3 body-copy">{description}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => move(-1)} className="neumorphic-control inline-flex h-11 w-11 items-center justify-center rounded-full" aria-label={`Scroll ${title} backward`}><FiArrowLeft /></button>
          <button type="button" onClick={() => move(1)} className="neumorphic-control inline-flex h-11 w-11 items-center justify-center rounded-full" aria-label={`Scroll ${title} forward`}><FiArrowRight /></button>
          <Button to="/products" variant="ghost" rightIcon={<FiArrowRight />}>View all</Button>
        </div>
      </motion.div>

      {loading ? (
        <SkeletonRegion label={`Loading ${title}`}>
          <div className="no-scrollbar flex gap-5 overflow-hidden">
            {Array.from({ length: 4 }, (_, index) => <div className="w-[270px] shrink-0 sm:w-[292px]" key={index}><ProductCardSkeleton /></div>)}
          </div>
        </SkeletonRegion>
      ) : (
        <div ref={railRef} className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto pb-5" tabIndex="0" aria-label={`${title} product carousel`}>
          {products.slice(0, 10).map((product) => (
            <motion.div
              key={product._id}
              className="w-[270px] shrink-0 snap-start sm:w-[292px]"
              initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
};
