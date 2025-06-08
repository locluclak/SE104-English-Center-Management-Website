import React, { useState, useEffect } from 'react';
import './TeacherGradingInterface.css';

const TeacherGradingInterface = ({ submission, onGrade, onBack, API_URL, assignmentName }) => {
    const [score, setScore] = useState('');
    const [comment, setComment] = useState('');

    useEffect(() => {
        if (submission) {
            setScore(submission.SCORE !== null ? submission.SCORE : ''); 
            setComment(submission.TEACHER_COMMENT || ''); 
        }
    }, [submission]);

    const handleSubmitGrade = (e) => {
        e.preventDefault();
        const parsedScore = parseFloat(score); 
        if (isNaN(parsedScore) || parsedScore < 0 || parsedScore > 100) {
            alert('Điểm phải là một số từ 0 đến 100.');
            return;
        }
        onGrade(parsedScore, comment);
    };

    return (
        <div className="teacher-grading-interface">
            <h3>Chấm điểm bài làm của: {submission.STUDENT_NAME}</h3>
            <h4>Bài tập: {assignmentName || 'N/A'}</h4>

            <div className="submission-content">
                <p><strong>Ngày nộp:</strong> {new Date(submission.SUBMIT_DATE).toLocaleString('vi-VN')}</p>
                <p><strong>Mô tả bài làm:</strong></p>
                <div dangerouslySetInnerHTML={{ __html: submission.DESCRIPTION || 'Không có mô tả.' }} />

                {submission.FILE && (
                    <p>
                        <strong>File đính kèm:</strong>{" "}
                        <a href={`${API_URL}${submission.FILE}`} target="_blank" rel="noopener noreferrer">
                            Tải xuống file
                        </a>
                    </p>
                )}
                {submission.AUDIO_FILE && ( 
                    <p>
                        <strong>Ghi âm:</strong>{" "}
                        <audio controls src={`${API_URL}${submission.AUDIO_FILE}`} />
                    </p>
                )}
            </div>

            <hr />

            <form onSubmit={handleSubmitGrade} className="grading-form">
                <label>
                    Điểm (0-100):
                    <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={score}
                        onChange={(e) => setScore(e.target.value)} 
                        required
                    />
                </label>
                <label>
                    Bình luận của giáo viên:
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows="4"
                        placeholder="Nhập bình luận của bạn về bài làm..."
                    />
                </label>
                <button type="submit">Lưu điểm</button>
            </form>
        </div>
    );
};

export default TeacherGradingInterface;