import React from "react";
import { motion } from "framer-motion";
import HomeProduct from "../components/product/home/HomeProduct.jsx";
import GoodPrice from "../components/card/GoodPrice.jsx";
import Banner from "../components/banner/banner.jsx";
import ServiceProduct from "../service/serviceProduct/ServiceProduct.jsx";

// Hiệu ứng fade-in + slide-up + scale nhẹ
const fadeInUp = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.8, ease: "easeOut" }
    }
};

const ItemPageHome = () => {
    return (
        <div className="space-y-10 p-5">
            {/* Banner */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                variants={fadeInUp}
                viewport={{ once: false, amount: 0.2 }} // Hiệu ứng luôn chạy khi cuộn lên xuống
            >
                <Banner />
            </motion.div>

            {/* ServiceProduct */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                variants={fadeInUp}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ delay: 0.1 }}
            >
                <ServiceProduct />
            </motion.div>

            {/* HomeProduct */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                variants={fadeInUp}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ delay: 0.2 }}
            >
                <HomeProduct />
            </motion.div>

            {/* GoodPrice */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                variants={fadeInUp}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ delay: 0.3 }}
            >
                <GoodPrice />
            </motion.div>

            {/* HomeProduct lần 2 */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                variants={fadeInUp}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ delay: 0.4 }}
            >
                <HomeProduct />
            </motion.div>
        </div>
    );
}

export default ItemPageHome;
