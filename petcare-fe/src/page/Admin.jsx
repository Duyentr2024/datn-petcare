import { Routes, Route } from "react-router-dom";
import SidebarMenu from "../components/PagesAdmin/SidebarMenu";

function Admin() {
  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      <div className="flex flex-1 lg:flex-row sm:flex-col overflow-hidden">
        <aside className="lg:w-1/6 sm:w-full bg-gray-50 shadow-md">
          <SidebarMenu />
        </aside>

        {/* Main Content adjusts based on the route */}
        <main className="flex-1 p-6 bg-gray-50 overflow-auto">
          <Routes>
            <Route path="/" element={<h1>Admin Dashboard</h1>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default Admin;
