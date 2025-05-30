export const getStudentTableColumns = (onEdit, onDelete) => [
  { header: 'ID', accessor: 'id' },
  { header: 'Name', accessor: 'name' },
  { header: 'Birthday', accessor: 'birthday' },
  { header: 'Email', accessor: 'email' },
  { header: 'Status', accessor: 'status' },
  {
    header: 'Action',
    render: (row) => (
      <div className="action-buttons">
        <button onClick={() => onEdit(row)}>Edit</button>
        <button onClick={() => onDelete(row)}>Delete</button>
      </div>
    ),
  },
];

export const getTeacherTableColumns = (onEdit, onDelete) => [
  { header: 'ID', accessor: 'id' },
  { header: 'Name', accessor: 'name' },
  { header: 'Birthday', accessor: 'birthday' },
  { header: 'Email', accessor: 'email' },
  {
    header: 'Action',
    render: (row) => (
      <div className="action-buttons">
        <button onClick={() => onEdit(row)}>Edit</button>
        <button onClick={() => onDelete(row)}>Delete</button>
      </div>
    ),
  },
];

export const getAccountantTableColumns = (onEdit, onDelete) => [
  { header: 'ID', accessor: 'id' },
  { header: 'Name', accessor: 'name' },
  { header: 'Birthday', accessor: 'birthday' },
  { header: 'Email', accessor: 'email' },
  {
    header: 'Action',
    render: (row) => (
      <div className="action-buttons">
        <button onClick={() => onEdit(row)}>Edit</button>
        <button onClick={() => onDelete(row)}>Delete</button>
      </div>
    ),
  },
];

export const assignmentTableColumns = [
  { header: 'ID', accessor: 'id' },
  { header: 'Name', accessor: 'title' },
  { header: 'Description', accessor: 'description' },
  { header: 'Date Start', accessor: 'assignedDate' },
  {
    header: 'Action',
    render: (row) => (
      <>
        <button onClick={() => alert(`Xem ${row.title}`)}>Edit</button>
        <button onClick={() => alert(`Xoá ${row.title}`)}>Delete</button>
      </>
    ),
  },
];

export const documentTableColumns = [
  { header: 'ID', accessor: 'id' },
  { header: 'Name', accessor: 'name' },
  { header: 'Description', accessor: 'description' },
  { header: 'Upload Date', accessor: 'uploadDate' },
  {
    header: 'Action',
    render: (row) => (
      <>
        <button onClick={() => alert(`Xem ${row.name}`)}>Edit</button>
        <button onClick={() => alert(`Xoá ${row.name}`)}>Delete</button>
      </>
    ),
  },
];
