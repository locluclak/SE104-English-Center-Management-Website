import { MainApiRequest } from '@/services/MainApiRequest';
import { Button, DatePicker, Form, Input, message, Modal, Popconfirm, Select, Space, Table } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import "./StaffList.scss";

const StaffList = () => {
    const [form] = Form.useForm();
    const [staffList, setStaffList] = useState<any[]>([]);

    const [openCreateStaffModal, setOpenCreateStaffModal] = useState(false);
    const [editingStaff, setEditingStaff] = useState<any | null>(null);

    const fetchStaffList = async () => {
        try {
            const res = await MainApiRequest.get('/staff/list');
            setStaffList(res.data);
        } catch (error) {
            console.error('Error fetching staff list:', error);
            message.error('Failed to fetch staff list. Please try again.');
        }
    };

    useEffect(() => {
        fetchStaffList();
    }, []);

    const onOpenCreateStaffModal = () => {
        setEditingStaff(null);
        form.setFieldsValue({});
        setOpenCreateStaffModal(true);
    }

    const onOKCreateStaff = async () => {
        try {
            const data = form.getFieldsValue();
            data.name = data.name || '';
            data.gender = data.gender || '';
            data.birth = data.birth ? data.birth.format('YYYY-MM-DD') : null;
            data.startDate = moment().format('YYYY-MM-DD');
            data.typeStaff = data.typeStaff || 'Nhân viên phục vụ';
            data.workHours = data.workHours || 8; // Mặc định là 8 giờ nếu không nhập
            //data.salary = data.minsalary * data.workHours; // Tính lương dựa trên giờ làm và lương cơ bản
            data.activestatus = true;
            data.roleid = 2;
            data.password = editingStaff ? editingStaff.password : "default123";

            console.log('Dữ liệu gửi:', data);

            if (editingStaff) {
                const {...rest } = data;
                await MainApiRequest.put(`/staff/${editingStaff.id}`, rest);
            } else {
                await MainApiRequest.post('/staff', data);
            }
            console.log(data);
            fetchStaffList();
            setOpenCreateStaffModal(false);
            form.resetFields();
            setEditingStaff(null);
        } catch (error) {
            console.error('Error creating/updating staff:', error);
            message.error('Failed to create staff. Please try again.');
        }
    }

    const onCancelCreateStaff = () => {
        setOpenCreateStaffModal(false);
        setEditingStaff(null);
        form.resetFields();
    };

    const onEditStaff = (staff:any) => {
        setEditingStaff(staff);
        form.setFieldsValue({
            name: staff.name || '',
            gender: staff.gender || '',
            birth: staff.birth ? moment(staff.birth, 'YYYY-MM-DD') : null,
            phone: staff.phone || '',
            typeStaff: staff.typeStaff || '',
            workHours: staff.workHours || 0,
            minsalary: staff.minsalary || 0,
            password: staff.password || '',
            startDate: staff.startDate ? moment(staff.startDate, 'YYYY-MM-DD') : null,
            address: staff.address || ''
        });
        setOpenCreateStaffModal(true);
    }

    const onDeleteStaff = async (id: number) => {
        try {
            await MainApiRequest.delete(`/staff/${id}`);
            fetchStaffList();
            //message.success('Xóa nhân viên thành công!');
        } catch (error) {
            console.error('Error deleting staff:', error);
            message.error('Failed to delete staff. Please try again.');
        }
    };

    return (
        <div className="container-fluid m-2">
            <h2 className='h2 header-custom'>DANH SÁCH NHÂN VIÊN</h2>
            <Button type='primary' onClick={onOpenCreateStaffModal}>
                Thêm nhân viên
            </Button>

            <Modal
                className='staff-modal'
                title={editingStaff ? "Chỉnh sửa" : "Thêm mới"}
                open={openCreateStaffModal}
                onOk={onOKCreateStaff}
                onCancel={onCancelCreateStaff}
            >
                <Form form={form} layout="vertical">
                    <div className="field-row">
                        <Form.Item
                            label="Tên nhân viên"
                            name="name"
                            rules={[{ required: true, message: "Please input name!" }]}
                        >
                            <Input type="text" />
                        </Form.Item>
                        <Form.Item
                            label="Giới tính"
                            name="gender"
                            rules={[{ required: true, message: "Please input gender!" }]}
                        >
                            <Select>
                                <Select.Option value="Nam">Nam</Select.Option>
                                <Select.Option value="Nữ">Nữ</Select.Option>
                                <Select.Option value="Khác">Khác</Select.Option>
                            </Select>
                        </Form.Item>
                    </div>
                    <div className="field-row">
                        <Form.Item
                            label="Ngày sinh"
                            name="birth"
                            rules={[{ required: true, message: "Please input birthday!" }]}
                        >
                            <DatePicker showTime />
                        </Form.Item>
                        <Form.Item
                            label="Số điện thoại"
                            name="phone"
                            rules={[{ required: true, message: "Please input phone!" }]}
                        >
                            <Input type="text" />
                        </Form.Item>
                    </div>
                    <div className="field-row">
                        <Form.Item
                            label="Loại nhân viên"
                            name="typeStaff"
                            rules={[{ required: true, message: "Please input type staff!" }]}
                        >
                            <Select>
                                <Select.Option value="Quản lý">Quản lý</Select.Option>
                                <Select.Option value="Nhân viên pha chế">Nhân viên pha chế</Select.Option>
                                <Select.Option value="Nhân viên phục vụ">Nhân viên phục vụ</Select.Option>
                                <Select.Option value="Thu ngân">Thu ngân</Select.Option>
                                <Select.Option value="Bảo vệ">Bảo vệ</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label="Số giờ làm việc"
                            name="workHours"
                            rules={[{ required: true, message: "Please input work hours!" }]}
                        >
                            <Input type="number" />
                        </Form.Item>
                    </div>
                    <div className="field-row">
                        <Form.Item
                            label="Lương cơ bản"
                            name="minsalary"
                            rules={[{ required: true, message: "Please input base salary!" }]}
                        >
                            <Input type="number" />
                        </Form.Item>
                        <Form.Item
                            label="Ngày bắt đầu"
                            name="startDate"
                            rules={[{ required: true, message: "Please input start date!" }]}
                        >
                            <DatePicker showTime/>
                        </Form.Item>
                    </div>
                        <Form.Item
                            label="Mật khẩu"
                            name="password"
                            rules={[{ required: true, message: "Please input password!" }]}
                        >
                            <Input.Password disabled={!!editingStaff} />
                        </Form.Item>
                    
                    <Form.Item
                        label="Địa chỉ"
                        name="address"
                        rules={[{ required: true, message: "Please input address!" }]}
                    >
                        <Input type="text" />
                    </Form.Item>
                </Form>
            </Modal>
            <Table
                dataSource={staffList}
                columns={[
                    { title: 'ID', dataIndex: 'id', key: 'id' },
                    { title: 'Tên nhân viên', dataIndex: 'name', key: 'name' },
                    { title: 'Giới tính', dataIndex: 'gender', key: 'gender' },
                    { title: 'Ngày sinh', dataIndex: 'birth', key: 'birth',                         
                        render: (birth: string) => (birth ? moment(birth).format('DD-MM-YYYY') : '-')
                    },
                                      
                    { title: 'Loại nhân viên', dataIndex: 'typeStaff', key: 'typeStaff' },
                    { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
                    { title: 'Địa chỉ', dataIndex: 'address', key: 'address' },
                    // { title: 'Lương cơ bản', dataIndex: 'minsalary', key: 'minsalary' },
                    { title: 'Giờ làm việc', dataIndex: 'workHours', key: 'workHours',
                        render: (workHours: number) => workHours + ' giờ',

                     },
                    { title: 'Lương', dataIndex: 'salary', key: 'salary',
                        // const formatCurrency = (value: number) =>
                        //     new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
                        //     .format(value)
                        //     .replace('₫', 'đ'); // Thay đổi ký hiệu để phù hợp với VNĐ
                        render: (salary: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(salary)
                     },
                    {
                        title: 'Ngày bắt đầu',
                        dataIndex: 'startDate',
                        key: 'startDate',
                        render: (startDate: string) => (startDate ? moment(startDate).format('DD-MM-YYYY HH:mm:ss') : '-'),
                    },
                    //{ title: 'Status', dataIndex: 'activestatus', key: 'activestatus' },
                    {
                        title: 'Hành động',
                        key: 'actions',
                        render: (_, record) => (
                            <Space size="middle">
                                <Button type="default" onClick={() => onEditStaff(record)}>
                                    <i className="fas fa-edit"></i>
                                </Button>
                                <Popconfirm
                                    title="Bạn có chắc chắn muốn xóa nhân viên này không?"
                                    onConfirm={() => onDeleteStaff(record.id)}
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

export default StaffList;
