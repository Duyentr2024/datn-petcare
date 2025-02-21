import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { ProductCard } from "../ProductCard";
import ProductsService from "../../../service/serviceProduct/ProductDetailsService";
import { Home } from "lucide-react";
const SearchProduct = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get("query");

  const [products, setProducts] = useState([]);
  const [resultCount, setResultCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [priceRange, setPriceRange] = useState("");

  useEffect(() => {
    if (query) {
      setIsLoading(true);
      ProductsService.searchProducts(query)
        .then((data) => {
          console.log("Dữ liệu từ API:", data);
          setProducts(Array.isArray(data) ? data : []);
          setResultCount(Array.isArray(data) ? data.length : 0);
        })
        .catch((error) => console.error("Lỗi tìm kiếm:", error))
        .finally(() => setIsLoading(false));
    }
  }, [query]);

  const handlePriceFilter = (e) => {
    setPriceRange(e.target.value);
  };

  // Lọc và sắp xếp sản phẩm theo giá
  const filteredProducts = products
    .filter(([product, price]) => {
      if (!priceRange) return true;
      const [min, max] = priceRange.split("-").map(Number);
      return price >= min && (max ? price <= max : true);
    })
    .sort((a, b) => a[1] - b[1]); // Sắp xếp giá từ thấp đến cao

  // Tính giá thấp nhất và cao nhất sau khi lọc
  const minPrice = filteredProducts.length ? filteredProducts[0][1] : 0;
  const maxPrice = filteredProducts.length
    ? filteredProducts[filteredProducts.length - 1][1]
    : 0;

  return (
    <div className="container mx-32 w-auto mb-8">
      {/* Breadcrumb */}
      <div className="flex justify-between">
        <div className="border border-yellow-500 mt-4 rounded-lg px-4 py-2 inline-flex items-center bg-yellow-50 text-gray-600 text-xl mb-4">
        <Link to="/" className="text-gray-500 hover:text-gray-700 flex items-center">
  <Home className="w-5 h-5 mr-2" /> Home
</Link>
          <span className="mx-2">•</span>
          <span className="text-yellow-600 font-medium">
            Tìm kiếm: "<span className="italic">{query}</span>"
          </span>
        </div>
        {/* Bộ lọc giá */}
        <div className="flex items-center gap-4 mb-4">
          <label className="text-gray-600 font-medium">Lọc theo giá:</label>
          <select
            className="border border-yellow-500 rounded px-2 py-1 bg-white text-gray-600"
            onChange={handlePriceFilter}
          >
            <option value="">Tất cả giá</option>
            <option value="0-100000">Dưới 100k</option>
            <option value="100000-500000">100k - 500k</option>
            <option value="500000-1000000">500k - 1 triệu</option>
            <option value="1000000-">Trên 1 triệu</option>
          </select>
        </div>
      </div>

      {/* Hiển thị số lượng kết quả và giá min-max */}
      <p className="text-start text-gray-600 mb-4">
        Có <span className="font-semibold">{filteredProducts.length}</span> kết
        quả tìm kiếm cho từ khóa{" "}
        <span className="font-semibold italic">"{query}"</span>
      </p>

      {filteredProducts.length > 0 && (
        <p className="text-start text-gray-600 mb-6">
          Giá từ:{" "}
          <span className="font-semibold">{minPrice.toLocaleString()}đ</span>
          {" - "}
          <span className="font-semibold">{maxPrice.toLocaleString()}đ</span>
        </p>
      )}

      {/* Hiển thị loading nếu đang tải */}
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-yellow-500"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <p className="text-start text-gray-500">Không tìm thấy sản phẩm nào.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {filteredProducts.map(([product, price], index) => (
            <div key={index}>
              <Link
                to={`/productDetail/${product.productId}`}
                className="transition-transform hover:scale-105"
              >
                <ProductCard
                  image={product.image}
                  name={
                    product.productName.length > 24
                      ? product.productName.slice(0, 24) + "..."
                      : product.productName
                  }
                  price={price}
                  productId={product.productId}
                />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchProduct;
