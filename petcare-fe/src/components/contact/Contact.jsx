import React, { useState } from 'react';
import axios from 'axios';
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không đúng định dạng';
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Số điện thoại không đúng định dạng';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Vui lòng nhập nội dung thắc mắc';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post(
        'http://localhost:8080/api/contacts', 
        formData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      toast.success('Gửi thông tin liên hệ thành công!');
      
      // Reset form after successful submission
      setFormData({
        fullName: '',
        email: '',
        phoneNumber: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      
      if (error.response) {
        console.error('Error response:', error.response);
        console.error('Error data:', error.response.data);
        console.error('Error status:', error.response.status);
        
        if (error.response.data) {
          toast.error(`Lỗi: ${error.response.data}`);
        } else {
          toast.error(`Lỗi ${error.response.status}: Vui lòng thử lại sau`);
        }
      } else if (error.request) {
        console.error('Error request:', error.request);
        toast.error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối của bạn.');
      } else {
        toast.error('Có lỗi xảy ra, vui lòng thử lại sau');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-6xl relative rounded-lg mx-auto">
        <div className="flex flex-col lg:flex-row shadow-xl rounded-lg overflow-hidden">
          {/* Left side - Contact Information */}
          <div className="w-full lg:w-2/5 bg-[#fbb321] p-8 text-white">
            <h2 className="text-white text-2xl font-bold font-['Quicksand'] leading-7 mb-6">
              Thông tin liên hệ
            </h2>
            
            <div className="flex gap-2 mb-8">
              <button className="bg-white px-4 py-2 rounded-full transition hover:bg-opacity-90">
                <span className="text-[#fbb321] text-base font-medium">Facebook</span>
              </button>
              <button className="border border-white px-4 py-2 rounded-full transition hover:bg-white hover:text-[#fbb321]">
                <span className="text-base font-medium">Zalo</span>
              </button>
            </div>

            {/* Contact Details */}
            <div className="space-y-8">
              <ContactItem 
                icon={<FaPhone />}
                label="Điện thoại" 
                value="0844233799" 
              />
              
              <ContactItem 
                icon={<FaEnvelope />}
                label="Email" 
                value="duyenttmpc08066@fpt.edu.vn" 
              />
              
              <ContactItem 
                icon={<FaMapMarkerAlt />}
                label="Cửa hàng"
              >          
                <p className="text-sm mt-2">
                  E62, đường số 2, khu đô thị mới Hưng Phú, Phường Hưng Thạnh, quận Cái Răng, TPCT
                </p>
                <a 
                  href="https://maps.google.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm underline mt-2 inline-block hover:text-yellow-200"
                >
                  Xem trên Google Maps
                </a>
              </ContactItem>
            </div>
          </div>

          {/* Right side - Contact Form */}
          <div className="w-full lg:w-3/5 bg-white p-8">
            <h1 className="text-[#fbb321] text-2xl md:text-3xl font-bold font-['Quicksand'] mb-8">
              Gửi thắc mắc cho chúng tôi
            </h1>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input 
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Họ và tên" 
                error={errors.fullName}
              />
              
              <Input 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email" 
                error={errors.email}
              />
              
              <Input 
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Số điện thoại" 
                error={errors.phoneNumber}
              />
              
              <div className="w-full">
                <div className="w-full bg-white rounded-lg border border-black/10 overflow-hidden">
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Nhập thắc mắc của bạn..."
                    className="w-full p-4 text-sm font-semibold placeholder-[#888888] resize-none h-32"
                  />
                </div>
                {errors.message && (
                  <p className="text-red-500 text-xs mt-1">{errors.message}</p>
                )}
              </div>

              <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <p className="text-[#8a5e3b] text-sm md:text-base font-medium">
                  Chúng tôi sẽ liên hệ tư vấn trong vòng 48h làm việc
                </p>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-[#fbb321] text-white font-bold px-6 py-3 rounded-full transition hover:bg-[#e9a819] disabled:opacity-70"
                >
                  {loading ? 'Đang gửi...' : 'Gửi thông tin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContactItem = ({ icon, label, value, children }) => {
  return (
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 text-[#fbb321]">
        {icon}
      </div>
      <div className="text-white">
        <div className="text-base font-medium">{label}</div>
        {value && <div className="text-base font-bold">{value}</div>}
        {children}
      </div>
    </div>
  );
};

const Input = ({ name, value, onChange, placeholder, error }) => {
  return (
    <div className="w-full">
      <div className={`w-full h-12 bg-white rounded-lg border ${error ? 'border-red-500' : 'border-black/10'} overflow-hidden`}>
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full h-full px-4 text-sm font-semibold placeholder-[#888888]"
        />
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
};

export default Contact;
