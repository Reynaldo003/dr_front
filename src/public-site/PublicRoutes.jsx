//src/public-site/PublicRoutes.jsx
import { Suspense, lazy, useState } from "react";
import { Route, Routes } from "react-router-dom";

import "./App.css";
import PageShell from "./pages/PageShell";

// Home
import Hero from "./components/Hero";
import NewCollection from "./components/NewCollection";

// Home secciones lazy
const CategoryStrip = lazy(() => import("./components/CategoryStrip"));
const HowItWorks = lazy(() => import("./components/HowItWorks"));
const Reviews = lazy(() => import("./components/Reviews"));
const InstagramStrip = lazy(() => import("./components/InstagramStrip"));
const Stores = lazy(() => import("./components/Stores"));

// Pages lazy
const AboutPage = lazy(() => import("./pages/about/AboutPage"));
const ShowroomPage = lazy(() => import("./pages/about/ShowroomPage"));
const BlogPage = lazy(() => import("./pages/about/BlogPage"));

const HelpReturns = lazy(() => import("./pages/help/HelpReturns"));
const HelpShipping = lazy(() => import("./pages/help/HelpShipping"));
const HelpTrack = lazy(() => import("./pages/help/HelpTrack"));
const HelpFAQ = lazy(() => import("./pages/help/HelpFAQ"));
const HelpBilling = lazy(() => import("./pages/help/HelpBilling"));
const HelpContact = lazy(() => import("./pages/help/HelpContact"));

const CheckoutPage = lazy(() => import("./pages/checkout/CheckoutPage"));
const CheckoutSuccess = lazy(() => import("./pages/checkout/CheckoutSuccess"));
const CheckoutPending = lazy(() => import("./pages/checkout/CheckoutPending"));
const CheckoutFailure = lazy(() => import("./pages/checkout/CheckoutFailure"));

const NotFound = lazy(() => import("./pages/NotFound"));

const AccountOrders = lazy(() => import("./pages/account/AccountOrders"));
const AccountHome = lazy(() => import("./pages/account/AccountHome"));
const AccountAddresses = lazy(() => import("./pages/account/AccountAddresses"));
const AccountContact = lazy(() => import("./pages/account/AccountContact"));
const AccountAccessPage = lazy(() => import("./pages/account/AccountAccessPage"));

const CategoriaPage = lazy(() => import("./pages/catalog/CategoriaPage"));
const RebajasPage = lazy(() => import("./pages/shop/RebajasPage"));
const NewArrivalsPage = lazy(() => import("./pages/shop/NewArrivalsPage"));

const ProtectedRoute = lazy(() => import("../auth/ProtectedRoute.jsx"));

function HomePage({ onAddToCart }) {
  return (
    <main>
      <Hero />
      <NewCollection onAddToCart={onAddToCart} />

      <Suspense fallback={null}>
        <CategoryStrip />
        <HowItWorks />
        <Reviews />
        <InstagramStrip />
        <Stores />
      </Suspense>
    </main>
  );
}

export default function PublicRoutes() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <Suspense fallback={null}>
      <Routes>
        <Route
          element={
            <PageShell
              cartOpen={cartOpen}
              onOpenCart={() => setCartOpen(true)}
              onCloseCart={() => setCartOpen(false)}
            />
          }
        >
          <Route
            index
            element={<HomePage onAddToCart={() => setCartOpen(true)} />}
          />

          <Route path="new-arrivals" element={<NewArrivalsPage />} />
          <Route path="rebajas" element={<RebajasPage />} />

          <Route path="about" element={<AboutPage />} />
          <Route path="about/showroom" element={<ShowroomPage />} />
          <Route path="about/blog" element={<BlogPage />} />

          <Route path="help/returns" element={<HelpReturns />} />
          <Route path="help/shipping" element={<HelpShipping />} />
          <Route path="help/tracking" element={<HelpTrack />} />
          <Route path="help/faq" element={<HelpFAQ />} />
          <Route path="help/billing" element={<HelpBilling />} />
          <Route path="help/contact" element={<HelpContact />} />

          <Route path="catalogo/:categoriaSlug" element={<CategoriaPage />} />

          <Route path="account/access" element={<AccountAccessPage />} />

          <Route
            path="account"
            element={
              <ProtectedRoute mode="cliente">
                <AccountHome />
              </ProtectedRoute>
            }
          />

          <Route
            path="account/orders"
            element={
              <ProtectedRoute mode="cliente">
                <AccountOrders />
              </ProtectedRoute>
            }
          />

          <Route
            path="account/orders/:id"
            element={
              <ProtectedRoute mode="cliente">
                <div className="mx-auto max-w-3xl p-4 text-left">
                  <h1 className="text-2xl font-extrabold">Detalle del pedido</h1>
                  <p className="mt-1 text-black/60">
                    Aquí después puedes mostrar el resumen completo del pedido.
                  </p>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="account/addresses"
            element={
              <ProtectedRoute mode="cliente">
                <AccountAddresses />
              </ProtectedRoute>
            }
          />

          <Route
            path="account/contact"
            element={
              <ProtectedRoute mode="cliente">
                <AccountContact />
              </ProtectedRoute>
            }
          />

          <Route
            path="checkout"
            element={
              <ProtectedRoute mode="cliente">
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route path="checkout/success" element={<CheckoutSuccess />} />
          <Route path="checkout/pending" element={<CheckoutPending />} />
          <Route path="checkout/failure" element={<CheckoutFailure />} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}