import {jwtDecode} from "jwt-decode";

export interface JwtPayload {
  id: number;
  email: string;
  role: string;
  name?: string;
}

export function getCurrentUser(): JwtPayload | null {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded;
  } catch (error) {
    console.error("Lỗi khi decode token:", error);
    return null;
  }
}
