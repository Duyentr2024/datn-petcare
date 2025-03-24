import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react"; // Giữ useRef và useEffect cho auto-scroll
import full from "../../assets/images/full.png";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import vechungtoi from "../../assets/images/vechungtoi.jpg";
const commitments = [
  {
    id: 1,
    title: "🐾 Sản phẩm an toàn",
    content: "Tất cả sản phẩm đều được kiểm định kỹ lưỡng, an toàn cho thú cưng.",
    image: "https://i.imgur.com/OgxBChDl.jpg",
  },
  {
    id: 2,
    title: "🍖 Thức ăn chất lượng",
    content: "Nguồn gốc rõ ràng, đảm bảo dinh dưỡng cho thú cưng của bạn.",
    image: "https://file.hstatic.net/200000263355/article/thuc_an_hat_cho_meo-4_c5ff0d3661094b7ebfa1ee1ed4ffc76f.png",
  },
  {
    id: 3,
    title: "🛁 Dịch vụ chăm sóc",
    content: "Tắm, cắt tỉa, spa, giúp thú cưng luôn sạch sẽ và khỏe mạnh.",
    image: "https://file.hstatic.net/200000263355/article/dich-vu-grooming-1_6b9b98f8b5d7493e84b428e9a0b8ac95.png",
  },
  {
    id: 4,
    title: "📦 Giao hàng nhanh",
    content: "Đặt hàng dễ dàng, giao hàng tận nơi chỉ trong 24h.",
    image: "https://petshopsaigon.vn/wp-content/uploads/2019/08/pet-shop-sai-gon-2.jpg",
  },
];

// Dữ liệu hình ảnh khách hàng (bạn có thể thay bằng URL thực tế của hình ảnh)
const customerImages = [
  "https://i.imgur.com/Vnv63mCl.jpg", // Hình ảnh 1
  "https://i.imgur.com/qHobwfsl.jpg", // Hình ảnh 2
  "https://i.imgur.com/nuWRgTfl.jpg", // Hình ảnh 3
  "https://i.imgur.com/JJhf9fsl.jpg", // Hình ảnh 4
];

