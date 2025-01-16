import React from "react";
import Header from "../components/header/Header.jsx";
import Banner from "../components/banner/banner.jsx";
import RenderFooter from "../components/footer/Footer.jsx"
import BannerFooter from "../components/footer/BannerFooter.jsx"
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
const HomePage = () => {

    return (
        <>
            <Header />

            <Routes>
                <Route path="/productDetail" element={<ProductDetail />} />
                <Route path="/productPage" element={<ProductPage/>} />
                <Route path="/contact" element={<Contact/>} />
                <Route path="/newsPage" element={<NewsPage/>} />
                <Route path="/checkout" element={<Checkout/>} />
                <Route path="/shoppingCart" element={<ShoppingCart/>} />
                <Route path="/" element={<ItemPageHome />} />
                <Route path="/login" element={<Login/>} />
                <Route path="/register" element={<Register/>} />
                <Route path="/forgotPassword" element={<ForgotPassword/>} />
            </Routes>

            <RenderFooter />

        </>
    );
};
export default HomePage;
