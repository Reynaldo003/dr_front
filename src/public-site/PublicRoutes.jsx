import { useState } from "react";
import { Route, Routes } from "react-router-dom";

import "./App.css";
import PageShell from "./pages/PageShell";

// Home
import Hero from "./components/Hero";
import NewCollection from "./components/NewCollection";
import CategoryStrip from "./components/CategoryStrip";
import HowItWorks from "./components/HowItWorks";
import Reviews from "./components/Reviews";
import InstagramStrip from "./components/InstagramStrip";
import Stores from "./components/Stores";

// Pages
import AboutPage from "./pages/about/AboutPage";
import ShowroomPage from "./pages/about/ShowroomPage";
import BlogPage from "./pages/about/BlogPage";

import HelpReturns from "./pages/help/HelpReturns";
import HelpShipping from "./pages/help/HelpShipping";
import HelpTrack from "./pages/help/HelpTrack";
import HelpFAQ from "./pages/help/HelpFAQ";
import HelpBilling from "./pages/help/HelpBilling";
import HelpContact from "./pages/help/HelpContact";

import CheckoutPage from "./pages/checkout/CheckoutPage";
import CheckoutSuccess from "./pages/checkout/CheckoutSuccess";
import CheckoutPending from "./pages/checkout/CheckoutPending";
import CheckoutFailure from "./pages/checkout/CheckoutFailure";

import NotFound from "./pages/NotFound";

import AccountOrders from "./pages/account/AccountOrders";
import AccountHome from "./pages/account/AccountHome";
import AccountAddresses from "./pages/account/AccountAddresses";
import AccountContact from "./pages/account/AccountContact";
import AccountAccessPage from "./pages/account/AccountAccessPage";

import CategoriaPage from "./pages/catalog/CategoriaPage";
import RebajasPage from "./pages/shop/RebajasPage";
import NewArrivalsPage from "./pages/shop/NewArrivalsPage";
import ProtectedRoute from "../auth/ProtectedRoute.jsx";

function HomePage({ onAddToCart }) {
  return (
    <main>
      <Hero />
      <NewCollection onAddToCart={onAddToCart} />
      <CategoryStrip />
      <HowItWorks />
      <Reviews />
      <InstagramStrip />
      <Stores />
    </main>
  );
}

export default function PublicRoutes() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
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
              <div className="max-w-3xl mx-auto p-4 text-left">
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
  );
}