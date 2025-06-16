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

interface Assignment {
  id: number
  title: string
}


interface BackendAssignmentForList {
    AS_ID: string;
    NAME: string;
}

interface Submission {
  studentName: string
  studentId: string
  submittedAt: string
  grade: number | undefined
  maxGrade: number 
}

interface TeacherReportItemsProps {
  courseId: number
}

export const TeacherReportItem: React.FC<TeacherReportItemsProps> = ({ courseId }) => {
  const [reportMode, setReportMode] = useState<"course" | "assignment">("course")
  const [courseReport, setCourseReport] = useState<Submission[]>([])
  const [assignmentReport, setAssignmentReport] = useState<Submission[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null)

  const fetchAssignmentsByCourse = async (courseId: number) => {
    try {
      const res = await MainApiRequest.get(`/submission/by_course/${courseId}`)
      let backendAssignments: BackendAssignmentForList[] = [];

      // Adjust based on actual backend response structure
      if (Array.isArray(res.data)) {
        backendAssignments = res.data;
      } else if (res.data && Array.isArray(res.data.report)) {
        backendAssignments = res.data.report;
      } else {
        message.warning("Invalid assignment list response from server.");
        return;
      }

      const mappedAssignments: Assignment[] = backendAssignments.map(b_assign => ({
          id: parseInt(b_assign.AS_ID, 10), // Convert string AS_ID to number ID
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
      setAssignments([]); // Ensure assignments array is cleared on error
    }
  }

  const fetchAssignmentReport = async (assignmentId: number) => {
    try {
      const res = await MainApiRequest.get(
        `/submission/report/${assignmentId}`
      )
      // Assuming res.data.report is an array of Submission
      setAssignmentReport(res.data.report || [])
      setReportMode("assignment") // Set mode after fetching
      if (!res.data.report || res.data.report.length === 0) {
        message.info("No submissions found for this assignment.");
      }
    } catch (error) {
      console.error("Error fetching assignment report:", error);
      message.error("Unable to load assignment report.");
      setAssignmentReport([]); // Clear assignment report on error
    }
  }

  const loadCourseReport = async () => {
    try {
      const res = await MainApiRequest.get(`/submission/course_report/${courseId}`);
      const reportData = res.data?.report || [];
      setCourseReport(reportData);
      if (reportData.length === 0) {
        message.info(res.data?.message || "No students have submitted for this course.");
      }
    } catch (err) {
      console.error("Error fetching course report:", err);
      message.error("Unable to load course report.");
      setCourseReport([]); // Clear course report on error
    }
  };

  useEffect(() => {
    fetchAssignmentsByCourse(courseId)
    loadCourseReport();
  }, [courseId])

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


  const handleReportModeChange = (e: RadioChangeEvent) => {
    const mode = e.target.value;
    setReportMode(mode);
    if (mode === "course") {
      loadCourseReport();
      setSelectedAssignmentId(null);
      setAssignmentReport([]);
    } else if (mode === "assignment") {
      // Data will be fetched when an assignment is selected from the dropdown
      setCourseReport([]);
    }
  };


  const columns = [
    {
      title: "Student Name",
      dataIndex: "studentName",
      key: "studentName",
      sorter: (a: Submission, b: Submission) => a.studentName.localeCompare(b.studentName),
    },
    {
      title: "Student ID",
      dataIndex: "studentId",
      key: "studentId",
    },
    {
      title: "Submitted At",
      dataIndex: "submittedAt",
      key: "submittedAt",
      render: (text: string) => text ? moment(text).format("DD-MM-YYYY HH:mm") : "N/A",
      sorter: (a: Submission, b: Submission) => moment(a.submittedAt).diff(moment(b.submittedAt)),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      // Add logic here to determine status if not provided by backend (e.g., based on grade existence)
      render: (text: string, record: Submission) => record.grade !== undefined ? "Graded" : "Pending",
    },
    {
      title: "Grade",
      dataIndex: "grade",
      key: "grade",
      render: (grade: number | undefined, record: Submission) => grade !== undefined ? `${grade}/${record.maxGrade || 100}` : "Not graded",
      sorter: (a: Submission, b: Submission) => (a.grade || 0) - (b.grade || 0),
    },
  ];

    const assignmentColumns = [
        ...columns,
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: Submission) => (
                <Space size="middle">
                    <Button onClick={() => { /* Implement view submission logic */ }} >
                        View Submission
                    </Button>
                </Space>
            ),
        },
    ];

  return (
    <div className="teacher-report-items">
      <div className="report-mode-selection">
        <Radio.Group
          onChange={handleReportModeChange}
          value={reportMode}
        >
          <Radio.Button value="course">Course Report</Radio.Button>
          <Radio.Button value="assignment">Assignment Report</Radio.Button>
        </Radio.Group>
      </div>


      {reportMode === "course" && (
        <div className="report-section course-report-section">
          <h3>Overall Course Submissions Report</h3>
          <Table
            columns={columns}
            dataSource={courseReport}
            rowKey="studentId"
            pagination={{ pageSize: 10 }}
            className="report-table"
          />
          <Button type="primary" onClick={handleExportCourseCsv} className="export-button">
            Export Course Report (CSV)
          </Button>
        </div>
      )}

      {reportMode === "assignment" && (
        <div className="report-section assignment-report-section">
          <div className="assignment-selection">
            <Select
              style={{ width: 300 }}
              placeholder="Select Assignment"
              onChange={(value) => {
                setSelectedAssignmentId(value);
                if (value) {
                  fetchAssignmentReport(value);
                } else {
                  setAssignmentReport([]); // Clear assignment report if no assignment is selected
                }
              }}
              value={selectedAssignmentId} // This makes the dropdown controlled
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

          {selectedAssignmentId && assignmentReport.length > 0 && (
            <>
              <h3>Report for Selected Assignment</h3>
              <Table
                columns={assignmentColumns}
                dataSource={assignmentReport}
                rowKey="studentId"
                pagination={{ pageSize: 10 }}
                className="report-table"
              />
              <Button type="primary" onClick={() => handleExportAssignmentCsv(selectedAssignmentId)} className="export-button">
                Export Assignment Report (CSV)
              </Button>
            </>
          )}
          {selectedAssignmentId && assignmentReport.length === 0 && (
              <p className="no-data-message">No submissions for this assignment yet.</p>
          )}
          {!selectedAssignmentId && (
              <p className="no-data-message">Please select an assignment to view its report.</p>
          )}
        </div>
      )}
    </div>
  )
}