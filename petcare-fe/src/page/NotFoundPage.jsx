import { useNavigate } from "react-router-dom";

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#Ffff] text-center relative">
      {/* Nội dung chính */}
      <div className="flex flex-col items-center">
        <div className="relative">
          {/* Số 404 với hiệu ứng vòng tròn quay thay cho số 0 */}
          <h1 className="text-[10rem] font-extrabold text-[#eab308] relative">
            4
            <span className="mx-2 inline-block relative w-[100px] h-[100px]">
              0
            </span>
            4
          </h1>
        </div>

        {/* Text mô tả */}
        <p className="text-gray-700 mt-4">
          Hmmm, có vẻ như trang này đã đi lạc. Bạn có muốn quay về trang chủ không?
        </p>

        {/* Nút quay về trang chủ */}
        <button
          onClick={() => navigate("/")}
          className="mt-6 px-6 py-3 bg-[#eab308] text-white rounded-lg shadow-md hover:bg-[#998037] transition"
        >
          Quay lại trang chủ
        </button>
      </div>
    </div>
  );
}

export default NotFoundPage;
