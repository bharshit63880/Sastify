import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import {
  FiArrowDown,
  FiArrowRight,
  FiChevronRight,
  FiCreditCard,
  FiHeadphones,
  FiPackage,
  FiShield,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "../components/ui/Button";
import { Skeleton, SkeletonRegion } from "../components/ui/Skeleton";
import { selectStorefrontCategoryCounts } from "../features/storefront/StorefrontSlice";
import { fetchStorefrontHome } from "../features/storefront/StorefrontApi";
import { ProductShelf } from "../features/home/components/ProductShelf";
import { RecentlyViewed } from "../features/home/components/RecentlyViewed";
import { HomeMedia } from "../features/home/components/HomeMedia";
import { buildCategoryTree, getCategoryHref } from "../utils/categoryTree";
import { formatPrice } from "../utils/currencyFormatter";

const FALLBACK_HERO = "/hero-editorial.jpg";
const HOME_REQUEST_TIMEOUT_MS = 8000;
const emptyHome = {
  banners: [],
  categories: [],
  brands: [],
  sections: { trending: [], bestSellers: [], newArrivals: [], dealsOfDay: [] },
};

const uniqueProducts = (...groups) => {
  const seen = new Set();
  return groups.flat().filter((product) => {
    if (!product?._id || seen.has(String(product._id))) return false;
    seen.add(String(product._id));
    return true;
  });
};

const getShowcaseCategories = (roots = []) => {
  const pool = roots.flatMap((root) => [root, ...(root.children || [])]);
  return pool.filter((category, index, all) => all.findIndex((item) => String(item._id) === String(category._id)) === index).slice(0, 6);
};

const AnnouncementBar = ({ productCount, categoryCount }) => (
  <div className="relative overflow-hidden border-y border-glass bg-brand-gradient text-white" aria-label="Store announcement">
    <motion.div
      className="flex min-h-10 items-center justify-center gap-3 px-4 py-2 text-center text-xs font-semibold tracking-wide sm:text-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_14px_white]" aria-hidden="true" />
      {productCount ? `${productCount} active products` : "The current Sastify catalogue"}
      {categoryCount ? ` across ${categoryCount} categories` : " ready to explore"}
      <Link to="/products" className="inline-flex items-center gap-1 underline decoration-white/50 underline-offset-4">Browse now <FiArrowRight /></Link>
    </motion.div>
  </div>
);

const Hero = ({ banner, products }) => {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", reduceMotion ? "0%" : "12%"]);
  const title = banner?.title || "A sharper way to discover what’s next";
  const subtitle = banner?.subtitle || "Explore the active Sastify catalogue through a clear, considered storefront.";
  const primaryText = banner?.ctaText || "Explore the catalogue";
  const primaryLink = banner?.ctaLink || "/products";

  return (
    <section ref={ref} className="relative min-h-[calc(100svh-6.5rem)] overflow-hidden" aria-labelledby="home-hero-title">
      <motion.div style={{ y: mediaY }} className="absolute inset-0 -top-[12%] h-[124%]">
        <HomeMedia banner={banner} fallback={FALLBACK_HERO} alt="" eager className="h-full w-full object-cover" />
      </motion.div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,8,22,.9)_0%,rgba(7,11,28,.7)_48%,rgba(8,12,30,.24)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_24%,rgba(111,78,255,.3),transparent_32%),radial-gradient(circle_at_28%_80%,rgba(38,198,229,.18),transparent_30%)]" />
      <div className="relative mx-auto flex min-h-[calc(100svh-6.5rem)] w-full max-w-[1440px] items-center px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1fr_.72fr]">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.09 } } }} className="max-w-4xl">
            <motion.p variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} className="text-label text-white/70">Sastify storefront</motion.p>
            <motion.h1 id="home-hero-title" variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }} className="mt-5 max-w-4xl text-[clamp(3.2rem,8vw,7.8rem)] font-extrabold leading-[.88] tracking-[-.075em] text-white">
              {title}
            </motion.h1>
            <motion.p variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} className="mt-7 max-w-2xl text-base leading-7 text-white/76 sm:text-xl sm:leading-8">{subtitle}</motion.p>
            <motion.div variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} className="mt-9 flex flex-wrap gap-3">
              <Button to={primaryLink} variant="gradient" size="lg" rightIcon={<FiArrowRight />}>{primaryText}</Button>
              <Button to="#featured-categories" variant="glass" size="lg">Browse categories</Button>
            </motion.div>
          </motion.div>

          <div className="hidden items-end justify-end gap-4 lg:flex" aria-label="Featured products">
            {products.slice(0, 2).map((product, index) => (
              <motion.div key={product._id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .35 + index * .1 }} className={index ? "mb-14" : ""}>
                <Link to={`/products/${product.slug || product._id}`} className="glass-panel group block w-52 overflow-hidden rounded-[28px] p-3 text-white">
                  <img src={product.thumbnail || product.images?.[0]} alt="" loading="lazy" width="208" height="240" className="aspect-[4/4.6] w-full rounded-[20px] object-cover transition duration-500 group-hover:scale-[1.03]" />
                  <p className="mt-3 line-clamp-1 text-sm font-semibold">{product.name || product.title}</p>
                  <p className="mt-1 text-xs text-white/70">{formatPrice(product.price)}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <motion.a href="#featured-categories" className="absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-xs font-medium uppercase tracking-[.2em] text-white/65" animate={reduceMotion ? undefined : { y: [0, 7, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
        Scroll <FiArrowDown />
      </motion.a>
    </section>
  );
};

const CategoryBento = ({ categories, counts, loading }) => {
  if (!loading && !categories.length) return null;
  return (
    <section id="featured-categories" aria-labelledby="category-bento-title" className="mx-auto w-full max-w-[1440px] px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      <div className="mb-8 max-w-2xl">
        <p className="text-label text-text-accent">Shop by perspective</p>
        <h2 id="category-bento-title" className="mt-3 text-section-title text-primary">Categories, composed differently</h2>
        <p className="mt-3 body-copy">Move through the active catalogue by category.</p>
      </div>
      {loading ? (
        <SkeletonRegion label="Loading categories"><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-64 rounded-[28px]" />)}</div></SkeletonRegion>
      ) : (
        <div className="grid auto-rows-[220px] gap-4 sm:auto-rows-[250px] md:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, index) => (
            <motion.article
              key={category._id}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: .2 }}
              className={`${index === 0 ? "md:row-span-2 lg:col-span-2" : ""} ${index === 3 ? "lg:col-span-2" : ""} group relative overflow-hidden rounded-[30px] border border-glass bg-surface shadow-md`}
            >
              {category.image ? <img src={category.image} alt="" loading="lazy" width="800" height="600" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" /> : <div className="absolute inset-0 bg-brand-soft" />}
              <div className="absolute inset-0 bg-gradient-to-t from-[#060a1a]/90 via-[#090d20]/35 to-transparent" />
              <Link to={getCategoryHref(category)} className="absolute inset-0 flex flex-col justify-end p-6 text-white sm:p-7">
                <div className="flex items-end justify-between gap-5">
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight">{category.name}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-white/70">{category.description || `Explore ${category.name}`}</p>
                    {counts[String(category._id)] ? <p className="mt-3 text-xs uppercase tracking-[.18em] text-white/55">{counts[String(category._id)]} products</p> : null}
                  </div>
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 transition group-hover:translate-x-1 group-hover:bg-white group-hover:text-[#0b1020]"><FiChevronRight /></span>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      )}
    </section>
  );
};

const FlashSale = ({ products }) => {
  if (!products.length) return null;
  return (
    <section aria-labelledby="current-offers-title" className="mx-auto w-full max-w-[1440px] px-4 py-14 sm:px-6 md:py-20 lg:px-8">
      <div className="relative overflow-hidden rounded-[36px] border border-glass bg-[#0b1020] px-6 py-10 text-white shadow-lg sm:px-10 lg:px-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(240,97,229,.22),transparent_27%),radial-gradient(circle_at_10%_90%,rgba(84,217,239,.17),transparent_30%)]" />
        <div className="relative grid gap-9 lg:grid-cols-[.65fr_1.35fr] lg:items-center">
          <div>
            <p className="text-label text-white/55">Current offers</p>
            <h2 id="current-offers-title" className="mt-4 text-4xl font-bold tracking-[-.05em] sm:text-5xl">Deals from the live catalogue</h2>
            <p className="mt-5 text-base leading-7 text-white/65">No artificial countdown—just products currently marked as deals.</p>
            <Button to="/products" variant="gradient" className="mt-7" rightIcon={<FiArrowRight />}>View all products</Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {products.slice(0, 4).map((product) => (
              <Link key={product._id} to={`/products/${product.slug || product._id}`} className="group flex items-center gap-4 rounded-[24px] border border-white/10 bg-white/[.07] p-3 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/[.11]">
                <img src={product.thumbnail || product.images?.[0]} alt="" loading="lazy" width="96" height="112" className="h-24 w-20 rounded-[18px] object-cover" />
                <div className="min-w-0">
                  {Number(product.discountPercent || product.discountPercentage) > 0 ? <span className="text-xs font-bold text-[#f58bec]">{Number(product.discountPercent || product.discountPercentage)}% off</span> : null}
                  <p className="mt-1 line-clamp-2 font-semibold">{product.name || product.title}</p>
                  <p className="mt-2 text-sm text-white/65">{formatPrice(product.price)}</p>
                  {Number(product.stock || product.stockQuantity) > 0 ? <p className="mt-1 text-xs text-white/45">{Number(product.stock || product.stockQuantity)} available</p> : null}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const EditorialBanner = ({ banner, category }) => {
  const title = banner?.title || "Discover the current Sastify edit";
  const copy = banner?.subtitle || "A visual route into products already available across the storefront.";
  return (
    <section aria-labelledby="editorial-title" className="mx-auto w-full max-w-[1440px] px-4 py-14 sm:px-6 md:py-20 lg:px-8">
      <motion.div initial={{ opacity: 0, scale: .985 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative min-h-[520px] overflow-hidden rounded-[38px] border border-glass shadow-lg">
        <HomeMedia banner={banner || { image: category?.image }} fallback={FALLBACK_HERO} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,9,22,.9),rgba(7,10,24,.48),rgba(7,10,24,.12))]" />
        <div className="relative flex min-h-[520px] max-w-3xl flex-col justify-end p-7 text-white sm:p-12 lg:p-16">
          <p className="text-label text-white/60">The Sastify edit</p>
          <h2 id="editorial-title" className="mt-4 text-[clamp(2.8rem,6vw,5.8rem)] font-bold leading-[.94] tracking-[-.065em]">{title}</h2>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/70 sm:text-lg">{copy}</p>
          <Button to={banner?.ctaLink || "/products"} variant="glass" size="lg" className="mt-8 w-fit" rightIcon={<FiArrowRight />}>{banner?.ctaText || "Explore products"}</Button>
        </div>
      </motion.div>
    </section>
  );
};

const Brands = ({ brands }) => {
  if (!brands.length) return null;
  return (
    <section aria-labelledby="brands-title" className="mx-auto w-full max-w-[1440px] px-4 py-14 sm:px-6 md:py-20 lg:px-8">
      <div className="text-center">
        <p className="text-label text-text-accent">Brands in the catalogue</p>
        <h2 id="brands-title" className="mt-3 text-section-title text-primary">Featured brands</h2>
      </div>
      <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {brands.slice(0, 12).map((brand) => (
          <motion.div key={brand._id} whileHover={{ y: -4 }} className="glass-panel flex min-h-28 items-center justify-center rounded-[24px] p-5 text-center">
            {brand.logo ? <img src={brand.logo} alt={brand.name} loading="lazy" width="140" height="60" className="max-h-12 max-w-[140px] object-contain dark:brightness-0 dark:invert" /> : <span className="font-bold tracking-tight text-primary">{brand.name}</span>}
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const TrustSection = () => {
  const items = [
    { icon: FiShield, title: "Secure checkout", copy: "Payment details are handled through the existing checkout flow." },
    { icon: FiPackage, title: "Clear delivery details", copy: "Available delivery information is shown before purchase." },
    { icon: FiCreditCard, title: "Transparent pricing", copy: "Current prices and discounts come directly from the catalogue." },
    { icon: FiHeadphones, title: "Account support", copy: "Order and account information remains accessible after sign-in." },
  ];
  return (
    <section aria-labelledby="trust-title" className="mx-auto w-full max-w-[1440px] px-4 py-14 sm:px-6 md:py-20 lg:px-8">
      <h2 id="trust-title" className="sr-only">Store services</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, copy }) => (
          <div key={title} className="rounded-[26px] border border-default bg-surface p-6 shadow-sm">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-text-accent"><Icon /></span>
            <h3 className="mt-5 font-bold text-primary">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{copy}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

const Newsletter = () => {
  const [message, setMessage] = useState("");
  return (
    <section aria-labelledby="newsletter-title" className="mx-auto w-full max-w-[1440px] px-4 py-14 sm:px-6 md:py-20 lg:px-8">
      <div className="overflow-hidden rounded-[36px] border border-glass bg-brand-gradient p-[1px] shadow-glow">
        <div className="rounded-[35px] bg-surface px-6 py-10 sm:px-10 lg:flex lg:items-center lg:justify-between lg:gap-12 lg:px-14">
          <div className="max-w-xl">
            <p className="text-label text-text-accent">Newsletter</p>
            <h2 id="newsletter-title" className="mt-3 text-section-title text-primary">Stay close to the catalogue</h2>
            <p className="mt-3 body-copy">The signup interface is ready; subscription delivery will activate when a newsletter service is connected.</p>
          </div>
          <form className="mt-7 w-full max-w-xl lg:mt-0" onSubmit={(event) => { event.preventDefault(); setMessage("Newsletter subscriptions are not connected yet."); }}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label htmlFor="home-newsletter-email" className="sr-only">Email address</label>
              <input id="home-newsletter-email" type="email" required placeholder="Email address" className="input-base min-h-[54px] rounded-pill" />
              <Button type="submit" variant="gradient" size="lg">Subscribe</Button>
            </div>
            <p className="mt-3 min-h-5 text-sm text-text-secondary" role="status" aria-live="polite">{message}</p>
          </form>
        </div>
      </div>
    </section>
  );
};

export const HomePage = () => {
  const [homeData, setHomeData] = useState(emptyHome);
  const [loading, setLoading] = useState(true);
  const categoryCounts = useSelector(selectStorefrontCategoryCounts);

  useEffect(() => {
    let active = true;
    let timeoutId;
    const timeout = new Promise((_, reject) => {
      timeoutId = window.setTimeout(() => reject(new Error("Storefront request timed out")), HOME_REQUEST_TIMEOUT_MS);
    });
    Promise.race([fetchStorefrontHome(), timeout])
      .then((data) => active && setHomeData({
        banners: data.banners || [],
        categories: data.categories || [],
        brands: data.brands || [],
        sections: {
          trending: data.sections?.trending || [],
          bestSellers: data.sections?.bestSellers || [],
          newArrivals: data.sections?.newArrivals || [],
          dealsOfDay: data.sections?.dealsOfDay || [],
        },
      }))
      .catch(() => active && setHomeData(emptyHome))
      .finally(() => {
        window.clearTimeout(timeoutId);
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, []);

  const categoryRoots = useMemo(() => buildCategoryTree(homeData.categories).roots, [homeData.categories]);
  const categories = useMemo(() => getShowcaseCategories(categoryRoots), [categoryRoots]);
  const heroProducts = useMemo(() => uniqueProducts(homeData.sections.trending, homeData.sections.newArrivals).slice(0, 2), [homeData.sections]);
  const productCount = useMemo(() => uniqueProducts(...Object.values(homeData.sections)).length, [homeData.sections]);

  return (
    <div className="relative -mt-0 overflow-hidden">
      <AnnouncementBar productCount={productCount} categoryCount={homeData.categories.length} />
      <Hero banner={homeData.banners[0]} products={heroProducts} />
      <CategoryBento categories={categories} counts={categoryCounts} loading={loading} />
      <ProductShelf id="trending-products" eyebrow="What’s moving" title="Trending now" description="Products currently marked as trending in the Sastify catalogue." products={homeData.sections.trending} loading={loading} />
      <FlashSale products={homeData.sections.dealsOfDay} />
      <ProductShelf id="best-sellers" eyebrow="Popular choices" title="Best sellers" description="Ordered from the catalogue’s recorded sales data." products={homeData.sections.bestSellers} loading={loading} />
      <ProductShelf id="new-arrivals" eyebrow="Just added" title="New arrivals" description="The latest active products added to Sastify." products={homeData.sections.newArrivals} loading={loading} />
      <EditorialBanner banner={homeData.banners[1]} category={categories[0]} />
      <Brands brands={homeData.brands} />
      <RecentlyViewed />
      <TrustSection />
      <Newsletter />
    </div>
  );
};
