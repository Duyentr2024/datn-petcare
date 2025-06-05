import React, { useEffect, useState } from "react";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import {
  toggleFavorite,
  getFavoriteStatus,
} from "../../service/accountService/FavoritesService";
import { useAuth } from "../../context/AuthContext";

export function ProductCard({ name, price, oldPrice, image, productId }) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (user?.userId && productId) {
      fetchFavoriteStatus();
    }
  }, [user?.userId, productId]);

  const fetchFavoriteStatus = async () => {
    try {
      const result = await getFavoriteStatus(user.userId, productId);
      setIsFavorite(result);
    } catch (error) {
      console.error("Lỗi khi kiểm tra yêu thích:", error);
    }
  };

  const handleToggleFavorite = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user?.userId) {
      alert("Bạn cần đăng nhập để yêu thích sản phẩm!");
      return;
    }

    try {
      await toggleFavorite(user.userId, productId);
      await fetchFavoriteStatus();
    } catch (error) {}
  };

  // 🔥 Format giá
  const formattedPrice = price.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
  const formattedOldPrice = oldPrice
    ? oldPrice.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
    : null;

  return (
    <div className="w-[250px] bg-white rounded-lg overflow-hidden shadow group ">
      <div className="relative w-[250px] h-[250px] overflow-hidden">
        <img
          src={image}
          alt={name}
          width={250}
          height={250}
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-3">
        <h3 className="font-medium text-gray-800 mb-3 line-clamp-2">{name}</h3>
        <div className="flex justify-between items-baseline">
          <div>
            {formattedOldPrice && (
              <span className="text-gray-400 line-through text-sm mr-2">
                {formattedOldPrice}
              </span>
            )}
            <span className="text-[#fbb321] font-bold text-lg">
              {formattedPrice}
            </span>
          </div>
          <button onClick={handleToggleFavorite}>
            {isFavorite ? (
              <FavoriteIcon className="text-red-500 transition-transform duration-500" />
            ) : (
              <FavoriteBorderOutlinedIcon className="text-gray-500 hover:text-red-500 transition-transform duration-500" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
