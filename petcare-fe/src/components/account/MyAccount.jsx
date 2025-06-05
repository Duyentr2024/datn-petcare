import { Routes, Route } from "react-router-dom";
import SidebarAccount from "../account/SidebarAccount";
import AccountInfo from "../account/AccountInfo";
import OrderHistory from "../account/OrderHistory";
import Address from "../account/Address";
import ChangePassword from "../account/ChangePassword";
import Favorites from "../account/Favorites";

const MyAccount = () => {
  return (
    <div className="min-h-screen container mx-auto p-5">
      <div className="flex justify-start items-start w-full max-w-6xl ml-auto mr-20">
        <div className="bg-white rounded-xl border-2 p-8 w-full flex">
          {/* Sidebar */}
          <div className="w-[30%] relative">
            <SidebarAccount />
          </div>

          {/* Content */}
          <div className="w-4/5 -ml-16">
            <h2 className="text-[#FBB321] text-2xl font-bold mb-6"></h2>
            <Routes>
              <Route path="/" element={<AccountInfo />} />
              <Route path="info" element={<AccountInfo />} />
              <Route path="/history" element={<OrderHistory />} />
              <Route path="/address" element={<Address />} />
              <Route path="/change-password" element={<ChangePassword />} />
              <Route path="/favorites" element={<Favorites />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;