import React, { useEffect, useState } from 'react';
import { Button, Form, Input, DatePicker, Modal, Table, Space, Popconfirm, message, Select } from 'antd';
import moment from 'moment';
import './CoursesList.scss';
import { MainApiRequest } from '@/services/MainApiRequest';
import SearchInput from '@/components/SearchInput/SearchInput';

interface Student {
  id: number;
  name: string;
  birthday: string;
  email: string;
  phone_number: string;
  status: string;
  date_of_birth: string;
}

const formatDate = (dateString: string): string | null => {
  if (!dateString) return null;
  return moment(dateString).format('YYYY-MM-DD');
};

const normalizeStudents = (students: any[]): Student[] =>
  students.map((s: any) => ({
    id: s.ID,
    name: s.NAME,
    birthday: formatDate(s.DATE_OF_BIRTH),
    email: s.EMAIL,
    status: s.STATUS,
    phone_number: s.PHONE_NUMBER || '',
    date_of_birth: s.DATE_OF_BIRTH,
  }));

const StudentsList = () => {
  const [form] = Form.useForm();
  const [studentsList, setStudentsList] = useState<Student[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  const fetchStudents = async () => {
    try {
      const res = await MainApiRequest.get('/students/all');
      setStudentsList(normalizeStudents(res.data));
    } catch (error) {
      console.error('Lỗi khi lấy danh sách học viên:', error);
      message.error('Không thể lấy danh sách học viên.');
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const onOK = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        name: values.name,
        email: values.email,
        phone_number: values.phone_number,
        date_of_birth: values.date_of_birth.format('YYYY-MM-DD'),
        status: values.status,
      };

      if (editingStudent) {
        await MainApiRequest.put(`/students/update/${editingStudent.id}`, payload);
        message.success('Cập nhật học viên thành công!');
      } else {
        await MainApiRequest.post('/students/create', payload);
        message.success('Thêm học viên thành công!');
      }

      fetchStudents();
      setOpenModal(false);
      form.resetFields();
    } catch (error) {
      console.error('Lỗi khi lưu học viên:', error);
      message.error('Không thể lưu học viên.');
    }
  };

  const onEdit = (record: Student) => {
    setEditingStudent(record);
    form.setFieldsValue({
      ...record,
      date_of_birth: moment(record.date_of_birth),
    });
    setOpenModal(true);
  };

  const onDelete = async (id: number) => {
    try {
      await MainApiRequest.delete(`/students/${id}`);
      fetchStudents();
      message.success('Xóa học viên thành công!');
    } catch (error) {
      console.error('Lỗi khi xóa học viên:', error);
      message.error('Không thể xóa học viên.');
    }
  };

  const handleSearch = (value: string) => {
    const keyword = value.trim().toLowerCase();
    setSearchKeyword(keyword);

    if (!keyword) {
      fetchStudents();
      return;
    }

    const filtered = studentsList.filter(student =>
      (student.name || '').toLowerCase().includes(keyword) ||
      (student.email || '').toLowerCase().includes(keyword)
    );

    setStudentsList(filtered);
  };

  return (
    <div className="container-fluid m-2">
      <div className="sticky-header-wrapper">
        <h2 className="h2 header-custom">QUẢN LÝ HỌC VIÊN</h2>
        <div className="header-actions d-flex me-3 py-2 align-items-center justify-content-between">
          <div className="flex-grow-1 d-flex justify-content-center">
            <Form layout="inline" className="search-form d-flex">
              <SearchInput
                placeholder="Tìm kiếm học viên..."
                value={searchKeyword}
                onChange={(e) => handleSearch(e.target.value)}
                onSearch={() => handleSearch(searchKeyword)}
                allowClear
              />
            </Form>
          </div>
          <Button type="primary" icon={<i className="fas fa-plus"></i>} onClick={() => {
            setEditingStudent(null);
            form.resetFields();
            setOpenModal(true);
          }} />
        </div>
      </div>

      <Modal
        className="students-modal"
        title={editingStudent ? 'Chỉnh sửa' : 'Thêm mới'}
        open={openModal}
        onOk={onOK}
        onCancel={() => {
          setOpenModal(false);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Tên học viên" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Số điện thoại" name="phone_number" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Ngày sinh" name="date_of_birth" rules={[{ required: true }]}>
            <DatePicker format="DD-MM-YYYY" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Trạng thái" name="status" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="active">Đang học</Select.Option>
              <Select.Option value="inactive">Nghỉ</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Table
        dataSource={studentsList}
        rowKey="id"
        pagination={{ pageSize: 5, showSizeChanger: true }}
        columns={[
          { title: 'ID', dataIndex: 'id' },
          { title: 'Tên', dataIndex: 'name' },
          { title: 'Email', dataIndex: 'email' },
          { title: 'SĐT', dataIndex: 'phone_number' },
          {
            title: 'Ngày sinh',
            dataIndex: 'birthday',
            render: (text) => moment(text).format('DD-MM-YYYY'),
          },
          { title: 'Trạng thái', dataIndex: 'status' },
          {
            title: 'Hành động',
            render: (_, record: Student) => (
              <Space>
                <Button onClick={() => onEdit(record)}>
                  <i className="fas fa-edit"></i>
                </Button>
                <Popconfirm
                  title="Xóa học viên?"
                  onConfirm={() => onDelete(record.id)}
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

export default StudentsList;
