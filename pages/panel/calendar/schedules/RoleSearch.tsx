'use client';

import React, { useState, useEffect } from 'react';
import { Form, ListGroup, Spinner, Alert } from 'react-bootstrap';
import { DebounceInput } from 'react-debounce-input';
import axios from 'axios';

interface Role {
  role: string;
}

interface RoleSearchProps {
  onSelectRole: (role: { role: string }) => void; // Function to add/remove role
  selectedRoles: string[]; // Array of selected roles
}

const RoleSearch: React.FC<RoleSearchProps> = ({ 
  onSelectRole, 
  selectedRoles = [] 
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    console.log("rolesselect:", roles);
    if (searchTerm.trim() === '') {
      setRoles([]);
      return;
    }

    const fetchRoles = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post(`${apiUrl}/roles/search`, { searchTerm });
        console.log('Roles fetched:', response.data.roles); // Debugging
        setRoles(response.data.roles); // Set state with roles array
      } catch (err) {
        console.error('Error fetching roles:', err);
        setError('Failed to search roles.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [searchTerm, apiUrl]);

  const handleRoleClick = (e: React.MouseEvent, role: Role) => {
    e.preventDefault();
    e.stopPropagation();
    
    onSelectRole(role);
    setSearchTerm(''); // Optional: Clear search term after selection
  };

  return (
    <div>
      <Form.Group className="tw-mb-3">
        <Form.Label>
          Role <span className="tw-text-red-500">*</span>
        </Form.Label>
        <DebounceInput
          minLength={1}
          debounceTimeout={300}
          element={Form.Control}
          type="text" 
          placeholder="Search role..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
        />
      </Form.Group>
      {loading && (
        <div className="tw-flex tw-justify-center tw-mb-2">
          <Spinner animation="border" variant="primary" size="sm" />
        </div>
      )}
      {error && <Alert variant="danger">{error}</Alert>}
      {roles.length > 0 && (
        <ListGroup>
          {roles.map((role) => (
            <ListGroup.Item
              key={role.role}
              action
              active={selectedRoles.includes(role.role)}
              onClick={(e) => handleRoleClick(e, role)}
            >
              {role.role}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
};

export default RoleSearch;