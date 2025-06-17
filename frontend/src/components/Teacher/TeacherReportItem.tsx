"use client"

import React, { useState, useEffect } from "react"
import {
  Button,
  Table,
  Space,
  Select,
  Radio,
  message,
} from "antd"
import type { RadioChangeEvent } from 'antd';
import moment from "moment"
import { MainApiRequest } from "@/services/MainApiRequest"

import './TeacherReportItem.scss';

// Define the shape of an assignment as returned by the backend for the dropdown
interface BackendAssignmentForList {
    AS_ID: string; // Assuming ID from backend is a string
    NAME: string;
}

// Define the interface for an assignment after mapping, used in state
interface AssignmentForReport {
  id: number;
  title: string;
}

// Define specific interfaces for report data items as displayed in tables
interface CourseReportItem {
  STUDENT_NAME: string;
  ASSIGNMENT_NAME: string;
  SCORE: number;
  uniqueRowKey: string; // Add a unique key for Ant Design Table
}

interface AssignmentReportItem {
  STUDENT_NAME: string;
  STUDENT_EMAIL: string;
  SUBMIT_DATE: string; // Consider converting to Date object if needed for sorting/manipulation
  SCORE: number;
  uniqueRowKey: string; // Add a unique key for Ant Design Table
}

interface TeacherReportItemsProps {
  courseId: number // Ensure this is consistently a number
}

