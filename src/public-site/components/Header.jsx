import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo_mis_dos_reynas.png";
import cartBagIcon from "../assets/icons/cart-bag.png";
import { useCart } from "../context/cart";
import { categories } from "../data/categories";
import { useAuth } from "../../auth/AuthContext";
import AuthModal from "./AuthModal";

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function buildSearchText(item) {
  return normalizeText([item?.name, item?.slug, item?.href].filter(Boolean).join(" "));
}

function SearchModal({ open, onClose, items = [] }) {
  const nav = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 30);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const normalizedQuery = normalizeText(query);

  const results = useMemo(() => {
    if (!normalizedQuery) return [];
    return items.filter((item) => buildSearchText(item).includes(normalizedQuery)).slice(0, 8);
  }, [items, normalizedQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!normalizedQuery) return;
    if (results.length === 0) return;

    onClose?.();
    nav(results[0].href);
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
                Busca por nombre, categoría o palabra clave.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-black transition hover:bg-gray-50"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          <div className="p-4 sm:p-6">
            <form onSubmit={handleSubmit}>
              <div className="flex gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ej. blusa, pantalón, vestido rosa..."
                  className="h-12 w-full rounded-full border border-black/10 px-5 text-sm outline-none transition focus:border-black/25"
                />

                <button
                  type="submit"
                  className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-black px-5 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  Buscar
                </button>
              </div>
            </form>

            {!normalizedQuery ? (
              <div className="mt-6">
                <p className="text-sm font-semibold text-black/55">Sugerencias</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {items.slice(0, 8).map((item) => (
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
                    {results.length > 0
                      ? `${results.length} resultado(s)`
                      : "No encontramos coincidencias"}
                  </p>
                </div>

                <div className="max-h-[55vh] space-y-3 overflow-y-auto pr-1">
                  {results.length > 0 ? (
                    results.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handlePickCategory(item)}
                        className="flex w-full items-center gap-4 rounded-3xl border border-black/10 bg-white p-3 text-left transition hover:bg-gray-50"
                      >
                        <div className="h-20 w-16 shrink-0 overflow-hidden rounded-2xl bg-gray-100 sm:h-24 sm:w-20">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-base font-bold text-black">
                            {item.name}
                          </h4>

                          <p className="mt-1 truncate text-sm text-black/55">
                            Categoría
                          </p>
                        </div>

                        <div className="hidden sm:flex">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-black">
                            ↗
                          </span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-3xl border border-dashed border-black/10 bg-gray-50 p-6 text-center">
                      <p className="text-base font-semibold text-black">
                        No encontramos resultados
                      </p>
                      <p className="mt-2 text-sm text-black/55">
                        Intenta con una categoría como blusas, vestidos, pantalones,
                        shorts o faldas.
                      </p>
                    </div>
                  )}
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

  const catalogItems = useMemo(
    () =>
      (Array.isArray(categories) ? categories : []).map((item) => ({
        id: item.id,
        label: item.name,
        to: item.href,
        image: item.image,
        name: item.name,
        slug: item.slug,
        href: item.href,
      })),
    []
  );

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

  const newArrivals = topLinks.find((x) => x.label === "NEW ARRIVALS");
  const rebajas = topLinks.find((x) => x.label === "REBAJAS");

  const displayName =
    clienteUser?.nombre || clienteUser?.email?.split("@")?.[0] || "Mi cuenta";

  const handleAccountClickMobile = () => {
    if (!clienteUser) {
      setAuthOpen(true);
      return;
    }
    setAccountOpenMobile((v) => !v);
  };

  const handleAccountClickDesktop = () => {
    if (!clienteUser) {
      setAuthOpen(true);
      return;
    }
    setAccountOpenDesktop((v) => !v);
  };

  const handleLogout = async () => {
    try {
      await logoutCliente();
      setAccountOpenMobile(false);
      setAccountOpenDesktop(false);
      nav("/", { replace: true });
    } catch (e) {
      console.error(e);
      alert("No se pudo cerrar sesión. Intenta de nuevo.");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-white overflow-x-clip">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 overflow-x-clip">
          <div className="lg:hidden">
            <div className="grid h-24 grid-cols-[auto,1fr,auto] items-center gap-2 sm:h-24">
              <div className="flex items-center gap-2 justify-self-start">
                <button
                  type="button"
                  onClick={() => setMenuOpen(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border transition hover:bg-gray-50"
                  aria-label="Abrir menú"
                  title="Menú"
                >
                  <span className="text-lg leading-none">☰</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border transition hover:bg-gray-50"
                  title="Buscar"
                  aria-label="Buscar"
                >
                  ⌕
                </button>
              </div>

              <Link
                to="/"
                className="min-w-0 justify-self-center flex items-center justify-center"
                aria-label="Ir al inicio"
                title="Inicio"
              >
                <img
                  src={logo}
                  alt="Logo Boutique"
                  className="h-[100px] w-auto max-w-[min(78vw,500px)] origin-center object-contain scale-[1.06] sm:h-[110px]"
                  draggable="false"
                />
              </Link>

              <div className="relative flex items-center gap-2 justify-self-end">
                <button
                  type="button"
                  onClick={handleAccountClickMobile}
                  className="flex h-10 w-10 items-center justify-center rounded-full border transition hover:bg-gray-50"
                  title={clienteUser ? displayName : "Cuenta"}
                  aria-label="Cuenta"
                >
                  👤
                </button>

                {clienteUser && accountOpenMobile && (
                  <div className="absolute right-12 top-11 z-[70] w-52 rounded-2xl border bg-white p-2 shadow-xl">
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
                )}

                <button
                  type="button"
                  onClick={onCartClick}
                  className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition hover:bg-gray-50"
                  title="Carrito"
                  aria-label="Abrir carrito"
                >
                  <img
                    src={cartBagIcon}
                    alt="Carrito"
                    className="h-[18px] w-[18px] object-contain"
                    draggable="false"
                  />

                  {count > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] rounded-full bg-black px-1 text-center text-[11px] leading-[18px] text-white h-[18px]">
                      {count}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex h-32 xl:h-36 2xl:h-40 items-center justify-between gap-4">
            <Link to="/" className="flex items-center shrink-0">
              <img
                src={logo}
                alt="Logo Boutique"
                className="h-[180px] w-auto max-w-[420px] object-contain xl:h-[190px] xl:max-w-[560px] 2xl:h-[210px] 2xl:max-w-[640px]"
              />
            </Link>

            <nav className="flex flex-1 items-center justify-center gap-6 text-sm font-semibold">
              <div className="relative" ref={desktopCatalogRef}>
                <button
                  type="button"
                  onClick={() => setCatalogOpenDesktop((v) => !v)}
                  className="inline-flex items-center gap-2 transition hover:opacity-70"
                  aria-expanded={catalogOpenDesktop}
                  aria-haspopup="menu"
                >
                  CATALOGO
                  <span className="text-xs">{catalogOpenDesktop ? "▲" : "▼"}</span>
                </button>

                {catalogOpenDesktop && (
                  <div
                    className="absolute left-1/2 mt-4 w-[min(760px,92vw)] -translate-x-1/2 rounded-3xl border bg-white p-5 shadow-2xl"
                    role="menu"
                  >
                    <div className="mb-3 text-xs font-bold text-gray-500">
                      CATEGORÍAS
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {catalogItems.map((c) => (
                        <Link
                          key={c.id}
                          to={c.to}
                          onClick={() => setCatalogOpenDesktop(false)}
                          className="rounded-2xl border px-4 py-3 font-medium transition hover:bg-gray-50"
                        >
                          {c.label}
                        </Link>
                      ))}
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setCatalogOpenDesktop(false)}
                        className="text-sm underline hover:opacity-70"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {topLinks.map((t) => (
                <Link key={t.label} to={t.to} className="hover:opacity-70">
                  {t.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full border transition hover:bg-gray-50"
                title="Buscar"
                aria-label="Buscar"
              >
                ⌕
              </button>

              <div className="relative" ref={desktopAccountRef}>
                <button
                  type="button"
                  onClick={handleAccountClickDesktop}
                  className="flex h-10 w-10 items-center justify-center rounded-full border transition hover:bg-gray-50"
                  title={clienteUser ? displayName : "Cuenta"}
                  aria-label="Cuenta"
                >
                  👤
                </button>

                {clienteUser && accountOpenDesktop && (
                  <div className="absolute right-0 mt-3 z-[70] w-56 rounded-2xl border bg-white p-2 shadow-xl">
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
                )}
              </div>

              <button
                type="button"
                onClick={onCartClick}
                className="relative flex h-10 w-10 items-center justify-center rounded-full border transition hover:bg-gray-50"
                title="Carrito"
                aria-label="Abrir carrito"
              >
                <img
                  src={cartBagIcon}
                  alt="Carrito"
                  className="h-[18px] w-[18px] object-contain"
                  draggable="false"
                />

                {count > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] rounded-full bg-black px-1 text-center text-[11px] leading-[18px] text-white h-[18px]">
                    {count}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {menuOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              onClick={() => setMenuOpen(false)}
              aria-label="Cerrar menú"
            />

            <aside className="absolute left-0 top-0 h-full w-[86vw] max-w-[360px] overflow-y-auto border-r bg-white shadow-2xl">
              <div className="flex h-16 items-center justify-between border-b px-4">
                <div className="font-extrabold tracking-wide">MENÚ</div>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border transition hover:bg-gray-50"
                  aria-label="Cerrar menú"
                  title="Cerrar"
                >
                  ✕
                </button>
              </div>

              <nav className="p-4">
                {newArrivals && (
                  <Link
                    to={newArrivals.to}
                    onClick={() => setMenuOpen(false)}
                    className="block w-full rounded-2xl border px-4 py-3 text-sm font-semibold transition hover:bg-gray-50"
                  >
                    {newArrivals.label}
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => setCatalogOpenMobile((v) => !v)}
                  className="mt-3 flex w-full items-center justify-between rounded-2xl border px-4 py-3 font-semibold transition hover:bg-gray-50"
                  aria-expanded={catalogOpenMobile}
                >
                  <span>CATALOGO</span>
                  <span className="text-sm">{catalogOpenMobile ? "▲" : "▼"}</span>
                </button>

                {catalogOpenMobile && (
                  <ul className="mt-3 space-y-2">
                    {catalogItems.map((l) => (
                      <li key={l.id}>
                        <Link
                          to={l.to}
                          onClick={() => {
                            setCatalogOpenMobile(false);
                            setMenuOpen(false);
                          }}
                          className="block rounded-2xl border px-4 py-3 text-sm font-medium transition hover:bg-gray-50"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}

                {rebajas && (
                  <Link
                    to={rebajas.to}
                    onClick={() => setMenuOpen(false)}
                    className="mt-3 block w-full rounded-2xl border px-4 py-3 text-sm font-semibold transition hover:bg-gray-50"
                  >
                    {rebajas.label}
                  </Link>
                )}

                <div className="mt-6 mb-3 text-xs font-semibold text-gray-500">
                  ACCESOS
                </div>

                <div className="grid grid-cols-2 gap-2">
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
                    className="rounded-2xl border px-3 py-3 text-sm transition hover:bg-gray-50"
                    onClick={() => {
                      setMenuOpen(false);

                      if (clienteUser) {
                        nav("/account");
                        return;
                      }

                      setAuthOpen(true);
                    }}
                  >
                    Cuenta
                  </button>
                </div>
              </nav>
            </aside>
          </div>
        )}

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