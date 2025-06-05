import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import ProductDetailsService from "../../service/serviceProduct/ProductDetailsService";
import ProductsService from "../../service/serviceProduct/ProductsService";
import { ProductCard } from "../product/ProductCard";

const RelatedProducts = () => {
  const { productId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const productList = await ProductDetailsService.getProductDetailsDTOByProductId(productId);
        if (Array.isArray(productList) && productList.length > 0) {
          const product = productList[0]; // Lấy sản phẩm đầu tiên trong danh sách
          setCurrentProduct(product);
        } else {
          console.warn("❗ Không tìm thấy sản phẩm.");
        }
      } catch (error) {
        console.error("❌ Lỗi khi lấy chi tiết sản phẩm:", error);
      }
    };

    fetchProductDetails();
  }, [productId]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await ProductsService.getAllProductsWithCategory();
        setProducts(response);
      } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách sản phẩm:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (currentProduct && products.length > 0) {
      const category = currentProduct.categoryName?.trim().toLowerCase(); // Lấy loại sản phẩm

      const filteredProducts = products.filter(
        (product) =>
          product.categoryName?.trim().toLowerCase() === category &&
          Number(product.productId) !== Number(productId) // Loại bỏ chính sản phẩm hiện tại
      );

      setRelatedProducts(filteredProducts);
    }
  }, [currentProduct, products, productId]);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <div className="py-8 px-4 relative">
      <h2 className="text-2xl font-bold text-yellow-500 mb-6">Sản phẩm liên quan</h2>
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-yellow-500"></div>
        </div>
      ) : relatedProducts.length > 0 ? (
        <Slider {...settings}>
          {relatedProducts.map((product) => (
            <div key={product.productId} className="p-4">
              <Link to={`/productDetail/${product.productId}`} className="transition-transform hover:scale-105">
                <ProductCard
                  image={product.image}
                  name={
                    product.productName.length > 24
                      ? product.productName.slice(0, 24) + "..."
                      : product.productName
                  }
                  price={product.price}
                  productId={product.productId}
                />
              </Link>
            </div>
          ))}
        </Slider>
      ) : (
        <p className="text-center text-gray-500">Không có sản phẩm liên quan.</p>
      )}
    </div>
  );
};

export default RelatedProducts;
