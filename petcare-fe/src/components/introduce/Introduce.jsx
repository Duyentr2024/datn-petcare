import {motion} from "framer-motion";
import {useState} from "react";

const commitments = [
    {
        id: 1,
        title: "📦 Chất lượng hảo hạng",
        content: "Sản phẩm được kiểm định nghiêm ngặt và đạt chuẩn quốc tế.",
        image: "https://placehold.co/140x135"
    },
    {
        id: 2,
        title: "🍯 Đảm bảo nguồn gốc",
        content: "Mật ong nguyên chất từ trang trại đạt chứng nhận hữu cơ.",
        image: "https://placehold.co/140x135"
    },
    {
        id: 3,
        title: "🍓 Đa dạng chủng loại",
        content: "Nhiều loại mật ong, phấn hoa, sữa ong chúa và tinh bột nghệ.",
        image: "https://placehold.co/140x135"
    },
    {
        id: 4,
        title: "👨‍💼 Dịch vụ chuyên nghiệp",
        content: "Hỗ trợ khách hàng nhanh chóng và tận tâm.",
        image: "https://placehold.co/140x135"
    },
];

const Introduce = () => {
    const [openId, setOpenId] = useState(null);

    const toggleDropdown = (id) => {
        setOpenId(openId === id ? null : id);
    };

    return (
        <div className="relative flex flex-col items-center bg-white p-10 overflow-hidden rounded-xl shadow-lg">

            {/* Nội dung giới thiệu */}
            <div className="relative z-10 flex flex-col md:flex-row items-center max-w-7xl w-full">
                {/* Phần chữ */}
                <div className="md:w-1/2 text-center md:text-left">
                    <h2 className="text-4xl font-bold text-[#fbb321]">Về chúng tôi</h2>
                    <p className="mt-4 text-black-2">
                        Mona Honey là thương hiệu mật ong chất lượng cao, với đa dạng sản phẩm phục vụ mọi nhu cầu: Mật
                        ong, phấn hoa, sữa ong chúa, sáp ong, tinh bột nghệ.
                    </p>
                    <p className="mt-1 text-black-2">
                        Chúng tôi hướng đến một cộng đồng sống khoẻ, sống lành mạnh với đa dạng dòng sản phẩm từ mật
                        ong, sữa ong chúa, phấn hoa,...
                    </p>
                    <p className="mt-1 text-black-2">
                        Thành lập từ năm 2023, chúng tôi tự hào đã cung cấp mật ong tươi ngon, đảm bảo nguồn gốc xuất xứ
                        tới bàn ăn của 8,000 khách hàng và hơn 200 đối tác doanh nghiệp trên cả nước.
                    </p>
                    <div className="mt-6 flex justify-between">
                        <div className="text-[#408630] font-bold text-4xl text-left">
                            1.000+ <br/>
                            <span className="text-[#525252] text-[16px]">Sản phẩm chất lượng</span>
                        </div>
                        <div className="text-[#8a5e3b] font-bold text-4xl text-left">
                            8.000+ <br/>
                            <span className="text-[#525252] text-[16px]">Khách hàng</span>
                        </div>
                        <div className="text-[#fbb321] font-bold text-4xl text-left">
                            200+ <br/>
                            <span className="text-[#525252] text-[16px]">Đối tác doanh nghiệp</span>
                        </div>
                    </div>
                </div>

                {/* Hình ảnh nhóm */}
                <div className="md:w-1/2 flex justify-center mt-6 md:mt-0">
                    <img
                        src="https://placehold.co/600x400"
                        alt="Team"
                        className="rounded-xl shadow-md object-cover w-[600px] h-[400px]"
                    />
                </div>
            </div>

            {/* Phần cam kết */}
            <div className="relative z-10 mt-12 p-6 bg-white rounded-lg shadow-6 w-full max-w-7xl">
                <h2 className="text-4xl font-bold text-[#fbb321]">Cam kết của chúng tôi</h2>
                <div className="mt-8 space-y-6">
                    {commitments.map((item) => (
                        <div key={item.id} className="relative border-b pb-6">

                            {/* Nút mở dropdown */}
                            <button
                                className="flex items-center justify-between w-full font-semibold text-left focus:outline-none text-2xl"
                                onClick={() => toggleDropdown(item.id)}
                            >
                                <span>{item.title}</span>
                                <span className="text-lg">{openId === item.id ? "−" : "+"}</span>
                            </button>

                            {/* Nội dung dropdown (kèm ảnh bên phải) */}
                            {openId === item.id && (
                                <motion.div
                                    className="mt-2 flex items-center justify-between"
                                    initial={{opacity: 0, height: 0}}
                                    animate={{opacity: 1, height: "auto"}}
                                    exit={{opacity: 0, height: 0}}
                                >
                                    <p className="text-gray-700 max-w-lg">{item.content}</p>
                                    <img
                                        src={item.image}
                                        alt="Cam kết"
                                        className="w-[140px] h-[135px] object-cover rounded-md shadow-md"
                                    />
                                </motion.div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Phần hệ thống */}
            <div className="flex flex-col md:flex-row items-top justify-between bg-white w-full mt-12 max-w-7xl">
                <div className="max-w-2xl text-center md:text-left">
                    <h2 className="text-4xl font-bold text-[#fbb321]">Hệ thống</h2>
                    <p className="mt-4 text-gray-700 leading-relaxed">
                        Hệ thống và hợp tác xã liên kết trên hầu hết các tỉnh thành: An Giang, Bắc Giang, Bến Tre, Cần Thơ, Bình Dương, Bình Phước, Bình Thuận, Đắk Lắk, Đắk Nông, Đồng Nai, Đồng Tháp, Gia Lai, Hà Nội, Hà Giang, Hà Tĩnh, Hải Dương, Hậu Giang, Hoà Bình, Hưng Yên, Kon Tum, Kiên Giang, Lâm Đồng, Long An, Nam Định, Nghệ An, Ninh Thuận, Sóc Trăng, Sơn La, Tây Ninh, Thanh Hoá, Tiền Giang, TPHCM (Củ Chi), Tuyên Quang, Vĩnh Long, Vũng Tàu
                    </p>
                </div>

                {/* Bản đồ Google */}
                <div className="relative w-full md:w-1/2 h-[350px] rounded-lg overflow-hidden shadow-md mt-6 md:mt-0">
                    <motion.iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.612633029015!2d106.65210667451707!3d10.840739889308056!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752930a204a9e9%3A0x840b0f77c28b0b68!2zQ8O0bmcgdHkgVE5ISCAtIE1PTkEgTUVESUE!5e0!3m2!1sen!2s!4v1700000000000"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        animate={{opacity: [0, 1], scale: [0.9, 1]}}
                        transition={{duration: 1}}
                    ></motion.iframe>
                </div>
            </div>
        </div>
    );
};

export default Introduce;
