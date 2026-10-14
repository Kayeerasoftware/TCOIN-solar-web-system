import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { listProducts } from '@/api/endpoints/catalog';
import { qk } from '@/api/queryKeys';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ProductCard } from '../components/ProductCard';
import type { Product } from '@/types/api';

/* ─── constants ─────────────────────────────────────────────────── */

const CATS = [
  { value: 'panels', label: 'Solar Panels', img: '/products display/Solar-panels.jpg' },
  { value: 'inverters', label: 'Inverters', img: '/products display/Inverter.jpg' },
  { value: 'batteries', label: 'Batteries', img: '/products display/battery.jpg' },
  { value: 'controllers', label: 'Charge Controllers', icon: '🎛️' },
  { value: 'mounting', label: 'Mounting & Structures', icon: '🔩' },
  { value: 'pumps', label: 'Solar Pumps', icon: '💧' },
  { value: 'accessories', label: 'Cables & Accessories', icon: '🔌' },
];

const BRANDS = [
  'Jinko Solar',
  'Canadian Solar',
  'Growatt',
  'Victron Energy',
  'BYD',
  'Trojan',
  'EPever',
  'Lorentz',
  'Helukabel',
  'Stäubli',
  'Felicity Solar',
  'TCOIN Solar',
];

const BANNERS = [
  {
    img: '/products display/Solar-panels.jpg',
    tag: 'BEST SELLERS',
    title: 'Solar Panels',
    sub: 'Mono & poly — all wattages in stock',
    cta: 'Shop Panels',
    cat: 'panels',
    accent: '#1d6434',
  },
  {
    img: '/products display/Inverter.jpg',
    tag: 'NEW ARRIVALS',
    title: 'Hybrid Inverters',
    sub: 'Grid-tie, off-grid & hybrid — free delivery Kampala',
    cta: 'Shop Inverters',
    cat: 'inverters',
    accent: '#3B3A93',
  },
  {
    img: '/products display/battery.jpg',
    tag: 'HOT DEAL',
    title: 'Lithium Batteries',
    sub: 'LiFePO4 deep-cycle — 10-year lifespan',
    cta: 'Shop Batteries',
    cat: 'batteries',
    accent: '#5A3114',
  },
];

