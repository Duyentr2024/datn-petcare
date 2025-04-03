import { useState, useEffect } from 'react';
import { FaLeaf, FaBath, FaCut, FaCircle, FaPaw, FaCheck, FaCut as FaScissorReplacement, FaShower, FaClipboardList, FaQuestion, FaCalendarAlt, FaMedkit, FaRuler, FaClock, FaList, FaArrowRight, FaHome, FaChevronRight, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Link } from 'react-router-dom';

/* Keyframe Animation for FAQ Answers */
import './grooming.css';

const Grooming = () => {
  const [selectedService, setSelectedService] = useState('bath');
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const services = {
    bath: {
      title: 'TẮM & VỆ SINH',
      icon: FaBath,
      image: 'https://i.pinimg.com/736x/a4/bc/5e/a4bc5e366224d3fde5681e0cab947a45.jpg',
      description: 'Dịch vụ tắm và vệ sinh toàn diện cho thú cưng của bạn, đảm bảo sạch sẽ và thơm tho.',
      options: [
        'Dầu gội làm sạch sâu',
        'Sấy khô lông',
        'Cắt móng',
        'Vệ sinh tai',
        'Vắt tuyến hậu môn',
        'Đánh răng',
        'Cắt tỉa lòng bàn chân',
        'Cắt tỉa lông mặt'
      ]
    },
    grooming: {
      title: 'TẮM & CẮT TỈA',
      icon: FaCut,
      image: 'https://i.pinimg.com/736x/12/28/dd/1228dd446fcdb5bac1271a36a93bc349.jpg',
      description: 'Dịch vụ tắm và cắt tỉa lông chuyên nghiệp, tạo kiểu theo yêu cầu cho thú cưng của bạn.',
      options: [
        'Cắt lông toàn thân',
        'Tỉa lông theo kiểu',
        'Dầu gội làm sạch sâu',
        'Sấy khô lông',
        'Cắt móng',
        'Vệ sinh tai',
        'Vắt tuyến hậu môn',
        'Đánh răng'
      ]
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center text-sm">
          <Link to="/" className="flex items-center text-gray-600 hover:text-[#026AC7]">
            <FaHome className="mr-1" />
            <span>Trang chủ</span>
          </Link>
          <FaChevronRight className="mx-2 text-gray-400 text-xs" />
          <span className="text-[#026AC7] font-medium">Dịch vụ spa</span>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header - Centered */}
        <h1 className="text-3xl font-bold text-[#026AC7] mb-8 text-left">DỊCH VỤ Ở PETCARE</h1>
        
        {/* Main Content */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column - Service Selection */}
          <div className="w-full md:w-1/3">
            <div className="grid grid-cols-1 gap-6">
              {/* Bath Service */}
              <div 
                className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all hover:shadow-lg 
                  ${selectedService === 'bath' ? 'ring-4 ring-[#026AC7]' : ''}`}
                onClick={() => setSelectedService('bath')}
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={services.bath.image} 
                    alt="Tắm & Vệ Sinh" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 text-center">
                  <h3 className="text-xl font-bold text-gray-800">{services.bath.title}</h3>
                </div>
              </div>
              
              {/* Grooming Service */}
              <div 
                className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all hover:shadow-lg 
                  ${selectedService === 'grooming' ? 'ring-4 ring-[#026AC7]' : ''}`}
                onClick={() => setSelectedService('grooming')}
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={services.grooming.image} 
                    alt="Tắm & Cắt Tỉa" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 text-center">
                  <h3 className="text-xl font-bold text-gray-800">{services.grooming.title}</h3>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Service Details */}
          <div className="w-full md:w-2/3 bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-6">
              {selectedService === 'bath' ? (
                <FaBath className="text-[#026AC7] text-2xl mr-2" />
              ) : (
                <FaCut className="text-[#026AC7] text-2xl mr-2" />
              )}
              <h2 className="text-2xl font-bold text-gray-800">
                {services[selectedService].title}
              </h2>
            </div>
            
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ul className="list-none space-y-3">
                  {services[selectedService].options.slice(0, Math.ceil(services[selectedService].options.length / 2)).map((option, index) => (
                    <li key={index} className="flex items-center">
                      <FaCircle className="text-[#026AC7] text-xs mr-3" />
                      <span className="text-gray-700">{option}</span>
                    </li>
                  ))}
                </ul>
                <ul className="list-none space-y-3">
                  {services[selectedService].options.slice(Math.ceil(services[selectedService].options.length / 2)).map((option, index) => (
                    <li key={index} className="flex items-center">
                      <FaCircle className="text-[#026AC7] text-xs mr-3" />
                      <span className="text-gray-700">{option}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="flex items-center mb-8 text-gray-600 bg-gray-50 p-4 rounded-md">
              <FaLeaf className="text-green-500 mr-2 flex-shrink-0" />
              <p>{services[selectedService].description}</p>
            </div>
            
            <div className="mt-auto">
              <div className="flex flex-col items-end">
                <Link to="/appointment" className="bg-[#026AC7] hover:bg-[#0253a0] text-white font-bold py-3 px-6 rounded-md transition-colors inline-block text-center">
                  ĐẶT LỊCH HẸN
                </Link>
                <p className="text-xs text-[#026AC7] mt-2">
                "PetCare – Yêu thương từ những điều nhỏ nhất!"
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Service Process Component */}
        <ServiceProcess />
        
        {/* FAQ Section */}
        <FAQ />
      </div>
    </div>
  );
};

