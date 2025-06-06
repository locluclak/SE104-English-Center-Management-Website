import React, { useEffect, useState } from 'react';
import { Button, Form, Input, DatePicker, Modal, Table, Space, Popconfirm, message, Select } from 'antd';
import moment, { Moment } from 'moment';
import './CoursesList.scss';
import { MainApiRequest } from '@/services/MainApiRequest';
import SearchInput from '@/components/SearchInput/SearchInput';

interface Course {
  id: number;
  name: string;
  description: string;
  teacherName: string;
  startDate: string;
  endDate: string;
  minStu: number;
  maxStu: number;
  price: number;
  status: string;
}

const formatDate = (dateString: string): string | null => {
  if (!dateString) return null;
  return moment(dateString).format('YYYY-MM-DD');
};

const normalizeCourses = (courses: any[]): Course[] =>
  courses.map((cls: any) => {
    const match = cls.DESCRIPTION?.match(/^\[Giáo viên:\s*(.*?)\]\s*/);
    const teacherName = match ? match[1] : 'Không rõ';
    const cleanDescription = cls.DESCRIPTION?.replace(/^\[Giáo viên:\s*.*?\]\s*/, '');

    return {
      id: cls.COURSE_ID,
      name: cls.NAME,
      description: cleanDescription,
      teacherName,
      startDate: cls.START_DATE,
      endDate: cls.END_DATE,
      minStu: cls.MIN_STU,
      maxStu: cls.MAX_STU,
      price: cls.PRICE,
      status: cls.STATUS || 'waiting',
    };
  });

const CoursesList = () => {
  const [form] = Form.useForm();
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [openCreateCoursesModal, setOpenCreateCoursesModal] = useState(false);
  const [editingCourses, setEditingCourses] = useState<Course | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  const fetchCoursesList = async () => {
    try {
      const res = await MainApiRequest.get('/course/all');
      const normalized = normalizeCourses(res.data);
      setCoursesList(normalized);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách khóa học:', error);
      message.error('Không thể lấy danh sách khóa học. Vui lòng thử lại.');
    }
  };

  useEffect(() => {
    fetchCoursesList();
  }, []);

  const onOKCreateCourses = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        name: values.name,
        teacherName: values.teacherName,
        description: values.description,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
        minStu: values.minStu,
        maxStu: values.maxStu,
        price: values.price,
        status: values.status,
      };

      if (editingCourses) {
        await MainApiRequest.put(`/course/update/${editingCourses.id}`, payload);
        message.success('Cập nhật khóa học thành công!');
      } else {
        await MainApiRequest.post('/course/create', payload);
        message.success('Tạo khóa học thành công!');
      }

      fetchCoursesList();
      setOpenCreateCoursesModal(false);
      form.resetFields();
    } catch (error) {
      console.error('Lỗi khi lưu khóa học:', error);
      message.error('Không thể lưu thông tin khóa học.');
    }
  };

  const onEditCourses = (record: Course) => {
    setEditingCourses(record);
    form.setFieldsValue({
      ...record,
      startDate: moment(record.startDate),
      endDate: moment(record.endDate),
    });
    setOpenCreateCoursesModal(true);
  };

  const onDeleteCourses = async (id: number) => {
    try {
      await MainApiRequest.delete(`/courses/${id}`);
      fetchCoursesList();
      message.success('Xóa khóa học thành công!');
    } catch (error) {
      console.error('Lỗi khi xóa:', error);
      message.error('Không thể xóa khóa học.');
    }
  };

  const handleSearch = (value: string) => {
    const keyword = value.trim().toLowerCase();
    setSearchKeyword(keyword);
    if (!keyword) {
      fetchCoursesList();
      return;
    }
    const filtered = coursesList.filter((course) => {
      return (
        (course.name || '').toLowerCase().includes(keyword) ||
        (course.teacherName || '').toLowerCase().includes(keyword)
      );
    });
    setCoursesList(filtered);
  };

  return (
    <div className="container-fluid m-2">
      <div className="sticky-header-wrapper">
        <h2 className="h2 header-custom">QUẢN LÝ KHÓA HỌC</h2>
        <div className="header-actions d-flex me-3 py-2 align-items-center justify-content-between">
          <div className="flex-grow-1 d-flex justify-content-center">
            <Form layout="inline" className="search-form d-flex">
              <SearchInput
                placeholder="Tìm kiếm khóa học..."
                value={searchKeyword}
                onChange={(e) => handleSearch(e.target.value)}
                onSearch={() => handleSearch(searchKeyword)}
                allowClear
              />
            </Form>
          </div>
          <Button type="primary" icon={<i className="fas fa-plus"></i>} onClick={() => {
            setEditingCourses(null);
            form.resetFields();
            setOpenCreateCoursesModal(true);
          }} />
        </div>
      </div>

      <Modal
        className="courses-modal"
        title={editingCourses ? 'Chỉnh sửa' : 'Thêm mới'}
        open={openCreateCoursesModal}
        onOk={onOKCreateCourses}
        onCancel={() => {
          setOpenCreateCoursesModal(false);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Tên khóa học" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Mô tả" name="description" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="Giáo viên" name="teacherName" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Ngày bắt đầu" name="startDate" rules={[{ required: true }]}>
            <DatePicker format="DD-MM-YYYY" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Ngày kết thúc" name="endDate" rules={[{ required: true }]}>
            <DatePicker format="DD-MM-YYYY" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Số học viên tối thiểu" name="minStu" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item label="Số học viên tối đa" name="maxStu" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item label="Học phí" name="price" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item label="Trạng thái" name="status" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="waiting">Chờ mở</Select.Option>
              <Select.Option value="active">Đang diễn ra</Select.Option>
              <Select.Option value="finished">Đã kết thúc</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Table
        dataSource={coursesList}
        rowKey="id"
        pagination={{ pageSize: 5, showSizeChanger: true }}
        columns={[
          { title: 'ID', dataIndex: 'id' },
          { title: 'Tên khóa học', dataIndex: 'name' },
          { title: 'Mô tả', dataIndex: 'description' },
          { title: 'Giáo viên', dataIndex: 'teacherName' },
          {
            title: 'Ngày bắt đầu',
            dataIndex: 'startDate',
            render: (text) => moment(text).format('DD-MM-YYYY'),
          },
          {
            title: 'Ngày kết thúc',
            dataIndex: 'endDate',
            render: (text) => moment(text).format('DD-MM-YYYY'),
          },
          { title: 'Tối thiểu', dataIndex: 'minStu' },
          { title: 'Tối đa', dataIndex: 'maxStu' },
          {
            title: 'Học phí',
            dataIndex: 'price',
            render: (text) =>
              new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(text).replace('₫', 'đ'),
          },
          { title: 'Trạng thái', dataIndex: 'status' },
          {
            title: 'Hành động',
            render: (_, record: Course) => (
              <Space>
                <Button onClick={() => onEditCourses(record)}>
                  <i className="fas fa-edit"></i>
                </Button>
                <Popconfirm
                  title="Xóa khóa học?"
                  onConfirm={() => onDeleteCourses(record.id)}
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

export default CoursesList;
