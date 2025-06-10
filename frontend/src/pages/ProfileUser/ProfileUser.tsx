import { MainApiRequest } from "@/services/MainApiRequest";
import { message, Spin } from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import imgProfile from "../../assets/profile.jpg";
import "./ProfileUser.scss";

interface JwtPayload {
  id: number;
  email: string;
  role: string;
}

const ProfileUser = () => {
  const [loading, setLoading] = useState(false);

  const [id, setId] = useState<number | null>(null);
  const [name, setName] = useState<string>("");
  const [birth, setBirth] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [typeStaff, setTypeStaff] = useState<string>("");

  const fetchUserProfile = async () => {
    try {
      // ✅ MOCK dữ liệu nếu chưa có token
      const mockUser = {
        id: 1,
        email: "alice@example.com",
        name: "Alice Johnson",
        role: "STUDENT",
      };
      localStorage.setItem("token", JSON.stringify(mockUser));

      const email = mockUser.email;
      const userId = mockUser.id;
      setId(userId);

      const res = await MainApiRequest.get(`/person?email=${email}`);
      const data = res.data;

      setName(data.NAME);
      setBirth(data.DATE_OF_BIRTH ? moment(data.DATE_OF_BIRTH).format("DD-MM-YYYY") : "");
      setPhone(data.PHONE_NUMBER);
      setTypeStaff(data.ROLE);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin tài khoản:", error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const updateData = {
      name,
      phone_number: phone,
      date_of_birth: moment(birth, "DD-MM-YYYY").format("YYYY-MM-DD"),
    };

    try {
      await MainApiRequest.put(`/person/update/${id}`, updateData);
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
            <p>{typeStaff || "Loại người dùng"}</p>
          </Col>
          <Col md={8}>
            <Card className="profile-details mt-2">
              <Card.Body>
                <Spin spinning={loading}>
                  <Form onSubmit={handleUpdateProfile}>
                    <Row
                      style={{
                        display: "flex",
                        justifyContent: "space-around",
                      }}
                    >
                      <Col md={6}>
                        <Form.Group controlId="name" className="mb-3">
                          <Form.Label>Họ và tên</Form.Label>
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
                            type="text"
                            placeholder="DD-MM-YYYY"
                            value={birth}
                            onChange={(e) => setBirth(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
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
                          <Form.Label>Loại người dùng</Form.Label>
                          <Form.Control
                            type="text"
                            value={typeStaff}
                            disabled
                          />
                        </Form.Group>
                      </Col>
                      <Button type="submit" className="custom-update-btn" disabled={loading}>
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
