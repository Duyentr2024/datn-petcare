import React from "react";
import HomeProduct from "../components/product/home/HomeProduct.jsx";
import GoodPrice from "../components/card/GoodPrice.jsx";
import Banner from "../components/banner/banner.jsx";
import ServiceProduct from "../service/serviceProduct/ServiceProduct.jsx";

const ItemPageHome = () => {
    return (
        <>
         <Banner/>
         <ServiceProduct></ServiceProduct>
        <HomeProduct></HomeProduct>
        <GoodPrice></GoodPrice>
        <HomeProduct></HomeProduct>
        </>
    );
}
export default ItemPageHome