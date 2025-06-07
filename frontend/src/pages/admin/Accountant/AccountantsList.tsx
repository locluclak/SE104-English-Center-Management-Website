import React, { useEffect, useState } from 'react';
import { Button, Form, Modal, Table, Space, Popconfirm, message } from 'antd';
import moment from 'moment';
import './AccountantsList.scss';
import { MainApiRequest } from '@/services/MainApiRequest';
import SearchInput from '@/components/SearchInput/SearchInput';
import FloatingLabelInput from '@/components/FloatingInput/FloatingLabelInput';

interface Accountant {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
  hire_day: string;
  password?: string;
}

const normalizeAccountants = (data: any[]): Accountant[] =>
  data.map((item: any) => ({
    id: item.ID,
    name: item.NAME,
    email: item.EMAIL,
    phone_number: item.PHONE_NUMBER || '',
    date_of_birth: item.DATE_OF_BIRTH,
    hire_day: item.HIRE_DAY,
  }));

const AccountantsList = () => {
  const [form] = Form.useForm();
  const [accountants, setAccountants] = useState<Accountant[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingAccountant, setEditingAccountant] = useState<Accountant | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  const fetchAccountants = async () => {
    try {
      const res = await MainApiRequest.get('/person/accountants');
      setAccountants(normalizeAccountants(res.data));
    } catch (error) {
      console.error('Failed to fetch accountants:', error);
      message.error('Failed to load accountants.');
    }
  };

  useEffect(() => {
    fetchAccountants();
  }, []);

  const onOKSubmit = async () => {
  try {
    const values = await form.validateFields();

    const basePayload = {
      name: values.name,
      email: values.email,
      phone_number: values.phone_number,
      date_of_birth: values.date_of_birth.format('YYYY-MM-DD'),
    };

    if (editingAccountant) {
      // Cập nhật thông tin
      await MainApiRequest.put(`/person/update/${editingAccountant.id}`, basePayload);

      // Reset mật khẩu nếu có nhập mới
      if (values.password && editingAccountant.email) {
        await MainApiRequest.post('/reset-password', {
          email: editingAccountant.email,
          newPassword: values.password,
        });
      }

      message.success('Cập nhật kế toán thành công!');
    } else {
      // Tạo mới kế toán
      const payload = {
        ...basePayload,
        hire_day: values.hire_day.format('YYYY-MM-DD'),
        staff_type: 'ACCOUNTANT',
        password: values.password,
      };

      await MainApiRequest.post('/allocate', payload);
      message.success('Thêm kế toán mới thành công!');
    }

    await fetchAccountants();
    setOpenModal(false);
    form.resetFields();
    setEditingAccountant(null);
  } catch (error: any) {
    console.error('Lỗi khi lưu kế toán:', error);

    if (error.response?.data?.error || error.response?.data?.message) {
      message.error(error.response.data.error || error.response.data.message);
    } else if (error.response?.status === 409) {
      message.error('Email đã tồn tại trong hệ thống!');
    } else {
      message.error('Không thể lưu kế toán. Vui lòng kiểm tra lại thông tin!');
    }
  }
};

  const onEdit = (record: Accountant) => {
    setEditingAccountant(record);
    form.setFieldsValue({
      ...record,
      date_of_birth: moment(record.date_of_birth),
    });
    setOpenModal(true);
  };

  const onDelete = async (id: number) => {
    try {
      await MainApiRequest.delete(`/person/delete/${id}`);
      fetchAccountants();
      message.success('Accountant deleted successfully!');
    } catch (error) {
      console.error('Failed to delete accountant:', error);
      message.error('Unable to delete accountant.');
    }
  };

  const handleSearch = (value: string) => {
    const keyword = value.trim().toLowerCase();
    setSearchKeyword(keyword);
    if (!keyword) {
      fetchAccountants();
      return;
    }
    const filtered = accountants.filter((acc) =>
      acc.name.toLowerCase().includes(keyword) ||
      acc.email.toLowerCase().includes(keyword)
    );
    setAccountants(filtered);
  };

  return (
    <div className="container-fluid m-2">
      <div className="sticky-header-wrapper">
        <h2 className="h2 header-custom">ACCOUNTANTS MANAGEMENT</h2>
        <div className="header-actions d-flex me-3 py-2 align-items-center justify-content-between">
          <div className="flex-grow-1 d-flex justify-content-center">
            <Form layout="inline" className="search-form d-flex">
              <SearchInput
                placeholder="Search accountant..."
                value={searchKeyword}
                onChange={(e) => handleSearch(e.target.value)}
                onSearch={() => handleSearch(searchKeyword)}
                allowClear
              />
            </Form>
          </div>
          <Button type="primary" icon={<i className="fas fa-plus"></i>} onClick={() => {
            setEditingAccountant(null);
            form.resetFields();
            setOpenModal(true);
          }} />
        </div>
      </div>

      <Modal
        className="accountants-modal"
        title={editingAccountant ? 'Edit Accountant' : 'Add New Accountant'}
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
          {!editingAccountant && (
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
        dataSource={accountants}
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
            render: (_, record: Accountant) => (
              <Space>
                <Button onClick={() => onEdit(record)}>
                  <i className="fas fa-edit"></i>
                </Button>
                <Popconfirm
                  title="Delete this accountant?"
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

export default AccountantsList;
