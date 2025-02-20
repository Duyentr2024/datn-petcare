import React, { useEffect, useState } from "react";
import ProductDetailsService from "../../service/manageService/ProductDetailsService";
import ProductsService from "../../service/manageService/ProductsService";
import ProductColorService from "../../service/manageService/ProductColorService";
import ProductSizeService from "../../service/manageService/ProductSizeService";
import ProductWeightsService from "../../service/manageService/ProductWeightsService";

const ManageProductDetails = () => {
    const [productDetails, setProductDetails] = useState([]);
    const [products, setProducts] = useState([]);
    const [colors, setColors] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [weights, setWeights] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newDetail, setNewDetail] = useState({
        productId: "",
        price: "",
        colorId: "",
        sizeId: "",
        weightId: "",
        quantity: "",
    });


    useEffect(() => {
        fetchProductDetails();
        fetchProducts();
        fetchColors();
        fetchSizes();
        fetchWeights();
    }, []);

    const fetchProductDetails = async () => {
        try {
            const response = await ProductDetailsService.getAllProductDetails();
            setProductDetails(response);
        } catch (error) {
            console.error("Error fetching product details:", error);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await ProductsService.getAllProducts();
            setProducts(response);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const fetchColors = async () => {
        try {
            const response = await ProductColorService.getAllProductColors();
            const activeColors = response.filter(color => color.status);
            setColors(activeColors);
        } catch (error) {
            console.error("Error fetching colors:", error);
        }
    };

    const fetchSizes = async () => {
        try {
            const response = await ProductSizeService.getAllProductSizes();
            const activeSizes = response.filter(size => size.status);
            setSizes(activeSizes);
        } catch (error) {
            console.error("Error fetching sizes:", error);
        }
    };


    const fetchWeights = async () => {
        try {
            const response = await ProductWeightsService.getAllProductWeights();
            const activeWeights = response.filter(weight => weight.status);
            setWeights(activeWeights);
        } catch (error) {
            console.error("Error fetching weights:", error);
        }
    };


    const handleAddProductDetail = async () => {
        if (!newDetail.productId || !newDetail.price || !newDetail.quantity) {
            alert("Please fill in all required fields!");
            return;
        }

        const payload = {
            quantity: newDetail.quantity,
            price: newDetail.price,
            products: { productId: newDetail.productId },
            weights: newDetail.weightId ? { weightId: newDetail.weightId } : null,
            productSizes: newDetail.sizeId ? { productSizeId: newDetail.sizeId } : null,
            productColors: newDetail.colorId ? { productColorId: newDetail.colorId } : null,
        };

        try {
            await ProductDetailsService.createProductDetail(payload);
            fetchProductDetails(); // Refresh danh sách sau khi thêm mới
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error adding product detail:", error);
        }
    };


    return (
        <div className="p-6 bg-white shadow-md rounded-md">
            <h2 className="text-2xl font-semibold mb-4">Quản lý biến thể sản phẩm</h2>
            <button onClick={() => setIsModalOpen(true)} className="mb-4 p-2 bg-green-500 text-white rounded">Thêm biến thể</button>
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-md shadow-lg w-1/3">
                        <h3 className="text-lg font-semibold mb-4">Thêm Biến Thể Sản Phẩm</h3>
                        <select className="border p-2 rounded w-full mb-2" onChange={(e) => setNewDetail({ ...newDetail, productId: e.target.value })}>
                            <option value="">Chọn Sản Phẩm</option>
                            {products.map((product) => (
                                <option key={product.productId} value={product.productId}>{product.productName}</option>
                            ))}
                        </select>
                        <select className="border p-2 rounded w-full mb-2" onChange={(e) => setNewDetail({ ...newDetail, colorId: e.target.value })}>
                            <option value="">Chọn Màu</option>
                            {colors.map((color) => (
                                <option key={color.productColorId} value={color.productColorId}>{color.colorValue}</option>
                            ))}
                        </select>
                        <select className="border p-2 rounded w-full mb-2" onChange={(e) => setNewDetail({ ...newDetail, sizeId: e.target.value })}>
                            <option value="">Chọn Kích Cỡ</option>
                            {sizes.map((size) => (
                                <option key={size.productSizeId} value={size.productSizeId}>{size.sizeValue}</option>
                            ))}
                        </select>
                        <select className="border p-2 rounded w-full mb-2" onChange={(e) => setNewDetail({ ...newDetail, weightId: e.target.value })}>
                            <option value="">Chọn Cân Nặng</option>
                            {weights.map((weight) => (
                                <option key={weight.weightId} value={weight.weightId}>{weight.weightValue} kg</option>
                            ))}
                        </select>
                        <input type="number" placeholder="Nhập Giá" value={newDetail.price} onChange={(e) => setNewDetail({ ...newDetail, price: e.target.value })} className="border p-2 rounded w-full mb-2" />
                        <input type="number" placeholder="Nhập Số Lượng" value={newDetail.quantity} onChange={(e) => setNewDetail({ ...newDetail, quantity: e.target.value })} className="border p-2 rounded w-full mb-2" />
                        <div className="flex justify-end space-x-2">
                            <button onClick={handleAddProductDetail} className="p-2 bg-green-500 text-white rounded">Lưu</button>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 bg-red-500 text-white rounded">Hủy</button>
                        </div>
                    </div>
                </div>
            )}

            <table className="w-full mt-4 border-collapse border">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2">ID</th>
                        <th className="border p-2">Name</th>
                        <th className="border p-2">Price</th>
                        <th className="border p-2">Color</th>
                        <th className="border p-2">Size</th>
                        <th className="border p-2">Weight</th>
                        <th className="border p-2">Quantity</th>
                        <th className="border p-2">Description</th>
                        <th className="border p-2">Images</th>
                    </tr>
                </thead>
                <tbody>
                    {productDetails.map((detail) => (
                        <tr key={detail.productDetailId} className="border">
                            <td className="border p-2">{detail.productDetailId}</td>
                            <td className="border p-2">{detail.productName}</td>
                            <td className="border p-2">{detail.price}</td>
                            <td className="border p-2">{detail.colorValue}</td>
                            <td className="border p-2">{detail.sizeValue}</td>
                            <td className="border p-2">{detail.weightValue} kg</td>
                            <td className="border p-2">{detail.quantity}</td>
                            <td className="border p-2">{detail.description}</td>
                            <td className="border p-2">
                                <div className="flex space-x-2">
                                    {detail.imageUrls && detail.imageUrls.length > 0 ? (
                                        detail.imageUrls.map((url, index) => (
                                            <img key={index} src={url} alt="Product" className="w-16 h-16 object-cover" />
                                        ))
                                    ) : (
                                        <span className="text-gray-500">No Image</span>
                                    )}
                                </div>
                            </td>

                        </tr>
                    ))}
                </tbody>
            </table>
            
        </div>
    );
};

export default ManageProductDetails;