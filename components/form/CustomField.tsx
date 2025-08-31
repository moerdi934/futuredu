// components/CustomField.tsx
'use client';

import React from 'react';
import { Form } from 'react-bootstrap';

interface CustomFieldProps {
  field: {
    key: string;
    label: string;
    options: Array<{ label: string; value: string }>;
  };
  value: string;
  onChange: (value: string) => void;
}

export const CustomField: React.FC<CustomFieldProps> = ({ field, value, onChange }) => (
  <Form.Group>
    <Form.Label>{field.label}</Form.Label>
    <Form.Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {field.options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Form.Select>
  </Form.Group>
);
