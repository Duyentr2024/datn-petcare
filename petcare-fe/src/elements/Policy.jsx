import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronDown, FaChevronUp, FaBoxOpen, FaCut, FaClinicMedical, FaQuestion, FaEnvelope, FaHome } from 'react-icons/fa';

const Policy = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [expandedFaqs, setExpandedFaqs] = useState([]);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const tabs = [
    { id: 'products', title: 'Bảo hành sản phẩm', icon: <FaBoxOpen /> },
    { id: 'grooming', title: 'Bảo hành dịch vụ Spa Grooming', icon: <FaCut /> },
    { id: 'veterinary', title: 'Bảo hành dịch vụ Thú y', icon: <FaClinicMedical /> }
  ];

  const toggleFaq = (id) => {
    setExpandedFaqs(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  const faqItems = [
    {
      id: 1,
      question: "Sản phẩm hỏng sau 30 ngày thì sao?",
      answer: "Sau 30 ngày, sản phẩm sẽ không còn trong thời gian bảo hành chính thức. Tuy nhiên, quý khách vẫn có thể liên hệ với chúng tôi để được tư vấn và hỗ trợ chi phí sửa chữa hoặc thay thế với giá ưu đãi."
    },
    {
      id: 2,
      question: "Làm sao để đặt lịch lại spa grooming?",
      answer: "Quý khách có thể đặt lịch lại dịch vụ spa grooming thông qua trang đặt lịch trên website, ứng dụng di động Petcare, hoặc gọi trực tiếp đến tổng đài 1900-xxxx. Vui lòng cung cấp thông tin về lần sử dụng dịch vụ trước đó."
    },
    {
      id: 3,
      question: "Làm thế nào để biết thú cưng của tôi cần được đưa đi điều trị lại?",
      answer: "Nếu sau khi điều trị, thú cưng của bạn vẫn có các dấu hiệu bất thường như: biếng ăn kéo dài, thay đổi hành vi, tiếp tục có các triệu chứng ban đầu, hoặc xuất hiện các triệu chứng mới, vui lòng liên hệ ngay với phòng khám của chúng tôi để được tư vấn."
    },
    {
      id: 4,
      question: "Thời gian bảo hành có thể kéo dài cho khách hàng thân thiết không?",
      answer: "Đối với khách hàng thân thiết hoặc thành viên VIP của Petcare, chúng tôi có các chính sách ưu đãi đặc biệt, bao gồm việc mở rộng thời gian bảo hành thêm 15-30 ngày tùy theo cấp độ thành viên. Vui lòng kiểm tra điểm tích lũy và cấp độ thành viên của bạn trên ứng dụng hoặc website của chúng tôi."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-6 text-sm text-gray-500">
        <Link to="/" className="hover:text-[#FBB321] flex items-center">
          <FaHome className="mr-1" />
          Trang chủ
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[#FBB321]">Chính sách bảo hành</span>
      </nav>

      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#FBB321] mb-2">Chính sách bảo hành Petcare</h1>
        <p className="text-gray-600">Cam kết chất lượng cho thú cưng của bạn</p>
      </div>

      {/* Introduction */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <p className="text-gray-800 leading-relaxed">
          Tại Petcare, chúng tôi cam kết mang đến sản phẩm và dịch vụ chất lượng cao cho thú cưng của bạn. 
          Chính sách bảo hành áp dụng cho sản phẩm mua tại cửa hàng trực tuyến, dịch vụ spa grooming, 
          và khám chữa bệnh tại thú y của chúng tôi. Chúng tôi luôn đặt sự hài lòng của khách hàng 
          và sức khỏe của thú cưng lên hàng đầu.
        </p>
      </div>

      {/* Warranty Policies Tabs */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="flex flex-wrap border-b">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              className={`flex items-center py-4 px-4 sm:px-6 focus:outline-none transition-colors flex-grow sm:flex-grow-0
                ${activeTab === index ? 'bg-[#fff8e6] text-[#FBB321] font-bold border-b-2 border-[#FBB321]' : 'text-gray-800 hover:bg-gray-50'}`}
              onClick={() => setActiveTab(index)}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.title}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 0 && (
            <div className="animate-fadeIn">
              <div className="flex flex-col md:flex-row mb-6">
                <div className="w-full md:w-1/3 mb-4 md:mb-0">
                  <img src="https://i.pinimg.com/236x/bf/50/45/bf504529372b7466ddbc760b63881271.jpg" alt="Sản phẩm Petcare" className="rounded-lg shadow-md w-full h-48 object-cover" />
                </div>
                <div className="w-full md:w-2/3 md:pl-6">
                  <h3 className="text-xl font-bold text-[#FBB321] mb-4">Bảo hành sản phẩm</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-[#FBB321] font-bold mr-2">•</span>
                      <span><strong>Thời gian bảo hành:</strong> 30 ngày cho sản phẩm lỗi từ nhà sản xuất.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#FBB321] font-bold mr-2">•</span>
                      <span><strong>Điều kiện:</strong> Giữ hóa đơn mua hàng, sản phẩm còn nguyên vẹn bao bì.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#FBB321] font-bold mr-2">•</span>
                      <span><strong>Quy trình:</strong> Liên hệ qua email hoặc hotline, gửi sản phẩm về kho trong vòng 7 ngày.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 1 && (
            <div className="animate-fadeIn">
              <div className="flex flex-col md:flex-row mb-6">
                <div className="w-full md:w-1/3 mb-4 md:mb-0">
                  <img src="https://i.pinimg.com/736x/3f/22/7c/3f227cfa485f9239e38b9f986be19809.jpg" alt="Dịch vụ Spa Grooming" className="rounded-lg shadow-md w-full h-48 object-cover" />
                </div>
                <div className="w-full md:w-2/3 md:pl-6">
                  <h3 className="text-xl font-bold text-[#FBB321] mb-4">Bảo hành dịch vụ Spa Grooming</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-[#FBB321] font-bold mr-2">•</span>
                      <span><strong>Đảm bảo chất lượng:</strong> Trong 7 ngày, bao gồm chỉnh sửa lông nếu không ưng ý.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#FBB321] font-bold mr-2">•</span>
                      <span><strong>Giới hạn:</strong> Không áp dụng nếu thú cưng tự làm hỏng sau dịch vụ.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#FBB321] font-bold mr-2">•</span>
                      <span><strong>Quy trình:</strong> Đặt lịch lại qua trang đặt lịch hoặc hotline.</span>
                    </li>
                  </ul>                
                </div>
              </div>
            </div>
          )}

          {activeTab === 2 && (
            <div className="animate-fadeIn">
              <div className="flex flex-col md:flex-row mb-6">
                <div className="w-full md:w-1/3 mb-4 md:mb-0">
                  <img src="https://i.pinimg.com/236x/87/f1/a3/87f1a3a2023330f396c805aa51e8ce43.jpg" alt="Dịch vụ Thú y" className="rounded-lg shadow-md w-full h-48 object-cover" />
                </div>
                <div className="w-full md:w-2/3 md:pl-6">
                  <h3 className="text-xl font-bold text-[#FBB321] mb-4">Bảo hành dịch vụ Thú y</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-[#FBB321] font-bold mr-2">•</span>
                      <span><strong>Thời gian bảo hành:</strong> 14 ngày nếu có sai sót từ bác sĩ.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#FBB321] font-bold mr-2">•</span>
                      <span><strong>Giới hạn:</strong> Không áp dụng cho trường hợp bệnh tái phát do yếu tố sức khỏe.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#FBB321] font-bold mr-2">•</span>
                      <span><strong>Quy trình:</strong> Liên hệ trực tiếp phòng khám để được kiểm tra lại.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <h3 className="text-xl font-bold p-4 bg-[#fff8e6] text-[#FBB321] border-b border-gray-200">Bảng tóm tắt chính sách bảo hành</h3>
        <div className="responsive-table">
          <table className="w-full">
            <thead>
              <tr className="bg-[#FBB321] text-white">
                <th className="py-3 px-4 text-left">Loại dịch vụ</th>
                <th className="py-3 px-4 text-left">Thời gian bảo hành</th>
                <th className="py-3 px-4 text-left">Điều kiện</th>
                <th className="py-3 px-4 text-left">Quy trình</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 font-medium">Sản phẩm</td>
                <td className="py-3 px-4">30 ngày</td>
                <td className="py-3 px-4">Hóa đơn, bao bì nguyên vẹn</td>
                <td className="py-3 px-4">Email/Hotline, gửi lại sản phẩm</td>
              </tr>
              <tr className="border-b border-gray-200 bg-gray-50">
                <td className="py-3 px-4 font-medium">Spa Grooming</td>
                <td className="py-3 px-4">7 ngày</td>
                <td className="py-3 px-4">Không tự làm hỏng</td>
                <td className="py-3 px-4">Đặt lịch lại qua website/hotline</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Thú y</td>
                <td className="py-3 px-4">14 ngày</td>
                <td className="py-3 px-4">Lỗi từ bác sĩ</td>
                <td className="py-3 px-4">Liên hệ trực tiếp phòng khám</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-xl font-bold text-[#FBB321] mb-6 flex items-center">
          <FaQuestion className="mr-2" />
          Câu hỏi thường gặp
        </h3>
        
        <div className="space-y-4">
          {faqItems.map((item) => (
            <div 
              key={item.id} 
              className="border border-gray-200 rounded-lg overflow-hidden transition-all"
            >
              <div 
                className={`flex items-center justify-between p-4 cursor-pointer ${expandedFaqs.includes(item.id) ? 'bg-[#fff8e6]' : 'bg-white'}`}
                onClick={() => toggleFaq(item.id)}
              >
                <h4 className={`font-medium ${expandedFaqs.includes(item.id) ? 'text-[#FBB321]' : 'text-gray-800'}`}>{item.question}</h4>
                <div className={`${expandedFaqs.includes(item.id) ? 'text-[#FBB321]' : 'text-gray-500'}`}>
                  {expandedFaqs.includes(item.id) ? <FaChevronUp /> : <FaChevronDown />}
                </div>
              </div>
              
              {expandedFaqs.includes(item.id) && (
                <div className="p-4 border-t border-gray-200 bg-gray-50 animate-fadeIn">
                  <p className="text-gray-700">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-[#fff8e6] rounded-lg shadow-md p-8 text-center mb-8">
        <h3 className="text-xl font-bold text-[#FBB321] mb-4">Cần hỗ trợ thêm?</h3>
        <p className="text-gray-700 mb-6">
          Đội ngũ chăm sóc khách hàng của chúng tôi luôn sẵn sàng giải đáp mọi thắc mắc của bạn về chính sách bảo hành và các dịch vụ khác.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/contact" className="bg-[#FBB321] hover:bg-[#e09a0d] text-white font-bold py-3 px-6 rounded-md transition-colors flex items-center justify-center">
            <FaEnvelope className="mr-2" />
            Liên hệ hỗ trợ
          </Link>
          <Link to="/" className="bg-white hover:bg-gray-100 text-[#FBB321] font-bold py-3 px-6 rounded-md border border-[#FBB321] transition-colors flex items-center justify-center">
            <FaHome className="mr-2" />
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Policy;
