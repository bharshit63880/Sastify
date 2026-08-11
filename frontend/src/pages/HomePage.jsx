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

const FALLBACK_HERO = "/hero-ivory-products.png";
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

const Hero = ({ banner, products }) => {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", reduceMotion ? "0%" : "12%"]);
  const title = "Finds that feel made for you.";
  const subtitle = "Thoughtful upgrades, unexpected favourites, and everyday pieces worth keeping.";
  const primaryText = "Discover what's new";
  const primaryLink = banner?.ctaLink || "/products";

  return (
    <div className="hero-dimensional-frame relative mx-3 mb-8 mt-4 sm:mx-5 lg:mx-8">
      <section ref={ref} className="hero-dimensional-panel relative min-h-[calc(100svh-8rem)] overflow-hidden" aria-labelledby="home-hero-title">
      <motion.div style={{ y: mediaY }} className="absolute inset-0 -top-[12%] h-[124%]">
        <HomeMedia banner={{ image: FALLBACK_HERO }} fallback={FALLBACK_HERO} alt="" eager className="h-full w-full object-cover" />
      </motion.div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,253,249,.96)_0%,rgba(255,252,246,.72)_39%,rgba(255,252,246,.08)_63%,transparent_100%)]" />
      <div className="relative mx-auto flex min-h-[calc(100svh-8rem)] w-full max-w-[1440px] items-center px-4 py-16 sm:px-7 lg:px-10">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1fr_.72fr]">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.09 } } }} className="max-w-3xl py-6 sm:py-9 lg:py-11">
            <motion.p variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} className="text-label text-[#b38a3d]">Curated for the curious</motion.p>
            <motion.h1 id="home-hero-title" variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }} className="mt-5 max-w-3xl text-[clamp(3.1rem,6.8vw,7rem)] font-extrabold leading-[.9] tracking-[-.07em] text-[#171b22]">
              {title}
            </motion.h1>
            <motion.p variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} className="mt-7 max-w-xl text-base leading-7 text-[#646a76] sm:text-xl sm:leading-8">{subtitle}</motion.p>
            <motion.div variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} className="mt-9 flex flex-wrap gap-3">
              <Button to={primaryLink} variant="gradient" size="lg" rightIcon={<FiArrowRight />} className="hero-primary-cta">{primaryText}</Button>
              <Button to="#featured-categories" variant="glass" size="lg" className="hero-secondary-cta">Explore categories</Button>
            </motion.div>
          </motion.div>

          <div className="hidden items-end justify-end gap-4 lg:flex" aria-label="Featured products">
            {products.slice(0, 2).map((product, index) => (
              <motion.div key={product._id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .35 + index * .1 }} className={index ? "mb-14" : ""}>
                <Link to={`/products/${product.slug || product._id}`} className="hero-product-float group block w-52 overflow-hidden rounded-[28px] p-3 text-[#252932]">
                  <img src={product.thumbnail || product.images?.[0]} alt="" loading="lazy" width="208" height="240" className="aspect-[4/4.6] w-full rounded-[20px] object-cover transition duration-500 group-hover:scale-[1.03]" />
                  <p className="mt-3 line-clamp-1 text-sm font-semibold">{product.name || product.title}</p>
                  <p className="mt-1 text-xs text-[#737985]">{formatPrice(product.price)}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <motion.a href="#featured-categories" className="absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-xs font-medium uppercase tracking-[.2em] text-[#757a84]" animate={reduceMotion ? undefined : { y: [0, 7, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
        Scroll <FiArrowDown />
      </motion.a>
      </section>
    </div>
  );
};

const CategoryBento = ({ categories, counts, loading }) => {
  if (!loading && !categories.length) return null;
  return (
    <section id="featured-categories" aria-labelledby="category-bento-title" className="mx-auto w-full max-w-[1440px] px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      <div className="mb-8 max-w-2xl">
        <p className="text-label text-text-accent">Shop by perspective</p>
        <h2 id="category-bento-title" className="mt-3 text-section-title text-text-primary">Categories, composed differently</h2>
        <p className="mt-3 body-copy">Start with what you need, then narrow it down to the right fit.</p>
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
                    {counts[String(category._id)] ? <p className="mt-3 text-xs uppercase tracking-[.18em] text-white/60">{counts[String(category._id)]} products</p> : null}
                  </div>
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 transition group-hover:translate-x-1 group-hover:bg-surface-raised group-hover:text-[#0b1020]"><FiChevronRight /></span>
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
            <p className="text-label text-white/60">Current offers</p>
            <h2 id="current-offers-title" className="mt-4 text-4xl font-bold tracking-[-.05em] sm:text-5xl">Good prices, while they last</h2>
            <p className="mt-5 text-base leading-7 text-white/70">Straightforward savings on products worth a closer look.</p>
            <Button to="/products" variant="gradient" className="mt-7" rightIcon={<FiArrowRight />}>View all products</Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {products.slice(0, 4).map((product) => (
              <Link key={product._id} to={`/products/${product.slug || product._id}`} className="group flex items-center gap-4 rounded-[24px] border border-white/10 bg-white/[.07] p-3 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/[.11]">
                <img src={product.thumbnail || product.images?.[0]} alt="" loading="lazy" width="96" height="112" className="h-24 w-20 rounded-[18px] object-cover" />
                <div className="min-w-0">
                  {Number(product.discountPercent || product.discountPercentage) > 0 ? <span className="text-xs font-bold text-[#f58bec]">{Number(product.discountPercent || product.discountPercentage)}% off</span> : null}
                  <p className="mt-1 line-clamp-2 font-semibold">{product.name || product.title}</p>
                  <p className="mt-2 text-sm text-white/70">{formatPrice(product.price)}</p>
                  {Number(product.stock || product.stockQuantity) > 0 ? <p className="mt-1 text-xs text-white/50">{Number(product.stock || product.stockQuantity)} available</p> : null}
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
  const title = banner?.title || "A considered mix for everyday life";
  const copy = banner?.subtitle || "Useful upgrades, thoughtful details, and a few finds you may not have searched for.";
  return (
    <section aria-labelledby="editorial-title" className="mx-auto w-full max-w-[1440px] px-4 py-14 sm:px-6 md:py-20 lg:px-8">
      <motion.div initial={{ opacity: 0, scale: .985, y: 18 }} whileInView={{ opacity: 1, scale: 1, y: 0 }} viewport={{ once: true }} className="editorial-frame relative">
        <div className="editorial-panel relative min-h-[520px] overflow-hidden">
          <HomeMedia banner={banner || { image: category?.image }} fallback={FALLBACK_HERO} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,9,22,.92),rgba(7,10,24,.5),rgba(7,10,24,.14))]" />
          <div className="editorial-shine absolute inset-0" aria-hidden="true" />
          <div className="relative flex min-h-[520px] max-w-3xl flex-col justify-end p-7 text-white sm:p-12 lg:p-16">
            <p className="text-label text-white/60">The Sastify edit</p>
            <h2 id="editorial-title" className="mt-4 text-[clamp(2.8rem,6vw,5.8rem)] font-bold leading-[.94] tracking-[-.065em]">{title}</h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/70 sm:text-lg">{copy}</p>
            <Button to={banner?.ctaLink || "/products"} variant="glass" size="lg" className="mt-8 w-fit" rightIcon={<FiArrowRight />}>{banner?.ctaText || "Explore products"}</Button>
          </div>
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
        <p className="text-label text-text-accent">Brands to know</p>
        <h2 id="brands-title" className="mt-3 text-section-title text-text-primary">Featured brands</h2>
      </div>
      <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {brands.slice(0, 12).map((brand) => (
          <motion.div key={brand._id} whileHover={{ y: -4 }} className="glass-panel flex min-h-28 items-center justify-center rounded-[24px] p-5 text-center">
            {brand.logo ? <img src={brand.logo} alt={brand.name} loading="lazy" width="140" height="60" className="max-h-12 max-w-[140px] object-contain dark:brightness-0 dark:invert" /> : <span className="font-bold tracking-tight text-text-primary">{brand.name}</span>}
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const TrustSection = () => {
  const items = [
    { icon: FiShield, title: "Secure checkout", copy: "Protected payments and clear order confirmation at every step." },
    { icon: FiPackage, title: "Delivery you can plan for", copy: "See availability and delivery details before you place an order." },
    { icon: FiCreditCard, title: "No-surprise pricing", copy: "The price you review is the price carried into checkout." },
    { icon: FiHeadphones, title: "Help when you need it", copy: "Your orders, addresses, and account details stay easy to find." },
  ];
  return (
    <section aria-labelledby="trust-title" className="mx-auto w-full max-w-[1440px] px-4 py-14 sm:px-6 md:py-20 lg:px-8">
      <h2 id="trust-title" className="sr-only">Store services</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, copy }) => (
          <div key={title} className="rounded-[26px] border border-default bg-surface p-6 shadow-sm">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-text-accent"><Icon /></span>
            <h3 className="mt-5 font-bold text-text-primary">{title}</h3>
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
            <h2 id="newsletter-title" className="mt-3 text-section-title text-text-primary">The good stuff, occasionally</h2>
            <p className="mt-3 body-copy">New arrivals, useful buying guides, and offers worth opening—sent without the inbox clutter.</p>
          </div>
          <form className="mt-7 w-full max-w-xl lg:mt-0" onSubmit={(event) => { event.preventDefault(); setMessage("You're on the list. Watch your inbox for the next Sastify edit."); }}>
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
  return (
    <div className="relative -mt-0 overflow-hidden">
      <Hero banner={homeData.banners[0]} products={heroProducts} />
      <CategoryBento categories={categories} counts={categoryCounts} loading={loading} />
      <ProductShelf id="trending-products" eyebrow="What’s moving" title="Trending now" description="The products shoppers are returning to right now." products={homeData.sections.trending} loading={loading} />
      <FlashSale products={homeData.sections.dealsOfDay} />
      <ProductShelf id="best-sellers" eyebrow="Popular choices" title="Best sellers" description="Reliable favourites chosen across the Sastify community." products={homeData.sections.bestSellers} loading={loading} />
      <ProductShelf id="new-arrivals" eyebrow="Just added" title="New arrivals" description="Fresh additions across fashion, technology, home, and personal care." products={homeData.sections.newArrivals} loading={loading} />
      <EditorialBanner banner={homeData.banners[1]} category={categories[0]} />
      <Brands brands={homeData.brands} />
      <RecentlyViewed />
      <TrustSection />
      <Newsletter />
    </div>
  );
};
