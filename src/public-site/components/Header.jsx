import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  Search,
  UserRound,
  ShoppingBag,
  X,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
} from "lucide-react";

import logo from "../assets/logo2.png";
import { useCart } from "../context/cart";
import { categories } from "../data/categories";
import { buscarProductosPorTerminosPublicos } from "../lib/productosPublicApi";
import { useAuth } from "../../auth/AuthContext";
import AuthModal from "./AuthModal";

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function slugFromText(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

function buildSearchText(item) {
  return normalizeText(
    [
      item?.name,
      item?.label,
      item?.slug,
      item?.href,
      item?.categoriaApi,
      ...(Array.isArray(item?.aliases) ? item.aliases : []),
    ]
      .filter(Boolean)
      .join(" "),
  );
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });
}

function getProductImage(producto) {
  return (
    producto?.imagen_principal_thumb ||
    producto?.imagen_principal ||
    producto?.image ||
    producto?.images?.[0] ||
    ""
  );
}

function getProductTitle(producto) {
  return producto?.titulo || producto?.name || producto?.title || "Producto";
}

function getProductCategory(producto) {
  return producto?.categoria || producto?.category || producto?.raw?.categoria || "";
}

function getProductHref(producto, catalogItems = []) {
  const productId = producto?.id;
  if (!productId) return "/";

  const categoriaProducto = normalizeText(getProductCategory(producto));

  const categoriaEncontrada = catalogItems.find((item) => {
    const valores = [
      item?.name,
      item?.label,
      item?.slug,
      item?.categoriaApi,
      ...(Array.isArray(item?.aliases) ? item.aliases : []),
    ];

    return valores.some((valor) => normalizeText(valor) === categoriaProducto);
  });

  const basePath = categoriaEncontrada?.href || "/";

  try {
    const url = new URL(basePath, window.location.origin);
    url.searchParams.set("producto", String(productId));

    return `${url.pathname}${url.search}`;
  } catch {
    return `/?producto=${encodeURIComponent(String(productId))}`;
  }
}

function CategoryMenuCard({ item, onClick }) {
  return (
    <Link
      to={item.to}
      onClick={onClick}
      className="group relative block min-h-[76px] overflow-hidden rounded-2xl border border-black/10 bg-[#f3f3f3] transition hover:bg-[#eeeeee] xl:min-h-[82px]"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#f3f3f3] via-[#f3f3f3] via-55% to-transparent" />

      <div className="relative z-10 flex h-full items-center px-4 py-4">
        <span className="max-w-[58%] text-[13px] font-extrabold uppercase tracking-tight text-black sm:text-sm xl:text-[15px]">
          {item.label}
        </span>
      </div>

      {item.image ? (
        <div className="pointer-events-none absolute inset-y-0 right-0 flex w-[84px] items-end justify-end xl:w-[96px]">
          <img
            src={item.image}
            alt={item.label}
            className="h-full w-full object-contain object-right-bottom transition duration-300 group-hover:scale-[1.04]"
            loading="lazy"
            decoding="async"
            draggable="false"
          />
        </div>
      ) : null}
    </Link>
  );
}

function CategoryMobileLink({ item, onClick }) {
  return (
    <Link
      to={item.to}
      onClick={onClick}
      className="group flex items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm text-black transition hover:bg-gray-50"
    >
      <span className="font-semibold tracking-tight">{item.label}</span>

      <ArrowUpRight
        className="h-4 w-4 text-black/45 transition group-hover:text-black"
        strokeWidth={2}
      />
    </Link>
  );
}

