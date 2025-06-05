import React, { useState, useEffect } from 'react';
import './ProfileModal.css';
import { fetchPersonById, updatePerson } from '../../../services/personService';

const ProfileModal = ({ visible, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    role: ''
  });

  // Lấy thông tin người dùng khi modal được mở
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        setIsLoading(true);
        const storedUser = JSON.parse(localStorage.getItem('user'));
        
        if (!storedUser?.id) {
          throw new Error('Không tìm thấy thông tin người dùng');
        }

        // Gọi API lấy thông tin chi tiết
        const data = await fetchPersonById(storedUser.id);
        
        if (!data) {
          throw new Error('Không thể lấy thông tin từ server');
        }

        // Cập nhật state với dữ liệu mới
        setUserInfo({
          id: data.ID,
          name: data.NAME || '',
          email: data.EMAIL || '',
          phone: data.PHONE_NUMBER || '',
          dateOfBirth: data.DATE_OF_BIRTH ? data.DATE_OF_BIRTH.split('T')[0] : '',
          role: storedUser.role || ''
        });
      } catch (error) {
        console.error('Lỗi khi tải thông tin người dùng:', error);
        alert('Không thể tải thông tin người dùng. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    if (visible) {
      loadUserInfo();
    }
  }, [visible]);

  // Xử lý cập nhật thông tin
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      // Validate dữ liệu
      if (!userInfo.name.trim()) {
        throw new Error('Vui lòng nhập họ tên');
      }

      // Gọi API cập nhật
      await updatePerson(userInfo.id, {
        name: userInfo.name.trim(),
        email: userInfo.email,
        phone_number: userInfo.phone.trim(),
        date_of_birth: userInfo.dateOfBirth
      });

      // Cập nhật localStorage
      const stored = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({
        ...stored,
        name: userInfo.name.trim()
      }));

      setIsEditing(false);
      alert('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Lỗi khi cập nhật:', error);
      alert(error.message || 'Không thể cập nhật thông tin. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal">
        <h2>Thông tin cá nhân</h2>
        {isLoading ? (
          <div className="loading">Đang tải...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* ...existing code... */}
            <div className="modal-actions">
              {isEditing ? (
                <>
                  <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Đang lưu...' : 'Lưu'}
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)} disabled={isLoading}>
                    Hủy
                  </button>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => setIsEditing(true)}>
                    Chỉnh sửa
                  </button>
                  <button type="button" onClick={onClose}>
                    Đóng
                  </button>
                </>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;