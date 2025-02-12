import React, { useEffect, useState } from "react";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoritesService from "../../service/accountService/FavoritesService"; // Import service đã tạo
import { useAuth } from "../../context/AuthContext"; // Import hook useAuth từ context
export function ProductCard({ name, price, image, productId }) {
    const { user } = useAuth(); // Lấy thông tin người dùng từ context
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        if (user?.userId && productId) {
            FavoritesService.getFavoriteByUserAndProduct(user.userId, productId)
                .then((favorite) => {
                    console.log("Favorite data:", favorite);
                    setIsFavorite(!!favorite);
                })
                .catch((error) => console.error("Lỗi khi kiểm tra yêu thích:", error));
        }
    }, [user?.userId, productId]);

    const handleToggleFavorite = async (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (!user?.userId) {
            alert("Bạn cần đăng nhập để yêu thích sản phẩm!");
            return;
        }



        try {

            const favoriteData = {
                userId: user.userId, // Chỉ gửi ID
                productId, // Chỉ gửi ID
                isLiked: true,
            };

            if (isFavorite) {
                const success = await FavoritesService.removeFavoriteByUserAndProduct(user.userId, productId);
                if (success) setIsFavorite(false);
            } else {

                const result = await FavoritesService.addOrUpdateFavorite(favoriteData);
                if (result) setIsFavorite(true);
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật yêu thích:", error);
        }
    };

    // const handleToggleFavorite = async (event) => {
    //     event.preventDefault();
    //     event.stopPropagation();

    //     if (!user?.userId) {
    //         alert("Bạn cần đăng nhập để yêu thích sản phẩm!");
    //         return;
    //     }

    //     const favoriteData = {
    //         userId: user.userId, // Chỉ gửi ID
    //         productId, // Chỉ gửi ID
    //         isLiked: true,
    //     };

    //     console.log("Sending favorite data:", favoriteData);

    //     try {
    //         const result = await FavoritesService.addOrUpdateFavorite(favoriteData);
    //         if (result) setIsFavorite(true);
    //     } catch (error) {
    //         console.error("Lỗi khi cập nhật yêu thích:", error);
    //     }
    // };

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
                    <span className="text-[#fbb321] font-bold text-lg">{price}đ</span>
                    <button onClick={handleToggleFavorite}>
                        {isFavorite ? (
                            <FavoriteIcon className="text-red-500 hover:text-red transition-transform duration-500" />
                        ) : (
                            <FavoriteBorderOutlinedIcon className="hover:text-red transition-transform duration-500" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