const SORT_OPTIONS = [
  { value: '', label: 'Best Match' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A–Z' },
];

const PRICE_RANGES = [
  { label: 'Under UGX 500K', min: 0, max: 500_000 },
  { label: 'UGX 500K – 1M', min: 500_000, max: 1_000_000 },
  { label: 'UGX 1M – 3M', min: 1_000_000, max: 3_000_000 },
  { label: 'UGX 3M – 6M', min: 3_000_000, max: 6_000_000 },
  { label: 'Above UGX 6M', min: 6_000_000, max: Infinity },
];

/* ─── component ─────────────────────────────────────────────────── */

export default function StoreListing() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState(searchParams.get('category') ?? '');
  const [sort, setSort] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number | null>(null);
  const [slide, setSlide] = useState(0);
  const [q, setQ] = useState(searchParams.get('q') ?? '');

  useEffect(() => {
    setCategory(searchParams.get('category') ?? '');
    setQ(searchParams.get('q') ?? '');
  }, [searchParams]);

  // auto-advance banner
  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % BANNERS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: qk.products({ q, category }),
    queryFn: () => listProducts({ q, category, limit: 60 }),
    staleTime: 30_000,
  });

  let products: Product[] = data?.data ?? [];
  if (inStockOnly) products = products.filter((p) => p.variants.some((v) => v.available_qty > 0));
  if (selectedBrands.length) products = products.filter((p) => selectedBrands.includes(p.brand));
  if (priceRange !== null) {
    const r = PRICE_RANGES[priceRange];
    products = products.filter((p) => {
      const price = parseFloat(p.variants[0]?.price.amount ?? '0');
      return price >= r.min && price < r.max;
    });
  }
  if (sort === 'price_asc')
    products = [...products].sort(
      (a, b) =>
        parseFloat(a.variants[0]?.price.amount ?? '0') - parseFloat(b.variants[0]?.price.amount ?? '0'),
    );
  if (sort === 'price_desc')
    products = [...products].sort(
      (a, b) =>
        parseFloat(b.variants[0]?.price.amount ?? '0') - parseFloat(a.variants[0]?.price.amount ?? '0'),
    );
  if (sort === 'name_asc') products = [...products].sort((a, b) => a.name.localeCompare(b.name));

  const activeFilters = [category, inStockOnly, selectedBrands.length > 0, priceRange !== null].filter(
    Boolean,
  ).length;

  const clearAll = useCallback(() => {
    setCategory('');
    setInStockOnly(false);
    setSelectedBrands([]);
    setPriceRange(null);
    setSort('');
    setQ('');
    navigate('/store');
  }, [navigate]);

  function toggleBrand(brand: string) {
    setSelectedBrands((prev) => (prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]));
  }

  function pickCategory(val: string) {
    setCategory((prev) => (prev === val ? '' : val));
    navigate(val ? `/store?category=${val}` : '/store');
  }

  return (
    <div style={{ background: '#f0f0f0', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '12px 12px 60px', display: 'flex', gap: 12 }}>
        {/* ══════════════════════════════════════════
            SIDEBAR
        ══════════════════════════════════════════ */}
        <aside style={{ width: 210, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Categories */}
          <div style={{ background: '#fff', borderRadius: 4, overflow: 'hidden' }}>
            <div
              style={{
                background: '#1d6434',
                color: '#fff',
                padding: '10px 14px',
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              Categories
            </div>
            {CATS.map((c) => (
              <button
                key={c.value}
                onClick={() => pickCategory(c.value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '9px 14px',
                  border: 'none',
                  borderBottom: '1px solid #f5f5f5',
                  background: category === c.value ? '#f0f7f2' : '#fff',
                  color: category === c.value ? '#1d6434' : '#333',
                  fontWeight: category === c.value ? 700 : 400,
                  fontSize: 12,
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderLeft: `3px solid ${category === c.value ? '#1d6434' : 'transparent'}`,
                }}
              >
                {'img' in c ? (
                  <img
                    src={c.img}
                    alt=""
                    style={{ width: 20, height: 20, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }}
                  />
                ) : (
                  <span style={{ fontSize: 14, flexShrink: 0 }}>{c.icon}</span>
                )}
                {c.label}
              </button>
            ))}
          </div>

          {/* Price range */}
          <div style={{ background: '#fff', borderRadius: 4, padding: '12px 14px' }}>
            <p
              style={{
                margin: '0 0 10px',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                color: '#444',
              }}
            >
              Price Range
            </p>
            {PRICE_RANGES.map((r, i) => (
              <label
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 12,
                  cursor: 'pointer',
                  marginBottom: 7,
                  color: priceRange === i ? '#1d6434' : '#333',
                }}
              >
                <input
                  type="radio"
                  name="price"
                  checked={priceRange === i}
                  onChange={() => setPriceRange(priceRange === i ? null : i)}
                  style={{ accentColor: '#1d6434' }}
                />
                {r.label}
              </label>
            ))}
          </div>

          {/* Brand */}
          <div style={{ background: '#fff', borderRadius: 4, padding: '12px 14px' }}>
            <p
              style={{
                margin: '0 0 10px',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                color: '#444',
              }}
            >
              Brand
            </p>
            {BRANDS.map((brand) => (
              <label
                key={brand}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 12,
                  cursor: 'pointer',
                  marginBottom: 7,
                  color: selectedBrands.includes(brand) ? '#1d6434' : '#333',
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  style={{ accentColor: '#1d6434' }}
                />
                {brand}
              </label>
            ))}
          </div>

          {/* Availability */}
          <div style={{ background: '#fff', borderRadius: 4, padding: '12px 14px' }}>
            <p
              style={{
                margin: '0 0 10px',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                color: '#444',
              }}
            >
              Availability
            </p>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12,
                cursor: 'pointer',
                color: inStockOnly ? '#1d6434' : '#333',
              }}
            >
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                style={{ accentColor: '#1d6434' }}
              />
              In stock only
            </label>
          </div>

          {/* Clear filters */}
          {activeFilters > 0 && (
            <button
              onClick={clearAll}
              style={{
                background: '#fff',
                border: '1px solid #e53935',
                borderRadius: 4,
                padding: '9px 14px',
                color: '#e53935',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              ✕ Clear all filters ({activeFilters})
            </button>
          )}

          {/* Calculator CTA */}
          <div style={{ background: '#fff8ee', border: '1px solid #f5a623', borderRadius: 4, padding: 14 }}>
            <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: '#b36b00' }}>
              Not sure what to buy?
            </p>
            <p style={{ margin: '0 0 10px', fontSize: 11, color: '#7a5000', lineHeight: 1.5 }}>
              Use our free solar calculator for a system recommendation.
            </p>
            <Link
              to="/calculator"
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '7px 0',
                background: '#f5a623',
                color: '#fff',
                borderRadius: 3,
                fontSize: 12,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Try calculator →
            </Link>
          </div>
        </aside>

        {/* ══════════════════════════════════════════
            MAIN COLUMN
        ══════════════════════════════════════════ */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* ── Hero banner ── */}
          <div
            style={{
              position: 'relative',
              height: 220,
              borderRadius: 6,
              overflow: 'hidden',
              background: '#111',
              flexShrink: 0,
            }}
          >
            {BANNERS.map((bn, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: i === slide ? 1 : 0,
                  transition: 'opacity 600ms',
                  pointerEvents: i === slide ? 'auto' : 'none',
                }}
              >
                <img
                  src={bn.img}
                  alt={bn.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                />
                {/* dark gradient overlay */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(90deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: 40,
                    transform: 'translateY(-50%)',
                    color: '#fff',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      background: bn.accent,
                      fontSize: 9,
                      fontWeight: 800,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      padding: '2px 8px',
                      borderRadius: 2,
                      marginBottom: 10,
                    }}
                  >
                    {bn.tag}
                  </span>
                  <h2
                    style={{
                      margin: '0 0 6px',
                      fontSize: 30,
                      fontWeight: 900,
                      lineHeight: 1.1,
                      textShadow: '0 2px 8px rgba(0,0,0,0.4)',
                    }}
                  >
                    {bn.title}
                  </h2>
                  <p style={{ margin: '0 0 16px', fontSize: 13, opacity: 0.88, maxWidth: 320 }}>{bn.sub}</p>
                  <button
                    onClick={() => pickCategory(bn.cat)}
                    style={{
                      padding: '8px 20px',
                      background: '#f5a623',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 3,
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {bn.cta} →
                  </button>
                </div>
              </div>
            ))}

            {/* Arrows */}
            {[
              ['‹', -1],
              ['›', 1],
            ].map(([arrow, dir]) => (
              <button
                key={String(arrow)}
                onClick={() => setSlide((s) => (s + Number(dir) + BANNERS.length) % BANNERS.length)}
                style={{
                  position: 'absolute',
                  top: '50%',
                  [Number(dir) < 0 ? 'left' : 'right']: 10,
                  transform: 'translateY(-50%)',
                  background: 'rgba(0,0,0,0.35)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: 34,
                  height: 34,
                  fontSize: 22,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                }}
              >
                {arrow}
              </button>
            ))}

            {/* Dots */}
            <div
              style={{
                position: 'absolute',
                bottom: 10,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 6,
                zIndex: 2,
              }}
            >
              {BANNERS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  style={{
                    width: i === slide ? 22 : 7,
                    height: 7,
                    borderRadius: 4,
                    border: 'none',
                    background: i === slide ? '#f5a623' : 'rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'width 300ms',
                  }}
                />
              ))}
            </div>
          </div>

          {/* ── Category tiles ── */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${CATS.length}, 1fr)`, gap: 6 }}>
            {CATS.map((c) => (
              <button
                key={c.value}
                onClick={() => pickCategory(c.value)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  padding: '12px 6px',
                  background: '#fff',
                  border: `2px solid ${category === c.value ? '#f5a623' : 'transparent'}`,
                  borderRadius: 4,
                  cursor: 'pointer',
                  transition: 'border-color 150ms',
                }}
              >
                {'img' in c ? (
                  <img
                    src={c.img}
                    alt={c.label}
                    style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 4 }}
                  />
                ) : (
                  <span style={{ fontSize: 26, lineHeight: 1 }}>{c.icon}</span>
                )}
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: category === c.value ? 700 : 500,
                    color: category === c.value ? '#f5a623' : '#444',
                    textAlign: 'center',
                    lineHeight: 1.2,
                  }}
                >
                  {c.label}
                </span>
              </button>
            ))}
          </div>

          {/* ── Sort / results bar ── */}
          <div
            style={{
              background: '#fff',
              borderRadius: 4,
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            {/* Search inline */}
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products…"
              style={{
                height: 30,
                padding: '0 10px',
                border: '1px solid #ddd',
                borderRadius: 3,
                fontSize: 12,
                outline: 'none',
                width: 180,
              }}
            />

            <div style={{ width: 1, height: 18, background: '#e8e8e8' }} />

            <span style={{ fontSize: 12, color: '#888', whiteSpace: 'nowrap' }}>
              {isLoading ? (
                '…'
              ) : (
                <>
                  <strong style={{ color: '#222' }}>{products.length}</strong> results
                </>
              )}
            </span>

            <div style={{ flex: 1 }} />

            <span style={{ fontSize: 12, color: '#888', whiteSpace: 'nowrap' }}>Sort by:</span>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {SORT_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setSort(o.value)}
                  style={{
                    padding: '4px 12px',
                    border: `1px solid ${sort === o.value ? '#f5a623' : '#ddd'}`,
                    borderRadius: 20,
                    background: sort === o.value ? '#f5a623' : '#fff',
                    color: sort === o.value ? '#fff' : '#555',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 120ms',
                  }}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Active filter chips ── */}
          {activeFilters > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#888' }}>Active filters:</span>
              {category && (
                <Chip
                  label={CATS.find((c) => c.value === category)?.label ?? category}
                  onRemove={() => {
                    setCategory('');
                    navigate('/store');
                  }}
                />
              )}
              {inStockOnly && <Chip label="In stock" onRemove={() => setInStockOnly(false)} />}
              {priceRange !== null && (
                <Chip label={PRICE_RANGES[priceRange].label} onRemove={() => setPriceRange(null)} />
              )}
              {selectedBrands.map((b) => (
                <Chip key={b} label={b} onRemove={() => toggleBrand(b)} />
              ))}
              <button
                onClick={clearAll}
                style={{
                  fontSize: 11,
                  color: '#e53935',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                Clear all
              </button>
            </div>
          )}

          {/* ── Grid ── */}
          {isLoading && <LoadingState />}

          {!isLoading && products.length === 0 && (
            <div style={{ background: '#fff', borderRadius: 4, padding: '60px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: 40, margin: 0 }}>🔍</p>
              <p style={{ margin: '12px 0 4px', fontWeight: 600, fontSize: 15 }}>No products found</p>
              <p style={{ margin: 0, fontSize: 13, color: '#888' }}>
                Try a different search or clear the filters.
              </p>
            </div>
          )}

          {!isLoading && products.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
                gap: 8,
              }}
            >
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Chip ───────────────────────────────────────────────────────── */
function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        background: '#e8f5e9',
        border: '1px solid #a5d6a7',
        borderRadius: 20,
        padding: '3px 10px',
        fontSize: 11,
        color: '#1d6434',
        fontWeight: 600,
      }}
    >
      {label}
      <button
        onClick={onRemove}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#1d6434',
          fontSize: 12,
          padding: 0,
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        ✕
      </button>
    </span>
  );
}
