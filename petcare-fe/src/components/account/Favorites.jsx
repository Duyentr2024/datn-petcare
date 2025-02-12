import React, { useEffect, useState, useRef } from "react";
import FavoritesService from "../../service/accountService/FavoritesService";
import { ProductCard } from "../product/ProductCard";
import { useAuth } from "../../context/AuthContext";

const Favorites = () => {
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const userId = user?.userId; // Lấy userId từ context
  const scrollRef = useRef(null); // Tham chiếu tới thanh cuộn

  useEffect(() => {
    if (!userId) {
      console.warn("User ID is undefined. Skipping API call.");
      setLoading(false);
      return;
    }

    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const favorites = await FavoritesService.getFavoriteProductsByUser(userId);

        // Định dạng dữ liệu để phù hợp với ProductCard
        const formattedFavorites = favorites.map((product) => ({
          productId: product.productId,
          name: product.productName,
          price: product.price || "Chưa có giá",
          image: product.image,
          isFavorite: true,
        }));
       console.log(formattedFavorites)

        setFavoriteProducts(formattedFavorites);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách sản phẩm yêu thích:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [userId]);

  // Hàm cuộn danh sách sản phẩm sang trái/phải
  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300; // Độ dài cuộn
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Sản phẩm yêu thích của bạn</h2>

      {loading && <p className="text-center">Đang tải sản phẩm yêu thích...</p>}
      {!loading && favoriteProducts.length === 0 && (
        <p className="text-center">Không có sản phẩm nào trong danh sách yêu thích.</p>
      )}

      {/* Thanh cuộn sản phẩm */}
      <div className="relative">
        {/* Danh sách sản phẩm (cuộn ngang) */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto space-x-4 p-4 scrollbar-hide scroll-smooth"
        >
          {favoriteProducts.map((product) => (
            <div key={product.productId} className="min-w-[250px]">
              <ProductCard
                name={product.name}
                price={product.price}
                image={product.image}
                productId={product.productId}
                isFavorite={true}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Favorites;




