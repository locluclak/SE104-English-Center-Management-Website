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
  teacherId?: number | null // Can be null if no teacher is assigned
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

  const [teachersInCourse, setTeachersInCourse] = useState<Teacher[]>([]); // List of teachers in the course
  const [teacherModalVisible, setTeacherModalVisible] = useState(false); // Teacher management modal state
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]); // List of all available teachers
  const [selectedTeacherToAdd, setSelectedTeacherToAdd] = useState<number | null>(null); // Selected teacher to add
  const [selectedTeacherRole, setSelectedTeacherRole] = useState<"LECTURER" | "ASSISTANT" | null>(null); // Role for the selected teacher

  const [reportModalVisible, setReportModalVisible] = useState(false)
  const [reportMode, setReportMode] = useState<"course" | "assignment">(
    "course"
  )
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
          let status = "Upcoming" //  

          if (currentDate.isBetween(startDate, endDate, null, "[]")) {
            status = "Active" //  
          } else if (currentDate.isAfter(endDate)) {
            status = "Completed" //  
          }

          return {
            id: cls.COURSE_ID,
            name: cls.NAME,
            description: cls.DESCRIPTION,
            teacherName: teacher.name, // Assigned teacher's name
            teacherId: teacher.id, // Assigned teacher's ID
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
      message.error("Unable to load courses.") //  
    }
  }

  const fetchTeacherForCourse = async (courseId: number) => {
    try {
      const res = await MainApiRequest.get(`/course/teacher/${courseId}`)
      const teacher = res.data[0]
      return teacher
        ? { id: teacher.ID, name: teacher.NAME }
        : { id: null, name: "Unassigned" } //  
    } catch {
      return { id: null, name: "Unassigned" } //  
    }
  }

  const fetchAllTeachers = async () => {
    try {
      const res = await MainApiRequest.get("/person/teachers");
      setAllTeachers(res.data);
    } catch (error) {
      console.error("Failed to fetch all teachers:", error);
      message.error("Unable to load teacher list."); //  
    }
  };

  const fetchTeachersInCourse = async (courseId: number) => {
    try {
      setSelectedCourseId(courseId);
      const res = await MainApiRequest.get(`/course/teacher/${courseId}`); // Get teachers for the course
      setTeachersInCourse(res.data);
      setTeacherModalVisible(true);
    } catch (error) {
      console.error("Failed to fetch teachers in course:", error);
      message.error("Unable to load course teachers."); //  
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
      message.success("Teacher added to course successfully."); //  
      fetchTeachersInCourse(selectedCourseId); // Reload teachers in modal
      fetchCoursesList(); // Update main course list to reflect new teacher
    } catch (error: any) {
      if (error?.response?.status === 409) {
        message.warning("Teacher is already assigned to this course!"); //  
      } else {
        console.error("Failed to add teacher:", error);
        message.error("Unable to add teacher."); //  
      }
    }
  };

  const removeTeacherFromCourse = async (teacherId: number) => {
    if (!selectedCourseId) return;
    try {
      await MainApiRequest.delete("/course/remove-teacher", {
        data: { teacherId: teacherId, courseId: selectedCourseId },
      });
      message.success("Teacher removed from course."); //  
      fetchTeachersInCourse(selectedCourseId); // Reload teachers in modal
      fetchCoursesList(); // Update main course list
    } catch (error) {
      console.error("Failed to remove teacher:", error);
      message.error("Unable to remove teacher."); //  
    }
  };

  const fetchAllStudents = async () => {
    try {
      const res = await MainApiRequest.get("/person/students");
      setAllStudents(res.data);
    } catch (error) {
      console.error("Failed to fetch students:", error);
      message.error("Unable to load student data."); //  
    }
  };

  const handleAddSelectedTeacher = () => {
    if (!selectedTeacherToAdd || !selectedTeacherRole) {
      message.warning("Please select a teacher and a role."); //  
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
      fetchAllTeachers(); // Load all teachers when teacher management modal opens
    }
  }, [teacherModalVisible]);

  const openCourseModal = (course: Course | null = null) => {
    setEditingCourses(course)

    if (course) {
      form.setFieldsValue({
        ...course,
        startDate: moment(course.startDate),
        endDate: moment(course.endDate),
        // Teacher field is managed separately now
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
      message.error("Unable to load students.") //  
    }
  }

  const addStudentToCourse = async (studentId: number) => {
    if (!selectedCourseId) return
    try {
      await MainApiRequest.post("/course/add-student", {
        courseId: selectedCourseId,
        studentId,
      })
      message.success("Student added successfully.") //  
      fetchStudentsInCourse(selectedCourseId)
      fetchCoursesList(); // Update student count in main table
    } catch (error: any) {
      if (error?.response?.status === 409) {
        message.warning("Student is already added to this course!") //  
      } else {
        console.error("Failed to add student:", error)
        message.error("Unable to add student.") //  
      }
    }
  }

  const removeStudentFromCourse = async (studentId: number) => {
    if (!selectedCourseId) return
    try {
      await MainApiRequest.delete("/course/remove-student", {
        data: { courseId: selectedCourseId, studentId },
      })
      message.success("Student removed.") //  
      fetchStudentsInCourse(selectedCourseId)
      fetchCoursesList(); // Update student count in main table
    } catch (error) {
      message.error("Unable to remove student.") //  
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
            res.data.message || "No assignments found for this course." //  
          )
        }
      } else {
        message.warning("Invalid response from server.") //  
      }
    } catch (error: any) {
      const serverMsg =
        error?.response?.data?.message || error?.response?.data?.error
      message.error(serverMsg || "Unable to load assignment list.") //  
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
      message.error("Unable to load assignment report.") //  
    }
  }

  const handleViewCourseReport = async (courseId: number) => {
    try {
      setSelectedCourseId(courseId)
      const res = await MainApiRequest.get(`/submission/course_report/${courseId}`)
      const reportData = res.data?.report || []

      setCourseReport(reportData)
      setReportMode("course")
      setReportModalVisible(true)

      if (reportData.length === 0) {
        message.info(res.data?.message || "No students have submitted for this course.") //  
      }

      await fetchAssignmentsByCourse(courseId)
    } catch (err) {
      message.error("Unable to load course report.") //  
    }
  }

  const onOKCreateCourses = async () => {
    try {
      const values = await form.validateFields()

      const currentDate = moment()
      const startDate = moment(values.startDate)
      const endDate = moment(values.endDate)
      let status = "Upcoming" //  

      if (currentDate.isBetween(startDate, endDate, null, "[]")) {
        status = "Active" //  
      } else if (currentDate.isAfter(endDate)) {
        status = "Completed" //  
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
        // No longer sending teacherName/teacherId directly here
      }

      let courseId: number;

      if (editingCourses) {
        await MainApiRequest.put(`/course/update/${editingCourses.id}`, payload);
        courseId = editingCourses.id; // Get ID of the course being edited
        message.success("Course updated successfully!"); //  
      } else {
        const createRes = await MainApiRequest.post("/course/create", payload);
        courseId = createRes.data.courseId; // Get ID of the newly created course
        message.success("Course created successfully!"); //  
      }

      // Teacher add/remove logic is now separate

      await fetchCoursesList();
      setOpenCreateCoursesModal(false);
      form.resetFields();
      setEditingCourses(null);
    } catch (error: any) {
      console.error("Failed to save course:", error);
      message.error(
        error?.response?.data?.error || "Failed to save course information." //  
      );
    }
  };


  const onDeleteCourses = async (id: number) => {
    try {
      await MainApiRequest.delete(`/courses/${id}`)
      fetchCoursesList()
      message.success("Course deleted successfully!") //  
    } catch (error) {
      console.error("Delete failed:", error)
      message.error("Unable to delete course.") //  
    }
  }

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
                placeholder="Search courses..." //  
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
            Add New Course {/*   */}
          </Button>
        </div>
      </div>

      <Modal
        className="courses-modal"
        title={editingCourses ? "Edit Course" : "Add New Course"} //  
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
            label="Course Name" //  
            name="name"
            required
            component="input"
          />
          <FloatingLabelInput
            label="Description" //  
            name="description"
            required
            component="input"
          />
          <FloatingLabelInput
            label="Start Date" //  
            name="startDate"
            required
            component="date"
            componentProps={{ format: "DD-MM-YYYY" }}
          />
          <FloatingLabelInput
            label="End Date" //  
            name="endDate"
            required
            component="date"
            componentProps={{ format: "DD-MM-YYYY" }}
          />
          <FloatingLabelInput
            label="Minimum Students" //  
            name="minStu"
            required
            component="input"
            type="number"
          />
          <FloatingLabelInput
            label="Maximum Students" //  
            name="maxStu"
            required
            component="input"
            type="number"
          />
          <FloatingLabelInput
            label="Price" //  
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
          { title: "Name", dataIndex: "name" }, //  
          { title: "Description", dataIndex: "description" }, //  
          { title: "Teacher", dataIndex: "teacherName" }, //  
          {
            title: "Start Date", //  
            dataIndex: "startDate",
            render: (text) => moment(text).format("DD-MM-YYYY"),
          },
          {
            title: "End Date", //  
            dataIndex: "endDate",
            render: (text) => moment(text).format("DD-MM-YYYY"),
          },
          { title: "Min Stu", dataIndex: "minStu" }, //  
          { title: "Max Stu", dataIndex: "maxStu" }, //  
          { title: "No. Students", dataIndex: "numberStu" }, //  
          {
            title: "Price", //  
            dataIndex: "price",
            render: (text) =>
              new Intl.NumberFormat("en-US", { //   format for currency, you can choose 'vi-VN' for VND again if preferred.
                style: "currency",
                currency: "VND",
              }).format(text),
          },
          { title: "Status", dataIndex: "status" }, //  
          {
            title: "Actions", //  
            render: (_, record: Course) => (
              <Space>
                <Button onClick={() => openCourseModal(record)} title="Edit"> {/*   */}
                  <i className="fas fa-edit"></i>
                </Button>
                <Button onClick={() => fetchStudentsInCourse(record.id)} title="Manage Students"> {/*   */}
                  <i className="fas fa-users"></i>
                </Button>
                <Button onClick={() => fetchTeachersInCourse(record.id)} title="Manage Teachers"> {/*   */}
                  <i className="fas fa-user-tie"></i>
                </Button>
                <Button onClick={() => handleViewCourseReport(record.id)} title="View Report"> {/*   */}
                  <i className="fas fa-chart-bar"></i>
                </Button>
                <Popconfirm
                  title="Are you sure you want to delete this course?" //  
                  onConfirm={() => onDeleteCourses(record.id)}
                  okText="Yes" //  
                  cancelText="No" //  
                >
                  <Button danger title="Delete"> {/*   */}
                    <i className="fas fa-trash"></i>
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title={`Students in Course #${selectedCourseId}`} //  
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
            placeholder="Select Student to Add" //  
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
            Add Student {/*   */}
          </Button>
        </div>

        <Table
          rowKey="ID"
          dataSource={studentsInCourse.map((s) => ({
            ...s,
            NAME: s.NAME?.trim() || "(No Name)", //  
            EMAIL: s.EMAIL || "-",
            PHONE_NUMBER: s.PHONE_NUMBER || "N/A",
            DATE_OF_BIRTH: s.DATE_OF_BIRTH
              ? moment(s.DATE_OF_BIRTH).format("DD-MM-YYYY")
              : "-",
            ENROLL_DATE: s.ENROLL_DATE
              ? moment(s.ENROLL_DATE).format("DD-MM-YYYY")
              : "-",
            PAYMENT_STATUS: s.PAYMENT_STATUS || "UNPAID", //  
          }))}
          columns={[
            { title: "Name", dataIndex: "NAME" }, //  
            { title: "Email", dataIndex: "EMAIL" }, //  
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
            placeholder="Select Teacher to Add" //  
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
            placeholder="Select Role" //  
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
            Add Teacher {/*   */}
          </Button>
        </div>

        <Table
          rowKey="ID"
          dataSource={teachersInCourse.map((t) => ({
            ...t,
            NAME: t.NAME?.trim() || "(No Name)", //  
            EMAIL: t.EMAIL || "-",
          }))}
          columns={[
            { title: "Name", dataIndex: "NAME" }, //  
            { title: "Email", dataIndex: "EMAIL" }, //  
            { title: "Role", dataIndex: "ROLE" }, // Assuming API returns 'ROLE' field for teacher in course
            {
              title: "Actions", //  
              render: (_, record) => (
                <Space>
                  <Popconfirm
                    title="Are you sure you want to remove this teacher?" //  
                    onConfirm={() => removeTeacherFromCourse(record.ID)}
                    okText="Yes" //  
                    cancelText="No" //  
                  >
                    <Button danger>Remove</Button> {/*   */}
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </Modal>


      <Modal
        title={`Grade Report for Course #${selectedCourseId}`} //  
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
                { title: "Student", dataIndex: "STUDENT_NAME" }, //  
                { title: "Assignment", dataIndex: "ASSIGNMENT_NAME" }, //  
                { title: "Score", dataIndex: "SCORE" }, //  
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
                Export All Assignments CSV {/*   */}
              </Button>
            </div>

            <div style={{ marginTop: 30 }}>
              <h4>View Report by Assignment</h4> {/*   */}
              <Select
                style={{ width: 300 }}
                placeholder="Select Assignment" //  
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
                { title: "Student", dataIndex: "STUDENT_NAME" }, //  
                { title: "Email", dataIndex: "STUDENT_EMAIL" }, //  
                { title: "Submit Date", dataIndex: "SUBMIT_DATE" }, //  
                { title: "Score", dataIndex: "SCORE" }, //  
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
                Export Assignment CSV {/*   */}
              </Button>

              <Button
                style={{ marginLeft: 10 }}
                onClick={() => setReportMode("course")}
              >
                ← Back to Course Report {/*   */}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default CoursesList;