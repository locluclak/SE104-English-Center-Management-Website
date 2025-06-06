import imgDefault from '@/assets/coffee.png';
import { MainApiRequest } from '@/services/MainApiRequest';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Form, GetProp, Input, message, Modal, Popconfirm, Progress, Select, Space, Table, Upload, UploadProps } from 'antd';
import { useEffect, useState } from 'react';
import "./ProductList.scss";

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];
type UploadRequestOption = Parameters<GetProp<UploadProps, 'customRequest'>>[0];
const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const mappingColor = (status: string, value: boolean) => {
  switch (status) {
    case 'available':
      return value ? 'green' : 'red';
    case 'action':
      return value ? 'red' : 'green';
    default:
      return 'gray'; // Màu mặc định nếu không khớp
  }
};

const ProductList = () => {
  const [form] = Form.useForm();
  const [progress, setProgress] = useState(0);
  const [productList, setProductList] = useState<any[]>([]);
  const [openCreateProductModal, setOpenCreateProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [fileList, setFileList] = useState<any[]>([]);
  const [imageUrl, setImageUrl] = useState<string>("");

  const handleChange = (info: any) => {
    const file = info.fileList[0];
    setFileList(file ? [file] : []);
  };

  const handleUpload = async (options: UploadRequestOption) => {
    const { onSuccess, onError, file, onProgress } = options;

    const fmData = new FormData();
    const config = {
      headers: { "content-type": "multipart/form-data" },
      onUploadProgress: (event: any) => {
        const percent = Math.floor((event.loaded / event.total) * 100);
        setProgress(percent);
        if (percent === 100) {
          setTimeout(() => setProgress(0), 1000);
        }
        onProgress && onProgress({ percent });
      },
    };
    fmData.append("file", file);
    try {
      const res = await MainApiRequest.post("/file/upload", fmData, config);
      const { data } = res;
      setImageUrl(data.imageUrl);
      onSuccess && onSuccess("Ok");
    } catch (err) {
      console.error("Error:", err);
      onError && onError(new Error("Upload failed"));
    }
  };

  const handleRemove = () => {
    setFileList([]);
    setImageUrl("");
  };

  const fetchProductList = async () => {
    const res = await MainApiRequest.get('/product/list');
    setProductList(res.data);
  };

  useEffect(() => {
    fetchProductList();
  }, []);

  const onOpenCreateProductModal = () => {
    setOpenCreateProductModal(true);
  };

  const onOKCreateProduct = async () => {
    if (!imageUrl) {
      message.error("Image is required. Please upload an image.");
      return;
  }

    setOpenCreateProductModal(false);
    const data = {
      name: form.getFieldValue('name'),
      price: parseInt(form.getFieldValue('price_S') || "0"),
      upsize: parseInt(form.getFieldValue('price_M') || "0") - parseInt(form.getFieldValue('price_S') || "0"),
      image: imageUrl || "",
      category: form.getFieldValue('category'),
    };

    if (editingProduct) {
      await MainApiRequest.put(`/product/${editingProduct.id}`, data);
    } else {
      await MainApiRequest.post('/product', data);
    }

    fetchProductList();
    setEditingProduct(null);
    form.resetFields();
  };

  const onEditProduct = (record: any) => {
    setEditingProduct(record);
    form.setFieldsValue({
      ...record,
      price_S: record.price,
      price_M: record.price + (record.upsize || 0),
      price_L: record.price + (record.upsize || 0) * 2,
      imageUrl: record.image,
    });
    setFileList(record.image ? [{
      uid: "1",
      name: record.name + ".png",
      status: 'done',
      url: record.image,
    }] : []);
    setImageUrl(record.image || "");
    setOpenCreateProductModal(true);
  };

  const onDeleteProduct = async (id: number) => {
    await MainApiRequest.delete(`/product/${id}`);
    fetchProductList();
  };

  const onToggleProductStatus = async (record: any) => {
    try {
      const updatedProduct = { ...record, available: !record.available };
      await MainApiRequest.put(`/product/available/${record.id}`, updatedProduct);
  
      // Cập nhật danh sách sản phẩm sau khi thay đổi
      setProductList((prevList) =>
        prevList.map((product) =>
          product.id === record.id
            ? { ...product, available: updatedProduct.available }
            : product
        )
      );
  
      message.success('Trạng thái sản phẩm đã được cập nhật.');
    } catch (error) {
      console.error('Error updating product status:', error);
      message.error('Không thể cập nhật trạng thái. Vui lòng thử lại.');
    }
  };


  return (
    <div className="container-fluid m-2">
      <h2 className="h2 header-custom">DANH SÁCH SẢN PHẨM</h2>

      <Button type="primary" onClick={() => onOpenCreateProductModal()}>
        Thêm mới sản phẩm
      </Button>

      <Modal
        className="product-modal"
        title={editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm mới sản phẩm"}
        open={openCreateProductModal}
        onOk={onOKCreateProduct}
        onCancel={() => setOpenCreateProductModal(false)}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            label="Hình ảnh"
            name="image"
            valuePropName="fileList"
            getValueFromEvent={(e) => e.fileList}
          >
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Upload
                listType="picture-card"
                fileList={fileList}
                accept="image/*"
                onPreview={() => {}}
                customRequest={handleUpload}
                onRemove={handleRemove}
                onChange={handleChange}
              >
              {fileList.length < 1 && (
                <div>
                  <PlusOutlined />
                  <div>Tải lên</div>
                </div>
              )}
            </Upload>
              {progress > 0 ? <Progress percent={progress} /> : null}
            </div>
          </Form.Item>
          <Form.Item
            label="Tên sản phẩm"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
          >
            <Input type="text" />
          </Form.Item>
          <Form.Item label="Giá">
            <Input.Group compact>
              <Form.Item
                name="price_S"
                noStyle
                rules={[{ required: true, message: 'Vui lòng nhập giá size S!' }]}
              >
                <Input style={{ width: '33%' }} placeholder="Giá size S" type="number" />
              </Form.Item>
              <Form.Item
                name="price_M"
                noStyle
                rules={[{ required: true, message: 'Vui lòng nhập giá size M!' }]}
              >
                <Input style={{ width: '33%' }} placeholder="Giá size M" type="number" />
              </Form.Item>
              <Form.Item
                name="price_L"
                noStyle
                rules={[{ required: true, message: 'Vui lòng nhập giá size L!' }]}
              >
                <Input style={{ width: '33%' }} placeholder="Giá size L" type="number" />
              </Form.Item>
            </Input.Group>
          </Form.Item>
          <Form.Item
            label="Loại"
            name="category"
            rules={[{ required: true, message: 'Vui lòng nhập loại sản phẩm!' }]}
          >
            <Select>
              <Select.Option value="Trà sữa">Trà sữa</Select.Option>
              <Select.Option value="Cafe">Cafe</Select.Option>
              <Select.Option value="Trà">Trà</Select.Option>
              <Select.Option value="Nước ép">Nước ép</Select.Option>
              <Select.Option value="Nước ngọt">Nước ngọt</Select.Option>
              <Select.Option value="Bánh ngọt">Bánh ngọt</Select.Option>
            </Select>
          </Form.Item>

        </Form>
      </Modal>

      <Table
        className='product-table'
        pagination={{
          pageSize: 6, // Số lượng item trên mỗi trang
          showSizeChanger: true, // Hiển thị tùy chọn thay đổi số item trên mỗi trang
          // Các tùy chọn cho số item mỗi trang
        }}
        dataSource={productList}
        columns={[
          {
            title: 'Hình ảnh',
            dataIndex: 'image',
            key: 'image',
            render: (image: string) => (
              <img
                src={image || imgDefault}
                alt="Product"
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '8px',
                }}
              />
            ),
          },
          { title: 'ID', dataIndex: 'id', key: 'id' },
          { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name' },
          {
            title: 'Giá', key: 'price', render: (_, record) => (
              <div>
                <p>Size S: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(record.price)}</p>
                <p>Size M: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(record.price + (record.upsize || 0))}</p>
                <p>Size L: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(record.price + (record.upsize || 0) * 2)}</p>
              </div>
            ),
          },
          { title: 'Loại', dataIndex: 'category', key: 'category' },
          {
            title: 'Trạng thái', dataIndex: 'available', key: 'available', 
            render: (available) => (
              <span style= {{ color: available ? 'green' : 'orange' }}>
                {available ? 'Đang bán' : 'Hết hàng'}
              </span>
            ),
          },
          {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
              <Space size="middle">
                <Button onClick={() => onEditProduct(record)}>
                  <i className="fas fa-edit"></i>
                </Button>
                <Popconfirm
                  title="Bạn có chắc chắn muốn xóa sản phẩm này không?"
                  onConfirm={() => onDeleteProduct(record.id)}
                  okText="Có"
                  cancelText="Không"
                >
                  <Button danger>
                    <i className="fas fa-trash"></i>
                  </Button>
                </Popconfirm>
                <Button 
                  type="default" 
                  style={{
                    color: record.available ? 'orange' : 'green',
                    borderColor: record.available ? 'orange' : 'green',
                  }}
                  onClick={() => onToggleProductStatus(record)}
                >
                  {record.available ? 'Ngưng bán' : 'Mở bán'}
                </Button>
              </Space>
            ),
          },
        ]}
      />
    </div>
  );
};

export default ProductList;
