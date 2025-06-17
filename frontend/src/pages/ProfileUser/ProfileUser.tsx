import { MainApiRequest } from "@/services/MainApiRequest";
import { message, Spin, Modal, Input, Form as AntdForm } from "antd"; // Corrected Ant Design import for Form alias
import moment from "moment";
import React, { useEffect, useState } from "react";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap"; // Keep React-Bootstrap imports
import imgProfile from "../../assets/profile.jpg";
import "./ProfileUser.scss";

const ProfileUser: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState<number | null>(null);
  const [email, setEmail] = useState<string>(""); // State to store user's email
  const [name, setName] = useState<string>("");
  const [birth, setBirth] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [typeStaff, setTypeStaff] = useState<string>("");

  // State for password change modal and fields
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");
  const [passwordLoading, setPasswordLoading] = useState(false); // Loading state for password change API call

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          message.error("Token not found. Please log in again.");
          return;
        }

        const payloadBase64 = token.split(".")[1];
        const payloadJson = atob(payloadBase64);
        const decodedToken = JSON.parse(payloadJson);

        const userEmail = decodedToken.email; // Get email from token
        const userId = decodedToken.id;
        setId(userId);
        setEmail(userEmail); // Set email state for password change API

        const res = await MainApiRequest.get(`/person?email=${userEmail}`); // Use email to fetch profile
        const data = res.data;

        setName(data.NAME);
        setBirth(data.DATE_OF_BIRTH ? moment(data.DATE_OF_BIRTH).format("DD-MM-YYYY") : "");
        setPhone(data.PHONE_NUMBER);
        setTypeStaff(data.ROLE);
      } catch (error) {
        console.error("Error fetching account information:", error);
        message.error("Invalid token or error loading data.");
      }
    };

    fetchUserProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const updateData = {
      email, // Add email to update data
      name,
      phone_number: phone,
      date_of_birth: moment(birth, "DD-MM-YYYY").format("YYYY-MM-DD"),
    };

    try {
      await MainApiRequest.put(`/person/update/${id}`, updateData);
      message.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile information:", error);
      message.error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const showPasswordModal = () => {
    setIsModalVisible(true);
  };

  const handleCancelPasswordModal = () => {
    setIsModalVisible(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      message.error("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      message.error("New password and confirmation do not match.");
      return;
    }

    if (newPassword.length < 6) {
      message.error("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword === currentPassword) {
        message.error("New password cannot be the same as your current password.");
        return;
    }

    setPasswordLoading(true);
    try {
      await MainApiRequest.post(`/change-password`, {
        email: email,
        oldPassword: currentPassword, 
        newPassword: newPassword,
      });
      message.success("Password changed successfully!");
      setIsModalVisible(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error: any) {
      console.error("Error changing password:", error);
      const errorMessage = error.response?.data?.message || "Failed to change password. Please check your current password and try again.";
      message.error(errorMessage);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="container-fluid m-2">
      <h2 className="h2 header-custom">MY PROFILE</h2>
      <Container fluid className="profile-container">
        <Row className="profile-content">
          <Col md={4} className="profile-sidebar text-center">
            <img src={imgProfile} alt="Avatar" className="profile-avatar" />
            <h4>{name || "User Name"}</h4>
            <p>{typeStaff || "User Type"}</p>
            <Button
              variant="outline-primary"
              className="custom-update-btn"
              onClick={showPasswordModal}
            >
              Change Password
            </Button>
          </Col>
          <Col md={8}>
            <Card className="profile-details mt-2">
              <Card.Body>
                <Spin spinning={loading}>
                  <Form onSubmit={handleUpdateProfile}>
                    <Row style={{ display: "flex", justifyContent: "space-around" }}>
                      <Col md={6}>
                        <Form.Group controlId="name" className="mb-3">
                          <Form.Label>Full Name</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                          />
                        </Form.Group>
                        <Form.Group controlId="birth" className="mb-3">
                          <Form.Label>Date of Birth</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="DD-MM-YYYY"
                            value={birth}
                            onChange={(e) => setBirth(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group controlId="email" className="mb-3"> {/* Added email field */}
                          <Form.Label>Email Address</Form.Label>
                          <Form.Control
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </Form.Group>
                        <Form.Group controlId="phone" className="mb-3">
                          <Form.Label>Phone Number</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter phone number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                          />
                        </Form.Group>
                        <Form.Group controlId="typeStaff" className="mb-3">
                          <Form.Label>User Type</Form.Label>
                          <Form.Control type="text" value={typeStaff} disabled />
                        </Form.Group>
                      </Col>
                      <Button type="submit" className="custom-update-btn" disabled={loading}>
                        {loading ? "Updating..." : "Update Profile"}
                      </Button>
                    </Row>
                  </Form>
                </Spin>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal
        title="Change Password"
        open={isModalVisible} 
        onOk={handleChangePassword}
        onCancel={handleCancelPasswordModal}
        confirmLoading={passwordLoading}
        okText="Change Password"
        cancelText="Cancel"
      >
        <Spin spinning={passwordLoading}>
          <AntdForm layout="vertical">
            <AntdForm.Item label="Current Password">
              <Input.Password
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </AntdForm.Item>
            <AntdForm.Item label="New Password">
              <Input.Password
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </AntdForm.Item>
            <AntdForm.Item label="Confirm New Password">
              <Input.Password
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </AntdForm.Item>
          </AntdForm>
        </Spin>
      </Modal>
    </div>
  );
};

export default ProfileUser;