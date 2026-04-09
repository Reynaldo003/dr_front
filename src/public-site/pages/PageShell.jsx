import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";
import FloatingContactButtons from "../components/FloatingContactButtons";


export default function PageShell({ cartOpen, onOpenCart, onCloseCart }) {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return (
    <div className="min-h-screen bg-white text-black">
      <Header onCartClick={onOpenCart} />

      <Outlet />

      <Footer />

      <FloatingContactButtons />

      <CartDrawer open={cartOpen} onClose={onCloseCart} />
    </div>
  );
}