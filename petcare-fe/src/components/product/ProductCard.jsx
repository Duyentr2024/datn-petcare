import React, { useEffect, useState } from "react";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import { toggleFavorite, getFavoriteStatus } from "../../service/accountService/FavoritesService";
import { useAuth } from "../../context/AuthContext";

export function ProductCard({ name, price, image, productId }) {
    const { user } = useAuth();
    const [isFavorite, setIsFavorite] = useState(false);

    // Khi component mount, lấy trạng thái yêu thích từ API
    useEffect(() => {
        if (user?.userId && productId) {
            fetchFavoriteStatus();
        }
    }, [user?.userId, productId]);

    // API để kiểm tra sản phẩm có được yêu thích hay không
    const fetchFavoriteStatus = async () => {
        try {
            const result = await getFavoriteStatus(user.userId, productId);
            setIsFavorite(result);  // Đã sửa lỗi result.isLiked -> result
        } catch (error) {
            console.error("Lỗi khi kiểm tra yêu thích:", error);
        }
    };

    // Xử lý khi người dùng nhấn nút yêu thích
    const handleToggleFavorite = async (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (!user?.userId) {
            alert("Bạn cần đăng nhập để yêu thích sản phẩm!");
            return;
        }

        try {
            await toggleFavorite(user.userId, productId);
            await fetchFavoriteStatus();  // Gọi lại API để lấy trạng thái mới
            // setIsFavorite(result.liked);  // Đã sửa lỗi result.isLiked -> result.liked
        } catch (error) {
        }
    };

    return (
        <div className="w-[250px] bg-white rounded-lg overflow-hidden shadow group">
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
                    <span className="text-[#fbb321] font-bold text-lg">{price}</span>
                    <button onClick={handleToggleFavorite}>
                        {isFavorite ? (
                            <FavoriteIcon className="text-red-500 transition-transform duration-500" />
                        ) : (
                            <FavoriteBorderOutlinedIcon className="text-gray-500 hover:text-red transition-transform duration-500" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