const Introduce = () => {
  const [openId, setOpenId] = useState(null);
  const innerRef = useRef(null); // Ref cho hình ảnh dài trong tivi để xử lý scroll
  const svgRef = useRef(null); // Ref cho SVG để kiểm soát animation

  // Tạo các refs và useInView cho từng phần
  const { ref: introRef, inView: introInView } = useInView({
    triggerOnce: true,
    threshold: 0.1, // Kích hoạt khi 10% phần tử hiển thị
  });
  const { ref: commitmentRef, inView: commitmentInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const { ref: systemRef, inView: systemInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const { ref: tvRef, inView: tvInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const { ref: statsRef, inView: statsInView } = useInView({
    triggerOnce: true,
    threshold: 0.1, // Kích hoạt khi 10% phần số thống kê hiển thị
  });
  const { ref: customerRef, inView: customerInView } = useInView({
    triggerOnce: true,
    threshold: 0.1, // Kích hoạt khi 10% phần "Khách hàng tin tưởng" hiển thị
  });

  const toggleDropdown = (id) => {
    setOpenId(openId === id ? null : id);
  };

  // Auto-scroll effect cho hình ảnh dài trong tivi với hiệu ứng mượt mà
  useEffect(() => {
    window.scrollTo(0, 0);
    if (innerRef.current) {
      let scrollPosition = 0;
      const speed = 1; // Tốc độ cuộn (bạn có thể điều chỉnh)
      const easing = (t) => t * t * (3 - 2 * t); // Hàm easing ease-in-out cho chuyển động mượt

      const animate = () => {
        const clientHeight = innerRef.current.clientHeight; // Chiều cao hiển thị của container (250px)
        const scrollHeight = innerRef.current.scrollHeight; // Chiều cao thực của hình ảnh (8405px)

        // Đảm bảo scrollHeight lớn hơn clientHeight để có thể scroll
        if (scrollHeight <= clientHeight) {
          console.warn(
            "Hình ảnh không đủ chiều cao để scroll. Kích thước hiện tại:",
            scrollHeight,
            "px"
          );
          return;
        }

        // Tính toán vị trí scroll với hiệu ứng mượt
        scrollPosition += speed * easing((scrollPosition % clientHeight) / clientHeight);
        if (scrollPosition >= scrollHeight - clientHeight) {
          scrollPosition = 0; // Reset về đầu khi chạm đáy
        }
        innerRef.current.scrollTop = Math.floor(scrollPosition); // Sử dụng Math.floor để tránh lặp vô hạn do số thập phân
        
        requestAnimationFrame(animate); // Gọi lại animation frame tiếp theo
       
      };

      // Bắt đầu animation ngay khi component mount
      requestAnimationFrame(animate);

      // Cleanup: Dừng animation khi component unmount
      return () => {};
    }
    
  }, []);

  // Đảm bảo hiệu ứng animation của SVG hoạt động ngay khi component mount
  useEffect(() => {
    if (svgRef.current) {
      const animates = svgRef.current.getElementsByTagName("animate");
      for (let animate of animates) {
        animate.beginElement(); // Kích hoạt animation ngay khi component được mount
      }
    }
    
  }, []);

  // Hàm điều hướng slider (thủ công)
  const nextSlide = () => {
    if (customerRef.current) {
      customerRef.current.scrollLeft += 256; // Trượt sang phải 256px (chiều rộng mỗi hình ảnh)
    }
  };

  const prevSlide = () => {
    if (customerRef.current) {
      customerRef.current.scrollLeft -= 256; // Trượt sang trái 256px (chiều rộng mỗi hình ảnh)
    }
  };

  return (
    <div className="relative flex flex-col items-center bg-white p-30 overflow-hidden rounded-xl top-5">
      {/* Nội dung giới thiệu */}
      <motion.div
        ref={introRef}
        className="relative z-10 flex flex-col md:flex-row items-center max-w-7xl w-full"
        initial={{ opacity: 0, y: 50 }}
        animate={introInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Phần chữ */}
        <div className="md:w-1/2 text-center md:text-left">
          <h2 className="text-4xl font-bold text-[#fbb321]">Về chúng tôi</h2>
          <p className="mt-4 text-black-2">
            PetCare là thương hiệu hàng đầu trong lĩnh vực chăm sóc và cung cấp sản phẩm cho thú cưng, mang đến giải pháp toàn diện cho sức khỏe và hạnh phúc của các bé yêu.
          </p>
          <p className="mt-1 text-black-2">
            Tại PetCare, chúng tôi cung cấp đa dạng sản phẩm và dịch vụ: thức ăn dinh dưỡng, phụ kiện, đồ chơi, spa & grooming, cùng dịch vụ khám chữa bệnh chuyên nghiệp,...
          </p>
          <p className="mt-1 text-black-2">
            Với sứ mệnh đồng hành cùng cộng đồng yêu thú cưng, PetCare cam kết mang đến những sản phẩm chất lượng cao, an toàn và tiện lợi, giúp các bé phát triển khỏe mạnh và hạnh phúc.
          </p>
          <p className="mt-1 text-black-2">
            Thành lập từ năm 2023, chúng tôi tự hào đã phục vụ hơn 10,000 khách hàng, chăm sóc sức khỏe cho hàng nghìn thú cưng và hợp tác với hơn 300 đối tác trên toàn quốc, góp phần xây dựng một cộng đồng yêu thương và chăm sóc thú cưng đúng cách.
          </p>
          <motion.div
            ref={statsRef} // Thêm ref cho phần số thống kê
            className="mt-6 flex justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <div className="text-[#408630] font-bold text-4xl text-left">
              {statsInView && <CountUp start={0} end={1000} duration={2} separator="," />}+
              <br />
              <span className="text-[#525252] text-[16px]">Sản phẩm chất lượng</span>
            </div>
            <div className="text-[#8a5e3b] font-bold text-4xl text-left">
              {statsInView && <CountUp start={0} end={10000} duration={2} separator="," />}+
              <br />
              <span className="text-[#525252] text-[16px]">Khách hàng</span>
            </div>
            <div className="text-[#fbb321] font-bold text-4xl text-left">
              {statsInView && <CountUp start={0} end={300} duration={2} separator="," />}+
              <br />
              <span className="text-[#525252] text-[16px]">Đối tác doanh nghiệp</span>
            </div>
          </motion.div>
        </div>

        {/* Hình ảnh nhóm với SVG làm background */}
        <motion.div
          className="md:w-1/2 flex justify-center mt-6 md:mt-0 relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={introInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="abi-img relative w-full max-w-[600px] h-[500px]">
            <svg
              width="800" // Giữ nguyên chiều rộng 800px như yêu cầu
              height="500"
              viewBox="0 0 612 453"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              ref={svgRef} // Thêm ref để kiểm soát animation
              className="absolute inset-0 w-[800px] h-full object-cover z-0 rotate-45 top-[-90px] -translate-x-10" // Kéo qua trái 10px bằng -translate-x-10
            >
              <path
                d="M81.9479 156.43C152.26 168.263 263.336 183.724 326.538 71.5523C389.581 -40.6194 537.946 -26.1049 594.67 153.117C651.393 332.34 559.277 472.278 375.045 449.718C200.609 428.104 105.49 377.303 26.1727 269.391C-20.1224 206.442 -6.06009 141.443 81.9479 156.43Z"
                fill="#FCB445"
              >
                <animate
                  repeatCount="indefinite"
                  attributeName="d"
                  dur="10s"
                  values="M81.9479 156.43C152.26 168.263 263.336 183.724 326.538 71.5523C389.581 -40.6194 537.946 -26.1049 594.67 153.117C651.393 332.34 559.277 472.278 375.045 449.718C200.609 428.104 105.49 377.303 26.1727 269.391C-20.1224 206.442 -6.06009 141.443 81.9479 156.43Z;                                    M39.4999 140.5C50.0001 125 158 59.5 191 38C224 16.5 465.684 -66.1752 522.408 113.047C579.131 292.27 427 401.5 302.783 409.647C178.566 417.795 97.8178 363.412 18.5 255.5C-27.7951 192.551 28.9996 156 39.4999 140.5Z;                                    M152.499 88.5C182.5 81.5 244.499 54.5 294.499 38C344.499 21.5 520.685 -69.1754 577.408 110.047C634.132 289.269 542.016 429.208 357.783 406.647C183.347 385.033 53.8227 333.141 8.9113 226.321C-36.0001 119.5 122.499 95.5 152.499 88.5Z;                                    M81.9479 156.43C152.26 168.263 263.336 183.724 326.538 71.5523C389.581 -40.6194 537.946 -26.1049 594.67 153.117C651.393 332.34 559.277 472.278 375.045 449.718C200.609 428.104 105.49 377.303 26.1727 269.391C-20.1224 206.442 -6.06009 141.443 81.9479 156.43Z;"
                ></animate>
              </path>
            </svg>
            <div className="inner relative z-10">
              <img
                width="900"
                height="693"
                src={vechungtoi}
                className="attachment-full size-full object-cover w-full max-w-[600px] h-auto rounded-xl shadow-md"
                alt="Hình ảnh nhóm"
                decoding="async"
                loading="lazy"
                sizes="(max-width: 900px) 100vw, 900px"
              />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Phần cam kết */}
      <motion.div
        ref={commitmentRef}
        className="relative z-10 mt-12 p-6 bg-white rounded-lg shadow-6 w-full max-w-7xl"
        initial={{ opacity: 0, y: 50 }}
        animate={commitmentInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.h2
          className="text-4xl font-bold text-[#fbb321]"
          initial={{ opacity: 0, x: -20 }}
          animate={commitmentInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Cam kết của chúng tôi
        </motion.h2>
        <motion.div
          className="mt-8 space-y-6"
          initial={{ opacity: 0 }}
          animate={commitmentInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          {commitments.map((item) => (
            <div key={item.id} className="relative border-b pb-6">
              {/* Nút mở dropdown */}
              <button
                className="flex items-center justify-between w-full font-semibold text-left focus:outline-none text-2xl"
                onClick={() => toggleDropdown(item.id)}
              >
                <span>{item.title}</span>
                <span className="text-lg">
                  {openId === item.id ? "−" : "+"}
                </span>
              </button>

              {/* Nội dung dropdown (kèm ảnh bên phải) */}
              {openId === item.id && (
                <motion.div
                  className="mt-2 flex items-center justify-between"
                  initial={{ opacity: 0, height: 0, y: 20 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: 20 }}
                  transition={{
                    opacity: { duration: 0.5 },
                    height: { duration: 0.5, ease: "easeInOut" },
                    y: { duration: 0.5, ease: "easeInOut" },
                  }}
                >
                  <p className="text-gray-700 max-w-lg">{item.content}</p>
                  <motion.img
                    src={item.image}
                    alt="Cam kết"
                    className="w-[140px] h-[135px] object-cover rounded-md shadow-md"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                  />
                </motion.div>
              )}
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Phần hệ thống */}
      <motion.div
        ref={systemRef}
        className="flex flex-col md:flex-row items-start justify-between bg-white w-full mt-12 max-w-7xl p-6 md:p-10 rounded-xl "
        initial={{ opacity: 0, y: 50 }}
        animate={systemInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Phần thông tin hệ thống */}
        <div className="max-w-2xl">
          <motion.h2
            className="text-4xl font-bold text-[#fbb321] mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={systemInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            Hệ thống phân phối
          </motion.h2>
          <motion.p
            className="text-gray-700 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={systemInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            Chúng tôi có mạng lưới hệ thống và hợp tác xã liên kết trên khắp cả nước, đặc biệt tại các tỉnh thành trọng điểm như:
            <span className="block font-semibold mt-2 text-[#525252]">
              An Giang, Bến Tre, Cần Thơ, Bình Dương, Đồng Nai, Gia Lai, Hà Nội, Hải Dương, Nghệ An, Tây Ninh, Tiền Giang, TP.HCM, Vũng Tàu...
            </span>
            <span className="block mt-2">
              Sẵn sàng mang đến dịch vụ tốt nhất với hệ thống phân phối rộng khắp.
            </span>
          </motion.p>
        </div>

        {/* Google Map */}
        <motion.div
          className="relative w-full md:w-[50%] h-[350px] rounded-lg overflow-hidden  mt-6 md:mt-0"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={systemInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <iframe
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3929.0865141307786!2d105.77999861417342!3d10.031483892834279!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a08846b82d5b2b%3A0x45dfde870620ffeb!2zQ8O0bmcgdmnDqm4gQ-G7rWEgQ2jhu6cgdGjDtG5nIENhbyDEkeG6s25nIEjDsmEgQsOsbg!5e0!3m2!1sen!2s!4v1700000000000"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </motion.div>
      </motion.div>

      {/* Thêm SVG animation ở dưới cùng với hình nhà, tivi và hình dài scroll */}
      <motion.div
        ref={tvRef}
        className="relative w-full mt-12"
        initial={{ opacity: 0, y: 50 }}
        animate={tvInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="channel-dv relative max-w-7xl top-40 mx-auto z-10 mb-[500px]">
          <div className="channel-dv-top absolute top-0 left-1/2 transform -translate-x-1/2 z-30">
            <img
              src="https://nongsan.monamedia.net/template/assets/images/channel-dv-top.svg"
              alt="Mái hiên"
              className="w-full max-w-[500px] h-auto object-contain" // Giữ tỷ lệ hình ảnh, giống mái hiên cam
            />
          </div>
          <div className="channel-dv-tv relative mt-[-20px] justify-center items-center z-20 left-1/2 transform -translate-x-50">
            <img
              src="https://nongsan.monamedia.net/template/assets/images/channel-dv.svg" // Hình nền tivi (monitor xanh), giữ nguyên để làm nền
              alt="Ngôi nhà"
              className="w-full max-w-[400px] h-auto object-contain rounded-lg absolute inset-0 opacity-50" // Làm nền mờ cho tivi
            />
            <div className="inner relative overflow-hidden h-[250px] w-full max-w-[400px]">
              {" "}
              {/* Chiều cao tivi để chứa hình dài */}
              <div
                className="inner-content"
                ref={innerRef}
                style={{ height: "100%", overflowY: "auto" }}
              >
                {" "}
                {/* Cho phép scroll tự động */}
                <motion.img
                  width="641"
                  height="8405" // Cập nhật chiều cao thực tế của full.png
                  src={full}
                  className="attachment-full size-full object-cover w-full"
                  alt="Hình ảnh dài"
                  decoding="async"
                  loading="lazy"
                  sizes="(max-width: 641px) 100vw, 641px"
                  initial={{ y: 0 }}
                  animate={{ y: -innerRef.current?.scrollHeight + innerRef.current?.clientHeight || 0 }}
                  transition={{
                    repeat: Infinity,
                    duration: 20, // Thời gian hoàn thành một vòng lặp (20 giây, bạn có thể điều chỉnh)
                    ease: "linear", // Chuyển động đều, không easing
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <svg
          width="1099"
          height="736"
          viewBox="0 0 1099 736"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full max-w-7xl mx-auto absolute inset-0 object-contain z-0" // Sử dụng object-contain để giữ tỷ lệ và chiều cao tự nhiên
          ref={svgRef}
        >
          <path
            d="M1097.51 495.327C1094.61 479.398 1087.58 464.711 1076.62 451.471C1048.9 417.752 1042.08 370.999 1060.49 331.487C1085.1 278.322 1091.51 222.882 1074.96 171.164C1027.19 22.0123 807.946 -41.2894 584.983 30.0802C562.438 37.3206 540.928 45.5953 520.245 54.6976C445.992 87.7965 362.64 91.9339 284.871 68.7646C203.794 44.7679 125.198 58.4212 81.143 111.793C45.775 154.822 39.9837 215.021 59.4258 275.84C68.7332 304.801 61.9078 336.659 40.811 358.587C23.4373 376.378 11.4411 397.065 6.06347 420.234C-21.445 537.115 56.5302 664.546 339.061 722.262C448.681 744.604 723.352 735.295 796.777 722.055C979.409 689.37 1114.06 588.004 1097.51 495.327Z"
            fill="#FFF8EA"
          >
            <animate
              repeatCount="indefinite"
              attributeName="d"
              dur="10s"
              values="M1097.51 495.327C1094.61 479.398 1087.58 464.711 1076.62 451.471C1048.9 417.752 1042.08 370.999 1060.49 331.487C1085.1 278.322 1091.51 222.882 1074.96 171.164C1027.19 22.0123 807.946 -41.2894 584.983 30.0802C562.438 37.3206 540.928 45.5953 520.245 54.6976C445.992 87.7965 362.64 91.9339 284.871 68.7646C203.794 44.7679 125.198 58.4212 81.143 111.793C45.775 154.822 39.9837 215.021 59.4258 275.84C68.7332 304.801 61.9078 336.659 40.811 358.587C23.4373 376.378 11.4411 397.065 6.06347 420.234C-21.445 537.115 56.5302 664.546 339.061 722.262C448.681 744.604 723.352 735.295 796.777 722.055C979.409 689.37 1114.06 588.004 1097.51 495.327Z;
                                M1097.19 495.269C1094.29 479.34 1097.19 486.815 1076.3 451.413C1055.41 416.01 1044.03 392.534 1060.16 331.429C1076.3 270.324 1091.19 222.823 1074.64 171.106C1026.86 21.9538 807.624 -41.348 584.66 30.0216C562.116 37.262 542.346 45.8447 519.922 54.639C497.499 63.4332 357.48 75.5902 284.549 68.706C211.618 61.8219 125.902 77.4925 80.8208 111.735C35.7391 145.977 21.3859 218.529 59.1035 275.781C93.7238 321.507 62.767 329.72 40.4888 358.529C23.115 376.319 11.1188 397.006 5.74121 420.176C-21.7673 537.056 56.2079 664.487 338.739 722.203C448.359 744.545 723.03 735.236 796.455 721.996C979.087 689.311 1104.51 535.544 1097.19 495.269Z;
                                M1097.51 495.327C1094.61 479.398 1087.58 464.711 1076.62 451.471C1048.9 417.752 1042.08 370.999 1060.49 331.487C1085.1 278.322 1091.51 222.882 1074.96 171.164C1027.19 22.0123 807.946 -41.2894 584.983 30.0802C562.438 37.3206 540.928 45.5953 520.245 54.6976C445.992 87.7965 362.64 91.9339 284.871 68.7646C203.794 44.7679 125.198 58.4212 81.143 111.793C45.775 154.822 39.9837 215.021 59.4258 275.84C68.7332 304.801 61.9078 336.659 40.811 358.587C23.4373 376.378 11.4411 397.065 6.06347 420.234C-21.445 537.115 56.5302 664.546 339.061 722.262C448.681 744.604 723.352 735.295 796.777 722.055C979.409 689.37 1114.06 588.004 1097.51 495.327Z"
            ></animate>
          </path>
        </svg>
      </motion.div>

       {/* Phần mới: Khách hàng tin tưởng */}
       <motion.div
        ref={customerRef}
        className="relative w-full max-w-7xl mx-auto mt-12 px-4 text-center"
        initial={{ opacity: 0, y: 50 }}
        animate={customerInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.h2
          className="text-3xl font-bold text-yellow-500 mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={customerInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Khách hàng tin tưởng
        </motion.h2>
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={prevSlide}
            className="text-yellow-500 text-2xl p-2 rounded-full bg-white shadow-md hover:bg-gray-200 transition"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <div
            ref={customerRef} // Sử dụng ref cho phần slider để điều hướng
            className="flex space-x-4 overflow-x-auto no-scrollbar"
            style={{ scrollBehavior: "smooth" }} // Thêm scroll mượt mà
          >
            {customerImages.map((image, index) => {
              let translateY = "translate-y-0"; // Mặc định không dịch chuyển
              if (index === 0 || index === 2) translateY = "-translate-y-8"; // Hình 1 & 3 lên cao hơn (dịch lên 8px)
              if (index === 1 || index === 3) translateY = "translate-y-8"; // Hình 2 & 4 xuống thấp hơn (dịch xuống 8px)

              return (
                <motion.div
                  key={index}
                  className={`flex-shrink-0 w-64 h-96 bg-white rounded-lg shadow-lg p-4 ${translateY} transition-transform`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={customerInView ? { opacity: 1, x: 0 } : {}}
                  transition={{
                    duration: 0.8,
                    delay: index * 0.1,
                    ease: "easeOut",
                  }}
                >
                  <img
                    src={image}
                    alt={`Khách hàng ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </motion.div>
              );
            })}
          </div>
          <button
            onClick={nextSlide}
            className="text-yellow-500 text-2xl p-2 rounded-full bg-white shadow-md hover:bg-gray-200 transition"
          >
            <i className="fas fa-arrow-right"></i>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Introduce;