export const TeacherReportItem: React.FC<TeacherReportItemsProps> = ({ courseId }) => {
  const [reportMode, setReportMode] = useState<"course" | "assignment">("course")
  const [courseReport, setCourseReport] = useState<CourseReportItem[]>([])
  const [assignmentReport, setAssignmentReport] = useState<AssignmentReportItem[]>([])
  const [assignments, setAssignments] = useState<AssignmentForReport[]>([])
  // Đảm bảo selectedAssignmentId có kiểu number | null
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null)

  // Function to fetch assignments for the dropdown
  const fetchAssignmentsByCourse = async (currentCourseId: number) => {
    try {
      const res = await MainApiRequest.get(`/submission/by_course/${currentCourseId}`)
      let backendAssignments: BackendAssignmentForList[] = [];

      // Handle different possible response structures
      if (Array.isArray(res.data)) {
        backendAssignments = res.data;
      } else if (res.data && Array.isArray(res.data.report)) {
        backendAssignments = res.data.report;
      } else {
        message.warning("Invalid assignment list response from server.");
        setAssignments([]);
        return;
      }

      // Map backend data to AssignmentForReport interface
      const mappedAssignments: AssignmentForReport[] = backendAssignments.map(b_assign => ({
          id: parseInt(b_assign.AS_ID, 10), // Convert AS_ID to number
          title: b_assign.NAME,
      }));
      setAssignments(mappedAssignments);

      if (mappedAssignments.length === 0) {
        message.info("No assignments found for this course.");
      }
    } catch (error: any) {
      const serverMsg =
        error?.response?.data?.message || error?.response?.data?.error
      message.error(serverMsg || "Unable to load assignment list.");
      setAssignments([]);
    }
  }

  // Function to fetch individual assignment report
  const fetchAssignmentReport = async (assignmentId: number) => {
    try {
      const res = await MainApiRequest.get(
        `/submission/report/${assignmentId}`
      )
      const rawReportData = res.data.report || [];
      // Map raw report data to AssignmentReportItem and generate uniqueRowKey
      const mappedReportData: AssignmentReportItem[] = rawReportData.map((item: any, idx: number) => ({
        STUDENT_NAME: item.STUDENT_NAME,
        STUDENT_EMAIL: item.STUDENT_EMAIL,
        SUBMIT_DATE: item.SUBMIT_DATE,
        SCORE: item.SCORE,
        uniqueRowKey: `${item.STUDENT_EMAIL}-${item.SUBMIT_DATE || 'no-submit'}-${idx}`, // More robust unique ID
      }));
      setAssignmentReport(mappedReportData);
      // setReportMode("assignment"); // This is set by handleReportModeChange, no need to set here again
      if (mappedReportData.length === 0) {
        message.info("No submissions found for this assignment.");
      }
    } catch (error) {
      console.error("Error fetching assignment report:", error);
      message.error("Unable to load assignment report.");
      setAssignmentReport([]);
    }
  }

  // Function to fetch overall course report
  const loadCourseReport = async () => {
    try {
      const res = await MainApiRequest.get(`/submission/course_report/${courseId}`);
      const rawReportData = res.data?.report || [];
      // Map raw report data to CourseReportItem and generate uniqueRowKey
      const mappedReportData: CourseReportItem[] = rawReportData.map((item: any, idx: number) => ({
        STUDENT_NAME: item.STUDENT_NAME,
        ASSIGNMENT_NAME: item.ASSIGNMENT_NAME,
        SCORE: item.SCORE,
        uniqueRowKey: `${item.STUDENT_NAME}-${item.ASSIGNMENT_NAME || 'no-assignment'}-${idx}`, // More robust unique ID
      }));
      setCourseReport(mappedReportData);
      // setReportMode("course"); // This is set by handleReportModeChange
      if (mappedReportData.length === 0) {
        message.info(res.data?.message || "No students have submitted for this course.");
      }
    } catch (err) {
      console.error("Error fetching course report:", err);
      message.error("Unable to load course report.");
      setCourseReport([]);
    }
  };

  // Initial data loading when component mounts or courseId changes
  useEffect(() => {
    // Ensure courseId is valid before fetching data
    if (courseId) {
      fetchAssignmentsByCourse(courseId);
      loadCourseReport(); // Load course report initially as default mode is "course"
    } else {
      message.error("Invalid Course ID provided for reports.");
    }
  }, [courseId]); // Dependency array includes courseId

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

  const handleExportCourseCsv = async () => {
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

  // Handle radio button mode change
  const handleReportModeChange = (e: RadioChangeEvent) => {
    const mode = e.target.value as "course" | "assignment";
    setReportMode(mode);
    if (mode === "course") {
      loadCourseReport();
      setSelectedAssignmentId(null); // Clear selected assignment
      setAssignmentReport([]); // Clear assignment report data
    } else if (mode === "assignment") {
      setCourseReport([]); // Clear course report data
      // Keep assignments data for the dropdown, user will select
    }
  };


  // Columns for the Overall Course Report Table
  const courseReportColumns = [
    {
      title: "Student Name",
      dataIndex: "STUDENT_NAME",
      key: "STUDENT_NAME",
      sorter: (a: CourseReportItem, b: CourseReportItem) => a.STUDENT_NAME.localeCompare(b.STUDENT_NAME),
    },
    {
      title: "Assignment Name",
      dataIndex: "ASSIGNMENT_NAME",
      key: "ASSIGNMENT_NAME",
      sorter: (a: CourseReportItem, b: CourseReportItem) => a.ASSIGNMENT_NAME.localeCompare(b.ASSIGNMENT_NAME),
    },
    {
      title: "Score",
      dataIndex: "SCORE",
      key: "SCORE",
      sorter: (a: CourseReportItem, b: CourseReportItem) => a.SCORE - b.SCORE,
      render: (text: number) => text !== null && text !== undefined ? text : 'N/A', // Display 'N/A' if score is null/undefined
    },
  ];

  // Columns for the Individual Assignment Report Table
  const assignmentReportColumns = [
    {
      title: "Student Name",
      dataIndex: "STUDENT_NAME",
      key: "STUDENT_NAME",
      sorter: (a: AssignmentReportItem, b: AssignmentReportItem) => a.STUDENT_NAME.localeCompare(b.STUDENT_NAME),
    },
    {
      title: "Student Email",
      dataIndex: "STUDENT_EMAIL",
      key: "STUDENT_EMAIL",
    },
    {
      title: "Submit Date",
      dataIndex: "SUBMIT_DATE",
      key: "SUBMIT_DATE",
      render: (text: string) => text ? moment(text).format("DD-MM-YYYY HH:mm:ss") : "N/A",
      sorter: (a: AssignmentReportItem, b: AssignmentReportItem) => moment(a.SUBMIT_DATE || 0).diff(moment(b.SUBMIT_DATE || 0)),
    },
    {
      title: "Score",
      dataIndex: "SCORE",
      key: "SCORE",
      sorter: (a: AssignmentReportItem, b: AssignmentReportItem) => a.SCORE - b.SCORE,
      render: (text: number) => text !== null && text !== undefined ? text : 'N/A', // Display 'N/A' if score is null/undefined
    },
    // You might want to add an "Actions" column here if you need to view individual submissions
    // For example:
    // {
    //     title: 'Actions',
    //     key: 'actions',
    //     render: (_: any, record: AssignmentReportItem) => (
    //         <Button onClick={() => console.log('View submission for', record.STUDENT_NAME)}>
    //             View Submission
    //         </Button>
    //     ),
    // },
  ];


  return (
    <div className="teacher-report-items">
      <div className="report-mode-selection">
        <Radio.Group
          onChange={handleReportModeChange}
          value={reportMode}
        >
          <Radio.Button value="course">Overall Course Report</Radio.Button>
          <Radio.Button value="assignment">Individual Assignment Report</Radio.Button>
        </Radio.Group>
      </div>


      {reportMode === "course" && (
        <div className="report-section course-report-section">
          <h3>Overall Course Submissions Report for Course #{courseId}</h3>
          <Table
            columns={courseReportColumns}
            dataSource={courseReport}
            rowKey="uniqueRowKey" // Use the generated uniqueRowKey
            pagination={{ pageSize: 10 }}
            className="report-table"
            locale={{ emptyText: "No submissions yet for this course." }}
          />
          <Button
            type="primary"
            onClick={handleExportCourseCsv}
            className="export-button"
            disabled={courseReport.length === 0} // Disable if no data to export
          >
            Export Overall Course CSV
          </Button>
        </div>
      )}

      {reportMode === "assignment" && (
        <div className="report-section assignment-report-section">
          <div className="assignment-selection">
            <h4>Select Assignment</h4>
            <Select
              style={{ width: 300 }}
              placeholder="Select Assignment"
              // Fix: Ensure onChange directly sets selectedAssignmentId with a number
              onChange={(value: number) => { // Tham số 'value' ở đây sẽ là kiểu 'number'
                setSelectedAssignmentId(value);
                if (!isNaN(value) && value > 0) {
                  fetchAssignmentReport(value);
                } else {
                  setAssignmentReport([]); // Clear report if selection is invalid/empty
                }
              }}
              value={selectedAssignmentId}
            >
              {assignments.length > 0 ? (
                assignments.map((assignment) => (
                  <Select.Option key={assignment.id} value={assignment.id}>
                    {assignment.title}
                  </Select.Option>
                ))
              ) : (
                <Select.Option key="no-assignments" disabled>
                  No assignments available
                </Select.Option>
              )}
            </Select>
          </div>

          {selectedAssignmentId && (
            <>
              <h3>Report for Selected Assignment</h3>
              <Table
                columns={assignmentReportColumns}
                dataSource={assignmentReport}
                rowKey="uniqueRowKey" // Use the generated uniqueRowKey
                pagination={{ pageSize: 10 }}
                className="report-table"
                locale={{ emptyText: "No submissions yet for this assignment." }}
              />
              <Button
                type="primary"
                onClick={() => handleExportAssignmentCsv(selectedAssignmentId)}
                className="export-button"
                disabled={assignmentReport.length === 0} // Disable if no data to export
              >
                Export Assignment Report (CSV)
              </Button>
            </>
          )}
          {!selectedAssignmentId && (
              <p className="no-data-message">Please select an assignment from the dropdown above to view its report.</p>
          )}
        </div>
      )}
    </div>
  )
}