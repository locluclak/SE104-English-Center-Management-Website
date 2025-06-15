"use client"

import React, { useState, useEffect } from "react"
import {
  Button,
  Form,
  Modal,
  Table,
  Space,
  Popconfirm,
  message,
  Select,
  Radio, // Import Radio for mode selection
} from "antd"
import moment from "moment"
import "./CoursesList.scss"
import { MainApiRequest } from "@/services/MainApiRequest"
import SearchInput from "@/components/SearchInput/SearchInput"
import FloatingLabelInput from "@/components/FloatingInput/FloatingLabelInput"

interface Course {
  id: number
  name: string
  description: string
  teacherName: string
  startDate: string
  endDate: string
  minStu: number
  maxStu: number
  price: number
  status: string
  teacherId?: number | null
}

interface Teacher {
  ID: number
  NAME: string
  EMAIL: string
}

const CoursesList = () => {
  const [form] = Form.useForm()
  const [coursesList, setCoursesList] = useState<Course[]>([])
  const [openCreateCoursesModal, setOpenCreateCoursesModal] = useState(false)
  const [editingCourses, setEditingCourses] = useState<Course | null>(null)
  const [searchKeyword, setSearchKeyword] = useState("")

  const [studentsInCourse, setStudentsInCourse] = useState<any[]>([])
  const [studentModalVisible, setStudentModalVisible] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)
  const [allStudents, setAllStudents] = useState<any[]>([])
  const [selectedStudentToAdd, setSelectedStudentToAdd] = useState<
    number | null
  >(null)

  const [teachersInCourse, setTeachersInCourse] = useState<Teacher[]>([]);
  const [teacherModalVisible, setTeacherModalVisible] = useState(false);
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherToAdd, setSelectedTeacherToAdd] = useState<number | null>(null);
  const [selectedTeacherRole, setSelectedTeacherRole] = useState<"LECTURER" | "ASSISTANT" | null>(null);

  const [reportModalVisible, setReportModalVisible] = useState(false)
  // reportMode: 'initial' for selection, 'course' for overall, 'assignment' for individual
  const [reportMode, setReportMode] = useState<"initial" | "course" | "assignment">("initial")
  const [courseReport, setCourseReport] = useState<any[]>([])
  const [assignmentReport, setAssignmentReport] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<
    number | null
  >(null)

  const fetchCoursesList = async () => {
    try {
      const res = await MainApiRequest.get("/course/all")
      const rawCourses = res.data

      const coursesWithDetails = await Promise.all(
        rawCourses.map(async (cls: any) => {
          const teacher = await fetchTeacherForCourse(cls.COURSE_ID)

          const currentDate = moment()
          const startDate = moment(cls.START_DATE)
          const endDate = moment(cls.END_DATE)
          let status = "Upcoming"

          if (currentDate.isBetween(startDate, endDate, null, "[]")) {
            status = "Active"
          } else if (currentDate.isAfter(endDate)) {
            status = "Completed"
          }

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
            numberStu: cls.NUMBER_STU,
            price: cls.PRICE,
            status,
          }
        })
      )

      setCoursesList(coursesWithDetails)
    } catch (error) {
      console.error("Failed to fetch courses:", error)
      message.error("Unable to load courses.")
    }
  }

  const fetchTeacherForCourse = async (courseId: number) => {
    try {
      const res = await MainApiRequest.get(`/course/teacher/${courseId}`)
      const teacher = res.data[0]
      return teacher
        ? { id: teacher.ID, name: teacher.NAME }
        : { id: null, name: "Unassigned" }
    } catch {
      return { id: null, name: "Unassigned" }
    }
  }

  const fetchAllTeachers = async () => {
    try {
      const res = await MainApiRequest.get("/person/teachers");
      setAllTeachers(res.data);
    } catch (error) {
      console.error("Failed to fetch all teachers:", error);
      message.error("Unable to load teacher list.");
    }
  };

  const fetchTeachersInCourse = async (courseId: number) => {
    try {
      setSelectedCourseId(courseId);
      const res = await MainApiRequest.get(`/course/teacher/${courseId}`);
      setTeachersInCourse(res.data);
      setTeacherModalVisible(true);
    } catch (error) {
      console.error("Failed to fetch teachers in course:", error);
      message.error("Unable to load course teachers.");
    }
  };

  const addTeacherToCourse = async (teacherId: number, role: "LECTURER" | "ASSISTANT") => {
    if (!selectedCourseId) return;
    try {
      await MainApiRequest.post("/course/add-teacher", {
        teacherId: teacherId,
        courseId: selectedCourseId,
        role: role,
      });
      message.success("Teacher added to course successfully.");
      fetchTeachersInCourse(selectedCourseId);
      fetchCoursesList();
    } catch (error: any) {
      if (error?.response?.status === 409) {
        message.warning("Teacher is already assigned to this course!");
      } else {
        console.error("Failed to add teacher:", error);
        message.error("Unable to add teacher.");
      }
    }
  };

  const removeTeacherFromCourse = async (teacherId: number) => {
    if (!selectedCourseId) return;
    try {
      await MainApiRequest.delete("/course/remove-teacher", {
        data: { teacherId: teacherId, courseId: selectedCourseId },
      });
      message.success("Teacher removed from course.");
      fetchTeachersInCourse(selectedCourseId);
      fetchCoursesList();
    } catch (error) {
      console.error("Failed to remove teacher:", error);
      message.error("Unable to remove teacher.");
    }
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

  const handleAddSelectedTeacher = () => {
    if (!selectedTeacherToAdd || !selectedTeacherRole) {
      message.warning("Please select a teacher and a role.");
      return;
    }
    addTeacherToCourse(selectedTeacherToAdd, selectedTeacherRole);
    setSelectedTeacherToAdd(null);
    setSelectedTeacherRole(null);
  };


  useEffect(() => {
    fetchCoursesList()
  }, [])

  useEffect(() => {
    if (studentModalVisible) {
      fetchAllStudents()
    }
  }, [studentModalVisible])

  useEffect(() => {
    if (teacherModalVisible) {
      fetchAllTeachers();
    }
  }, [teacherModalVisible]);

  const openCourseModal = (course: Course | null = null) => {
    setEditingCourses(course)

    if (course) {
      form.setFieldsValue({
        ...course,
        startDate: moment(course.startDate),
        endDate: moment(course.endDate),
      })
    } else {
      form.resetFields()
    }

    setOpenCreateCoursesModal(true)
  }

  const handleAddSelectedStudent = () => {
    if (!selectedStudentToAdd) return
    addStudentToCourse(selectedStudentToAdd)
    setSelectedStudentToAdd(null)
  }

  const fetchStudentsInCourse = async (courseId: number) => {
    try {
      setSelectedCourseId(courseId)
      const res = await MainApiRequest.get(`/course/${courseId}/students`)
      const students = res.data
      setStudentsInCourse(students)
      setStudentModalVisible(true)
    } catch (error: any) {
      console.error("Failed to fetch students:", error)
      message.error("Unable to load students.")
    }
  }

  const addStudentToCourse = async (studentId: number) => {
    if (!selectedCourseId) return
    try {
      await MainApiRequest.post("/course/add-student", {
        courseId: selectedCourseId,
        studentId,
      })
      message.success("Student added successfully.")
      fetchStudentsInCourse(selectedCourseId)
      fetchCoursesList();
    } catch (error: any) {
      if (error?.response?.status === 409) {
        message.warning("Student is already added to this course!")
      } else {
        console.error("Failed to add student:", error)
        message.error("Unable to add student.")
      }
    }
  }

  const removeStudentFromCourse = async (studentId: number) => {
    if (!selectedCourseId) return
    try {
      await MainApiRequest.delete("/course/remove-student", {
        data: { courseId: selectedCourseId, studentId },
      })
      message.success("Student removed.")
      fetchStudentsInCourse(selectedCourseId)
      fetchCoursesList();
    } catch (error) {
      message.error("Unable to remove student.")
    }
  }

  const fetchAssignmentsByCourse = async (courseId: number) => {
    try {
      const res = await MainApiRequest.get(`/submission/by_course/${courseId}`)

      if (Array.isArray(res.data)) {
        setAssignments(res.data)
      } else if (Array.isArray(res.data.report)) {
        setAssignments(res.data.report)
        if (res.data.report.length === 0) {
          message.info(
            res.data.message || "No assignments found for this course."
          )
        }
      } else {
        message.warning("Invalid response from server.")
      }
    } catch (error: any) {
      const serverMsg =
        error?.response?.data?.message || error?.response?.data?.error
      message.error(serverMsg || "Unable to load assignment list.")
    }
  }

  const fetchAssignmentReport = async (assignmentId: number) => {
    try {
      const res = await MainApiRequest.get(
        `/submission/report/${assignmentId}`
      )
      setAssignmentReport(res.data.report)
      setReportMode("assignment")
    } catch (error) {
      message.error("Unable to load assignment report.")
    }
  }

  // --- NEW/MODIFIED: handleViewCourseReport to initialize report modal ---
  const handleViewCourseReport = async (courseId: number) => {
    setSelectedCourseId(courseId);
    setReportMode("initial"); // Start with initial selection mode
    setReportModalVisible(true);
    // Fetch assignments for the dropdown as soon as the modal opens, regardless of initial view
    await fetchAssignmentsByCourse(courseId);
  }

  // --- NEW: Function to load course report data ---
  const loadCourseReport = async () => {
    if (!selectedCourseId) return;
    try {
      const res = await MainApiRequest.get(`/submission/course_report/${selectedCourseId}`);
      const reportData = res.data?.report || [];
      setCourseReport(reportData);
      setReportMode("course");
      if (reportData.length === 0) {
        message.info(res.data?.message || "No students have submitted for this course.");
      }
    } catch (err) {
      console.error("Error fetching course report:", err);
      message.error("Unable to load course report.");
    }
  };

  // --- NEW: Function to handle mode change in report modal ---
  const handleReportModeChange = (e: any) => {
    const mode = e.target.value;
    setReportMode(mode);
    if (mode === "course") {
      loadCourseReport();
      setSelectedAssignmentId(null); // Reset selected assignment if switching to course view
      setAssignmentReport([]); // Clear assignment report data
    } else if (mode === "assignment") {
      // User will select an assignment from dropdown, data will be loaded then
      setCourseReport([]); // Clear course report data
    }
  };


  const onOKCreateCourses = async () => {
    try {
      const values = await form.validateFields()

      const currentDate = moment()
      const startDate = moment(values.startDate)
      const endDate = moment(values.endDate)
      let status = "Upcoming"

      if (currentDate.isBetween(startDate, endDate, null, "[]")) {
        status = "Active"
      } else if (currentDate.isAfter(endDate)) {
        status = "Completed"
      }

      const payload = {
        name: values.name,
        description: values.description,
        startDate: startDate.format("YYYY-MM-DD"),
        endDate: endDate.format("YYYY-MM-DD"),
        minStu: values.minStu,
        maxStu: values.maxStu,
        price: values.price,
        status,
      }

      let courseId: number;

      if (editingCourses) {
        await MainApiRequest.put(`/course/update/${editingCourses.id}`, payload);
        courseId = editingCourses.id;
        message.success("Course updated successfully!");
      } else {
        const createRes = await MainApiRequest.post("/course/create", payload);
        courseId = createRes.data.courseId;
        message.success("Course created successfully!");
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
      await MainApiRequest.delete(`/courses/${id}`)
      fetchCoursesList()
      message.success("Course deleted successfully!")
    } catch (error) {
      console.error("Delete failed:", error)
      message.error("Unable to delete course.")
    }
  }

const downloadCsvFromBlob = (data: Blob, filename: string) => {
  const url = window.URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const handleExportCourseCsv = async (courseId: number) => {
  try {
    const res = await MainApiRequest.get(`/submission/export_csv_course/${courseId}`, {
      responseType: 'blob',
    });

    const filename = `course_${courseId}_report_scores.csv`;
    downloadCsvFromBlob(res.data, filename);

    message.success("Course report exported successfully!");
  } catch (error) {
    console.error("Failed to export course report CSV:", error);
    message.error("Unable to export course report CSV.");
  }
};

const handleExportAssignmentCsv = async (assignmentId: number) => {
    try {
        const res = await MainApiRequest.get(`/submission/export_csv_assignment/${assignmentId}`, {
            responseType: 'blob',
        });
        const filename = `assignment_${assignmentId}_report.csv`;
        downloadCsvFromBlob(res.data, filename);
        message.success("Assignment report exported successfully!");
    } catch (error) {
        console.error("Failed to export assignment report CSV:", error);
        message.error("Unable to export assignment report CSV.");
    }
};

  const handleSearch = (value: string) => {
    const keyword = value.trim().toLowerCase()
    setSearchKeyword(keyword)
    if (!keyword) {
      fetchCoursesList()
      return
    }
    const filtered = coursesList.filter(
      (course) =>
        course.name.toLowerCase().includes(keyword) ||
        course.teacherName.toLowerCase().includes(keyword)
    )
    setCoursesList(filtered)
  }

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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
                onSearch={() => handleSearch(searchKeyword)}
                allowClear
              />
            </Form>
          </div>
          <Button
            type="primary"
            icon={<i className="fas fa-plus"></i>}
            onClick={() => openCourseModal()}
          >
          </Button>
        </div>
      </div>

      <Modal
        className="courses-modal"
        title={editingCourses ? "Edit Course" : "Add New Course"}
        open={openCreateCoursesModal}
        onOk={onOKCreateCourses}
        onCancel={() => {
          setOpenCreateCoursesModal(false)
          form.resetFields()
        }}
        destroyOnClose={true}
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
        </Form>
      </Modal>

      <Table
        dataSource={coursesList}
        rowKey="id"
        pagination={{ pageSize: 5, showSizeChanger: true }}
        columns={[
          { title: "ID", dataIndex: "id" },
          { title: "Name", dataIndex: "name" },
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
          { title: "Min Stu", dataIndex: "minStu" },
          { title: "Max Stu", dataIndex: "maxStu" },
          { title: "No. Students", dataIndex: "numberStu" },
          {
            title: "Price",
            dataIndex: "price",
            render: (text) =>
              new Intl.NumberFormat("en-US", {
                currency: "VND",
              }).format(text),
          },
          { title: "Status", dataIndex: "status" },
          {
            title: "Actions",
            render: (_, record: Course) => (
              <Space>
                <Button onClick={() => openCourseModal(record)} title="Edit">
                  <i className="fas fa-edit"></i>
                </Button>
                <Button onClick={() => fetchStudentsInCourse(record.id)} title="Manage Students">
                  <i className="fas fa-users"></i>
                </Button>
                <Button onClick={() => fetchTeachersInCourse(record.id)} title="Manage Teachers">
                  <i className="fas fa-user-tie"></i>
                </Button>
                <Button onClick={() => handleViewCourseReport(record.id)} title="View Report">
                  <i className="fas fa-chart-bar"></i>
                </Button>
                <Popconfirm
                  title="Are you sure you want to delete this course?"
                  onConfirm={() => onDeleteCourses(record.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button danger title="Delete">
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
          setStudentModalVisible(false)
          setSelectedStudentToAdd(null)
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
            Add Student
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
                    title="Are you sure you want to remove this student?"
                    onConfirm={() => removeStudentFromCourse(record.ID)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button danger>Remove</Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </Modal>

      {/* Teacher management modal */}
      <Modal
        title={`Teachers in Course #${selectedCourseId}`}
        open={teacherModalVisible}
        onCancel={() => {
          setTeacherModalVisible(false);
          setSelectedTeacherToAdd(null);
          setSelectedTeacherRole(null);
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
            placeholder="Select Teacher to Add"
            value={selectedTeacherToAdd}
            onChange={(value) => setSelectedTeacherToAdd(value)}
          >
            {allTeachers.map((teacher) => (
              <Select.Option key={teacher.ID} value={teacher.ID}>
                {teacher.NAME} - {teacher.EMAIL}
              </Select.Option>
            ))}
          </Select>
          <Select
            style={{ width: 150 }}
            placeholder="Select Role"
            value={selectedTeacherRole}
            onChange={(value: "LECTURER" | "ASSISTANT") => setSelectedTeacherRole(value)}
          >
            <Select.Option value="LECTURER">LECTURER</Select.Option>
            <Select.Option value="ASSISTANT">ASSISTANT</Select.Option>
          </Select>
          <Button
            type="primary"
            onClick={handleAddSelectedTeacher}
            disabled={!selectedTeacherToAdd || !selectedTeacherRole}
          >
            Add Teacher
          </Button>
        </div>

        <Table
          rowKey="ID"
          dataSource={teachersInCourse.map((t) => ({
            ...t,
            NAME: t.NAME?.trim() || "(No Name)",
            EMAIL: t.EMAIL || "-",
          }))}
          columns={[
            { title: "Name", dataIndex: "NAME" },
            { title: "Email", dataIndex: "EMAIL" },
            { title: "Role", dataIndex: "ROLE" }, 
            {
              title: "Actions",
              render: (_, record) => (
                <Space>
                  <Popconfirm
                    title="Are you sure you want to remove this teacher?"
                    onConfirm={() => removeTeacherFromCourse(record.ID)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button danger>Remove</Button>
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
        onCancel={() => {
            setReportModalVisible(false);
            setReportMode("initial"); 
            setCourseReport([]); 
            setAssignmentReport([]); 
            setSelectedAssignmentId(null); 
        }}
        footer={null}
        width={800}
      >

        <div style={{ marginBottom: 20 }}>
          <Radio.Group onChange={handleReportModeChange} value={reportMode}>
            <Radio.Button value="course">Overall Course Report</Radio.Button>
            <Radio.Button value="assignment">Individual Assignment Report</Radio.Button>
          </Radio.Group>
        </div>

        {reportMode === "initial" && (
          <p>Please select a report type above to view.</p>
        )}

        {/* Overall Course Report View */}
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
              // Conditional message if no data
              locale={{ emptyText: "No submissions yet for this course." }}
            />

            <div style={{ marginTop: 20 }}>
              <Button
                type="primary"
                onClick={() => handleExportCourseCsv(selectedCourseId!)}
                disabled={!selectedCourseId || courseReport.length === 0} 
              >
                Export Overall Course CSV
              </Button>
            </div>
          </>
        )}

        {/* Individual Assignment Report View */}
        {reportMode === "assignment" && (
          <>
            <div style={{ marginBottom: 20 }}>
              <h4>Select Assignment</h4>
              <Select
                style={{ width: 300 }}
                placeholder="Select Assignment"
                value={selectedAssignmentId}
                onChange={(id) => {
                  setSelectedAssignmentId(id);
                  if (id) {
                      fetchAssignmentReport(id); 
                  } else {
                      setAssignmentReport([]); 
                  }
                }}
              >
                {assignments.map((a) => (
                  <Select.Option key={a.AS_ID} value={a.AS_ID}>
                    {a.NAME}
                  </Select.Option>
                ))}
              </Select>
            </div>

            {selectedAssignmentId && (
                <>
                    <Table
                        style={{ marginTop: 20 }}
                        dataSource={assignmentReport}
                        rowKey={(r) => `${r.STUDENT_NAME}-${r.STUDENT_EMAIL}`}
                        columns={[
                            { title: "Student", dataIndex: "STUDENT_NAME" },
                            { title: "Email", dataIndex: "STUDENT_EMAIL" },
                            { title: "Submit Date", dataIndex: "SUBMIT_DATE", render: (text) => text ? moment(text).format("DD-MM-YYYY HH:mm:ss") : '-' },
                            { title: "Score", dataIndex: "SCORE" },
                        ]}
                        pagination={false}
                        locale={{ emptyText: "No submissions yet for this assignment." }}
                    />
                    <div style={{ marginTop: 20 }}>
                        <Button
                            type="primary"
                            onClick={() => handleExportAssignmentCsv(selectedAssignmentId!)}
                            disabled={!selectedAssignmentId || assignmentReport.length === 0} // Disable if no data
                        >
                            Export Assignment CSV
                        </Button>
                    </div>
                </>
            )}
            {!selectedAssignmentId && (
                <p style={{marginTop: 20}}>Please select an assignment from the dropdown above to view its report.</p>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default CoursesList;