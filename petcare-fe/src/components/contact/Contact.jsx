import React from 'react';

const Contact = () => {
  return (
    <div className="w-full min-h-screen flex items-center justify-center px-4">
      <div className="w-[994px] h-[594.64px] relative rounded-lg mx-auto my-10">
        {/* Left side - Contact Information */}
        <div className="w-[894px] h-[594.64px] left-[100px] top-0 absolute bg-white rounded-lg shadow-[0px_2px_8px_0px_rgba(99,99,99,0.20)]" />
        <div className="w-[376px] h-[510.64px] left-0 top-[24px] absolute bg-[#fbb321] rounded-lg p-6">
          <h2 className="text-white text-lg font-bold font-['Quicksand'] leading-7">Thông tin liên hệ</h2>
          
          <div className="flex gap-2 mt-4">
            <button className="bg-white px-4 py-2 rounded-full">
              <span className="text-[#fbb321] text-base font-medium">Facebook</span>
            </button>
            <button className="border border-white px-4 py-2 rounded-full">
              <span className="text-white text-base font-medium">Zalo</span>
            </button>
          </div>

          {/* Contact Details */}
          <div className="mt-6 space-y-8">
            <ContactItem icon="phone" label="Điện thoại" value="0844233799" />
            <ContactItem icon="email" label="Email" value="duyenttmpc08066@fpt.edu.vn" />
            <ContactItem icon="location" label="Cửa hàng">          
              <p className="text-sm mt-2">
                E62, đường số 2, khu đô thị mới Hưng Phú, Phường Hưng Thạnh, quận Cái Răng, TPCT
              </p>
              <a href="#" className="text-sm underline">Đường dẫn google maps</a>
            </ContactItem>
          </div>
        </div>

        {/* Right side - Contact Form */}
        <div className="absolute left-[400px] top-[27px]">
          <h1 className="text-[#fbb321] text-[27px] font-bold font-['Quicksand']">
            Gửi thắc mắc cho chúng tôi
          </h1>
          
          <form className="mt-14 space-y-5">
            <Input placeholder="Họ và tên" />
            <Input placeholder="Email" />
            <Input placeholder="Số điện thoại" />
            <Input placeholder="Tên công ty" />
            <Input placeholder="Mã số thuế" />

            <div className="mt-12 flex items-center justify-between">
              <p className="text-[#8a5e3b] text-base font-medium">
                Chúng tôi sẽ liên hệ tư vấn trong vòng 48h làm việc
              </p>
              <button className="bg-[#fbb321] text-white font-bold px-4 py-3 rounded-full">
                Gửi thông tin
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ContactItem = ({ icon, label, value, children }) => {
  return (
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shrink-0">
        {/* Add icon component here */}
      </div>
      <div className="text-white">
        <div className="text-base font-medium">{label}</div>
        {value && <div className="text-base font-bold">{value}</div>}
        {children}
      </div>
    </div>
  );
};

const Input = ({ placeholder }) => {
  return (
    <div className="w-[570px] h-12 bg-white rounded-lg border border-black/10 overflow-hidden">
      <input
        type="text"
        placeholder={placeholder}
        className="w-full h-full px-4 text-sm font-semibold placeholder-[#888888]"
      />
    </div>
  );
};

export default Contact;
