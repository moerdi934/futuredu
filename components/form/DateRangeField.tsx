'use client';

import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { Calendar } from 'lucide-react';
import { getWeekDates, getMonthDates } from '../../utils/DateUtils';
import 'react-datepicker/dist/react-datepicker.css';

interface DateRangeFieldProps {
  value: {
    dateRange: string;
    startDate: Date | null; 
    endDate: Date | null;
  };
  onChange: (value: { dateRange: string; startDate: Date | null; endDate: Date | null }) => void;
  className?: string;
}

export const DateRangeField: React.FC<DateRangeFieldProps> = ({ value, onChange, className }) => {
  const CustomDateInput = React.forwardRef<HTMLInputElement, any>(
    ({ value, onClick, placeholder, disabled }, ref) => (
      <div className="position-relative">
        <Form.Control
          ref={ref}
          value={value}
          onClick={onClick}
          placeholder={placeholder}
          disabled={disabled}
          readOnly
        />
        <Calendar 
          className="position-absolute top-50 end-0 translate-middle-y me-2" 
          size={18}
          style={{ 
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1 
          }}
        />
      </div>
    )
  );

  const handleDateRangeChange = (range: string) => {
    let startDate = null;
    let endDate = null;

    switch (range) {
      case 'today':
        const today = new Date();
        startDate = new Date(today.setHours(0, 0, 0, 0));
        endDate = new Date(today.setHours(23, 59, 59, 999));
        break;
      case 'week':
        const weekDates = getWeekDates();
        startDate = weekDates.start;
        endDate = weekDates.end;
        break;
      case 'month':
        const monthDates = getMonthDates();
        startDate = monthDates.start;
        endDate = monthDates.end;
        break;
      case 'custom':
        startDate = value.startDate;
        endDate = value.endDate;
        break;
      default:
        startDate = null;
        endDate = null;
    }

    onChange({
      dateRange: range,
      startDate,
      endDate,
    });
  };

  return (
    <div className={className}>
      <Form.Group>
        <Form.Label>Date Range</Form.Label>
        <Form.Select
          value={value.dateRange}
          onChange={(e) => handleDateRangeChange(e.target.value)}
          className="mb-3"
        >
          <option value="none">No Date Filter</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="custom">Custom Range</option>
        </Form.Select>
      </Form.Group>
      <Row>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Start Date</Form.Label>
            <DatePicker
              selected={value.startDate}
              onChange={(date: Date | null) => onChange({ ...value, startDate: date })}
              selectsStart
              startDate={value.startDate}
              endDate={value.endDate}
              dateFormat="yyyy-MM-dd"
              placeholderText="Select start date"
              disabled={value.dateRange !== 'custom'}
              customInput={<CustomDateInput />}
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>End Date</Form.Label>
            <DatePicker
              selected={value.endDate}
              onChange={(date: Date | null) => onChange({ ...value, endDate: date })}
              selectsEnd
              startDate={value.startDate}
              endDate={value.endDate}
              minDate={value.startDate}
              dateFormat="yyyy-MM-dd"
              placeholderText="Select end date"
              disabled={value.dateRange !== 'custom'}
              customInput={<CustomDateInput />}
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
            />
          </Form.Group>
        </Col>
      </Row>
    </div>
  );
};