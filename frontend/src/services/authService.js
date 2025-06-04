const API_URL = "http://localhost:3000";

const formatDateToYMD = (dateStr) => {
  if (!dateStr) return ""; // Hoặc return null tùy theo backend yêu cầu
  try {
    const date = new Date(dateStr); // dateStr nên là định dạng mà new Date() hiểu đúng, ví dụ YYYY-MM-DD hoặc MM/DD/YYYY
    if (isNaN(date)) return "";     // Hoặc return null

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`; // <--- THAY ĐỔI Ở ĐÂY: sử dụng dấu gạch ngang "-"
  } catch {
    return ""; // Hoặc return null
  }
};

export const signup = async ({
  name,
  email,
  password,
  phoneNumber,
  dateOfBirth,
  role,
}) => {
  const formattedDateOfBirth = formatDateToYMD(dateOfBirth); // Format the date here

  const response = await fetch(`${API_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      email,
      password,
      phoneNumber,
      dateOfBirth: formattedDateOfBirth,
      role,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Signup failed.");
  }

  return data;
};

export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Login failed.");
  }

  return data;
};

export const createTeacher = async (data) => {
  console.log("Creating teacher with data (authService received):", data); 
  const formattedDateOfBirth = formatDateToYMD(data.dateOfBirth);
  const formattedHireDay = formatDateToYMD(data.hire_day); 

  // Log các giá trị đã format để kiểm tra
  console.log("Formatted Date of Birth (authService):", formattedDateOfBirth);
  console.log("Formatted Hire Day (authService):", formattedHireDay);

  const payload = {
    name: data.name,
    email: data.email,
    password: data.password,
    phone_number: data.phoneNumber, // Backend API mong đợi phone_number
    date_of_birth: formattedDateOfBirth, // Backend API mong đợi dateOfBirth (format YYYY/MM/DD)
    hire_day: formattedHireDay, // Backend API mong đợi hire_day (format YYYY/MM/DD)
    staff_type: "TEACHER",
  };
  console.log(
    "Payload to backend (/allocate):",
    JSON.stringify(payload, null, 2)
  ); // Log payload cuối cùng

  const response = await fetch(`${API_URL}/allocate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  if (!response.ok) {
    console.error("Backend error response:", result); // In ra lỗi chi tiết từ backend
    throw new Error(result.error || "Create teacher failed");
  }
  return result;
};

export const createAccountant = async (data) => {
  console.log("Creating accountant with data (authService received):", data);
  const formattedDateOfBirth = formatDateToYMD(data.dateOfBirth);
  // SỬA Ở ĐÂY: Sử dụng data.hire_day (snake_case)
  const formattedHireDay = formatDateToYMD(data.hire_day); // <--- SỬA LẠI KEY NÀY

  console.log(
    "Formatted Date of Birth (authService - accountant):",
    formattedDateOfBirth
  );
  console.log(
    "Formatted Hire Day (authService - accountant):",
    formattedHireDay
  );

  const payload = {
    name: data.name,
    email: data.email,
    password: data.password,
    phone_number: data.phoneNumber,
    date_of_birth: formattedDateOfBirth,
    hire_day: formattedHireDay,
    staff_type: "ACCOUNTANT",
  };
  console.log(
    "Payload to backend (/allocate - accountant):",
    JSON.stringify(payload, null, 2)
  );

  const response = await fetch(`${API_URL}/allocate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  if (!response.ok) {
    console.error("Backend error response (accountant):", result);
    throw new Error(result.error || "Create accountant failed");
  }
  return result;
};
