import EditButton from '../components/common/Button/EditButton';
import DeleteButton from '../components/common/Button/DeleteButton';

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
        <EditButton onClick={() => onEdit(row)} />
        <DeleteButton onClick={() => onDelete(row)} />
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
        <EditButton onClick={() => onEdit(row)} />
        <DeleteButton onClick={() => onDelete(row)} />
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
        <EditButton onClick={() => onEdit(row)} />
        <DeleteButton onClick={() => onDelete(row)} />
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
        <EditButton onClick={() => alert(`Xem ${row.title}`)} />
        <DeleteButton onClick={() => alert(`Xoá ${row.title}`)} />
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
        <EditButton onClick={() => alert(`Xem ${row.name}`)} />
        <DeleteButton onClick={() => alert(`Xoá ${row.name}`)} />
      </>
    ),
  },
];
