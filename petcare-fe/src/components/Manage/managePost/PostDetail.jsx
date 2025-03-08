import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const PostDetail = () => {
    const [post, setPost] = useState(null);
    const [editing, setEditing] = useState(null);
    const [newData, setNewData] = useState({ title: "", description: "" }); // Thay đổi newData thành object
    const [openSections, setOpenSections] = useState({});
    const [error, setError] = useState(null);

    const { id } = useParams();
    const API_URL = `https://fir-eed33-default-rtdb.asia-southeast1.firebasedatabase.app/posts/${id}.json`;

    useEffect(() => {
        fetch(API_URL)
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Không tìm thấy dữ liệu");
                }
                return res.json();
            })
            .then((data) => {
                if (data === null) {
                    setError("Không có thông tin cho ID này");
                } else {
                    setPost(data);
                    setError(null);
                }
            })
            .catch((err) => {
                setError(err.message);
                console.error(err);
            });
    }, [id]);

    if (!post && !error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-lg text-gray-500 animate-pulse">Đang tải...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-lg text-red-500 font-semibold">{error}</p>
            </div>
        );
    }

    if (!post.details) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-lg text-yellow-600 font-semibold">Không có chi tiết bài viết</p>
            </div>
        );
    }

    const { benefits = [], process = [], tips = [], who_should_try = "" } = post.details;

    const toggleSection = (section) => {
        setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
    };

    const handleEdit = (section, index) => {
        setEditing({ section, index });
        if (section === "title") {
            setNewData({ title: post.title, description: "" });
        } else if (section === "benefits") {
            setNewData({
                title: post.details.benefits[index].title,
                description: post.details.benefits[index].description,
            });
        } else if (section === "tips" || section === "who_should_try") {
            setNewData({ title: "", description: post.details[section][index] || post.details[section] });
        } else {
            setNewData({
                title: post.details[section][index].title,
                description: post.details[section][index].description,
            });
        }
    };

    const handleSave = async () => {
        if (!editing) return;
        const { section, index } = editing;
        const updatedPost = { ...post };

        if (section === "title") {
            updatedPost.title = newData.title;
        } else if (section === "tips") {
            updatedPost.details.tips[index] = newData.description;
        } else if (section === "who_should_try") {
            updatedPost.details.who_should_try = newData.description;
        } else {
            updatedPost.details[section][index].title = newData.title;
            updatedPost.details[section][index].description = newData.description;
        }

        try {
            await fetch(API_URL, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedPost),
            });
            setPost(updatedPost);
            setEditing(null);
            setNewData({ title: "", description: "" });
        } catch (error) {
            console.error("Lỗi khi cập nhật dữ liệu:", error);
        }
    };

    const handleDelete = async (section, index) => {
        const updatedPost = { ...post };
        updatedPost.details[section].splice(index, 1);

        try {
            await fetch(API_URL, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedPost),
            });
            setPost(updatedPost);
        } catch (error) {
            console.error("Lỗi khi xóa dữ liệu:", error);
        }
    };

    const handleAdd = async (section) => {
        const updatedPost = { ...post };
        if (section === "benefits") {
            updatedPost.details.benefits = updatedPost.details.benefits || [];
            updatedPost.details.benefits.push({ title: "Lợi ích mới", description: "Mô tả mới" });
        } else if (section === "process") {
            updatedPost.details.process = updatedPost.details.process || [];
            updatedPost.details.process.push({
                step: updatedPost.details.process.length + 1,
                title: "Bước mới",
                description: "Mô tả mới",
            });
        } else if (section === "tips") {
            updatedPost.details.tips = updatedPost.details.tips || [];
            updatedPost.details.tips.push("Mẹo mới");
        }

        try {
            await fetch(API_URL, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedPost),
            });
            setPost(updatedPost);
        } catch (error) {
            console.error("Lỗi khi thêm dữ liệu:", error);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            <div className="bg-white rounded-xl shadow-2xl p-6">
                <div className="flex items-center justify-center mb-6">
                    {editing?.section === "title" ? (
                        <div className="flex items-center space-x-2 w-full max-w-xl">
                            <input
                                type="text"
                                className="flex-1 text-4xl font-bold text-gray-800 p-2 border rounded-md focus:ring-2 focus:ring-blue-300 text-center"
                                value={newData.title}
                                onChange={(e) => setNewData({ ...newData, title: e.target.value })}
                            />
                            <button
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                onClick={handleSave}
                            >
                                Lưu
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-4">
                            <h1 className="text-4xl font-bold text-gray-800 text-center">{post.title}</h1>
                            <button
                                className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors"
                                onClick={() => handleEdit("title")}
                            >
                                Sửa
                            </button>
                        </div>
                    )}
                </div>
                <p className="text-gray-600 text-center italic mb-6">{post.summary}</p>

                {/* Lợi ích */}
                <AccordionSection
                    title="🎯 Lợi ích khi tắm spa"
                    isOpen={openSections["benefits"]}
                    onToggle={() => toggleSection("benefits")}
                    onAdd={() => handleAdd("benefits")}
                >
                    <table className="w-full border-collapse">
                        <thead>
                        <tr className="bg-blue-600 text-white">
                            <th className="p-4 text-left rounded-tl-lg">Tiêu đề</th>
                            <th className="p-4 text-left">Mô tả</th>
                            <th className="p-4 text-center rounded-tr-lg">Hành động</th>
                        </tr>
                        </thead>
                        <tbody>
                        {benefits.length > 0 ? (
                            benefits.map((item, index) => (
                                <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-medium text-gray-800">
                                        {editing?.section === "benefits" && editing?.index === index ? (
                                            <input
                                                type="text"
                                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-300"
                                                value={newData.title}
                                                onChange={(e) =>
                                                    setNewData({ ...newData, title: e.target.value })
                                                }
                                            />
                                        ) : (
                                            item.title
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {editing?.section === "benefits" && editing?.index === index ? (
                                            <input
                                                type="text"
                                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-300"
                                                value={newData.description}
                                                onChange={(e) =>
                                                    setNewData({ ...newData, description: e.target.value })
                                                }
                                            />
                                        ) : (
                                            item.description
                                        )}
                                    </td>
                                    <td className="p-4 text-center space-x-2">
                                        <ActionButtons
                                            isEditing={
                                                editing?.section === "benefits" && editing?.index === index
                                            }
                                            onEdit={() => handleEdit("benefits", index)}
                                            onSave={handleSave}
                                            onDelete={() => handleDelete("benefits", index)}
                                        />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="p-4 text-center text-gray-500">
                                    Không có lợi ích nào
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </AccordionSection>

                {/* Quy trình */}
                <AccordionSection
                    title="📌 Quy trình tắm spa"
                    isOpen={openSections["process"]}
                    onToggle={() => toggleSection("process")}
                    onAdd={() => handleAdd("process")}
                >
                    <table className="w-full border-collapse">
                        <thead>
                        <tr className="bg-blue-600 text-white">
                            <th className="p-4 text-left rounded-tl-lg">Bước</th>
                            <th className="p-4 text-left">Tiêu đề</th>
                            <th className="p-4 text-left">Mô tả</th>
                            <th className="p-4 text-center rounded-tr-lg">Hành động</th>
                        </tr>
                        </thead>
                        <tbody>
                        {process.length > 0 ? (
                            process.map((item, index) => (
                                <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-bold text-center text-blue-600">{item.step}</td>
                                    <td className="p-4 font-medium text-gray-800">{item.title}</td>
                                    <td className="p-4">
                                        {editing?.section === "process" && editing?.index === index ? (
                                            <input
                                                type="text"
                                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-300"
                                                value={newData.description}
                                                onChange={(e) =>
                                                    setNewData({ ...newData, description: e.target.value })
                                                }
                                            />
                                        ) : (
                                            item.description
                                        )}
                                    </td>
                                    <td className="p-4 text-center space-x-2">
                                        <ActionButtons
                                            isEditing={
                                                editing?.section === "process" && editing?.index === index
                                            }
                                            onEdit={() => handleEdit("process", index)}
                                            onSave={handleSave}
                                            onDelete={() => handleDelete("process", index)}
                                        />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="p-4 text-center text-gray-500">
                                    Không có quy trình nào
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </AccordionSection>

                {/* Ai nên thử */}
                <AccordionSection
                    title="🐾 Ai nên thử dịch vụ này?"
                    isOpen={openSections["who_should_try"]}
                    onToggle={() => toggleSection("who_should_try")}
                >
                    <div className="bg-gray-50 p-4 rounded-lg">
                        {editing?.section === "who_should_try" ? (
                            <div className="space-y-3">
                                <textarea
                                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-300"
                                    value={newData.description}
                                    onChange={(e) => setNewData({ ...newData, description: e.target.value })}
                                    rows="4"
                                />
                                <button
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                    onClick={handleSave}
                                >
                                    Lưu
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-gray-700">{who_should_try || "Chưa có thông tin"}</p>
                                <button
                                    className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors"
                                    onClick={() => handleEdit("who_should_try")}
                                >
                                    Sửa
                                </button>
                            </div>
                        )}
                    </div>
                </AccordionSection>

                {/* Mẹo */}
                <AccordionSection
                    title="💡 Mẹo chăm sóc thú cưng"
                    isOpen={openSections["tips"]}
                    onToggle={() => toggleSection("tips")}
                    onAdd={() => handleAdd("tips")}
                >
                    <ul className="space-y-3">
                        {tips.length > 0 ? (
                            tips.map((tip, index) => (
                                <li
                                    key={index}
                                    className="flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow-sm hover:bg-gray-100 transition-colors"
                                >
                                    {editing?.section === "tips" && editing?.index === index ? (
                                        <input
                                            type="text"
                                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-300"
                                            value={newData.description}
                                            onChange={(e) =>
                                                setNewData({ ...newData, description: e.target.value })
                                            }
                                        />
                                    ) : (
                                        <span className="text-gray-700">{tip}</span>
                                    )}
                                    <div className="ml-4 space-x-2">
                                        <ActionButtons
                                            isEditing={editing?.section === "tips" && editing?.index === index}
                                            onEdit={() => handleEdit("tips", index)}
                                            onSave={handleSave}
                                            onDelete={() => handleDelete("tips", index)}
                                        />
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="p-4 text-center text-gray-500">Không có mẹo nào</li>
                        )}
                    </ul>
                </AccordionSection>
            </div>
        </div>
    );
};

// Component AccordionSection
const AccordionSection = ({ title, isOpen, onToggle, onAdd, children }) => (
    <div className="mt-6">
        <div
            className="flex items-center justify-between p-4 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
            onClick={onToggle}
        >
            <h2 className="text-2xl font-semibold text-blue-700">{title}</h2>
            <div className="flex items-center space-x-4">
                {onAdd && (
                    <button
                        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors flex items-center"
                        onClick={(e) => {
                            e.stopPropagation();
                            onAdd();
                        }}
                    >
                        <span className="mr-2">+</span> Thêm
                    </button>
                )}
                <span className="text-blue-700 text-xl">{isOpen ? "▲" : "▼"}</span>
            </div>
        </div>
        {isOpen && <div className="mt-4">{children}</div>}
    </div>
);

// Component ActionButtons
const ActionButtons = ({ isEditing, onEdit, onSave, onDelete }) =>
    isEditing ? (
        <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            onClick={onSave}
        >
            Lưu
        </button>
    ) : (
        <div className="space-x-2">
            <button
                className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors"
                onClick={onEdit}
            >
                Sửa
            </button>
            <button
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                onClick={onDelete}
            >
                Xóa
            </button>
        </div>
    );

export default PostDetail;