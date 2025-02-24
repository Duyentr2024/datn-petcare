import React from "react";
import PetService from "../components/spaGrooming/PetService.jsx";
import Header from "../components/header/Header.jsx";
import RenderFooter from "../components/footer/Footer.jsx";
const SpaPage = () => {
    return (
        <>
            <Header />
            <PetService></PetService>
            <RenderFooter />
        </>
    )
}
export default SpaPage;