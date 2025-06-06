import { MainApiRequest } from '@/services/MainApiRequest';
import { Button, DatePicker, Form, Input, message, Modal, Popconfirm, Select, Space, Table, Tag } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import "./Promote.scss";

const Promote = () => {
    const [form] = Form.useForm();
    const [promoteList, setPromoteList] = useState<any[]>([]);
    const [couponList, setCouponList] = useState<any[]>([]);
    const [openCreatePromoteModal, setOpenCreatePromoteModal] = useState(false);
    const [openCreateCouponModal, setOpenCreateCouponModal] = useState(false);
    const [editPromote, setEditPromote] = useState<any>(null);
    const [editCoupon, setEditCoupon] = useState<any>(null);

    // Hàm random mã CouponCode
    const generateRandomCode = () => {
        const length = 5; // Random 15 ký tự
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let result = "";
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    const fetchPromoteList = async () => {
        const res = await MainApiRequest.get('/promote/list');
        setPromoteList(res.data);
    }

    const fetchCouponList = async () => {
        const res = await MainApiRequest.get('/promote/coupon/list');
        setCouponList(res.data);
    }

    useEffect(() => {
        fetchPromoteList();
        fetchCouponList();
    }, []);


    const onOpenCreatePromoteModal = (record: any = null) => {
        setEditPromote(record);
        if (record) {
            form.setFieldsValue({
                ...record,
                startAt: moment(record.startAt),
                endAt: moment(record.endAt),
            });
        }
        setOpenCreatePromoteModal(true);
    }
    

    const onOpenCreateCouponModal = (record: any = null) => {
        setEditCoupon(record);
        if (record) {
            form.setFieldsValue(record);
            form.setFieldsValue({ promoteId: record.promote.id });
        }
        setOpenCreateCouponModal(true);
    }

    const onOKCreatePromote = async () => {
        try {
            const data = form.getFieldsValue();
            if (data.startAt) {
                data.startAt = data.startAt.toISOString();
            } else {
                message.error("Start date is required!");
                return;
            }
            if (data.endAt) {
                data.endAt = data.endAt.toISOString();
            } else {
                message.error("End date is required!");
                return;
            }

            if (editPromote) {
                const { id, ...rest } = data;
                await MainApiRequest.put(`/promote/${editPromote.id}`, rest);
            } else {
                await MainApiRequest.post('/promote', data);
            }

            fetchPromoteList();
            setOpenCreatePromoteModal(false);
            form.resetFields();
            message.success("Promote saved successfully!");
            setEditPromote(null);
        
        } catch (error) {
            console.error('Error saving promote:', error);
            message.error('Failed to save promote. Please try again.');
        }
    }

    const onOKCreateCoupon = async () => {
        try {
            const data = form.getFieldsValue();
            const now = moment();
            const promote = promoteList.find(p => p.id === data.promoteId);
            if (promote && moment(promote.endAt).isBefore(now)) {
                data.status = 'Hết hạn';
            } else {
                data.status = 'Có hiệu lực';
            }
            if (editCoupon) {
                const { id, ...rest } = data;
                await MainApiRequest.put(`/promote/coupon/${editCoupon.id}`, rest);
            } else {
                await MainApiRequest.post('/promote/coupon', data);
            }
            fetchCouponList();
            setOpenCreateCouponModal(false);
            form.resetFields();
            message.success('Coupon saved successfully!');
            setEditCoupon(null);
        } catch (error) {
            console.error('Error saving coupon:', error);
            message.error('Failed to save coupon. Please try again  ');
        }
    }; 

    const onCancelCreatePromote = () => {
        setOpenCreatePromoteModal(false);
        form.resetFields();
    }

    const onCancelCreateCoupon = () => {
        setOpenCreateCouponModal(false);
        form.resetFields();
    }

    const onOpenEditPromote = (record: any) => {
        setEditPromote(record);
        form.setFieldsValue({
            ...record,
            startAt: moment(record.startAt),
            endAt: moment(record.endAt),
        });
        setOpenCreatePromoteModal(true);
    }

    const onOpenEditCoupon = (record: any) => {
        setEditCoupon(record);
        form.setFieldsValue(record);
        form.setFieldsValue({ promoteId: record.promote.id });
        setOpenCreateCouponModal(true);
    }

    const onDeletePromote = async (id: number) => {
        try {
            await MainApiRequest.delete(`/promote/${id}`);
            fetchPromoteList();
            fetchCouponList();
            message.success('Promote deleted successfully!');
        } catch (error) {
            console.error('Error deleting promote:', error);
            message.error('Failed to delete promote. Please try again.');
            }
    }

    const onDeleteCoupon = async (id: number) => {
        try {
            await MainApiRequest.delete(`/promote/coupon/${id}`);
            fetchCouponList();
            message.success('Coupon deleted successfully!');
        } catch (error) {
            console.error('Error deleting coupon:', error);
            message.error('Failed to delete coupon. Please try again.');
        }
    }

    const mappingColor = (status: string) => {
        switch (status) {
            case 'Có hiệu lực': return 'green';
            case 'Hết hạn': return 'red';
        }
    }

    return (
        <div className="container-fluid m-2">
            <h2 className='h2 header-custom'>PROMOTE & COUPON</h2>
            <Button
                type='primary'
                onClick={() => onOpenCreatePromoteModal()}
            >
                Thêm mới Khuyến mãi
            </Button>

            <Modal
                className='promote-modal'
                title={editPromote ? "Chỉnh sửa" : "Thêm mới"}
                open={openCreatePromoteModal}
                onOk={() => onOKCreatePromote()}
                onCancel={() => onCancelCreatePromote()}
            >
                <Form
                    form={form}
                    layout="vertical"
                >

                    <div className='field-row'>
                        <Form.Item
                            label='Tên khuyến mãi'
                            name='name'
                            rules={[{ required: true, message: 'Please input promote name!' }]}>
                            <Input type='text' />
                        </Form.Item>
                        <Form.Item
                            label='Loại'
                            name='promoteType'
                            rules={[{ required: true, message: 'Please select type!' }]}>
                            <Select >
                                <Select.Option value="Phần trăm">Phần trăm</Select.Option>
                                <Select.Option value="Cố định">Cố định</Select.Option>
                            </Select>
                        </Form.Item>
                    </div>
                    <div className='field-row'>
                        <Form.Item
                            label='Mô tả'
                            name='description'
                            rules={[{ required: true, message: 'Please input description!' }]}>
                            <Input type='text' />
                        </Form.Item>
                        <Form.Item
                            label='Giảm giá'
                            name='discount'
                            rules={[{ required: true, message: 'Please input discount!' }]}>
                            <Input type='number' />
                        </Form.Item>
                    </div>
                    <div className='field-row '>
                        <Form.Item
                            label='Ngày bắt đầu'
                            name='startAt'
                            rules={[{ required: true, message: 'Please select start date!' }]}>
                            <DatePicker showTime />
                        </Form.Item>
                        <Form.Item
                            label='Ngày kết thúc'
                            name='endAt'
                            rules={[{ required: true, message: 'Please select end date!' }]}>
                            <DatePicker showTime />
                        </Form.Item>
                    </div>
                </Form>
            </Modal>

            <Modal
                className='promote-modal'
                title={editCoupon ? "Chỉnh sửa" : "Thêm mới"}
                open={openCreateCouponModal}
                onOk={() => onOKCreateCoupon()}
                onCancel={() => onCancelCreateCoupon()}
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        label='Tên khuyến mãi'
                        name='promoteId'
                        rules={[{ required: true, message: 'Please input promote name!' }]}
                    >
                        <Select>
                            {promoteList.map((promote) => (
                                <Select.Option key={promote.id} value={promote.id}>
                                    {promote.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <div className='field-row'>
                        <Form.Item
                            label='Mã Coupon'
                            name='code'
                            rules={[{ required: true, message: 'Please input coupon code!' }]}
                        >
                            <Input
                                addonAfter={
                                    <Button
                                        type="link"
                                        className='random-button'
                                        onClick={() => {
                                            const randomCode = generateRandomCode();
                                            form.setFieldsValue({ code: randomCode });
                                        }}
                                    >
                                        Random
                                    </Button>
                                }
                            />
                        </Form.Item>
                    </div>
                </Form>
            </Modal>

            <h4 className='h4 mt-3'>Danh sách Khuyến mãi</h4>
            <Table
                dataSource={promoteList}
                pagination={{
                    pageSize: 5, // Số lượng item trên mỗi trang
                    showSizeChanger: true, // Hiển thị tùy chọn thay đổi số item trên mỗi trang
                     // Các tùy chọn cho số item mỗi trang
                    }
                }    
                            
                columns={[
                    { title: 'Tên khuyến mãi', dataIndex: 'name', key: 'name' },
                    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
                    { title: 'Giảm giá', dataIndex: 'discount', key: 'discount',
                        render: (discount: number, record) => {
                            return record.promoteType === 'Phần trăm' ? `${Math.round(discount)}%` : 
                            new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(discount));
                        }
                     },
                    { title: 'Loại', dataIndex: 'promoteType', key: 'promoteType'},
                    { title: 'Ngày bắt đầu', dataIndex: 'startAt', key: 'startAt', render: (startAt: string) => moment(startAt).format('YYYY-MM-DD HH:mm:ss') },
                    { title: 'Ngày kết thúc', dataIndex: 'endAt', key: 'endAt', render: (endAt: string) => moment(endAt).format('YYYY-MM-DD HH:mm:ss') },
                    {
                        title: 'Actions', key: 'actions', render: (text, record) => (
                            <Space size="middle">
                                <Button onClick={() => onOpenEditPromote(record)}>
                                    <i className="fas fa-edit"></i>
                                </Button>
                                <Popconfirm
                                    title="Bạn có chắc chắn muốn xóa khuyến mãi này?"
                                    onConfirm={() => onDeletePromote(record.id)}
                                    okText="Đồng ý"
                                    cancelText="Huỷ"
                                >
                                    <Button danger>
                                        <i className="fas fa-trash"></i>
                                    </Button>
                                </Popconfirm>
                            </Space>
                        )
                    },
                ]}
            />

            <h4 className='h4'>Coupon List</h4>
            <Button
                type='primary'
                onClick={() => onOpenCreateCouponModal()}
                style={{ marginLeft: 10 }}
            >
                Thêm mới Coupon
            </Button>
            <Table
                dataSource={couponList}
                columns={[
                    { title: 'ID', dataIndex: 'id', key: 'id' },
                    { title: 'Tên khuyến mãi', dataIndex: 'promote', key: 'promote', render: (promote) => promote?.name || 'N/A' },
                    { title: 'Trạng thái', dataIndex: 'status', key: 'status', 
                        render: (status: string) => {
                            return <Tag color={mappingColor(status)}>{status}</Tag>
                        }
                    },
                    { title: 'Mã Code', dataIndex: 'code', key: 'code' },
                    {
                        title: 'Actions', key: 'actions', render: (text, record) => (
                            <Space size="middle">
                                <Button onClick={() => onOpenEditCoupon(record)}>
                                    <i className="fas fa-edit"></i>
                                </Button>
                                <Popconfirm
                                    title="Bạn có chắc chắn muốn xóa coupon này?"
                                    onConfirm={() => onDeleteCoupon(record.id)}
                                    okText="Đồng ý"
                                    cancelText="Hủy"
                                >
                                    <Button danger>
                                        <i className="fas fa-trash"></i>
                                    </Button>
                                </Popconfirm>
                            </Space>
                        )
                    },
                ]}
            />
        </div>
    );
};
export default Promote;
