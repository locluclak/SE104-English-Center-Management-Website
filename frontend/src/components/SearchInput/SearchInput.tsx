import React from 'react';
import { Input, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import './SearchInput.scss';

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch?: () => void;
  allowClear?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Tìm kiếm ...',
  value,
  onChange,
  onSearch,
  allowClear = true,
}) => {
  return (
    <div className="custom-search-input" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Typography.Text className="search-label" style={{ color: '#2F4156', fontSize: '16px', whiteSpace: 'nowrap', fontWeight: '400' }}>
        Tìm kiếm
      </Typography.Text>
      <Input
        style={{ width: 350, height: 35}}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onPressEnter={onSearch}
        allowClear={allowClear}
        suffix={
          <SearchOutlined
            className="search-icon"
            onClick={onSearch}
            style={{ cursor: 'pointer', color: value ? '#2F4156' : '#557C8D' }}
          />
        }
      />
    </div>
  );
};

export default SearchInput;