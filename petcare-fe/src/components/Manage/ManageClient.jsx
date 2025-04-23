import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Switch, message } from 'antd';

const ManageClient = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    // Lấy danh sách users với role là USER khi component mount
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8080/api/users/role/USER');
            setUsers(response.data);
        } catch (error) {
            message.error('Failed to load users');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Xử lý thay đổi status
    const handleStatusChange = async (userId, checked) => {
        try {
            await axios.put(`http://localhost:8080/api/users/${userId}/status`, checked, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            setUsers(users.map(user =>
                user.userId === userId ? { ...user, isStatus: checked } : user
            ));
            message.success('Status updated successfully');
        } catch (error) {
            message.error('Failed to update status');
            console.error('Error updating status:', error.response?.data || error.message);
        }
    };

    // Định nghĩa columns cho table
    const columns = [
        {
            title: 'STT',
            key: 'index',
            render: (text, record, index) => index + 1, // Hiển thị số thứ tự bắt đầu từ 1
        },
        {
            title: 'Full Name',
            dataIndex: 'fullName',
            key: 'fullName',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Registration Date',
            dataIndex: 'registration_date',
            key: 'registration_date',
            render: (date) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Total Spent',
            dataIndex: 'totalSpent',
            key: 'totalSpent',
        },
        {
            title: 'Status',
            dataIndex: 'isStatus',
            key: 'isStatus',
            render: (status, record) => (
                <Switch
                    checked={status}
                    onChange={(checked) => handleStatusChange(record.userId, checked)}
                />
            ),
        },
        {
            title: 'Image',
            dataIndex: 'imageUrl',
            key: 'imageUrl',
            render: (url) => url && <img src={url} alt="user" style={{ width: '50px' }} />,
        },
    ];

    return (
        <div style={{ padding: '20px' }}>
            <h1 className="text-xl">Quản lý người dùng</h1>
            <Table
                columns={columns}
                dataSource={users}
                rowKey="userId"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />
        </div>
    );
};

export default ManageClient;