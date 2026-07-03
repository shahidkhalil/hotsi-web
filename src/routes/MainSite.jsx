import { useCallback } from 'react';
import { AppProvider, useApp } from '../context/AppContext';
import { useCustomCursor, useNavScroll, useEscapeKey } from '../hooks/useEffects';
import Loader from '../components/Loader';
import Cart, { ProductModal } from '../components/Cart';
import CartToast from '../components/CartToast';
import Nav from '../components/Nav';
import Hero from '../components/Hero';
import Categories from '../components/Categories';
import MenuSection from '../components/MenuSection';
import Pizza from '../components/Pizza';
import Deals from '../components/Deals';
import Why from '../components/Why';
import Story from '../components/Story';
import Gallery from '../components/Gallery';
import Reviews from '../components/Reviews';
import Delivery from '../components/Delivery';
import Footer from '../components/Footer';

function MainContent() {
  const { setBooted, closeProduct, cartOpen, closeCart, cartToast, clearCartToast } = useApp();
  const onBoot = useCallback(() => setBooted(true), [setBooted]);

  useCustomCursor();
  useNavScroll();
  useEscapeKey(useCallback(() => {
    if (cartOpen) closeCart();
    else closeProduct();
  }, [cartOpen, closeCart, closeProduct]));

  return (
    <>
      <Cart />
      <CartToast toast={cartToast} onDone={clearCartToast} />
      <ProductModal />
      <div id="cursor" />
      <div id="cursor-glow" />
      <Loader onBoot={onBoot} />
      <Nav />
      <Hero />
      <Categories />
      <MenuSection />
      <Pizza />
      <Deals />
      <Why />
      <Story />
      <Gallery />
      <Reviews />
      <Delivery />
      <Footer />
    </>
  );
}

export default function MainSite() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
