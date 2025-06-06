import React, { useEffect, useState } from "react";
import { Button, Form, Modal, Table, Space, Popconfirm, message } from "antd";
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

const normalizeCourses = (courses: any[]): Course[] =>
  courses.map((cls: any) => {
    const match = cls.DESCRIPTION?.match(/^\[Giáo viên:\s*(.*?)\]\s*/);
    const teacherName = match ? match[1] : "Unknown";
    const cleanDescription = cls.DESCRIPTION?.replace(
      /^\[Giáo viên:\s*.*?\]\s*/,
      ""
    );

    return {
      id: cls.COURSE_ID,
      name: cls.NAME,
      description: cleanDescription,
      teacherName,
      startDate: cls.START_DATE,
      endDate: cls.END_DATE,
      minStu: cls.MIN_STU,
      maxStu: cls.MAX_STU,
      price: cls.PRICE,
      status: cls.STATUS || "waiting",
      teacherId: cls.TEACHER_ID || null,
    };
  });

const CoursesList = () => {
  const [form] = Form.useForm();
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [openCreateCoursesModal, setOpenCreateCoursesModal] = useState(false);
  const [editingCourses, setEditingCourses] = useState<Course | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [teacherOptions, setTeacherOptions] = useState<
    { label: string; value: number }[]
  >([]);

  const fetchCoursesList = async () => {
    try {
      const res = await MainApiRequest.get("/course/all");
      const rawCourses = res.data;

      // Gọi song song để lấy giáo viên tương ứng
      const coursesWithTeachers = await Promise.all(
        rawCourses.map(async (cls: any) => {
          const teacherName = await fetchTeacherForCourse(cls.COURSE_ID);
          const match = cls.DESCRIPTION?.match(/^\[Giáo viên:\s*(.*?)\]\s*/);
          const cleanDescription = cls.DESCRIPTION?.replace(
            /^\[Giáo viên:\s*.*?\]\s*/,
            ""
          );

          return {
            id: cls.COURSE_ID,
            name: cls.NAME,
            description: cleanDescription,
            teacherName,
            startDate: cls.START_DATE,
            endDate: cls.END_DATE,
            minStu: cls.MIN_STU,
            maxStu: cls.MAX_STU,
            price: cls.PRICE,
            status: cls.STATUS || "waiting",
            teacherId: null, // sẽ dùng riêng khi edit
          };
        })
      );

      setCoursesList(coursesWithTeachers);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      message.error("Unable to load courses.");
    }
  };
  const fetchTeacherForCourse = async (courseId: number): Promise<string> => {
    try {
      const res = await MainApiRequest.get(`/course/teacher/${courseId}`);
      const teacher = res.data[0]; 
      return teacher ? teacher.NAME : "Unknown";
    } catch (error) {
      return "Unknown";
    }
  };
  const fetchTeachers = async (courseId?: number) => {
    try {
      // Lấy danh sách tất cả giáo viên
      const res = await MainApiRequest.get("/person/teachers");
      const options = res.data.map((t: any) => ({
        label: t.NAME,
        value: t.ID,
      }));
      setTeacherOptions(options);

      // Nếu đang ở chế độ edit, lấy giáo viên hiện tại để hiển thị đúng teacherId
      if (courseId) {
        const currentTeacherRes = await MainApiRequest.get(
          `/course/teacher/${courseId}`
        );
        const teacher = currentTeacherRes.data[0]; // chỉ lấy 1 người
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
      fetchTeachers(course.id); // 👈 edit mode
    } else {
      form.resetFields();
      fetchTeachers(); // 👈 create mode
    }

    setOpenCreateCoursesModal(true);
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
        await MainApiRequest.put(
          `/course/update/${editingCourses.id}`,
          payload
        );
        courseId = editingCourses.id;

        if (editingCourses.teacherId !== values.teacherId) {
          if (editingCourses.teacherId) {
            await MainApiRequest.delete("/course/remove-teacher", {
              data: {
                teacherId: editingCourses.teacherId,
                courseId,
              },
            });
          }
          await MainApiRequest.post("/course/add-teacher", {
            teacherId: values.teacherId,
            courseId,
            role: "LECTURER",
          });
        }

        message.success("Course updated successfully!");
      } else {
        const res = await MainApiRequest.post("/course/create", payload);
        courseId = res.data.courseId;

        await MainApiRequest.post("/course/add-teacher", {
          teacherId: values.teacherId,
          courseId,
          role: "LECTURER",
        });

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
    </div>
  );
};

export default CoursesList;
