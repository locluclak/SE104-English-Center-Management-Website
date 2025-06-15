import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  Modal,
  Table,
  Space,
  Popconfirm,
  message,
  Select,
} from "antd";
import moment from "moment";
import "./CoursesList.scss";
import { MainApiRequest } from "@/services/MainApiRequest";
import SearchInput from "@/components/SearchInput/SearchInput";
import FloatingLabelInput from "@/components/FloatingInput/FloatingLabelInput";

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
  teacherId?: number;
}

const CoursesList = () => {
  const [form] = Form.useForm();
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [openCreateCoursesModal, setOpenCreateCoursesModal] = useState(false);
  const [editingCourses, setEditingCourses] = useState<Course | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [teacherOptions, setTeacherOptions] = useState<
    { label: string; value: number }[]
  >([]);

  const [studentsInCourse, setStudentsInCourse] = useState<any[]>([]);
  const [studentModalVisible, setStudentModalVisible] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [selectedStudentToAdd, setSelectedStudentToAdd] = useState<
    number | null
  >(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportMode, setReportMode] = useState<"course" | "assignment">(
    "course"
  );
  const [courseReport, setCourseReport] = useState<any[]>([]);
  const [assignmentReport, setAssignmentReport] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<
    number | null
  >(null);

  const fetchCoursesList = async () => {
  try {
    const res = await MainApiRequest.get("/course/all");
    const rawCourses = res.data;

    const coursesWithTeachers = await Promise.all(
      rawCourses.map(async (cls: any) => {
        const teacher = await fetchTeacherForCourse(cls.COURSE_ID);
        return {
          id: cls.COURSE_ID,
          name: cls.NAME,
          description: cls.DESCRIPTION,
          teacherName: teacher.name,
          teacherId: teacher.id,
          startDate: cls.START_DATE,
          endDate: cls.END_DATE,
          minStu: cls.MIN_STU,
          maxStu: cls.MAX_STU,
          price: cls.PRICE,
          status: cls.STATUS || "waiting",
        };
      })
    );

    setCoursesList(coursesWithTeachers);
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    message.error("Unable to load courses.");
  }
};

  const fetchTeacherForCourse = async (courseId: number) => {
    try {
      const res = await MainApiRequest.get(`/course/teacher/${courseId}`);
      const teacher = res.data[0];
      return teacher
        ? { id: teacher.ID, name: teacher.NAME }
        : { id: null,    name: "Unknown" };
    } catch {
      return { id: null, name: "Unknown" };
    }
  };

  const fetchTeachers = async (courseId?: number) => {
    try {
      const res = await MainApiRequest.get("/person/teachers");
      const options = res.data.map((t: any) => ({
        label: t.NAME,
        value: t.ID,
      }));
      setTeacherOptions(options);

      if (courseId) {
        const currentTeacherRes = await MainApiRequest.get(
          `/course/teacher/${courseId}`
        );
        const teacher = currentTeacherRes.data[0];
        if (teacher) {
          form.setFieldValue("teacherId", teacher.ID);
        }
      }
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
      message.error("Unable to load teacher data.");
    }
  };

  useEffect(() => {
    fetchCoursesList();
  }, []);

  const openCourseModal = (course: Course | null = null) => {
    setEditingCourses(course);

    if (course) {
      form.setFieldsValue({
        ...course,
        startDate: moment(course.startDate),
        endDate: moment(course.endDate),
      });
      fetchTeachers(course.id);
    } else {
      form.resetFields();
      fetchTeachers();
    }

    setOpenCreateCoursesModal(true);
  };

  const fetchAllStudents = async () => {
    try {
      const res = await MainApiRequest.get("/person/students");
      setAllStudents(res.data);
    } catch (error) {
      console.error("Failed to fetch students:", error);
      message.error("Unable to load student data.");
    }
  };

  useEffect(() => {
    if (studentModalVisible) {
      fetchAllStudents();
    }
  }, [studentModalVisible]);

  const handleAddSelectedStudent = () => {
    if (!selectedStudentToAdd) return;
    addStudentToCourse(selectedStudentToAdd);
    setSelectedStudentToAdd(null);
  };

  const fetchStudentsInCourse = async (courseId: number) => {
    try {
      setSelectedCourseId(courseId);
      const res = await MainApiRequest.get(`/course/${courseId}/students`);
      const students = res.data;
      setStudentsInCourse(students);
      setStudentModalVisible(true);
    } catch (error: any) {
      console.error("Failed to fetch students:", error);
      message.error("Unable to load students.");
    }
  };

  const addStudentToCourse = async (studentId: number) => {
    if (!selectedCourseId) return;
    try {
      await MainApiRequest.post("/course/add-student", {
        courseId: selectedCourseId,
        studentId,
      });
      message.success("Student added successfully");
      fetchStudentsInCourse(selectedCourseId);
    } catch (error: any) {
      if (error?.response?.status === 409) {
        message.warning("Học viên đã được thêm vào khóa học này!");
      } else {
        console.error("Failed to add student:", error);
        message.error("Không thể thêm học viên.");
      }
    }
  };

  const removeStudentFromCourse = async (studentId: number) => {
    if (!selectedCourseId) return;
    try {
      await MainApiRequest.delete("/course/remove-student", {
        data: { courseId: selectedCourseId, studentId },
      });
      message.success("Student removed.");
      fetchStudentsInCourse(selectedCourseId);
    } catch (error) {
      message.error("Failed to remove student.");
    }
  };

  const fetchAssignmentsByCourse = async (courseId: number) => {
    try {
      const res = await MainApiRequest.get(`/submission/by_course/${courseId}`);

      // Nếu response dạng { report: [], message: '...' }
      if (Array.isArray(res.data)) {
        setAssignments(res.data);
      } else if (Array.isArray(res.data.report)) {
        setAssignments(res.data.report);
        if (res.data.report.length === 0) {
          message.info(
            res.data.message || "Chưa có bài tập nào trong khóa học này."
          );
        }
      } else {
        message.warning("Phản hồi không hợp lệ từ server.");
      }
    } catch (error: any) {
      const serverMsg =
        error?.response?.data?.message || error?.response?.data?.error;
      message.error(serverMsg || "Không thể tải danh sách bài tập.");
    }
  };

  const fetchAssignmentReport = async (assignmentId: number) => {
    try {
      const res = await MainApiRequest.get(
        `/submission/report/${assignmentId}`
      );
      setAssignmentReport(res.data.report);
      setReportMode("assignment");
    } catch (error) {
      message.error("Không thể tải báo cáo bài tập.");
    }
  };

  const handleViewCourseReport = async (courseId: number) => {
  try {
    setSelectedCourseId(courseId);
    const res = await MainApiRequest.get(`/submission/course_report/${courseId}`);
    const reportData = res.data?.report || [];

    setCourseReport(reportData);
    setReportMode("course");
    setReportModalVisible(true);

    if (reportData.length === 0) {
      message.info(res.data?.message || "Chưa có học viên nào nộp bài cho khóa học này.");
    }

    await fetchAssignmentsByCourse(courseId);
  } catch (err) {
    message.error("Không thể tải báo cáo khoá học.");
  }
};


  const onOKCreateCourses = async () => {
    try {
      const values = await form.validateFields();
      const selectedTeacher = teacherOptions.find(
        (t) => t.value === values.teacherId
      );
      const teacherName = selectedTeacher?.label;

      const payload = {
        name: values.name,
        description: values.description,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate.format("YYYY-MM-DD"),
        minStu: values.minStu,
        maxStu: values.maxStu,
        price: values.price,
        status: values.status,
        teacherName,
      };

      let courseId: number;

      if (editingCourses) {
        await MainApiRequest.put(`/course/update/${editingCourses.id}`, payload);
        const courseId = editingCourses.id;
      
        if (editingCourses.teacherId !== values.teacherId) {
          if (editingCourses.teacherId) {
            await MainApiRequest.delete("/course/remove-teacher", {
              data: { teacherId: editingCourses.teacherId, courseId },
            });
          }
          if (values.teacherId) {
            await MainApiRequest.post("/course/add-teacher", {
              teacherId: values.teacherId,
              courseId,
              role: "LECTURER",
            });
          }
        }
  
        message.success("Course updated successfully!");
      }      

      await fetchCoursesList();
      setOpenCreateCoursesModal(false);
      form.resetFields();
      setEditingCourses(null);
    } catch (error: any) {
      console.error("Failed to save course:", error);
      message.error(
        error?.response?.data?.error || "Failed to save course information."
      );
    }
  };

  const onDeleteCourses = async (id: number) => {
    try {
      await MainApiRequest.delete(`/courses/${id}`);
      fetchCoursesList();
      message.success("Course deleted successfully!");
    } catch (error) {
      console.error("Delete failed:", error);
      message.error("Unable to delete course.");
    }
  };

  const handleSearch = (value: string) => {
    const keyword = value.trim().toLowerCase();
    setSearchKeyword(keyword);
    if (!keyword) {
      fetchCoursesList();
      return;
    }
    const filtered = coursesList.filter(
      (course) =>
        course.name.toLowerCase().includes(keyword) ||
        course.teacherName.toLowerCase().includes(keyword)
    );
    setCoursesList(filtered);
  };

  return (
    <div className="container-fluid m-2">
      <div className="sticky-header-wrapper">
        <h2 className="h2 header-custom">COURSES MANAGEMENT</h2>
        <div className="header-actions d-flex me-3 py-2 align-items-center justify-content-between">
          <div className="flex-grow-1 d-flex justify-content-center">
            <Form layout="inline" className="search-form d-flex">
              <SearchInput
                placeholder="Search courses..."
                value={searchKeyword}
                onChange={(e) => handleSearch(e.target.value)}
                onSearch={() => handleSearch(searchKeyword)}
                allowClear
              />
            </Form>
          </div>
          <Button
            type="primary"
            icon={<i className="fas fa-plus"></i>}
            onClick={() => openCourseModal()}
          />
        </div>
      </div>

      <Modal
        className="courses-modal"
        title={editingCourses ? "Edit Course" : "Add New Course"}
        open={openCreateCoursesModal}
        onOk={onOKCreateCourses}
        onCancel={() => {
          setOpenCreateCoursesModal(false);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <FloatingLabelInput
            label="Course Name"
            name="name"
            required
            component="input"
          />
          <FloatingLabelInput
            label="Description"
            name="description"
            required
            component="input"
          />
          <FloatingLabelInput
            label="Teacher"
            name="teacherId"
            required
            component="select"
            options={teacherOptions}
          />
          <FloatingLabelInput
            label="Start Date"
            name="startDate"
            required
            component="date"
            componentProps={{ format: "DD-MM-YYYY" }}
          />
          <FloatingLabelInput
            label="End Date"
            name="endDate"
            required
            component="date"
            componentProps={{ format: "DD-MM-YYYY" }}
          />
          <FloatingLabelInput
            label="Minimum Students"
            name="minStu"
            required
            component="input"
            type="number"
          />
          <FloatingLabelInput
            label="Maximum Students"
            name="maxStu"
            required
            component="input"
            type="number"
          />
          <FloatingLabelInput
            label="Price"
            name="price"
            required
            component="input"
            type="number"
          />
          <FloatingLabelInput
            label="Status"
            name="status"
            required
            component="select"
            options={[
              { label: "Waiting", value: "waiting" },
              { label: "Ongoing", value: "active" },
              { label: "Finished", value: "finished" },
            ]}
          />
        </Form>
      </Modal>

      <Table
        dataSource={coursesList}
        rowKey="id"
        pagination={{ pageSize: 5, showSizeChanger: true }}
        columns={[
          { title: "ID", dataIndex: "id" },
          { title: "Course Name", dataIndex: "name" },
          { title: "Description", dataIndex: "description" },
          { title: "Teacher", dataIndex: "teacherName" },
          {
            title: "Start Date",
            dataIndex: "startDate",
            render: (text) => moment(text).format("DD-MM-YYYY"),
          },
          {
            title: "End Date",
            dataIndex: "endDate",
            render: (text) => moment(text).format("DD-MM-YYYY"),
          },
          { title: "Min Students", dataIndex: "minStu" },
          { title: "Max Students", dataIndex: "maxStu" },
          {
            title: "Price",
            dataIndex: "price",
            render: (text) =>
              new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "VND",
              }).format(text),
          },
          { title: "Status", dataIndex: "status" },
          {
            title: "Actions",
            render: (_, record: Course) => (
              <Space>
                <Button onClick={() => openCourseModal(record)}>
                  <i className="fas fa-edit"></i>
                </Button>
                <Button onClick={() => fetchStudentsInCourse(record.id)}>
                  <i className="fas fa-users"></i>
                </Button>
                <Button onClick={() => handleViewCourseReport(record.id)}>
                  <i className="fas fa-chart-bar"></i>
                </Button>
                <Popconfirm
                  title="Delete this course?"
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

      <Modal
        title={`Students in Course #${selectedCourseId}`}
        open={studentModalVisible}
        onCancel={() => {
          setStudentModalVisible(false);
          setSelectedStudentToAdd(null);
        }}
        footer={null}
        width={800}
      >
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <Select
            style={{ width: 300 }}
            placeholder="Select Student to Add"
            value={selectedStudentToAdd}
            onChange={(value) => setSelectedStudentToAdd(value)}
          >
            {allStudents.map((student) => (
              <Select.Option key={student.ID} value={student.ID}>
                {student.NAME} - {student.EMAIL}
              </Select.Option>
            ))}
          </Select>
          <Button
            type="primary"
            onClick={handleAddSelectedStudent}
            disabled={!selectedStudentToAdd}
          >
            Thêm học viên
          </Button>
        </div>

        <Table
          rowKey="ID"
          dataSource={studentsInCourse.map((s) => ({
            ...s,
            NAME: s.NAME?.trim() || "(No Name)",
            EMAIL: s.EMAIL || "-",
            PHONE_NUMBER: s.PHONE_NUMBER || "N/A",
            DATE_OF_BIRTH: s.DATE_OF_BIRTH
              ? moment(s.DATE_OF_BIRTH).format("DD-MM-YYYY")
              : "-",
            ENROLL_DATE: s.ENROLL_DATE
              ? moment(s.ENROLL_DATE).format("DD-MM-YYYY")
              : "-",
            PAYMENT_STATUS: s.PAYMENT_STATUS || "UNPAID",
          }))}
          columns={[
            { title: "Name", dataIndex: "NAME" },
            { title: "Email", dataIndex: "EMAIL" },
            { title: "Phone", dataIndex: "PHONE_NUMBER" },
            { title: "DOB", dataIndex: "DATE_OF_BIRTH" },
            { title: "Enroll Date", dataIndex: "ENROLL_DATE" },
            { title: "Payment", dataIndex: "PAYMENT_STATUS" },
            {
              title: "Actions",
              render: (_, record) => (
                <Space>
                  <Popconfirm
                    title="Remove this student?"
                    onConfirm={() => removeStudentFromCourse(record.ID)}
                  >
                    <Button danger>Delete</Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </Modal>
      <Modal
        title={`Grade Report for Course #${selectedCourseId}`}
        open={reportModalVisible}
        onCancel={() => setReportModalVisible(false)}
        footer={null}
        width={800}
      >
        {reportMode === "course" && (
          <>
            <Table
              dataSource={courseReport}
              rowKey={(r) => `${r.STUDENT_NAME}-${r.ASSIGNMENT_NAME}`}
              columns={[
                { title: "Student", dataIndex: "STUDENT_NAME" },
                { title: "Assignment", dataIndex: "ASSIGNMENT_NAME" },
                { title: "Score", dataIndex: "SCORE" },
              ]}
              pagination={false}
            />

            <div style={{ marginTop: 20 }}>
              <Button
                type="primary"
                onClick={() =>
                  window.open(
                    `/api/submission/export_csv_course/${selectedCourseId}`,
                    "_blank"
                  )
                }
              >
                Export All Assignments CSV
              </Button>
            </div>

            <div style={{ marginTop: 30 }}>
              <h4>Xem báo cáo theo bài tập</h4>
              <Select
                style={{ width: 300 }}
                placeholder="Select Assignment"
                value={selectedAssignmentId}
                onChange={(id) => {
                  setSelectedAssignmentId(id);
                  fetchAssignmentReport(id);
                }}
              >
                {assignments.map((a) => (
                  <Select.Option key={a.AS_ID} value={a.AS_ID}>
                    {a.NAME}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </>
        )}

        {reportMode === "assignment" && (
          <>
            <Table
              style={{ marginTop: 20 }}
              dataSource={assignmentReport}
              rowKey={(r) => `${r.STUDENT_NAME}-${r.STUDENT_EMAIL}`}
              columns={[
                { title: "Student", dataIndex: "STUDENT_NAME" },
                { title: "Email", dataIndex: "STUDENT_EMAIL" },
                { title: "Submit Date", dataIndex: "SUBMIT_DATE" },
                { title: "Score", dataIndex: "SCORE" },
              ]}
              pagination={false}
            />
            <div style={{ marginTop: 20 }}>
              <Button
                type="primary"
                onClick={() =>
                  window.open(
                    `/api/submission/export_csv_assignment/${selectedAssignmentId}`,
                    "_blank"
                  )
                }
                disabled={!selectedAssignmentId}
              >
                Export Assignment CSV
              </Button>

              <Button
                style={{ marginLeft: 10 }}
                onClick={() => setReportMode("course")}
              >
                ← Back to Course Report
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default CoursesList;
