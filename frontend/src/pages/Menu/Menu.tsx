import React, { useEffect, useState } from 'react';
import imgDefault from '@/assets/coffee.png';
import { Button, Input, Modal, Select, Card, message, Pagination, AutoComplete, Form, DatePicker, Flex } from 'antd';
import './Menu.scss';
import { MainApiRequest } from '@/services/MainApiRequest';
import { useNavigate } from "react-router-dom";

const categories = ['All', 'Cafe', 'Trà', 'Trà sữa', 'Nước ép', 'Bánh'];
const options = [
    { label: 'Mang đi', value: 'Mang đi' },
    { label: 'Tại chỗ', value: 'Tại chỗ' },
];

interface Product {
    id: string;
    name: string;
    category: string;
    image: string;
    available: boolean;
    price: number;
    upsize: number;
    sizes: boolean; // true nếu có size S
    sizem: boolean; // true nếu có size M
    sizel: boolean; // true nếu có size L
    hot: boolean;
    cold: boolean;
}

interface Coupon {
    id: number;
    code: string;
    status: string;
    promote: {
        id: number;
        name: string;
        description: string;
        discount: number;
        promoteType: string;
        startAt: string;
        endAt: string;
    };
}

const Menu = () => {
    const [menuList, setMenuList] = useState<any[]>([]);
    const [filteredMenuList, setFilteredMenuList] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [search, setSearch] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [order, setOrder] = useState<{ [key: string]: { size: string; mood: string; quantity: number; price: number } }>({});
    const [selectedSizes, setSelectedSizes] = useState<{ [key: string]: string }>({});
    const [selectedMoods, setSelectedMoods] = useState<{ [key: string]: string }>({});
    const [currentProductId, setCurrentProductId] = useState<string | null>(null);
    const [orderInfo, setOrderInfo] = useState<any | null>(null);
    const [phone, setPhone] = useState("");
    const [name, setName] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [suggestions, setSuggestions] = useState<{ phone: string, name: string }[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [couponCode, setCouponCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [totalPrice, setTotalPrice] = useState(
        Object.values(order).reduce((total, item) => total + item.price * item.quantity, 0)
    );
    const pageSize = 6;
    const navigate = useNavigate();

    const fetchInvoiceTemplate = async () => {
        const response = await fetch("/invoiceTemplate.html");
        return response.text();
    };

    const fetchMenuList = async () => {
        try {
            setLoading(true);
            const res = await MainApiRequest.get("/product/list");
            setMenuList(res.data);
            setFilteredMenuList(res.data);
        } catch (error) {
            message.error("Lấy danh sách sản phẩm thất bại!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenuList();
    }, []);

    useEffect(() => {
        // Gọi API để lấy thông tin hóa đơn mới
        const fetchOrderInfo = async () => {
            try {
                const response = await MainApiRequest.get('/order/new');
                if (response?.data?.length > 0) {
                    setOrderInfo(response.data[0]); // Lấy đối tượng đầu tiên trong mảng
                }
            } catch (error) {
                console.error('Failed to fetch order info:', error);
            }
        };

        fetchOrderInfo();
    }, []);

    useEffect(() => {
        // Tính lại tổng tiền khi order thay đổi
        const calculateTotalPrice = () => {
            const total = Object.values(order).reduce((sum, item) => sum + item.price * item.quantity, 0);
            setTotalPrice(total);
        };
        calculateTotalPrice();
    }, [order]);

    const filteredProducts = menuList.filter((product) =>
        selectedCategory === 'All' || product.category === selectedCategory
    ).filter((product) =>
        product.name.toLowerCase().includes(search.toLowerCase())
    );

    const fetchCustomerSuggestions = async (value: string) => {
        if (value.length > 0) {  // Đảm bảo rằng chỉ gọi API khi có ít nhất một ký tự
            try {
                const response = await MainApiRequest.get(`/customer/search?phone=${value}`);
                setSuggestions(response.data);  // Lưu kết quả trả về từ API
            } catch (error) {
                console.error('Error fetching customer suggestions:', error);
            }
        } else {
            setSuggestions([]);
        }
    };

    const handleSelectCustomer = (value: string) => {
        setPhone(value);  // Set the phone value from the selected suggestion
    };

    const handleOpenModal = () => {
        setIsModalVisible(true);
    };

    const handleSelectSize = (id: string, size: string) => {
        // Nếu chọn sản phẩm mới, reset size và mood của sản phẩm khác
        if (currentProductId !== id) {
            setSelectedSizes({});
            setSelectedMoods({});
        }
        setCurrentProductId(id);

        // Cập nhật size cho sản phẩm hiện tại
        setSelectedSizes((prev) => ({
            ...prev,
            [id]: size,
        }));
    };

    const handleSelectMood = (id: string, mood: string) => {
        // Nếu chọn sản phẩm mới, reset size và mood của sản phẩm khác
        if (currentProductId !== id) {
            setSelectedSizes({});
            setSelectedMoods({});
        }
        setCurrentProductId(id);

        // Cập nhật mood cho sản phẩm hiện tại
        setSelectedMoods((prev) => ({
            ...prev,
            [id]: mood,
        }));
    };

    const handleAddToOrder = (id: number, size: string) => {
        const product = menuList.find((p) => p.id === id);
        if (product && size) {
            const mood = product.hot || product.cold ? selectedMoods[id] : ''; // Nếu không có mood thì mood là chuỗi rỗng
            let price = product.price;
            if (size === 'M') {
                price += product.upsize;
            } else if (size === 'L') {
                price += product.upsize * 2;
            }

            const key = `${id}-${size}-${mood}`;
            setOrder((prevOrder) => ({
                ...prevOrder,
                [key]: {
                    size,
                    mood,
                    quantity: (prevOrder[key]?.quantity || 0) + 1,
                    price,
                },
            }));

            // Reset trạng thái size và mood
            setSelectedSizes({});
            setSelectedMoods({});
            setCurrentProductId(null);
        }
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        form.resetFields(); // Reset form khi đóng modal
    };

    const handleSubmit = async (values: any) => {
        try {
            const formattedValues = {
                ...values,
                registrationDate: values.registrationDate
                    ? values.registrationDate.toISOString() // Định dạng ngày thành chuỗi ISO
                    : null,
            };

            await MainApiRequest.post('/customer', formattedValues);
            message.success('Customer added successfully!');
            handleCloseModal();
        } catch (error) {
            console.error('Error adding customer:', error);
            message.error('Failed to add customer.');
        }
    };

    const handleRemoveItem = (id: string, size: string, mood: string) => {
        const actualMood = mood === '' ? 'none' : mood; // Đảm bảo 'mood' rỗng được thay bằng 'none'
        const key = `${id}-${size}-${actualMood}`; // Tạo key để xóa

        setOrder((prevOrder) => {
            // Kiểm tra key đã tồn tại trong order chưa
            if (prevOrder[key]) {
                const newOrder = { ...prevOrder }; // Tạo bản sao của order hiện tại
                delete newOrder[key]; // Xóa item theo key
                return newOrder; // Trả về order đã cập nhật
            }

            // Nếu key không tồn tại, trả về order không thay đổi
            return prevOrder;
        });
    };


    const handleIncreaseQuantity = (id: string, size: string, mood: string) => {
        const product = menuList.find((p) => String(p.id) === id);
        const actualMood = product?.hot || product?.cold ? mood : ''; // Nếu không có mood, dùng chuỗi rỗng
        const key = `${id}-${size}-${actualMood}`;

        setOrder((prevOrder) => ({
            ...prevOrder,
            [key]: {
                ...prevOrder[key],
                quantity: prevOrder[key]?.quantity + 1 || 1,
            },
        }));
    };

    const handleDecreaseQuantity = (id: string, size: string, mood: string) => {
        console.log('handleDecreaseQuantity called', { id, size, mood });
        const product = menuList.find((p) => String(p.id) === id);
        const actualMood = product?.hot || product?.cold ? mood : ''; // Nếu không có mood, dùng chuỗi rỗng
        const key = `${id}-${size}-${actualMood}`;

        setOrder((prevOrder) => {
            console.log('Current order before update:', prevOrder);
            const newOrder = { ...prevOrder };
            if (newOrder[key]?.quantity > 1) {
                newOrder[key].quantity -= 1;
                console.log(`Quantity decremented for ${key}:`, newOrder[key].quantity);
            } else {
                delete newOrder[key];
            }
            console.log('Updated order:', newOrder);
            return newOrder;
        });
    };

    const handleApplyCoupon = async () => {
        try {
            let couponDiscount = 0;
            let membershipDiscount = 0;

            // Lấy thông tin coupon
            if (couponCode) {
                const response = await MainApiRequest.get('/promote/coupon/list');
                const coupon = response.data.find((c: Coupon) => c.code === couponCode && c.status === 'Có hiệu lực');

                if (coupon) {
                    const discount = coupon.promote.discount;
                    if (coupon.promote.promoteType === 'Phần trăm') {
                        couponDiscount = (totalPrice * discount) / 100;
                    } else if (coupon.promote.promoteType === 'Cố định') {
                        couponDiscount = discount;
                    }
                } else {
                    message.error('Mã giảm giá không hợp lệ hoặc đã hết hạn!');
                    return;
                }
            }

            // Lấy thông tin rank khách hàng
            if (phone) {
                const customerResponse = await MainApiRequest.get(`/customer/${phone}`);
                const customer = customerResponse.data;

                if (customer?.rank) {
                    const membershipResponse = await MainApiRequest.get(`/membership/${customer.rank}`);
                    const membership = membershipResponse.data;

                    if (membership?.discount) {
                        membershipDiscount = membership.discount;
                    }
                }
            }

            // Tính tổng chiết khấu
            setDiscountAmount(couponDiscount + membershipDiscount);
            message.success('Áp dụng chiết khấu thành công!');
        } catch (error) {
            console.error('Lỗi khi áp dụng chiết khấu:', error);
            message.error('Có lỗi xảy ra khi áp dụng chiết khấu!');
        }
    };

    const updateCustomerTotal = async (phone: string, currentBillTotal: number) => {
        try {
            // Lấy tổng chi tiêu hiện tại
            const response = await MainApiRequest.get(`/customer/${phone}`);
            const customer = response.data;

            if (!customer) {
                console.error("Customer not found");
                return;
            }

            const updatedTotal = (customer.total || 0) + currentBillTotal;

            // Cập nhật tổng chi tiêu
            await MainApiRequest.put(`/customer/total/${phone}`, { total: updatedTotal });

            console.log("Customer total updated successfully!");
        } catch (error) {
            console.error("Failed to update customer total:", error);
        }
    };

    const handlePayment = async () => {
        try {
            // Tính tổng tiền sau khi áp dụng chiết khấu
            // Tính tổng tiền sau khi áp dụng chiết khấu
            let finalTotal = totalPrice - discountAmount;

            // Đảm bảo tổng tiền không âm
            if (finalTotal < 0) {
                finalTotal = 0;
            }
            console.log('total', finalTotal);
            if (totalPrice === 0) {
                message.warning("Đơn hàng không có sản phẩm hoặc tổng tiền không hợp lệ.");
                return;
            }

            // Cập nhật tổng tiền chi tiêu của khách hàng
            if (phone) {
                await updateCustomerTotal(phone, finalTotal);
            }

            // Gửi thông tin sản phẩm đã đặt vào `order_detail`
            for (const [productKey, orderItem] of Object.entries(order)) {
                const { size, mood, quantity } = orderItem;
                const [productID] = productKey.split("-");

                await MainApiRequest.post(`/order/detail/${orderInfo.id}`, {
                    orderID: orderInfo.id,
                    productID,
                    size,
                    mood,
                    quantity_product: quantity,
                });
            }

            // Cập nhật trạng thái đơn hàng
            await MainApiRequest.put(`/order/${orderInfo.id}`, {
                phone,
                serviceType: orderInfo.serviceType,
                totalPrice: finalTotal,
                orderDate: new Date().toISOString(),
                status: "Đang chuẩn bị",
            });

            // Reset trạng thái bàn nếu là Dine In
            if (orderInfo.serviceType === "Dine In") {
                const tableResponse = await MainApiRequest.get(`/table/${orderInfo.tableID}`);
                const tableData = tableResponse.data;

                await MainApiRequest.put(`/table/${orderInfo.tableID}`, {
                    status: "Occupied",
                    phoneOrder: phone,
                    bookingTime: new Date().toISOString(),
                    seatingTime: new Date().toISOString(),
                    seat: tableData.seat,
                });
            }

            // Hiển thị hóa đơn
            const template = await fetchInvoiceTemplate();
            const rows = Object.keys(order).map((productKey, index) => {
                const { size, mood, quantity, price } = order[productKey];
                const [id] = productKey.split("-");
                const product = menuList.find((p) => String(p.id) === id);
                if (!product) return "";
                const itemName = `${product.name}`;
                const itemDetails = `${size}${mood ? ` - ${mood}` : ""}`;
                const itemTotal = price * quantity;
                return `
                    <tr>
                        <td>${index + 1}</td>
                        <td>
                            <div>${itemName}</div>
                            <div style='font-size: 0.85em; color: gray;'>${itemDetails}</div>
                        </td>
                        <td>${quantity}</td>
                        <td>${price.toLocaleString()}</td>
                        <td>${itemTotal.toLocaleString()}</td>
                    </tr>
                `;
            }).join("");

            const invoiceHtml = template
                .replace("{ORDER_ID}", orderInfo?.id || "---")
                .replace("{SERVICE_TYPE}", orderInfo?.serviceType === "Take Away" ? "Mang đi" : `Tại chỗ - ${orderInfo?.tableID || "---"}`)
                .replace("{DATE}", new Date().toLocaleDateString())
                .replace("{ITEM_ROWS}", rows)
                .replace("{TOTAL_AMOUNT}", totalPrice.toLocaleString())
                .replace("{DISCOUNT_AMOUNT}", discountAmount.toLocaleString())
                .replace("{FINAL_TOTAL}", finalTotal.toLocaleString());

            const newWindow = window.open();
            if (newWindow) {
                newWindow.document.write(invoiceHtml);
                newWindow.document.close();
            }

            // Thông báo và reset trạng thái
            message.success("Thanh toán thành công!");
            setOrder({});
            setCouponCode("");
            setDiscountAmount(0);
            navigate("/order/list");
        } catch (error) {
            console.error("Error during payment:", error);
            message.error("Có lỗi xảy ra khi thanh toán!");
        }
    };


    const handleSelect = (value: string) => {
        // Khi chọn một số điện thoại, tìm khách hàng từ danh sách gợi ý và điền tên vào input
        const selectedCustomer = suggestions.find((customer) => customer.phone === value);
        if (selectedCustomer) {
            setPhone(selectedCustomer.phone);  // Cập nhật số điện thoại vào ô nhập số điện thoại
            setName(selectedCustomer.name);    // Cập nhật tên vào ô nhập tên
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const currentProducts = filteredProducts.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    return (
        <div className="menu-container">
            <div className="menu-left">
                <h2 className='h2 header-custom'>MENU</h2>
                <div className="category-filter">
                    {categories.map((category) => (
                        <Button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            type={selectedCategory === category ? 'primary' : 'default'} // Sử dụng kiểu primary cho nút được chọn
                            className="ant-btn"
                        >
                            {category}
                        </Button>
                    ))}
                </div>
                <Input
                    className="search-input"
                    placeholder="Tìm kiếm sản phẩm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <div className="product-cards" >
                    {currentProducts.map((product) => (
                        <Card key={product.id} className="product-card">
                            <div className="product-image" >
                                <img src={product.image} alt={product.name} />
                            </div>
                            <div className="product-info">
                                <h3 style={{ fontWeight: 'bold', fontSize: 20 }}>{product.name}</h3>
                                {product.available ? (
                                    <>
                                        {/* Size Options */}
                                        {product.sizes || product.sizem || product.sizel ? (
                                            <div style={{ display: 'flex' }}>
                                                <span style={{ marginRight: 4, alignSelf: 'center' }}>Size:</span>
                                                <div className="size-options">
                                                    {product.sizes && (
                                                        <Button
                                                            key="S"
                                                            className={`size-button ${selectedSizes[product.id] === 'S' ? 'selected' : ''}`}
                                                            onClick={() => handleSelectSize(product.id, 'S')}
                                                        >
                                                            S
                                                        </Button>
                                                    )}
                                                    {product.sizem && (
                                                        <Button
                                                            key="M"
                                                            className={`size-button ${selectedSizes[product.id] === 'M' ? 'selected' : ''}`}
                                                            onClick={() => handleSelectSize(product.id, 'M')}
                                                        >
                                                            M
                                                        </Button>
                                                    )}
                                                    {product.sizel && (
                                                        <Button
                                                            key="L"
                                                            className={`size-button ${selectedSizes[product.id] === 'L' ? 'selected' : ''}`}
                                                            onClick={() => handleSelectSize(product.id, 'L')}
                                                        >
                                                            L
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ) : null}

                                        {/* Mood Options */}
                                        {product.hot && product.cold ? (
                                            <div style={{ display: 'flex' }}>
                                                <span style={{ marginRight: 4, alignSelf: 'center' }}>Mood:</span>
                                                <div className="hot-cold-options">
                                                    {product.hot && (
                                                        <Button
                                                            className={`mood-button ${selectedMoods[product.id] === 'Nóng' ? 'selected' : ''}`}
                                                            onClick={() => handleSelectMood(product.id, 'Nóng')}
                                                        >
                                                            Nóng
                                                        </Button>
                                                    )}
                                                    {product.cold && (
                                                        <Button
                                                            className={`mood-button ${selectedMoods[product.id] === 'Lạnh' ? 'selected' : ''}`}
                                                            onClick={() => handleSelectMood(product.id, 'Lạnh')}
                                                        >
                                                            Lạnh
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ) : null}

                                        {/* Price and Add to Order Button */}
                                        <div style={{ display: 'flex', marginTop: 10 }}>
                                            <div className="price">
                                                <span>Giá:</span>
                                                <span>
                                                    {selectedSizes[product.id] === 'M'
                                                        ? product.price + product.upsize
                                                        : selectedSizes[product.id] === 'L'
                                                            ? product.price + product.upsize * 2
                                                            : product.price}
                                                </span>
                                            </div>
                                            <Button
                                                className="select-button"
                                                onClick={() => handleAddToOrder(product.id, selectedSizes[product.id])}
                                                disabled={
                                                    !selectedSizes[product.id] ||
                                                    (product.hot && product.cold && !selectedMoods[product.id]) // Bắt buộc chọn mood nếu có cả hot và cold
                                                }
                                            >
                                                Chọn
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="sold-out">
                                        <span>Sold Out</span>
                                    </div>
                                )}
                            </div>

                        </Card>
                    ))}
                </div>
                <div className="pagination">
                    <Pagination
                        current={currentPage}
                        pageSize={pageSize}
                        total={filteredProducts.length}
                        onChange={handlePageChange}
                    />
                </div>
            </div>

            <div className="menu-right">
                <h2 style={{ textAlign: 'center', fontSize: 24, fontWeight: 'bold' }}>HÓA ĐƠN</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <label style={{ fontWeight: 'bold' }}>
                        Mã HĐ: {orderInfo?.id || '---'}
                    </label>
                    <label style={{ fontWeight: 'bold' }}>
                        Loại: {orderInfo?.serviceType === 'Take Away'
                            ? 'Mang đi'
                            : `Bàn ${orderInfo?.tableID || '---'}`}
                    </label>
                </div>
                <div className="customer-info">
                    <Button onClick={handleOpenModal} style={{ marginBottom: 5 }}><i className='fas fa-user-plus'></i></Button>
                    <Modal
                        title="Thêm mới khách hàng"
                        visible={isModalVisible}
                        onCancel={handleCloseModal}
                        footer={null}
                    >
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSubmit}
                            initialValues={{ gender: 'male' }}
                        >
                            <Form.Item
                                name="name"
                                label="Tên"
                                rules={[{ required: true, message: 'Please enter the name' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                name="phone"
                                label="Số điện thoại"
                                rules={[
                                    { required: true, message: 'Please enter the phone number' },
                                    { pattern: /^[0-9]+$/, message: 'Please enter a valid phone number' },
                                ]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item name="gender" label="Giới tính">
                                <Select>
                                    <Select.Option value="Nam">Nam</Select.Option>
                                    <Select.Option value="Nữ">Nữ</Select.Option>
                                    <Select.Option value="Khác">Khác</Select.Option>
                                </Select>
                            </Form.Item>
                            <Form.Item
                                name="registrationDate"
                                label="Ngày đăng ký"
                                rules={[{ required: true, message: 'Please select the registration date' }]}
                            >
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit">
                                    Submit
                                </Button>
                                <Button style={{ marginLeft: '10px' }} onClick={handleCloseModal}>
                                    Cancel
                                </Button>
                            </Form.Item>
                        </Form>
                    </Modal>
                    <AutoComplete
                        className='ant-select-selection-search'
                        value={phone}
                        onChange={(value) => {
                            setPhone(value);  // Cập nhật giá trị ô input
                            fetchCustomerSuggestions(value);  // Tìm kiếm khi người dùng thay đổi giá trị
                        }}
                        onSelect={handleSelect}
                        options={suggestions.map((suggestion) => ({
                            value: suggestion.phone,  // Giá trị hiển thị là số điện thoại
                            label: `${suggestion.phone} - ${suggestion.name}`,  // Hiển thị số điện thoại và tên
                        }))}
                        placeholder="Số điện thoại khách hàng"
                        style={{ marginBottom: 5 }}
                    >
                        <Input />
                    </AutoComplete>
                    <Input placeholder="Tên khách hàng" value={name} />
                    <Input placeholder="Ngày cập nhật" disabled value={new Date().toLocaleString()} />

                </div>
                <div className="order-items">
                    <h3>Món Đã Đặt</h3>
                    <div className="order-list">
                        {Object.keys(order).map((productKey) => {
                            const orderItem = order[productKey];
                            const { size, mood, quantity, price } = orderItem;
                            const [id, selectedSize, selectedMood] = productKey.split('-');
                            const product = menuList.find((p) => String(p.id) === id);
                            return product ? (
                                <div key={productKey} className="order-item-card">
                                    <img src={product.image} alt={product.name} className="order-item-image" />
                                    <div>
                                        <div>{product.name}</div>
                                        <div>Size: {size} {mood && `, Mood: ${mood}`}</div>
                                        <div>Giá: {price * quantity}</div>
                                    </div>
                                    <div className="quantity-controls">
                                        <Input
                                            type="number"
                                            min={1}
                                            value={quantity}
                                            onChange={(e) => {
                                                const newQuantity = parseInt(e.target.value, 10) || 1;
                                                setOrder((prevOrder) => {
                                                    const key = `${id}-${size}-${product.hot || product.cold ? mood : ''}`;
                                                    const updatedOrder = { ...prevOrder };
                                                    updatedOrder[key].quantity = newQuantity; // Cập nhật số lượng
                                                    return updatedOrder;
                                                });
                                            }}
                                            style={{ width: 60, textAlign: "center" }}
                                        />
                                    </div>
                                    <Button
                                        className="remove-button"
                                        onClick={() => handleRemoveItem(id, size, mood)}
                                    >
                                        X
                                    </Button>
                                </div>
                            ) : null;
                        })}
                    </div>
                </div>
                <div className="total-info">
                    <div className="discount-input">
                        <Input
                            placeholder="Nhập mã giảm giá"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            style={{ width: '70%', marginRight: '5px', marginLeft: 5, marginBottom: 5 }}
                        />
                        <Button onClick={handleApplyCoupon} style={{ width: '25%', marginRight: 5 }}>Áp dụng</Button>
                    </div>
                    <div className="total-info-item">
                        <span className="label">Tổng số món:</span>
                        <span className="value">
                            {Object.values(order).reduce((total, item) => total + item.quantity, 0)}
                        </span>
                    </div>
                    <div className="total-info-item">
                        <span className="label">Tổng tiền:</span>
                        <span className="value" style={{ fontWeight: 'bold' }}>
                            {Object.values(order).reduce(
                                (total, item) => total + item.price * item.quantity,
                                0
                            )}
                        </span>
                    </div>
                    <div className="total-info-item">
                        <span className="label">Chiết khấu:</span>
                        <span className="value" style={{ color: 'red', fontWeight: 'bold' }}>
                            - {discountAmount.toLocaleString()} VND
                        </span>
                    </div>

                    {/* Tổng hóa đơn */}
                    <div className="total-info-item">
                        <span className="label" style={{ fontWeight: 'bold' }}>Tổng hóa đơn:</span>
                        <span className="value" style={{ fontWeight: 'bold' }}>
                            {Math.max(0, totalPrice - discountAmount).toLocaleString()} VND
                        </span>
                    </div>
                    <Button className="button" style={{ height: 50, fontSize: 20 }} onClick={handlePayment}>Thanh Toán</Button>
                </div>
            </div>
        </div >
    );
};

export default Menu;
