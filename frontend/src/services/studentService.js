const API_BASE_URL = 'http://localhost:3000'; // URL backend của bạn

export const fetchStudents = async () => {
  const response = await fetch(`${API_BASE_URL}/person/students`);
  if (!response.ok) {
    throw new Error('Failed to fetch students');
  }
  return response.json();
};

export const updateStudent = async (id, data) => {
  const response = await fetch(`${API_BASE_URL}/person/update/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update student');
  }
  return response.json();
};

export const deleteStudent = async (id) => {
  const response = await fetch(`${API_BASE_URL}/person/students/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete student');
  }
  return response.json();
};