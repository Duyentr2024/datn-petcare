import React from 'react';

export function ContactForm() {
    return (
        <div className="w-full max-w-xl">
            <h2 className="text-2xl font-semibold text-orange-400 mb-6">Gửi thắc mắc cho chúng tôi</h2>

            <form className="space-y-4">
                <input
                    type="text"
                    placeholder="Họ và tên"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                />

                <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                />

                <input
                    type="tel"
                    placeholder="Số điện thoại"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                />

                <input
                    type="text"
                    placeholder="Tên công ty"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                />

                <input
                    type="text"
                    placeholder="Mã số thuế"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                />

                <div className="flex items-center justify-between pt-4">
                    <p className="text-gray-600">Chúng tôi sẽ liên hệ tư vấn trong vòng 48h làm việc</p>
                    <button
                        type="submit"
                        className="bg-orange-400 text-white px-6 py-3 rounded-full hover:bg-orange-500 transition-colors flex items-center gap-2"
                    >
                        Gửi thông tin
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    );
}
export default ContactForm;