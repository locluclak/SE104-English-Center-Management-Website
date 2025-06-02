const API_URL = 'http://localhost:3000';

export const signup = async ({ name, email, password, phoneNumber, dateOfBirth, role }) => {
  const response = await fetch(`${API_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, phoneNumber, dateOfBirth, role }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Signup failed.');
  }

  return data;
};

export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Login failed.');
  }

  return data;
};

export const createTeacher = async (data) => {
  const response = await fetch(`${API_URL}/allocate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      password: data.password,
      phone_number: data.phoneNumber,
      date_of_birth: data.dateOfBirth,
      hire_day: data.hireDay,
      staff_type: 'TEACHER',
    }),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Create teacher failed');
  return result;
};


export const createAccountant = async (data) => {
  const response = await fetch(`${API_URL}/allocate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      password: data.password,
      phone_number: data.phoneNumber,
      date_of_birth: data.dateOfBirth,
      hire_day: data.hireDay,
      staff_type: 'ACCOUNTANT',
    }),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Create accountant failed');
  return result;
};

