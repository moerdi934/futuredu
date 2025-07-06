'use client';

import React, { useState, useEffect } from 'react';
import { Form, ListGroup, Spinner, Alert } from 'react-bootstrap';
import { DebounceInput } from 'react-debounce-input';
import axios from 'axios';

interface User {
  userid: string;
  name: string;
}

interface AssigneeSearchProps {
  onSelectAssignee: (user: User) => void;
  selectedAssigneeIds: string[];
  roles: string[]; // Change to roles array
}

const AssigneeSearch: React.FC<AssigneeSearchProps> = ({ 
  onSelectAssignee, 
  selectedAssigneeIds = [], // Default to empty array
  roles = [] // Default to empty array
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    console.log("assign roles:", roles);
    // Add safety check for roles
    if (searchTerm.trim() === '' || !roles || roles.length === 0) {
      setUsers([]);
      return;
    }

    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try { 
        const response = await axios.post(`${apiUrl}/users/search-by-roles`, { 
          searchTerm, 
          roles // Send roles array to backend
        });
        // Add safety check for response data
        if (response.data && response.data.users) {
          setUsers(response.data.users);
        } else {
          setUsers([]);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to search assignees.');
        setUsers([]); // Clear users on error
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [searchTerm, roles, apiUrl]);

  const handleUserClick = (e: React.MouseEvent, user: User) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Add safety check for selectedAssigneeIds
    if (selectedAssigneeIds && !selectedAssigneeIds.includes(user.userid)) {
      onSelectAssignee(user);
      setSearchTerm(''); // Optional: Clear search term after selection
      setUsers([]);       // Optional: Clear users after selection
    }
  };

  return (
    <div> 
      <Form.Group className="tw-mb-3">
        <Form.Label>
          Assign To <span className="tw-text-red-500">*</span>
        </Form.Label>
        <DebounceInput
          minLength={1}
          debounceTimeout={300}
          element={Form.Control}
          type="text"
          placeholder="Search assignee..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          disabled={!roles || roles.length === 0} // Add safety check for roles
        />
      </Form.Group>
      {loading && (
        <div className="tw-flex tw-justify-center tw-mb-2">
          <Spinner animation="border" variant="primary" size="sm" />
        </div>
      )}
      {error && <Alert variant="danger">{error}</Alert>}
      {users && users.length > 0 && (
        <ListGroup>
          {users.map((user) => (
            <ListGroup.Item
              key={user.userid}
              action
              onClick={(e) => handleUserClick(e, user)}
              disabled={selectedAssigneeIds && selectedAssigneeIds.includes(user.userid)}
            >
              {user.name}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
};

export default AssigneeSearch;