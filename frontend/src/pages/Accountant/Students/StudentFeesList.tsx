import { useState, useEffect } from "react"
import { Table, Modal, Button, message, Select, Form } from "antd"
import { MainApiRequest } from "@/services/MainApiRequest"
import FloatingLabelInput from "@/components/FloatingInput/FloatingLabelInput"
import "./StudentFeesList.scss"

// Interface cho báo cáo theo lớp học
interface Student {
  student_name: string
  student_email: string
  payment_price: number
  payment_type: string
  payment_status: string
  payment_date: string | null
  payment_id: string
}

interface ClassReport {
  courseId: string
  totalRevenue: number
  students: Student[]
}

interface TuitionUpdate {
  PRICE: number
  TYPE: string
  DESCRIPTION: string
  STATUS: string
  PAID_DATE: string
}

const StudentFeesList = () => {
  const [courseId, setCourseId] = useState<string | null>("")
  const [report, setReport] = useState<any[]>([])
  const [overallRevenue, setOverallRevenue] = useState(0)
  const [availableCourses, setAvailableCourses] = useState<any[]>([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [form] = Form.useForm()

  // Fetch danh sách khóa học
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await MainApiRequest.get("/course/all")
        setAvailableCourses(response.data)
      } catch (error) {
        console.error("Lỗi khi tải danh sách lớp học:", error)
        message.error("Không thể tải danh sách lớp học.")
      }
    }
    fetchCourses()
  }, [])

  const handleEditStudent = (student: Student) => {
    console.log("Selected student:", student); // Kiểm tra xem student có đúng dữ liệu không
    setSelectedStudent(student);

    // Set dữ liệu cho form modal
    form.setFieldsValue({
      student_name: student.student_name,
      student_email: student.student_email,
      payment_price: student.payment_price,
      payment_status: student.payment_status,
      payment_type: student.payment_type,
      payment_date: student.payment_date ? new Date(student.payment_date) : null,
    });

    setIsModalVisible(true);
  };

  const onOkSubmit = async () => {
    console.log("Selected student:", selectedStudent);

    if (!selectedStudent || !selectedStudent.payment_id) {
      message.error("Không có thông tin học viên để cập nhật.");
      return;
    }

    try {
      const values = await form.validateFields();
        console.log("Values from the form:", values);
      // Cập nhật dữ liệu, không bao gồm student_name và student_email
      const normalizedData: TuitionUpdate = {
        PRICE: values.payment_price,
        TYPE: values.payment_type,
        DESCRIPTION: "Paid in full", // Giữ nguyên mô tả
        STATUS: values.payment_status,
        PAID_DATE: values.payment_date ? values.payment_date.toISOString() : selectedStudent.payment_date, // Chỉ cập nhật khi có thay đổi
      };

      console.log("Data to be sent to API:", normalizedData);

      const response = await MainApiRequest.put(`/tuition/${selectedStudent.payment_id}`, normalizedData);

      // Log phản hồi từ API
      console.log("API response:", response);

      if (response.status === 200) {
        message.success("Cập nhật học phí thành công!");
        const updatedStudent = {
          ...selectedStudent,
          payment_price: values.payment_price,
          payment_type: values.payment_type,
          payment_status: values.payment_status,
          payment_date: values.payment_date ? values.payment_date.toISOString() : selectedStudent.payment_date,
        };

        const updatedReport = report.map((student) =>
          student.payment_id === selectedStudent.payment_id ? updatedStudent : student,
        );
        setReport(updatedReport);
        setIsModalVisible(false);
        form.resetFields();
      }
    } catch (error: any) {
      // Log lỗi
      console.error("Error during tuition update:", error);

      if (error && error.errorFields) {
        message.error("Vui lòng kiểm tra lại thông tin đã nhập.");
      } else {
        message.error("Không thể cập nhật học phí.");
      }
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedStudent(null);
    form.resetFields();
  };

  const handleViewReport = async () => {
    if (!courseId) {
      message.error("Vui lòng chọn lớp học.");
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
        message.warning("Không có dữ liệu báo cáo cho lớp học đã chọn.");
      }
    } catch (err) {
      console.error("Error fetching course report data", err);
      message.error("Không thể tải báo cáo theo lớp học.");
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

  // Options cho select components
  const paymentStatusOptions = [
    { label: "PAID", value: "PAID" },
    { label: "UNPAID", value: "UNPAID" },
  ];

  const paymentTypeOptions = [
    { label: "CASH", value: "CASH" },
    { label: "CREDIT", value: "CREDIT" },
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

      {overallRevenue > 0 && (
        <div className="revenue-summary">
          <h4>
            Total Revenue:{" "}
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(overallRevenue)}
          </h4>
        </div>
      )}

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
            <div className="form-row">
              <FloatingLabelInput
                label="Student Name"
                name="student_name"
                component="input"
                disabled
              />
            </div>

            <div className="form-row">
              <FloatingLabelInput
                label="Student Email"
                name="student_email"
                component="input"
                disabled
              />
            </div>

            <div className="form-row">
              <FloatingLabelInput
                label="Tuition Fee"
                name="payment_price"
                component="input"
                type="number"
                required
                rules={[
                  { required: true, message: "Vui lòng nhập học phí" },
                  { type: "number", min: 0, message: "Học phí phải lớn hơn 0" },
                ]}
              />
            </div>

            <div className="form-row">
              <FloatingLabelInput
                label="Payment Status"
                name="payment_status"
                component="select"
                required
                options={paymentStatusOptions}
              />
            </div>

            <div className="form-row">
              <FloatingLabelInput
                label="Payment Type"
                name="payment_type"
                component="select"
                required
                options={paymentTypeOptions}
              />
            </div>

            <div className="form-row">
              <FloatingLabelInput
                label="Payment Date"
                name="payment_date"
                component="date"
                componentProps={{
                  format: "DD/MM/YYYY HH:mm:ss",
                  showTime: true,
                }}
              />
            </div>
          </Form>
        ) : (
          <p>No student information available for editing.</p>
        )}
      </Modal>
    </div>
  );
};

export default StudentFeesList;
