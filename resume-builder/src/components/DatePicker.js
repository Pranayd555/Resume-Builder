import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './DatePicker.css';

const CustomDatePicker = ({
  value,
  onChange,
  onBlur,
  required = false,
  placeholder = "Select date",
  className = "",
  hasError = false,
  disabled = false,
  ...props
}) => {
  // Dates are stored as "YYYY-MM-DD" calendar days. Parse and format them in
  // local time: new Date('2021-01-01') is UTC midnight and toISOString() shifts
  // a local midnight back to the previous day east of UTC (e.g. IST), which
  // showed and saved the day before the one the user picked.
  const parseDateValue = (dateValue) => {
    if (!dateValue || dateValue === 'null' || dateValue === 'undefined') return null;
    const match = typeof dateValue === 'string' && /^(\d{4})-(\d{2})-(\d{2})/.exec(dateValue);
    const parsed = match ? new Date(+match[1], +match[2] - 1, +match[3]) : new Date(dateValue);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  // Convert string date to Date object for react-datepicker
  const dateValue = parseDateValue(value);

  const handleDateChange = (date) => {
    // Convert Date object back to YYYY-MM-DD string format
    const pad = (n) => String(n).padStart(2, '0');
    const dateString = date ? `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` : '';
    onChange(dateString);
  };

  const handleBlur = () => {
    if (onBlur) {
      onBlur();
    }
  };

  return (
    <DatePicker
      selected={dateValue}
      onChange={handleDateChange}
      onBlur={handleBlur}
      required={required}
      disabled={disabled}
      placeholderText={placeholder}
      dateFormat="yyyy-MM-dd"
      showYearDropdown
      showMonthDropdown
      dropdownMode="scroll"
      yearDropdownItemNumber={50}
      scrollableYearDropdown
      autoComplete="off"
      isClearable={false}
      showPopperArrow={false}
      popperClassName="react-datepicker-popper"
      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-900 bg-white dark:bg-white ${
        hasError 
          ? 'border-red-300 focus:border-red-500' 
          : 'border-gray-300'
      } ${disabled ? 'disabled:bg-gray-100' : ''} ${className}`}
      wrapperClassName="w-full"
      {...props}
    />
  );
};

export default CustomDatePicker;
