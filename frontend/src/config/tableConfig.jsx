export const getStudentTableColumns = (onEdit, onDelete) => [
  { header: 'ID', accessor: 'id' },
  { header: 'Họ và Tên', accessor: 'name' },
  { header: 'Ngày sinh', accessor: 'birthday' },
  { header: 'Email', accessor: 'email' },
  { header: 'Trạng thái', accessor: 'status' },
  {
    header: 'Hành động',
    render: (row) => (
      <div className="action-buttons">
        <button onClick={() => onEdit(row)}>Sửa</button>
        <button onClick={() => onDelete(row)}>Xóa</button>
      </div>
    ),
  },
];

export const getTeacherTableColumns = (onEdit, onDelete) => [
  { header: 'ID', accessor: 'id' },
  { header: 'Họ và Tên', accessor: 'name' },
  { header: 'Ngày sinh', accessor: 'birthday' },
  { header: 'Email', accessor: 'email' },
  {
    header: 'Hành động',
    render: (row) => (
      <div className="action-buttons">
        <button onClick={() => onEdit(row)}>Sửa</button>
        <button onClick={() => onDelete(row)}>Xóa</button>
      </div>
    ),
  },
];

export const getAccountantTableColumns = (onEdit, onDelete) => [
  { header: 'ID', accessor: 'id' },
  { header: 'Họ và Tên', accessor: 'name' },
  { header: 'Ngày sinh', accessor: 'birthday' },
  { header: 'Email', accessor: 'email' },
  {
    header: 'Hành động',
    render: (row) => (
      <div className="action-buttons">
        <button onClick={() => onEdit(row)}>Sửa</button>
        <button onClick={() => onDelete(row)}>Xóa</button>
      </div>
    ),
  },
];

export const assignmentTableColumns = [
  { header: 'ID', accessor: 'id' },
  { header: 'Tên bài tập', accessor: 'title' },
  { header: 'Mô tả', accessor: 'description' },
  { header: 'Ngày giao', accessor: 'assignedDate' },
  {
    header: 'Thao tác',
    render: (row) => (
      <>
        <button onClick={() => alert(`Xem ${row.title}`)}>Xem</button>
        <button onClick={() => alert(`Xoá ${row.title}`)}>Xoá</button>
      </>
    ),
  },
];

export const documentTableColumns = [
  { header: 'ID', accessor: 'id' },
  { header: 'Tên tài liệu', accessor: 'name' },
  { header: 'Mô tả', accessor: 'description' },
  { header: 'Ngày tải lên', accessor: 'uploadDate' },
  {
    header: 'Thao tác',
    render: (row) => (
      <>
        <button onClick={() => alert(`Xem ${row.name}`)}>Xem</button>
        <button onClick={() => alert(`Xoá ${row.name}`)}>Xoá</button>
      </>
    ),
  },
];
