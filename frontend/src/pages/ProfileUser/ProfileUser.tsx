import { MainApiRequest } from "@/services/MainApiRequest";
import { message, Spin } from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import imgProfile from "../../assets/profile.jpg";
import "./ProfileUser.scss";

const ProfileUser = () => {
  const [loading, setLoading] = useState(false);

  const [id, setId] = useState<number | null>(null);
  const [name, setName] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [birth, setBirth] = useState<string>(""); // Dùng để lưu ngày sinh
  const [address, setAddress] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [workHours, setWorkHours] = useState<number | null>(null);
  const [minsalary, setMinSalary] = useState<number | null>(null);
  const [typeStaff, setTypeStaff] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");

  // Lấy thông tin từ API
  const fetchUserProfile = async () => {
    try {
      const res = await MainApiRequest.get("/auth/callback");
      const data = res.data.data;
      setId(data.id);
      setName(data.name);
      setGender(data.gender);
      setBirth(data.birth ? moment(data.birth).format("DD-MM-YYYY") : ""); // Định dạng thành DD-MM-YYYY
      setAddress(data.address);
      setPhone(data.phone);
      setWorkHours(data.workHours);
      setMinSalary(data.minsalary);
      setTypeStaff(data.typeStaff);
      setStartDate(data.startDate);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin tài khoản:", error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Xử lý cập nhật thông tin
  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const updateData = {
      name,
      gender,
      birth: moment(birth, "DD-MM-YYYY").format("YYYY-MM-DD"), // Định dạng lại trước khi gửi API
      address,
      phone,
      workHours,
      typeStaff,
      minsalary,
    };

    try {
      await MainApiRequest.put(`/staff/${id}`, updateData);
      message.success("Cập nhật thông tin thành công");
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin tài khoản:", error);
      message.error("Cập nhật thông tin thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid m-2">
      <h2 className="h2 header-custom">THÔNG TIN CỦA TÔI</h2>
      <Container fluid className="profile-container">
        <Row className="profile-content">
          <Col md={4} className="profile-sidebar text-center">
            <img src={imgProfile} alt="Avatar" className="profile-avatar" />
            <h4>{name || "Họ và tên"}</h4>
            <p>{typeStaff || "Loại nhân viên"}</p>
          </Col>
          <Col md={8}>
            <Card className="profile-details mt-2">
              <Card.Body>
                <Spin spinning={loading}>
                  <Form onSubmit={handleUpdateProfile}>
                    <Row style={{ display: "flex", justifyContent: "space-around" }}>
                      <Col md={6}>
                        <Form.Group controlId="name" className="mb-3">
                          <Form.Label>Tên</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Nhập tên của bạn"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                          />
                        </Form.Group>
                        <Form.Group controlId="birth" className="mb-3">
                          <Form.Label>Ngày sinh</Form.Label>
                          <Form.Control
                            type="text" // Sử dụng text để cho phép định dạng DD-MM-YYYY
                            placeholder="DD-MM-YYYY"
                            value={birth}
                            onChange={(e) => setBirth(e.target.value)} // Không thay đổi format
                          />
                        </Form.Group>
                        <Form.Group controlId="address" className="mb-3">
                          <Form.Label>Địa chỉ</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Nhập địa chỉ"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                          />
                        </Form.Group>
                        <Form.Group controlId="minSalary" className="mb-3">
                          <Form.Label>Lương cơ bản</Form.Label>
                          <Form.Control
                            disabled
                            type="number"
                            placeholder="Lương cơ bản"
                            value={minsalary ?? ""}
                            onChange={(e) => setMinSalary(e.target.value ? parseInt(e.target.value) : null)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group controlId="gender" className="mb-3">
                          <Form.Label>Giới tính</Form.Label>
                          <Form.Control
                            as="select"
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                          >
                            <option value="">Chọn giới tính</option>
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                            <option value="Khác">Khác</option>
                          </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="phone" className="mb-3">
                          <Form.Label>Số điện thoại</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Nhập số điện thoại"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                          />
                        </Form.Group>
                        <Form.Group controlId="typeStaff" className="mb-3">
                          <Form.Label>Loại nhân viên</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Nhập loại nhân viên"
                            value={typeStaff}
                            onChange={(e) => setTypeStaff(e.target.value)}
                          />
                        </Form.Group>
                        <Form.Group controlId="workHours" className="mb-3">
                          <Form.Label>Giờ làm việc</Form.Label>
                          <Form.Control
                            type="number"
                            placeholder="Nhập giờ làm việc"
                            value={workHours ?? ""}
                            onChange={(e) => setWorkHours(e.target.value ? parseInt(e.target.value) : null)}
                          />
                        </Form.Group>
                      </Col>
                      <Button
                        type="submit"
                        variant="primary"
                        className="mt-3 p-3"
                        style={{
                          width: "40%",
                          display: "flex",
                          justifyContent: "space-around",
                          fontWeight: "700",
                          fontSize: "1rem",
                        }}
                      >
                        {loading ? "Đang cập nhật..." : "Cập nhật thông tin"}
                      </Button>
                    </Row>
                  </Form>
                </Spin>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ProfileUser;