function SearchModal({ open, onClose, items = [] }) {
  const nav = useNavigate();
  const inputRef = useRef(null);

  const [query, setQuery] = useState("");
  const [productos, setProductos] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState("");

  const normalizedQuery = normalizeText(query);

  const categoryResults = useMemo(() => {
    if (!normalizedQuery) return [];

    return items
      .filter((item) => buildSearchText(item).includes(normalizedQuery))
      .slice(0, 6);
  }, [items, normalizedQuery]);

  const terminosBusqueda = useMemo(() => {
    if (!normalizedQuery || normalizedQuery.length < 2) return [];

    const terminos = [query.trim()];

    categoryResults.forEach((item) => {
      terminos.push(item.name);
      terminos.push(item.slug);
      terminos.push(item.categoriaApi);

      if (Array.isArray(item.aliases)) {
        terminos.push(...item.aliases);
      }
    });

    return Array.from(
      new Set(
        terminos
          .map((termino) => String(termino || "").trim())
          .filter(Boolean),
      ),
    );
  }, [query, normalizedQuery, categoryResults]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 30);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) return;

    setQuery("");
    setProductos([]);
    setBuscando(false);
    setError("");
  }, [open]);

  useEffect(() => {
    if (!open) return;

    if (terminosBusqueda.length === 0) {
      setProductos([]);
      setBuscando(false);
      setError("");
      return;
    }

    const controller = new AbortController();
    let activo = true;

    const timer = window.setTimeout(async () => {
      try {
        setBuscando(true);
        setError("");

        const data = await buscarProductosPorTerminosPublicos(terminosBusqueda, {
          pageSize: 8,
          soloDisponibles: true,
          limiteFinal: 8,
          signal: controller.signal,
        });

        if (!activo) return;

        setProductos(data.results || []);
      } catch (err) {
        if (!activo || err?.name === "AbortError") return;

        console.error(err);
        setProductos([]);
        setError("No se pudieron cargar los productos.");
      } finally {
        if (activo) {
          setBuscando(false);
        }
      }
    }, 300);

    return () => {
      activo = false;
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [open, terminosBusqueda]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!normalizedQuery) return;

    if (productos.length > 0) {
      onClose?.();
      nav(getProductHref(productos[0], items));
      return;
    }

    if (categoryResults.length > 0) {
      onClose?.();
      nav(categoryResults[0].href);
    }
  };

  const handlePickProduct = (producto) => {
    onClose?.();
    nav(getProductHref(producto, items));
  };

  const handlePickCategory = (item) => {
    onClose?.();
    nav(item.href);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999]">
      <button
        type="button"
        aria-label="Cerrar búsqueda"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <div className="relative z-10 flex h-full w-full items-start justify-center p-3 sm:p-6">
        <div className="mt-10 w-full max-w-3xl overflow-hidden rounded-[28px] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.28)]">
          <div className="flex items-center justify-between border-b border-black/10 px-4 py-4 sm:px-6">
            <div>
              <h3 className="text-lg font-extrabold tracking-tight text-black sm:text-xl">
                Buscar prendas
              </h3>
              <p className="mt-1 text-sm text-black/55">
                Busca por nombre, categoría, SKU o código.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-black transition hover:bg-gray-50"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>

          <div className="p-4 sm:p-6">
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ej. set, conjunto, blusa, vestido rosa..."
                  className="h-12 w-full rounded-full border border-black/10 px-5 text-sm outline-none transition focus:border-black/25"
                />

                <button
                  type="submit"
                  className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-black px-5 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  <Search className="h-4 w-4" strokeWidth={2} />
                  Buscar
                </button>
              </div>
            </form>

            {!normalizedQuery ? (
              <div className="mt-6">
                <p className="text-sm font-semibold text-black/55">
                  Sugerencias
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {items.slice(0, 10).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setQuery(item.name)}
                      className="rounded-full border border-black/10 bg-gray-50 px-4 py-2 text-sm text-black transition hover:bg-gray-100"
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-black/55">
                    {buscando
                      ? "Buscando productos..."
                      : `${productos.length + categoryResults.length} resultado(s)`}
                  </p>
                </div>

                {error ? (
                  <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                ) : null}

                <div className="max-h-[55vh] space-y-5 overflow-y-auto pr-1">
                  {productos.length > 0 ? (
                    <section>
                      <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-black/45">
                        Productos
                      </p>

                      <div className="space-y-3">
                        {productos.map((producto) => {
                          const image = getProductImage(producto);

                          return (
                            <button
                              key={producto.id}
                              type="button"
                              onClick={() => handlePickProduct(producto)}
                              className="flex w-full items-center justify-between gap-4 rounded-2xl border border-black/10 bg-white px-4 py-3 text-left transition hover:bg-gray-50"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-gray-100">
                                  {image ? (
                                    <img
                                      src={image}
                                      alt={getProductTitle(producto)}
                                      className="h-full w-full object-cover"
                                      loading="lazy"
                                      decoding="async"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-xs text-black/35">
                                      Sin img
                                    </div>
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <h4 className="truncate text-sm font-bold text-black sm:text-base">
                                    {getProductTitle(producto)}
                                  </h4>

                                  <p className="mt-1 truncate text-xs text-black/50 sm:text-sm">
                                    {getProductCategory(producto) || "Sin categoría"}
                                  </p>

                                  <p className="mt-1 text-sm font-bold text-black">
                                    {formatMoney(producto.precio)}
                                  </p>
                                </div>
                              </div>

                              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-black">
                                <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  ) : null}

                  {categoryResults.length > 0 ? (
                    <section>
                      <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-black/45">
                        Categorías
                      </p>

                      <div className="space-y-3">
                        {categoryResults.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handlePickCategory(item)}
                            className="flex w-full items-center justify-between gap-4 rounded-2xl border border-black/10 bg-white px-4 py-4 text-left transition hover:bg-gray-50"
                          >
                            <div className="min-w-0 flex-1">
                              <h4 className="truncate text-base font-bold text-black">
                                {item.name}
                              </h4>

                              <p className="mt-1 text-sm text-black/55">
                                Ver categoría
                              </p>
                            </div>

                            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-black">
                              <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
                            </span>
                          </button>
                        ))}
                      </div>
                    </section>
                  ) : null}

                  {!buscando &&
                    productos.length === 0 &&
                    categoryResults.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-black/10 bg-gray-50 p-6 text-center">
                      <p className="text-base font-semibold text-black">
                        No encontramos resultados
                      </p>
                      <p className="mt-2 text-sm text-black/55">
                        Intenta con palabras como sets, conjuntos, blusas,
                        vestidos, pantalones, shorts o faldas.
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Header({ onCartClick }) {
  const nav = useNavigate();

  const topLinks = [
    { label: "NEW ARRIVALS", to: "/new-arrivals" },
    { label: "REBAJAS", to: "/rebajas" },
  ];

  const catalogItems = useMemo(() => {
    if (!Array.isArray(categories)) return [];

    return categories
      .map((item, index) => {
        if (typeof item === "string") {
          const slug = slugFromText(item);
          const href = `/catalogo/${slug}`;

          return {
            id: `cat-${index + 1}`,
            label: item,
            to: href,
            name: item,
            slug,
            href,
            categoriaApi: item,
            aliases: [],
            image: null,
          };
        }

        const name = item?.name || item?.slug || `Categoría ${index + 1}`;
        const slug = item?.slug || slugFromText(name);
        const href = item?.href || `/catalogo/${slug}`;

        return {
          id: item?.id ?? `cat-${index + 1}`,
          label: name,
          to: href,
          name,
          slug,
          href,
          categoriaApi: item?.categoriaApi || name,
          aliases: Array.isArray(item?.aliases) ? item.aliases : [],
          image: item?.image || null,
        };
      })
      .filter(Boolean);
  }, []);

  const { count } = useCart();
  const { clienteUser, logoutCliente } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [catalogOpenMobile, setCatalogOpenMobile] = useState(false);
  const [catalogOpenDesktop, setCatalogOpenDesktop] = useState(false);
  const desktopCatalogRef = useRef(null);

  const [authOpen, setAuthOpen] = useState(false);
  const [accountOpenMobile, setAccountOpenMobile] = useState(false);
  const [accountOpenDesktop, setAccountOpenDesktop] = useState(false);
  const desktopAccountRef = useRef(null);

  const [searchOpen, setSearchOpen] = useState(false);

  const newArrivals = topLinks.find((x) => x.label === "NEW ARRIVALS");
  const rebajas = topLinks.find((x) => x.label === "REBAJAS");

  const displayName =
    clienteUser?.nombre || clienteUser?.email?.split("@")?.[0] || "Mi cuenta";

  const headerIconBtnClass =
    "flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition hover:border-white/40 hover:bg-white/10";

  const headerIconClass = "h-5 w-5";

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setCatalogOpenMobile(false);
        setCatalogOpenDesktop(false);
        setAuthOpen(false);
        setAccountOpenMobile(false);
        setAccountOpenDesktop(false);
        setSearchOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!catalogOpenDesktop) return;

    const onDown = (e) => {
      if (!desktopCatalogRef.current) return;

      if (!desktopCatalogRef.current.contains(e.target)) {
        setCatalogOpenDesktop(false);
      }
    };

    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [catalogOpenDesktop]);

  useEffect(() => {
    if (!accountOpenDesktop) return;

    const onDown = (e) => {
      if (!desktopAccountRef.current) return;

      if (!desktopAccountRef.current.contains(e.target)) {
        setAccountOpenDesktop(false);
      }
    };

    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [accountOpenDesktop]);

  const handleAccountClickMobile = () => {
    if (!clienteUser) {
      setAuthOpen(true);
      return;
    }

    setAccountOpenMobile((value) => !value);
  };

  const handleAccountClickDesktop = () => {
    if (!clienteUser) {
      setAuthOpen(true);
      return;
    }

    setAccountOpenDesktop((value) => !value);
  };

  const handleLogout = async () => {
    try {
      await logoutCliente();
      setAccountOpenMobile(false);
      setAccountOpenDesktop(false);
      nav("/", { replace: true });
    } catch (error) {
      console.error(error);
      alert("No se pudo cerrar sesión. Intenta de nuevo.");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black">
        <div className="mx-auto max-w-[1300px] px-3 sm:px-4">
          <div className="lg:hidden">
            <div className="grid h-16 grid-cols-[88px,1fr,88px] items-center gap-2 sm:h-[72px]">
              <div className="flex items-center gap-2 justify-self-start">
                <button
                  type="button"
                  onClick={() => setMenuOpen(true)}
                  className={headerIconBtnClass}
                  aria-label="Abrir menú"
                  title="Menú"
                >
                  <Menu className={headerIconClass} strokeWidth={2} />
                </button>

                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className={headerIconBtnClass}
                  title="Buscar"
                  aria-label="Buscar"
                >
                  <Search className={headerIconClass} strokeWidth={2} />
                </button>
              </div>

              <Link
                to="/"
                className="flex min-w-0 items-center justify-center justify-self-center px-2"
                aria-label="Ir al inicio"
                title="Inicio"
              >
                <img
                  src={logo}
                  alt="Logo Boutique"
                  className="h-12 w-auto max-w-[170px] object-contain [filter:brightness(0)_invert(1)] sm:h-14 sm:max-w-[210px]"
                  draggable="false"
                />
              </Link>

              <div className="relative flex items-center gap-2 justify-self-end">
                <button
                  type="button"
                  onClick={handleAccountClickMobile}
                  className={headerIconBtnClass}
                  title={clienteUser ? displayName : "Cuenta"}
                  aria-label="Cuenta"
                >
                  <UserRound className={headerIconClass} strokeWidth={2} />
                </button>

                {clienteUser && accountOpenMobile ? (
                  <div className="absolute right-12 top-11 z-[70] w-52 rounded-2xl border border-black/10 bg-white p-2 shadow-xl">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500">
                      {displayName}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setAccountOpenMobile(false);
                        nav("/account");
                      }}
                      className="w-full rounded-xl px-3 py-2 text-left text-sm transition hover:bg-gray-50"
                    >
                      Mi cuenta
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAccountOpenMobile(false);
                        nav("/account/orders");
                      }}
                      className="w-full rounded-xl px-3 py-2 text-left text-sm transition hover:bg-gray-50"
                    >
                      Mis pedidos
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAccountOpenMobile(false);
                        nav("/account/addresses");
                      }}
                      className="w-full rounded-xl px-3 py-2 text-left text-sm transition hover:bg-gray-50"
                    >
                      Direcciones
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full rounded-xl px-3 py-2 text-left text-sm text-red-600 transition hover:bg-gray-50"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={onCartClick}
                  className={`${headerIconBtnClass} relative`}
                  title="Carrito"
                  aria-label="Abrir carrito"
                >
                  <ShoppingBag className={headerIconClass} strokeWidth={2} />

                  {count > 0 ? (
                    <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white px-1 text-[11px] text-black">
                      {count}
                    </span>
                  ) : null}
                </button>
              </div>
            </div>
          </div>

          <div className="hidden h-28 items-center justify-between gap-4 lg:flex xl:h-32 2xl:h-36">
            <Link to="/" className="flex shrink-0 items-center">
              <img
                src={logo}
                alt="Logo Boutique"
                className="h-[92px] w-auto max-w-[300px] object-contain [filter:brightness(0)_invert(1)] xl:h-[104px] xl:max-w-[360px] 2xl:h-[116px] 2xl:max-w-[420px]"
                draggable="false"
              />
            </Link>

            <nav className="flex flex-1 items-center justify-center gap-6 text-sm font-semibold text-white">
              <div className="relative" ref={desktopCatalogRef}>
                <button
                  type="button"
                  onClick={() => setCatalogOpenDesktop((value) => !value)}
                  className="inline-flex items-center gap-2 text-white transition hover:opacity-70"
                  aria-expanded={catalogOpenDesktop}
                  aria-haspopup="menu"
                >
                  CATALOGO
                  {catalogOpenDesktop ? (
                    <ChevronUp className="h-4 w-4" strokeWidth={2} />
                  ) : (
                    <ChevronDown className="h-4 w-4" strokeWidth={2} />
                  )}
                </button>

                {catalogOpenDesktop ? (
                  <div
                    className="absolute left-1/2 top-full z-[80] mt-4 w-[min(980px,94vw)] -translate-x-1/2 rounded-[32px] border border-black/10 bg-white text-black shadow-[0_24px_70px_rgba(0,0,0,0.22)]"
                    role="menu"
                  >
                    <div className="max-h-[calc(100vh-150px)] overflow-y-auto p-4 sm:p-5 xl:p-6">
                      <div className="mb-4 flex items-center justify-between gap-4">
                        <div>
                          <div className="text-xs font-bold tracking-[0.14em] text-gray-500">
                            CATEGORÍAS
                          </div>
                          <p className="mt-1 text-sm text-gray-500">
                            Explora todas las colecciones
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setCatalogOpenDesktop(false)}
                          className="shrink-0 rounded-full border border-black/10 px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
                        >
                          Cerrar
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
                        {catalogItems.map((item) => (
                          <CategoryMenuCard
                            key={item.id}
                            item={item}
                            onClick={() => setCatalogOpenDesktop(false)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {topLinks.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="text-white hover:opacity-70"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className={headerIconBtnClass}
                title="Buscar"
                aria-label="Buscar"
              >
                <Search className={headerIconClass} strokeWidth={2} />
              </button>

              <div className="relative" ref={desktopAccountRef}>
                <button
                  type="button"
                  onClick={handleAccountClickDesktop}
                  className={headerIconBtnClass}
                  title={clienteUser ? displayName : "Cuenta"}
                  aria-label="Cuenta"
                >
                  <UserRound className={headerIconClass} strokeWidth={2} />
                </button>

                {clienteUser && accountOpenDesktop ? (
                  <div className="absolute right-0 z-[70] mt-3 w-56 rounded-2xl border border-black/10 bg-white p-2 text-black shadow-xl">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500">
                      {displayName}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setAccountOpenDesktop(false);
                        nav("/account");
                      }}
                      className="w-full rounded-xl px-3 py-2 text-left text-sm transition hover:bg-gray-50"
                    >
                      Mi cuenta
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAccountOpenDesktop(false);
                        nav("/account/orders");
                      }}
                      className="w-full rounded-xl px-3 py-2 text-left text-sm transition hover:bg-gray-50"
                    >
                      Mis pedidos
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAccountOpenDesktop(false);
                        nav("/account/addresses");
                      }}
                      className="w-full rounded-xl px-3 py-2 text-left text-sm transition hover:bg-gray-50"
                    >
                      Direcciones
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full rounded-xl px-3 py-2 text-left text-sm text-red-600 transition hover:bg-gray-50"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={onCartClick}
                className={`${headerIconBtnClass} relative`}
                title="Carrito"
                aria-label="Abrir carrito"
              >
                <ShoppingBag className={headerIconClass} strokeWidth={2} />

                {count > 0 ? (
                  <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white px-1 text-[11px] text-black">
                    {count}
                  </span>
                ) : null}
              </button>
            </div>
          </div>
        </div>

        {menuOpen ? (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <button
              type="button"
              aria-label="Cerrar menú"
              onClick={() => setMenuOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <aside className="absolute left-0 top-0 h-full w-[min(88vw,380px)] overflow-y-auto bg-white p-4 text-black shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <Link
                  to="/"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center"
                >
                  <img
                    src={logo}
                    alt="Logo Boutique"
                    className="h-14 w-auto max-w-[190px] object-contain"
                    draggable="false"
                  />
                </Link>

                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 transition hover:bg-gray-50"
                  aria-label="Cerrar menú"
                >
                  <X className="h-5 w-5" strokeWidth={2} />
                </button>
              </div>

              <nav>
                {newArrivals ? (
                  <Link
                    to={newArrivals.to}
                    onClick={() => setMenuOpen(false)}
                    className="block w-full rounded-2xl border px-4 py-3 text-sm font-semibold transition hover:bg-gray-50"
                  >
                    {newArrivals.label}
                  </Link>
                ) : null}

                <button
                  type="button"
                  onClick={() => setCatalogOpenMobile((value) => !value)}
                  className="mt-3 flex w-full items-center justify-between rounded-2xl border px-4 py-3 font-semibold transition hover:bg-gray-50"
                  aria-expanded={catalogOpenMobile}
                >
                  <span>CATALOGO</span>

                  {catalogOpenMobile ? (
                    <ChevronUp className="h-4 w-4" strokeWidth={2} />
                  ) : (
                    <ChevronDown className="h-4 w-4" strokeWidth={2} />
                  )}
                </button>

                {catalogOpenMobile ? (
                  <ul className="mt-3 space-y-2">
                    {catalogItems.map((item) => (
                      <li key={item.id}>
                        <CategoryMobileLink
                          item={item}
                          onClick={() => {
                            setCatalogOpenMobile(false);
                            setMenuOpen(false);
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                ) : null}

                {rebajas ? (
                  <Link
                    to={rebajas.to}
                    onClick={() => setMenuOpen(false)}
                    className="mt-3 block w-full rounded-2xl border px-4 py-3 text-sm font-semibold transition hover:bg-gray-50"
                  >
                    {rebajas.label}
                  </Link>
                ) : null}

                <div className="mb-3 mt-6 text-xs font-semibold text-gray-500">
                  ACCESOS
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className="rounded-2xl border px-3 py-3 text-sm transition hover:bg-gray-50"
                    onClick={() => {
                      setMenuOpen(false);
                      setSearchOpen(true);
                    }}
                  >
                    Buscar
                  </button>

                  <button
                    type="button"
                    className="rounded-2xl border px-3 py-3 text-sm transition hover:bg-gray-50"
                    onClick={() => {
                      setMenuOpen(false);
                      onCartClick?.();
                    }}
                  >
                    Ver carrito
                  </button>

                  <button
                    type="button"
                    className="col-span-2 rounded-2xl border px-3 py-3 text-sm transition hover:bg-gray-50"
                    onClick={() => {
                      setMenuOpen(false);

                      if (clienteUser) {
                        nav("/account");
                        return;
                      }

                      setAuthOpen(true);
                    }}
                  >
                    {clienteUser ? "Mi cuenta" : "Cuenta"}
                  </button>
                </div>
              </nav>
            </aside>
          </div>
        ) : null}

        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      </header>

      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        items={catalogItems}
      />
    </>
  );
}