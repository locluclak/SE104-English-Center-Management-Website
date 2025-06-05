const API_BASE_URL = 'http://localhost:3000/person';

// get persons with id (adding after editing for 3 features at admin)
export const fetchPersonById = async (id) => {
  const response = await fetch(`http://localhost:3000/person/${id}`);
  if (!response.ok) throw new Error('Failed to fetch person by ID');
  return response.json();
};

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

// personService.js - trong updatePerson
export const updatePerson = async (id, personData) => {
  const convertDateToDatabaseFormat = (dateStr) => {
    if (!dateStr) return null; // Trả về null nếu dateStr rỗng

    // Kiểm tra nếu dateStr đã ở định dạng YYYY-MM-DD
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateStr; // Trả về nguyên bản nếu đã đúng định dạng
    }

    // Nếu không phải định dạng YYYY-MM-DD, thì giả định là dd/MM/yyyy và chuyển đổi
    const parts = dateStr.split('/');
    if (parts.length !== 3) {
      console.warn("Invalid date format for conversion in personService:", dateStr);
      return null;
    }
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  let dateOfBirthFormatted = null;
  // Admin.jsx có thể gửi `birthday` (từ normalizeTeachers/Students) hoặc `date_of_birth`
  // Tùy thuộc vào cách bạn truyền dữ liệu vào `updatePerson` từ `Admin.jsx`
  if (personData.birthday) { // Nếu Admin.jsx gửi `birthday`
    dateOfBirthFormatted = convertDateToDatabaseFormat(personData.birthday);
  } else if (personData.date_of_birth) { // Nếu Admin.jsx gửi `date_of_birth`
    dateOfBirthFormatted = convertDateToDatabaseFormat(personData.date_of_birth);
  }

  const payload = {
    name: personData.name,
    email: personData.email,
    phone_number: personData.phone_number || "",
    date_of_birth: dateOfBirthFormatted, // Đảm bảo trường này chứa giá trị đã được định dạng
  };

  if (personData.password && personData.password.trim() !== "") {
    payload.password = personData.password;
  }

  const response = await fetch(`${API_BASE_URL}/update/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to update person and parse error' }));
    throw new Error(errorData.message || 'Failed to update person');
  }
  return response.json();
};


export const deletePerson = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete person');
  return response.json();
};
