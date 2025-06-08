import EditButton from '../components/common/Button/EditButton';
import DeleteButton from '../components/common/Button/DeleteButton';

export const getStudentTableColumns = (onEdit, onDelete) => [
  { header: 'ID', accessor: 'ID' },
  { header: 'Name', accessor: 'NAME' },
  { header: 'Email', accessor: 'EMAIL' },
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

export const getAssignmentTableColumns = (onEdit, onDelete) => [
  { header: 'ID', accessor: 'AS_ID' },
  { header: 'Name', accessor: 'NAME' },
  {
    header: 'Description',
    accessor: 'DESCRIPTION',
    render: (row) => (
      <div className="table-description-cell">
        {row.DESCRIPTION}
      </div>
    ),
  },
  { header: 'Start Date', accessor: 'START_DATE' },
  { header: 'End Date', accessor: 'END_DATE' },
  {
    header: 'Action',
    render: (row) => (
      <>
        <EditButton onClick={() => onEdit(row)} />
        <DeleteButton onClick={() => onDelete(row)} />
      </>
    ),
  },
];

export const getDocumentTableColumns = (onEdit, onDelete) => [
  { header: 'ID', accessor: 'DOC_ID' },
  { header: 'Name', accessor: 'NAME' },
  {
    header: 'Description',
    accessor: 'DESCRIPTION',
    render: (row) => (
      <div className="table-description-cell">
        {row.DESCRIPTION}
      </div>
    ),
  },
  {
    header: 'Action',
    render: (row) => (
      <>
        <EditButton onClick={() => onEdit(row)} />
        <DeleteButton onClick={() => onDelete(row)} />
      </>
    ),
  },
];