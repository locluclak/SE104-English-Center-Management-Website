import { MainApiRequest } from '@/services/MainApiRequest';
import { Button, Form, Input, message, Popconfirm, Space, Table, Tag } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import './OrderList.scss';

export const OrderList = () =>{
  const [form] = Form.useForm();
  const [orderList, setOrderList] = useState<any[]>([]);
  const [originalOrderList, setOriginalOrderList] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [customerList, setCustomerList] = useState<any[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  

  const fetchOrderList = async () => {
    const res = await MainApiRequest.get('/order/list');
      setOrderList(res.data);
      setOriginalOrderList(res.data);
  };

  const fetchStaffList = async () => {
    const res = await MainApiRequest.get('/staff/list');
    setStaffList(res.data);
  }

  const fetchCustomerList = async () => {
    const res = await MainApiRequest.get('/customer/list');
    setCustomerList(res.data);
  }

  useEffect(() => {
    fetchOrderList();
    fetchStaffList();
    fetchCustomerList();
  }, []);
 
  const data = {
    
  }


  const handleSearchKeyword = () => {
    if (searchKeyword === '') {
      setOrderList(originalOrderList);
    } else {
      const filteredList = originalOrderList.filter((order) => {
        return (
          order.id.toString().includes(searchKeyword) ||
          order.phone.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          order.staffName.toLowerCase().includes(searchKeyword.toLowerCase())
        );
      });
      setOrderList(filteredList);
    }
  };

  const handleExportInvoice = (id: number) => {
    const order = orderList.find((order) => order.id === id);
    if (order) {
      const invoiceData= {
        id: order.id,
        serviceType: order.serviceType,
        totalPrice: order.totalPrice,
        orderDate: moment(order.orderDate).format('DD-MM-YYYY HH:mm:ss'),
        staffName: order.staffName,
        status: order.status
      }
      console.log('Invoice:', invoiceData);
      message.success(`Xuất hóa đơn cho đơn hàng ${order.id} thành công.`);
    } else {
      message.error('Không thể xuất hóa đơn. Đơn hàng không tồn tại.');
    }
  };

  const handleExportOrderList = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      orderList.map((order) => ({
        id: order.id,
        phone: order.phone,
        serviceType: order.serviceType,
        totalPrice: order.totalPrice,
        orderDate: moment(order.orderDate).format('DD-MM-YYYY HH:mm:ss'),
        staffName: order.staffName,
        status: order.status,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh Sách Đơn Hàng');
    XLSX.writeFile(workbook, 'DanhSachDonHang.xlsx');
    message.success('Xuất danh sách đơn hàng thành công.');
  };

  // const mappingColor = (status: string) => {
  //   switch (status) {
  //     case 'Đang chuẩn bị': return 'purple';
  //     case 'Hoàn thành': return 'green';
  //     case 'Đã huỷ': return 'red';
  //     default: return 'black';
  //   }
  // }

  const onConfirmOrder = async (record: any) => {
    const id = record.id;
    const res = await MainApiRequest.put(`/order/complete/${id}`, { status: 'Đang chuẩn bị' });
    if (res.status === 200) {
      message.success(`Xác nhận đơn hàng ${id} thành công.`);
      fetchOrderList();
    } else {
      message.error(`Xác nhận đơn hàng ${id} thất bại.`);
    }
  };
  
  const onCancelOrder = async (record: any) => {
    const id = record.id;
    const res = await MainApiRequest.put(`/order/cancel/${id}`, { status: 'Đã huỷ' });
    if (res.status === 200) {
      message.success(`Hủy đơn hàng ${id} thành công.`);
      fetchOrderList();
    } else {
      message.error(`Hủy đơn hàng ${id} thất bại.`);
    }
  }


  return (
    <div className="container-fluid m-2">
      <h2 className='h2 header-custom'>DANH SÁCH ĐƠN HÀNG</h2>
      
      {/* Search and Export Buttons */}
      <div className="d-flex justify-content-between mb-3">
        <Button type="primary" onClick={handleExportOrderList}>
          Xuất danh sách
        </Button>
        <Form
          layout='inline'
          className='d-flex'
        >
          <Form.Item label='Tìm kiếm (Số điện thoại, Mã đơn)' className='d-flex flex-1 mt-2 #2F4156'>
        <Input placeholder='Search Keyword' value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
          </Form.Item>
          <Form.Item>
        <Button type='primary' onClick={handleSearchKeyword}>Tìm kiếm</Button>
          </Form.Item>
        </Form>
      </div>
      <Table
        dataSource={orderList}
        rowKey= "id"
        showSorterTooltip={{ target: 'sorter-icon' }}
        columns={[
          {
            sorter: (a,b) => a.id - b.id,
            title: 'Mã đơn', dataIndex: 'id', key: 'id',
          },
          {
            sorter: (a, b) => (a.phone || '').localeCompare(b.phone || ''),
            title: 'Số điện thoại', dataIndex: 'phone', key: 'phone',
          },
          {
            sorter: (a, b) => (a.serviceType || '').localeCompare(b.serviceType || ''),
            title: 'Loại phục vụ', dataIndex: 'serviceType', key: 'serviceType'
          },
          {
            sorter: (a, b) => (a.totalPrice || 0) - (b.totalPrice || 0),
            title: 'Tổng tiền', dataIndex: 'totalPrice', key: 'totalPrice'
          },
          {
            sorter: (a, b) => new Date(a.orderdate || 0).getTime() - new Date(b.orderdate || 0).getTime(),
            title: 'Ngày đặt', dataIndex: 'orderdate', key: 'orderdate', 
            render: (orderDate: string) => moment(orderDate).format('DD-MM-YYYY HH:mm:ss')
          },
          {
            sorter: (a, b) => (a.staffName || '').localeCompare(b.staffName || ''),
            title: 'Nhân viên phục vụ', dataIndex: 'staffName', key: 'staffName', 
          },
          {
            sorter: (a, b) => (a.status || '').localeCompare(b.status || ''),
            title: 'Trạng thái', dataIndex: 'status', key: 'status', 
            render: (status: string) => {
              let color = '';
              if (status === "Đang chuẩn bị") {
                color = 'purple';
              } else if (status === "Hoàn thành") {
                color = 'green';
              } else if (status === "Đã hủy") {
                color = 'red';
              } else {
                color = 'default'; // Màu mặc định nếu trạng thái không xác định
              }
              return <Tag color={color}>{status}</Tag>;
            },
          },
          {
            title: 'Hành động',
            key: 'action',
            render: (text: any, record: any) => (
              <>
                {
                  record.status === 'Đang chuẩn bị' && (
                  <Space size="middle">                    
                    <Button
                      type='primary'
                      onClick={() => onConfirmOrder(record)}
                      style={{ marginRight: 8 }}
                    >
                      Hoàn thành
                    </Button>
                    <Popconfirm
                      title="Bạn có chắc chắn muốn huỷ đơn này không?"
                      onConfirm={() => onCancelOrder(record)}
                      okText="Có"
                      cancelText="Không"
                    >
                      <Button danger>
                        <i className="fas fa-trash"></i>
                      </Button>
                    </Popconfirm>
                  </Space>
                  )
                }
              </>
            )
          }
        ]}
      />
    </div>
  );
};

export default OrderList;