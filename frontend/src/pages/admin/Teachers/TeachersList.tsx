import React, { useEffect, useState } from 'react';
import { Button, Form, Modal, Table, Space, Popconfirm, message } from 'antd';
import moment from 'moment';
import './TeachersList.scss';
import { MainApiRequest } from '@/services/MainApiRequest';
import SearchInput from '@/components/SearchInput/SearchInput';
import FloatingLabelInput from '@/components/FloatingInput/FloatingLabelInput';

interface Teacher {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
  hire_day: string;
  password?: string;
}

const formatDate = (dateString: string): string =>
  dateString ? moment(dateString).format('YYYY-MM-DD') : '';

const normalizeTeachers = (teachers: any[]): Teacher[] =>
  teachers.map((t: any) => ({
    id: t.ID,
    name: t.NAME,
    email: t.EMAIL,
    phone_number: t.PHONE_NUMBER || '',
    date_of_birth: t.DATE_OF_BIRTH,
    hire_day: t.HIRE_DAY,
  }));

const TeachersList = () => {
  const [form] = Form.useForm();
  const [TeachersList, setTeachersList] = useState<Teacher[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  const fetchTeachers = async () => {
    try {
      const res = await MainApiRequest.get('/person/teachers');
      setTeachersList(normalizeTeachers(res.data));
    } catch (error) {
      console.error('Lỗi khi lấy danh sách giáo viên:', error);
      message.error('Không thể lấy danh sách giáo viên.');
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const onOKSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload: any = {
        name: values.name,
        email: values.email,
        phone_number: values.phone_number,
        date_of_birth: values.date_of_birth.format('YYYY-MM-DD'),
        password: values.password,
      };

      if (editingTeacher) {
        await MainApiRequest.put(`/person/update/${editingTeacher.id}`, payload);
        message.success('Cập nhật giáo viên thành công!');
      } else {
        await MainApiRequest.post('/person/allocate', {
          ...payload,
          hire_day: values.hire_day.format('YYYY-MM-DD'),
          role: 'TEACHER',
        });
        message.success('Tạo giáo viên mới thành công!');
      }

      fetchTeachers();
      setOpenModal(false);
      form.resetFields();
      setEditingTeacher(null);
    } catch (error) {
      console.error('Lỗi khi lưu giáo viên:', error);
      message.error('Không thể lưu giáo viên.');
    }
  };

  const onEdit = (record: Teacher) => {
    setEditingTeacher(record);
    form.setFieldsValue({
      ...record,
      date_of_birth: moment(record.date_of_birth),
    });
    setOpenModal(true);
  };

  const onDelete = async (id: number) => {
    try {
      await MainApiRequest.delete(`/person/delete/${id}`);
      fetchTeachers();
      message.success('Xóa giáo viên thành công!');
    } catch (error) {
      console.error('Lỗi khi xóa giáo viên:', error);
      message.error('Không thể xóa giáo viên.');
    }
  };

  const handleSearch = (value: string) => {
    const keyword = value.trim().toLowerCase();
    setSearchKeyword(keyword);
    if (!keyword) {
      fetchTeachers();
      return;
    }
    const filtered = TeachersList.filter((teacher) =>
      (teacher.name || '').toLowerCase().includes(keyword) ||
      (teacher.email || '').toLowerCase().includes(keyword)
    );
    setTeachersList(filtered);
  };

  return (
    <div className="container-fluid m-2">
      <div className="sticky-header-wrapper">
        <h2 className="h2 header-custom">QUẢN LÝ GIÁO VIÊN</h2>
        <div className="header-actions d-flex me-3 py-2 align-items-center justify-content-between">
          <div className="flex-grow-1 d-flex justify-content-center">
            <Form layout="inline" className="search-form d-flex">
              <SearchInput
                placeholder="Search teacher..."
                value={searchKeyword}
                onChange={(e) => handleSearch(e.target.value)}
                onSearch={() => handleSearch(searchKeyword)}
                allowClear
              />
            </Form>
          </div>
          <Button type="primary" icon={<i className="fas fa-plus"></i>} onClick={() => {
            setEditingTeacher(null);
            form.resetFields();
            setOpenModal(true);
          }} />
        </div>
      </div>

      <Modal
        className="teachers-modal"
        title={editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
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
          {!editingTeacher && (
            <FloatingLabelInput
              label="Hire Date"
              name="hire_day"
              required
              component="date"
              componentProps={{ format: 'DD-MM-YYYY' }}
            />
          )}
          <FloatingLabelInput
            label="Password"
            name="password"
            required
            component="input"
            type="password"
          />
        </Form>
      </Modal>

      <Table
        dataSource={TeachersList}
        rowKey="id"
        pagination={{ pageSize: 5, showSizeChanger: true }}
        columns={[
          { title: 'ID', dataIndex: 'id' },
          { title: 'Name', dataIndex: 'name' },
          { title: 'Email', dataIndex: 'email' },
          { title: 'Phone Number', dataIndex: 'phone_number' },
          {
            title: 'Date of Birth',
            dataIndex: 'date_of_birth',
            render: (text) => moment(text).format('DD-MM-YYYY'),
          },
          {
            title: 'Hire Date',
            dataIndex: 'hire_day',
            render: (text) => moment(text).format('DD-MM-YYYY'),
          },
          {
            title: 'Actions',
            render: (_, record: Teacher) => (
              <Space>
                <Button onClick={() => onEdit(record)}>
                  <i className="fas fa-edit"></i>
                </Button>
                <Popconfirm
                  title="Delete teacher?"
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

export default TeachersList;
