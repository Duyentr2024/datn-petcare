import React from 'react';

export function ContactInfo() {
    return (
        <div className="bg-orange-400 p-8 rounded-lg text-white">
            <h2 className="text-2xl font-semibold mb-6">Thông tin liên hệ</h2>

            <div className="space-y-2">
                <div className="flex gap-2">
                    <span className="bg-white text-orange-400 px-4 py-2 rounded-full">Mona.Media</span>
                    <span className="bg-white text-orange-400 px-4 py-2 rounded-full">Mona.Software</span>
                </div>

                <div className="space-y-4 mt-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-full">
                            <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                        </div>
                        <div>
                            <div className="font-medium">Điện thoại</div>
                            <div>0313728397</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-full">
                            <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <div className="font-medium">Email</div>
                            <div>info@themona.global</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-full">
                            <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </div>
                        <div>
                            <div className="font-medium">Hệ thống chi nhánh</div>
                            <div>Chi nhánh 1 | Chi nhánh 2</div>
                            <div className="text-sm">1073/23 Cách Mạng Tháng 8, P.7, Q.Tân Bình, TP.HCM</div>
                            <a href="#" className="text-sm underline">Đường dẫn google maps</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default ContactInfo;