import React, { useEffect, useState } from 'react';
import { Button, Form, Input, DatePicker, Modal, Table, Space, Popconfirm, message, Select } from 'antd';
import moment from 'moment';
import "./MaterialList.scss";
import { MainApiRequest } from '@/services/MainApiRequest';

const MaterialList = () => {
    const [form] = Form.useForm();
    const [materialList, setMaterialList] = useState<any[]>([]);
    const [openCreateMaterialModal, setOpenCreateMaterialModal] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState<any | null>(null);

    const fetchMaterialList = async () => {
        const res = await MainApiRequest.get('/material/list');
        setMaterialList(res.data);
    }

    useEffect(() => {
        fetchMaterialList();
    }, []);

    const onOpenCreateMaterialModal = (record: any = null) => {
        setEditingMaterial(record); // Gán record vào trạng thái đang chỉnh sửa
        if (record) {
            form.setFieldsValue({
                ...record,
                price: record.price.toFixed(0),
                importDate: moment(record.importDate), 
                expiryDate: moment(record.expiryDate), 
            });
        }
        setOpenCreateMaterialModal(true);
    };


    const onOKCreateMaterial = async () => {
        try {
            const data = form.getFieldsValue();
            if (data.importDate) {
                data.importDate = data.importDate.toISOString();
            } else {
                message.error('Vui lòng chọn ngày nhập!');
                return;
            }
            if (data.expiryDate) {
                data.expiryDate = data.expiryDate.toISOString();
            } else {
                message.error('Vui lòng chọn ngày hết hạn!');
                return;
            }

            if (editingMaterial) {
                const { id, ...rest } = data;
                await MainApiRequest.put(`/material/${editingMaterial.id}`, rest);
            } else {
                await MainApiRequest.post('/material', data);
            }

            fetchMaterialList();
            setOpenCreateMaterialModal(false);
            form.resetFields();
            message.success('Nguyên liệu đã được lưu thành công!');
            setEditingMaterial(null);

        } catch (error) {
            console.error('Lỗi khi tạo nguyên liệu:', error);
            message.error('Không thể tạo nguyên liệu. Vui lòng thử lại.');
        }
    }

    const onCancelCreateMaterial = () => {
        setOpenCreateMaterialModal(false);
        form.resetFields();
    };

    const onOpenEditMaterial = (record: any) => {
        setEditingMaterial(record);
        form.setFieldsValue({
            ...record,
            importDate: moment(record.importDate), 
            expiryDate: moment(record.expiryDate), 
        });
        setOpenCreateMaterialModal(true);
    }

    const onDeleteMaterial = async (id: number) => {
        try {
            await MainApiRequest.delete(`/material/${id}`);
            fetchMaterialList();
            message.success('Nguyên liệu đã được xóa thành công!');
        } catch (error) {
            console.error('Lỗi khi xóa nguyên liệu:', error);
            message.error('Không thể xóa nguyên liệu. Vui lòng thử lại.');
        }
    };

    return (
        <div className="container-fluid m-2">
            <h2 className='h2 header-custom'>DANH SÁCH NGUYÊN LIỆU</h2>
            <Button 
                type='primary' 
                onClick={() => onOpenCreateMaterialModal()}
            >
                Thêm mới nguyên liệu
            </Button>

            <Modal
                className='material-modal'
                title={editingMaterial ? "Chỉnh sửa" : "Thêm mới"}
                open={openCreateMaterialModal}
                onOk={() => onOKCreateMaterial()}
                onCancel = {() => onCancelCreateMaterial()}
            >
                <Form form={form} layout="vertical">
                        <Form.Item
                            label="Tên nguyên liệu"
                            name="name"
                            rules={[{ required: true, message: "Please input name!" }]}
                        >
                            <Input type="text" />
                        </Form.Item>
                    <div className="field-row">
                        <Form.Item
                            label="Số lượng nhập"
                            name="quantityImported"
                            rules={[{ required: true, message: "Please input quantity imported!" }]}
                        >
                            <Input type="number" />
                        </Form.Item>
                        <Form.Item
                            label="Số lượng tồn"
                            name="quantityStock"
                            rules={[{ required: true, message: "Please input quantity stock!" }]}
                        >
                            <Input type="number" />
                        </Form.Item>
                    </div>
                    <div className="field-row">
                        <Form.Item
                            label="Giá"
                            name="price"
                            rules={[{ required: true, message: "Please input price!" }]}
                        >   
                            <Input type="number" />
                        </Form.Item>
                        <Form.Item
                            label="Loại bảo quản"
                            name="storageType"
                            rules={[{ required: true, message: "Please input storage type!" }]}
                        >
                            <Select>
                                <Select.Option value="Cấp đông">Cấp đông</Select.Option>
                                <Select.Option value="Để ngoài">Để ngoài</Select.Option>
                            </Select>
                        </Form.Item>
                    </div>
                    <div className="field-row">
                        <Form.Item
                            label="Ngày nhập"
                            name="importDate"
                            rules={[{ required: true, message: "Please input import date!" }]}
                        >
                            <DatePicker showTime/>
                        </Form.Item>
                        <Form.Item
                            label="Ngày hết hạn"
                            name="expiryDate"
                            rules={[{ required: true, message: "Please input expiration date!" }]}
                        >
                            <DatePicker showTime/>
                        </Form.Item>
                    </div>
                </Form>
            </Modal>
            <Table
                dataSource={materialList}
                pagination={{
                    pageSize: 9, // Số lượng item trên mỗi trang
                    showSizeChanger: true, // Hiển thị tùy chọn thay đổi số item trên mỗi trang
                     // Các tùy chọn cho số item mỗi trang
                    }}
                columns={[
                    { title: 'ID', dataIndex: 'id', key: 'id' },
                    { title: 'Tên nguyên liệu', dataIndex: 'name', key: 'name' },
                    { title: 'Số lượng nhập', dataIndex: 'quantityImported', key: 'quantityImported' },
                    { title: 'Số lượng tồn', dataIndex: 'quantityStock', key: 'quantityStock' },
                    { title: 'Giá', dataIndex: 'price', key: 'price',
                        render: (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
                     },
                    { title: 'Loại bảo quản', dataIndex: 'storageType', key: 'storageType' },
                    { title: 'Ngày nhập', dataIndex: 'importDate', key: 'importDate',
                        render: (importDate: string) => moment(importDate).format('YYYY-MM-DD HH:mm:ss')
                     },
                    { title: 'Ngày hết hạn', dataIndex: 'expiryDate', key: 'expiryDate',
                        render: (expiryDate: string) => moment(expiryDate).format('YYYY-MM-DD HH:mm:ss'),
                     },
                    {
                        title: 'Hành động',
                        key: 'actions',
                        render: (_, record) => (
                            <Space size="middle">
                                <Button onClick={() => onOpenEditMaterial(record)}>
                                    <i className="fas fa-edit"></i>
                                </Button>
                                <Popconfirm
                                    title="Bạn có chắc chắn muốn xóa nguyên liệu này không?"
                                    onConfirm={() => onDeleteMaterial(record.id)}
                                    okText="Có"
                                    cancelText="Không"
                                >
                                    <Button danger>
                                        <i className="fas fa-trash"></i>
                                    </Button>
                                </Popconfirm>
                            </Space>
                        ),
                    },
                ]}
            />
        </div>
    );
};

export default MaterialList;
