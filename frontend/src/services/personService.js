const API_BASE_URL = 'http://localhost:3000/person';

export const fetchStudents = async () => {
  const response = await fetch(`${API_BASE_URL}/students`);
  if (!response.ok) throw new Error('Failed to fetch students');
  return response.json();
};

export const fetchTeachers = async () => {
  const response = await fetch(`${API_BASE_URL}/teachers`);
  if (!response.ok) throw new Error('Failed to fetch teachers');
  return response.json();
};

export const fetchAccountants = async () => {
  const response = await fetch(`${API_BASE_URL}/accountants`);
  if (!response.ok) throw new Error('Failed to fetch accountants');
  return response.json();
};

export const updatePerson = async (id, data) => {
  const payload = {
    name: data.name,
    email: data.email,
    phone_number: data.phoneNumber || "",
    date_of_birth: data.birthday || "",
  };

  const response = await fetch(`${API_BASE_URL}/update/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error('Failed to update person');
  return response.json();
};

export const deletePerson = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete person');
  return response.json();
};

