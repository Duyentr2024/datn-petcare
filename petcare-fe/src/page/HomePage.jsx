import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Header from "../components/header/Header.jsx";
import RenderFooter from "../components/footer/Footer.jsx";
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
import Introduce from "../components/introduce/Introduce.jsx";
import NotFoundPage from "./NotFoundPage.jsx";
import PrivateRoute from "../context/PrivateRoute.jsx";
import SearchProduct from "../components/product/search/SearchProduct.jsx";
import NewsDetail from "../service/newpages/NewsDetail.jsx";
import Policy from "../elements/Policy.jsx";
import Guide from "../elements/Guide.jsx";
import SpaPage from "../components/spaGrooming/Grooming.jsx";
import AppointmentPage from "./AppointmentPage.jsx";
import CheckoutPayment from "../components/spaGrooming/user/CheckoutPayment.jsx";
// Hiệu ứng chuyển trang
const pageVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, y: -30, transition: { duration: 0.3, ease: "easeInOut" } }
    
};

const AnimatedRoutes = () => {
    const location = useLocation(); // Lấy đường dẫn hiện tại

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={pageVariants}
            >
                <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<ItemPageHome />} />
                    <Route path="/productDetail/:productId" element={<ProductDetail />} />
                    <Route path="/productPage/*" element={<ProductPage />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/newsPage" element={<NewsPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgotPassword" element={<ForgotPassword />} />
                    <Route path="/verify-otp" element={<VerifyOTP />} />
                    <Route path="/introduce" element={<Introduce />} />
                    <Route path="/search" element={<SearchProduct />} />
                    <Route path="/newsdetail/:id" element={<NewsDetail />} />
                    <Route path="/policy" element={<Policy />} />
                    <Route path="/guide" element={<Guide />} />
                    <Route path="/spa" element={<SpaPage />} />
                    <Route path="/checkout-payment" element={<CheckoutPayment />} />
                    
            <Route path="/appointment" element={<AppointmentPage />} />
                    {/* ✅ Route yêu cầu đăng nhập */}
                    <Route element={<PrivateRoute />}>
                        <Route path="/my-account/*" element={<MyAccount />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/shoppingCart" element={<ShoppingCart />} />
                    </Route>

                    {/* Route 404 - Khi không tìm thấy trang */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </motion.div>
        </AnimatePresence>
    );
};

const HomePage = () => {
    return (
        <>
            <Header />
            <AnimatedRoutes /> {/* Gọi Routes có hiệu ứng */}
            <RenderFooter />
        </>
    );
};

export default HomePage;
