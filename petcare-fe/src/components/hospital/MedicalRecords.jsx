import React from "react";
import { Link } from "react-router-dom";
import { ClipboardList, Plus, History } from "lucide-react";

const MedicalRecords = () => {
  const medicalRecords = [
    {
      id: 1,
      petName: "Lucky",
      petType: "Chó",
      breed: "Corgi",
      owner: "Nguyễn Văn A",
      lastVisit: "2024-03-15",
      records: [
        {
          date: "2024-03-15",
          symptoms: "Ho, sốt nhẹ",
          diagnosis: "Viêm đường hô hấp trên",
          treatment: "Kháng sinh, thuốc ho",
          nextVisit: "2024-03-22",
        },
        {
          date: "2024-02-28",
          symptoms: "Tiêm phòng định kỳ",
          diagnosis: "Khỏe mạnh",
          treatment: "Tiêm vắc-xin 6 bệnh",
          nextVisit: "2024-03-28",
        },
      ],
    },
    {
      id: 2,
      petName: "Mèo Mập",
      petType: "Mèo",
      breed: "Munchkin",
      owner: "Trần Thị B",
      lastVisit: "2024-03-14",
      records: [
        {
          date: "2024-03-14",
          symptoms: "Biếng ăn, nôn",
          diagnosis: "Rối loạn tiêu hóa",
          treatment: "Thuốc điều trị tiêu hóa, men tiêu hóa",
          nextVisit: "2024-03-21",
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <ClipboardList className="mr-2" /> Hồ Sơ Bệnh Án
          </h2>
          <Link to="" className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4 mr-2" /> Thêm Hồ Sơ Mới
          </Link>
        </div>
        <div className="space-y-6">
          {medicalRecords.map((record) => (
            <div key={record.id} className="border rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{record.petName}</h3>
                  <p className="text-gray-600">
                    {record.petType} - {record.breed}
                  </p>
                  <p className="text-gray-600">Chủ nuôi: {record.owner}</p>
                </div>
                <div className="text-sm text-gray-500">
                  Lần khám gần nhất: {record.lastVisit}
                </div>
              </div>
              <div className="space-y-4">
                {record.records.map((visit, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <History className="w-4 h-4 mr-2 text-blue-600" />
                      <span className="font-medium">{visit.date}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Triệu chứng:
                        </p>
                        <p className="text-sm text-gray-600">
                          {visit.symptoms}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Chẩn đoán:
                        </p>
                        <p className="text-sm text-gray-600">
                          {visit.diagnosis}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Điều trị:
                        </p>
                        <p className="text-sm text-gray-600">
                          {visit.treatment}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Tái khám:
                        </p>
                        <p className="text-sm text-gray-600">
                          {visit.nextVisit}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                  Thêm Lần Khám
                </button>
                <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Cập Nhật Hồ Sơ
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MedicalRecords;