const ServiceProcess = () => {
  const steps = [
    {
      number: 1,
      title: "Check-in",
      time: "~15 min",
      icon: FaCheck,
      description: "Đăng ký và kiểm tra sức khỏe ban đầu cho thú cưng của bạn"
    },
    {
      number: 2,
      title: "Chải lông và cắt móng",
      time: "~30 min",
      icon: FaPaw,
      description: "Chải lông và loại bỏ các nút rối, cắt móng an toàn"
    },
    {
      number: 3,
      title: "Cắt tỉa lông toàn diện",
      time: "~45 min",
      icon: FaScissorReplacement,
      description: "Cắt tỉa lông theo yêu cầu hoặc theo giống"
    },
    {
      number: 4,
      title: "Tắm và sấy khô",
      time: "~45 min",
      icon: FaShower,
      description: "Tắm bằng sản phẩm chuyên dụng và sấy khô an toàn"
    },
    {
      number: 5,
      title: "Báo cáo kết quả",
      time: "~10 min",
      icon: FaClipboardList,
      description: "Tư vấn chăm sóc và thông báo kết quả dịch vụ"
    }
  ];

  return (
    <div className="mt-16 bg-white rounded-lg shadow-md p-8">
      {/* Title Section */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-[#026AC7] mb-2">TRẢI NGHIỆM CỦA THÚ CƯNG TẠI PETCARE</h2>
        <p className="text-green-600">Từ đầu đến cuối, chúng tôi luôn đặt sức khỏe và hạnh phúc của thú cưng của bạn lên hàng đầu. Mỗi cuộc hẹn mất khoảng 2-4 giờ.</p>
      </div>
      
      {/* Two-column layout */}
      <div className="flex flex-col md:flex-row gap-10">
        {/* Left column - Process Steps */}
        <div className="w-full md:w-1/2">
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#CDEBFF] border-2 border-[#026AC7]">
                      <span className="text-xl font-bold text-[#026AC7]">{step.number}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 flex-grow">
                    <div className="flex items-center mb-2">
                      <step.icon className="text-[#026AC7] mr-2" />
                      <h3 className="text-xl font-semibold text-gray-800">{step.title}</h3>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-[#026AC7] font-medium">{step.time}</span>
                    </div>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="absolute left-6 top-12 h-12 w-0 border-l-2 border-dashed border-gray-300"></div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Right column - Image and additional info */}
        <div className="w-full md:w-1/2">
          <div className="bg-gray-50 rounded-lg overflow-hidden mb-6">
            <img 
              src="https://i.pinimg.com/736x/3f/22/7c/3f227cfa485f9239e38b9f986be19809.jpg" 
              alt="Thú cưng được chăm sóc" 
              className="w-full h-64 object-cover"
            />
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-3">Dịch vụ chăm sóc toàn diện</h3>
            <p className="text-gray-700 mb-4">
              Dịch vụ của chúng tôi bắt đầu bằng Kiểm tra chăm sóc thú cưng, một cuộc kiểm tra nhanh để đảm bảo không có dấu hiệu hoặc cảm giác bất thường nào ở thú cưng của bạn. Sau đó, chúng tôi tiến hành chải lông, cắt tỉa và tắm theo quy trình chuyên nghiệp, tuỳ theo nhu cầu của từng thú cưng.
            </p>
            <p className="text-gray-500 text-sm italic">
              *Kiểm tra chăm sóc thú cưng không thay thế cho việc khám và chăm sóc thường xuyên của bác sĩ thú y được cấp phép. Nếu chúng tôi phát hiện bất kỳ vấn đề nào, chúng tôi sẽ giới thiệu bạn đến bác sĩ thú y.
            </p>
            <div className="mt-4 p-3 bg-[#CDEBFF] border border-[#026AC7] rounded-md">
              <p className="text-[#026AC7] font-medium">Lưu ý: Thông tin quy trình này chỉ có tác dụng hiển thị cho người dùng xem và tham khảo.</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <Link to="/appointment" className="bg-[#026AC7] hover:bg-[#0253a0] text-white font-bold py-3 px-8 rounded-md transition-colors w-full md:w-auto">
              ĐẶT LỊCH HẸN
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const FAQ = () => {
  const [expandedItems, setExpandedItems] = useState([]);

  const toggleItem = (id) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  const faqItems = [
    {
      id: 1,
      question: "Tôi có thể tham gia buổi chăm sóc tại PETCARE không?",
      answer: "Chúng tôi khuyến khích chủ nuôi ở lại để quan sát quy trình chăm sóc chó mèo của bạn tại spa. Vui lòng đặt lịch trước để đảm bảo thời gian phù hợp. Nếu bạn không thể ở lại, đội ngũ chuyên nghiệp của chúng tôi sẽ chăm sóc kỹ lưỡng cho thú cưng của bạn với các dịch vụ spa như tắm, cắt tỉa lông, và làm đẹp. Xem thêm Điều khoản và Điều kiện của PETCARE.",
      icon: FaQuestion
    },
    {
      id: 2,
      question: "Tôi có cần phải đưa thú cưng của mình đi khám sức khỏe trước khi đến spa không?",
      answer: "Nên đưa thú cưng đến bác sĩ thú y để kiểm tra trước nếu bạn lo lắng về tình trạng sức khỏe. Tuy nhiên, đội ngũ của chúng tôi sẽ thực hiện kiểm tra ban đầu để đảm bảo thú cưng của bạn phù hợp với các dịch vụ spa grooming.",
      icon: FaMedkit
    },
    {
      id: 3,
      question: "Chiều dài lông của thú cưng có ảnh hưởng gì không?",
      answer: "Chiều dài lông có thể ảnh hưởng đến thời gian và kiểu dáng grooming. Hãy cho chúng tôi biết trước để chuẩn bị dịch vụ phù hợp.",
      icon: FaRuler
    },
    {
      id: 4,
      question: "Tôi nên bao lâu thì đưa thú cưng đi spa grooming một lần?",
      answer: "Tùy thuộc vào giống loài và loại lông, thường nên grooming mỗi 4-6 tuần để giữ vệ sinh và vẻ đẹp cho chó mèo.",
      icon: FaClock
    },
    {
      id: 5,
      question: "Dịch vụ spa grooming cho thú cưng bao gồm những gì?",
      answer: "Dịch vụ bao gồm tắm sạch, cắt tỉa lông, làm sạch tai, cắt móng, và tùy chọn massage thư giãn cho thú cưng.",
      icon: FaList
    },
    {
      id: 6,
      question: "Làm thế nào để tôi đặt lịch spa grooming cho thú cưng của mình?",
      answer: "Vui lòng liên hệ với chúng tôi qua số điện thoại hoặc đặt trực tiếp trên website.",
      icon: FaCalendarAlt
    }
  ];

  return (
    <div className="mt-16 bg-white rounded-lg shadow-md p-8">
      {/* Title Section */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-[#026AC7] mb-4">CÂU HỎI THƯỜNG GẶP</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {faqItems.map((item) => (
          <div 
            key={item.id} 
            className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 hover:border-[#026AC7]"
            onClick={() => toggleItem(item.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="bg-[#CDEBFF] p-2 rounded-full mr-4">
                  <item.icon className="text-[#026AC7] text-xl" />
                </div>
                <h3 className="text-xl font-bold text-[#026AC7]">{item.question}</h3>
              </div>
              <div className="text-[#026AC7] ml-2 flex-shrink-0">
                {expandedItems.includes(item.id) ? <FaChevronUp /> : <FaChevronDown />}
              </div>
            </div>
            {expandedItems.includes(item.id) && (
              <div className="ml-12 mt-2 animate-fadeIn border-t border-gray-200 pt-3">
                <p className="text-gray-700">{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-10 flex justify-center">
        <Link to="/appointment" className="bg-[#026AC7] hover:bg-[#0253a0] text-white font-bold py-3 px-8 rounded-md transition-colors flex items-center">
          ĐẶT LỊCH NGAY
          <FaArrowRight className="ml-2" />
        </Link>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Bạn có câu hỏi khác? <Link to="/contact" className="text-[#026AC7] font-medium hover:underline">Hỏi thêm</Link>
        </p>
      </div>
    </div>
  );
};

export default Grooming;
