import React, { useEffect, useState } from 'react';
import { Button, Form, Modal, Table, Space, Popconfirm, message } from 'antd';
import moment from 'moment';
import './StudentList.scss';
import { MainApiRequest } from '@/services/MainApiRequest';
import SearchInput from '@/components/SearchInput/SearchInput';
import FloatingLabelInput from '@/components/FloatingInput/FloatingLabelInput';

interface Student {
  id: number;
  name: string;
  birthday: string;
  email: string;
  status: string;
  phone_number: string;
  date_of_birth: string;
  password?: string;
}

const formatDate = (dateString: string): string =>
  dateString ? moment(dateString).format('YYYY-MM-DD') : '';

const normalizeStudents = (students: any[]): Student[] =>
  students.map((s: any) => ({
    id: s.ID,
    name: s.NAME,
    birthday: formatDate(s.DATE_OF_BIRTH),
    email: s.EMAIL,
    status: 'active',
    phone_number: s.PHONE_NUMBER || '',
    date_of_birth: s.DATE_OF_BIRTH,
  }));

const StudentsList = () => {
  const [form] = Form.useForm();
  const [studentsList, setStudentsList] = useState<Student[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  const fetchStudentsList = async () => {
    try {
      const res = await MainApiRequest.get('/person/students');
      setStudentsList(normalizeStudents(res.data));
    } catch (error) {
      console.error('Lỗi khi lấy danh sách học viên:', error);
      message.error('Không thể lấy danh sách học viên.');
    }
  };

  useEffect(() => {
    fetchStudentsList();
  }, []);

  const onOKSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        name: values.name,
        email: values.email,
        phone_number: values.phone_number,
        date_of_birth: values.date_of_birth.format('YYYY-MM-DD'),
        password: values.password || undefined,
        role: 'STUDENT',
      };

      if (editingStudent) {
        await MainApiRequest.put(`/person/update/${editingStudent.id}`, payload);
        message.success('Cập nhật học viên thành công!');
      } else {
        await MainApiRequest.post('/auth/signup', {
          ...payload,
          password: payload.password || 'student123',
        });
        message.success('Tạo học viên mới thành công!');
      }

      fetchStudentsList();
      setOpenModal(false);
      form.resetFields();
      setEditingStudent(null);
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
      await MainApiRequest.delete(`/person/delete/${id}`);
      fetchStudentsList();
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
      fetchStudentsList();
      return;
    }
    const filtered = studentsList.filter((student) =>
      (student.name || '').toLowerCase().includes(keyword) ||
      (student.email || '').toLowerCase().includes(keyword)
    );
    setStudentsList(filtered);
  };

  return (
    <div className="container-fluid m-2">
      <div className="sticky-header-wrapper">
        <h2 className="h2 header-custom">STUDENTS MANAGEMENT</h2>
        <div className="header-actions d-flex me-3 py-2 align-items-center justify-content-between">
          <div className="flex-grow-1 d-flex justify-content-center">
            <Form layout="inline" className="search-form d-flex">
              <SearchInput
                placeholder="Search students..."
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
        title={editingStudent ? 'Edit Student' : 'Add New Student'}
        open={openModal}
        onOk={onOKSubmit}
        onCancel={() => {
          setOpenModal(false);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <FloatingLabelInput label="Name" name="name" required component="input" />
          <FloatingLabelInput label="Email" name="email" required component="input" type="email" />
          <FloatingLabelInput label="Phone Number" name="phone_number" required component="input" />
          <FloatingLabelInput
            label="Date of Birth"
            name="date_of_birth"
            required
            component="date"
            componentProps={{ format: 'DD-MM-YYYY' }}
          />
          <FloatingLabelInput
            label="Password"
            name="password"
            required
            component="input"
            type="password"
            componentProps={{ autoComplete: 'new-password' }}
          />
        </Form>
      </Modal>

      <Table
        dataSource={studentsList}
        rowKey="id"
        pagination={{ pageSize: 5, showSizeChanger: true }}
        columns={[
          { title: 'ID', dataIndex: 'id' },
          { title: 'Name', dataIndex: 'name' },
          { title: 'Email', dataIndex: 'email' },
          { title: 'Phone Number', dataIndex: 'phone_number' },
          {
            title: 'Date of Birth',
            dataIndex: 'birthday',
            render: (text) => moment(text).format('DD-MM-YYYY'),
          },
          { title: 'Status', dataIndex: 'status' },
          {
            title: 'Actions',
            render: (_, record: Student) => (
              <Space>
                <Button onClick={() => onEdit(record)}>
                  <i className="fas fa-edit"></i>
                </Button>
                <Popconfirm
                  title="Delete student?"
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
