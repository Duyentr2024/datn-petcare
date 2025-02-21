import React from "react";
import Header from "../components/header/Header.jsx";
import RenderFooter from "../components/footer/Footer.jsx";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ItemPageHome from "./ItemPageHome.jsx";
import ProductDetail from "../components/productDetail/ProductDetail.jsx";
import ProductPage from "../components/product/ProductPage.jsx";
import Contact from "../components/contact/Contact.jsx";
import NewsPage from "../service/newpages/NewsPage.jsx";
import Checkout from "../components/pay/Checkout.jsx";
import ShoppingCart from "../components/cart/ShoppingCart.jsx";
import Login from "../components/account/Login.jsx";
import Register from "../components/account/Register.jsx";
import ForgotPassword from "../components/account/ForgotPassword.jsx";
import MyAccount from "../components/account/MyAccount.jsx";
import VerifyOTP from "../components/account/VerifyOTP.jsx";
import OrderOffline from "../components/orderOffline/OrderOffline.jsx";
import Introduce from "../components/introduce/Introduce.jsx";

import NotFoundPage from "./NotFoundPage.jsx";
import Admin from "./Admin.jsx";
import PrivateRoute from "../context/PrivateRoute.jsx";
import SearchProduct from "../components/product/search/SearchProduct.jsx";
const HomePage = () => {
  return (
    <>
      <Header />

      <Routes>
          <Route path="/productDetail/:productId" element={<ProductDetail />} />
        <Route path="/productPage" element={<ProductPage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/newsPage" element={<NewsPage />} />
        {/* <Route path="/checkout" element={<Checkout />} /> */}
        {/* <Route path="/shoppingCart" element={<ShoppingCart />} /> */}
        <Route path="/" element={<ItemPageHome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        {/* <Route path="/my-account/*" element={<MyAccount />} /> */}
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/orderOffline" element={<OrderOffline />} />
          <Route path="/introduce" element={<Introduce />} />
          <Route path="/search" element={<SearchProduct />} />
        {/* ✅ Route yêu cầu đăng nhập */}
        <Route element={<PrivateRoute />}>
          <Route path="/my-account/*" element={<MyAccount />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/shoppingCart" element={<ShoppingCart />} />
 
        </Route>

        {/* Route 404 - Khi không tìm thấy trang */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <RenderFooter />  
    </>
  );
};
export default HomePage;
