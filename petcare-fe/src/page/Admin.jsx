import { Routes, Route } from "react-router-dom";
import SidebarMenu from "../components/PagesAdmin/SidebarMenu";
import ManageProductColor from "../components/Manage/ManageProductColor";
import ManageProductSize from "../components/Manage/ManageProductSize";
import ManageProductWeights from "../components/Manage/ManageProductWeights";
import ManageProductBrand from "../components/Manage/ManageProductBrand";
import ManageProductCategories from "../components/Manage/ManageProductCategories";
import ManageProducts from "../components/Manage/ManageProducts";
import ManageProductImages from "../components/Manage/ManageProductImages";
import ManageProductDetails from "../components/Manage/ManageProductDetails";
function Admin() {
  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      <div className="flex flex-1 lg:flex-row sm:flex-col overflow-hidden">
        <aside className="lg:w-1/6 sm:w-full bg-gray-50 shadow-md">
          <SidebarMenu />
        </aside>


        <main className="flex-1 p-6 bg-gray-50 overflow-auto">
          <Routes>
            <Route path="/" element={<h1>Admin Dashboard</h1>} />
            <Route path="/product-color" element={<ManageProductColor />} />
            <Route path="/product-size" element={<ManageProductSize />} />
            <Route path="/product-weights" element={<ManageProductWeights />} />
            <Route path="/product-brands" element={<ManageProductBrand />} />
            <Route path="/product-categories" element={<ManageProductCategories />} />
            <Route path="/products-list" element={<ManageProducts />} />
            <Route path="/product-image" element={<ManageProductImages />} />
            <Route path="/product-details" element={<ManageProductDetails />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default Admin;
