import { useState, useEffect } from "react";
import { Table, Modal, Button, message, Select, Form, Input, DatePicker } from "antd";
import { MainApiRequest } from "@/services/MainApiRequest";
import "./StudentFeesList.scss";
import moment from "moment";

// Interface for class report
interface Student {
  student_name: string;
  student_email: string;
  payment_price: number;
  payment_type: string;
  payment_status: string;
  payment_date: string | null;
  payment_id: string;
}

interface ClassReport {
  courseId: string;
  totalRevenue: number;
  students: Student[];
}

interface TuitionUpdate {
  PRICE: number;
  TYPE: string;
  DESCRIPTION: string;
  STATUS: string;
  PAID_DATE: string;
  T_ID: string;
}

const StudentFeesList = () => {
  const [courseId, setCourseId] = useState<string | null>("");
  const [report, setReport] = useState<any[]>([]);
  const [overallRevenue, setOverallRevenue] = useState(0);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [form] = Form.useForm();
  const [paymentStatus, setPaymentStatus] = useState<string | undefined>(undefined);
  const [paymentType, setPaymentType] = useState<string | undefined>("");

  // Options for select components based on ENUM from the database
  const paymentStatusOptions = [
    { label: "UNPAID", value: "UNPAID" },
    { label: "PAID", value: "PAID" },
    { label: "DEFERRED", value: "DEFERRED" },
  ];

  const paymentTypeOptions = [
    { label: "UNPAID", value: "UNPAID" },
    { label: "CARD", value: "CARD" },
    { label: "TRANSFER", value: "TRANSFER" },
    { label: "CASH", value: "CASH" },
  ];

  // Fetch list of courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await MainApiRequest.get("/course/all");
        setAvailableCourses(response.data);
      } catch (error) {
        console.error("Error loading class list:", error);
        message.error("Could not load class list.");
      }
    };
    fetchCourses();
  }, []);

  const handleEditStudent = (student: Student) => {
    console.log("Selected student:", student); // Kiểm tra xem student có đúng dữ liệu không
    setSelectedStudent(student);
    setPaymentStatus(student.payment_status); // Set the initial payment status
    setPaymentType(student.payment_type); // Set initial payment type

    // Set dữ liệu cho modal form
    form.setFieldsValue({
      student_name: student.student_name,
      student_email: student.student_email,
      payment_price: student.payment_price,
      payment_status: student.payment_status,
      payment_type: student.payment_type,
      // Sử dụng moment để thiết lập giá trị ngày cho Ant Design DatePicker
      payment_date: student.payment_date ? moment(student.payment_date) : null,
      tuition_id: student.payment_id, // Đảm bảo truyền payment_id vào form
    });

    setIsModalVisible(true);
  };

  const onPaymentStatusChange = (value: string) => {
    setPaymentStatus(value);
    if (value === "UNPAID") {
      setPaymentType("UNPAID"); // Nếu payment_status là UNPAID, chọn payment_type là UNPAID
    } else {
      setPaymentType(undefined); // Nếu không phải UNPAID, bỏ chọn payment_type
    }
  };

  const onOkSubmit = async () => {
    if (!selectedStudent || !selectedStudent.payment_id) {
      message.error("No student information to update.");
      return;
    }

    try {
      const values = await form.validateFields();
      console.log("Values from the form:", values);

      // Prepare data for update, excluding student_name and student_email
      const normalizedData: TuitionUpdate = {
        PRICE: values.payment_price,
        TYPE: values.payment_type || "UNPAID", // If payment_type is undefined, set it to UNPAID
        DESCRIPTION: values.payment_status === 'PAID' ? values.payment_status : null,
        STATUS: values.payment_status,
        PAID_DATE: values.payment_date ? moment(values.payment_date).format('YYYY-MM-DD') : selectedStudent.payment_date ? moment(selectedStudent.payment_date).format('YYYY-MM-DD') : "",
        T_ID: selectedStudent.payment_id,
      };

      console.log("Data to be sent to API:", normalizedData);

      const response = await MainApiRequest.put(`/payment/tuition/${selectedStudent.payment_id}`, normalizedData);

      if (response.status === 200) {
        message.success("Tuition updated successfully!");
        setIsModalVisible(false);
        form.resetFields();
        handleViewReport(); 
      }
    } catch (error) {
      console.error("Failed to update tuition:", error);
      message.error("Could not update tuition.");
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedStudent(null);
    form.resetFields();
  };

  const handleViewReport = async () => {
    if (!courseId) {
      message.error("Please select a class.");
      return;
    }

    try {
      const response = await MainApiRequest.get(`/payment/revenue-report/${courseId}`);
      const apiData: ClassReport = response.data;

      if (apiData?.students?.length > 0) {
        setReport(apiData.students);
        setOverallRevenue(apiData.totalRevenue);
      } else {
        setReport([]);
        setOverallRevenue(0);
        message.warning("No report data for the selected class.");
      }
    } catch (err) {
      console.error("Error fetching course report data", err);
      message.error("Could not load class report.");
    }
  };

  const getColumns = () => [
    {
      title: "Name",
      dataIndex: "student_name",
      key: "student_name",
    },
    {
      title: "Email",
      dataIndex: "student_email",
      key: "student_email",
    },
    {
      title: "Tuition Fee",
      dataIndex: "payment_price",
      key: "payment_price",
      render: (value: number) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(value),
    },
    {
      title: "Payment Type",
      dataIndex: "payment_type",
      key: "payment_type",
    },
    {
      title: "Payment Status",
      dataIndex: "payment_status",
      key: "payment_status",
      render: (status: string) => (
        <span
          style={{
            color: status === "PAID" ? "green" : "orange",
            fontWeight: "bold",
          }}
        >
          {status}
        </span>
      ),
    },
    {
      title: "Payment Date",
      dataIndex: "payment_date",
      key: "payment_date",
      render: (value: string | null) => (value ? new Date(value).toLocaleString("vi-VN") : "-"),
    },
    {
      title: "Action",
      key: "action",
      render: (text: any, record: Student) => (
        <Button onClick={() => handleEditStudent(record)} type="link">
          <i className="fas fa-edit"></i> Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="reports-container">
      <h3 className="report-title">STUDENT FEES</h3>
      <div className="report-controls-row">
        <div className="control-group">
          <label htmlFor="course-id">Select course:</label>
          <Select id="course-id" value={courseId || ""} onChange={(value) => setCourseId(value)} style={{ width: 200 }}>
            <Select.Option value="">-- Select course --</Select.Option>
            {availableCourses.map((course) => (
              <Select.Option key={course.COURSE_ID} value={course.COURSE_ID}>
                {course.NAME}
              </Select.Option>
            ))}
          </Select>
        </div>
        <div className="control-group">
          <Button className="view-button" onClick={handleViewReport}>
            View Report
          </Button>
        </div>
      </div>



      {report.length > 0 && (
        <Table
          columns={getColumns()}
          dataSource={report.map((item: any, index: number) => ({
            ...item,
            key: item.payment_id || item.student_id || `student-${index}`,
          }))}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} records`,
          }}
        />
      )}

      <Modal
        title="Edit Tuition Fees"
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={onOkSubmit}
        width={600}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={onOkSubmit}>
            Save Changes
          </Button>,
        ]}
      >
        {selectedStudent ? (
          <Form form={form} layout="vertical" className="edit-form">
            <Form.Item label="Student Name" name="student_name">
              <Input value={selectedStudent.student_name} disabled />
            </Form.Item>

            <Form.Item label="Student Email" name="student_email">
              <Input value={selectedStudent.student_email} disabled />
            </Form.Item>

            <Form.Item label="Tuition Fee" name="payment_price" required>
              <Input type="number" />
            </Form.Item>

            <Form.Item label="Payment Status" name="payment_status" required>
              <Select value={paymentStatus} onChange={onPaymentStatusChange}>
                {paymentStatusOptions.map((option) => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {paymentStatus === "PAID" && (
              <Form.Item label="Payment Type" name="payment_type" required>
                <Select value={paymentType} onChange={(value) => setPaymentType(value)}>
                  {paymentTypeOptions.map((option) => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            <Form.Item label="Payment Date" name="payment_date">
              <DatePicker
                value={moment(selectedStudent.payment_date)}
                format="DD/MM/YYYY"
                disabled={!paymentStatus || paymentStatus !== 'PAID'}
              />
            </Form.Item>

            <Form.Item label="Description" name="description">
              <Input placeholder="Enter description (optional)" />
            </Form.Item>
          </Form>
        ) : (
          <p>No student information available for editing.</p>
        )}
      </Modal>
    </div>
  );
};

export default StudentFeesList;
