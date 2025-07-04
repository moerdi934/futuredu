'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Badge, Table, Spinner, Alert, Card } from 'react-bootstrap';
import { FaCalendarPlus, FaClock, FaUsers, FaStickyNote, FaUserCog, FaTimes } from 'react-icons/fa';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';

import MainLayout from '../../../../components/layout/DashboardLayout';
import RoleSearch from './RoleSearch';
import AssigneeSearch from './AssigneeSearch';

interface AssignedUser {
  userid: string;
  name: string;
}

interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  role: string[];
  assignedTo: AssignedUser[];
  notes?: string;
  backgroundColor?: string;
  starter_user_id?: string;
}

interface User {
  userid: string;
  name: string;
}

interface NewEvent extends Partial<Event> {
  newAssignee?: string;
}

const rolesColors: Record<string, string> = {
  Admin: '#8b5cf6',
  Manager: '#a855f7',
  Staff: '#c084fc',
  Supervisor: '#d8b4fe',
  Operator: '#e9d5ff',
  Engineer: '#7c3aed',
  Consultant: '#6d28d9',
};

const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDateEvents, setSelectedDateEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState<NewEvent>({
    assignedTo: [],
    newAssignee: '',
  });
  const [editEvent, setEditEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [showAssignedTo, setShowAssignedTo] = useState<boolean>(false);
  const [selectedAssignees, setSelectedAssignees] = useState<User[]>([]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${apiUrl}/events`);
        const fetchedEvents = response.data.map((event: any) => ({
          id: event.id.toString(),
          title: event.title,
          start: event.start, 
          end: event.end,
          role: event.role,
          assignedTo: event.assignedTo.map((user: any) => ({
            userid: user.userid.toString(),
            name: user.name,
          })),
          notes: event.notes,
          starter_user_id: event.starter_user_id?.toString(),
          backgroundColor: rolesColors[event.role[0]] || '#8b5cf6',
        }));
        setEvents(fetchedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
  
    fetchEvents();
  }, [apiUrl]);

  const handleDateClick = (info: any) => {
    const dateEvents = events.filter((event) =>
      event.start.startsWith(info.dateStr)
    );
    setSelectedDateEvents(dateEvents);
    setShowDayModal(true);
  };

  const handleEventClick = (info: any) => {
    const clickedEvent = events.find((event) => event.id === info.event.id);
    if (clickedEvent) {
      setSelectedEvent(clickedEvent);
      setEditEvent(clickedEvent);
      setShowEditModal(true);
      setSelectedRoles(clickedEvent.role);
      const assignees = clickedEvent.assignedTo.map((user: AssignedUser) => ({
        userid: user.userid,
        name: user.name,
      }));
      setSelectedAssignees(assignees);
      setShowAssignedTo(true);
    }
  };

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.start || !newEvent.end || selectedRoles.length === 0) {
      setError('Please complete all required fields.');
      return;
    }
  
    const assignedToIds = selectedAssignees.map(user => parseInt(user.userid, 10));
  
    try {
      setLoading(true);
      const response = await axios.post(`${apiUrl}/events`, {
        title: newEvent.title,
        start_time: newEvent.start,
        end_time: newEvent.end,
        role: selectedRoles,
        assigned_to: assignedToIds,
        notes: newEvent.notes,
        starter_user_id: newEvent.starter_user_id,
      });
      
      const addedEvent = {
        ...response.data,
        backgroundColor: rolesColors[selectedRoles[0]] || '#8b5cf6',
      };
      setEvents((prev) => [
        ...prev,
        {
          id: addedEvent.id.toString(),
          title: addedEvent.title,
          start: addedEvent.start,
          end: addedEvent.end,
          role: addedEvent.role,
          assignedTo: addedEvent.assignedTo,
          notes: addedEvent.notes,
          starter_user_id: addedEvent.starter_user_id?.toString(),
          backgroundColor: addedEvent.backgroundColor,
        },
      ]);
      setShowAddModal(false);
      setNewEvent({ assignedTo: [], newAssignee: '' });
      setSelectedRoles([]);
      setShowAssignedTo(false);
      setSelectedAssignees([]);
      setError(null);
    } catch (error) {
      console.error('Error adding event:', error);
      setError('Failed to add event.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEventSave = async () => {
    if (!editEvent || !editEvent.title || !editEvent.start || !editEvent.end || selectedRoles.length === 0) {
      setError('Please complete all required fields.');
      return;
    }
  
    const assignedToIds = selectedAssignees.map(user => parseInt(user.userid, 10));
  
    try {
      setLoading(true);
      const updatedEvent = {
        title: editEvent.title,
        start_time: editEvent.start,
        end_time: editEvent.end,
        role: selectedRoles,
        assigned_to: assignedToIds,
        notes: editEvent.notes,
        starter_user_id: editEvent.starter_user_id,
      };
      
      const response = await axios.put(`${apiUrl}/events/${editEvent.id}`, updatedEvent);
      
      setEvents((prev) =>
        prev.map((event) =>
          event.id === editEvent.id
            ? { 
                ...event, 
                title: response.data.title,
                start: response.data.start,
                end: response.data.end,
                role: response.data.role,
                assignedTo: response.data.assignedTo,
                notes: response.data.notes,
                starter_user_id: response.data.starter_user_id?.toString(),
                backgroundColor: rolesColors[selectedRoles[0]] || '#8b5cf6',
              }
            : event
        )
      );
      
      setShowEditModal(false);
      setEditEvent(null);
      setSelectedRoles([]);
      setShowAssignedTo(false);
      setSelectedAssignees([]);
      setError(null);
    } catch (error) {
      console.error('Error updating event:', error);
      setError('Failed to update event.');
    } finally {
      setLoading(false);
    }
  };

  const handleEventDrop = async (info: any) => {
    const updatedEvent = events.find((event) => event.id === info.event.id);
    if (!updatedEvent) return;

    const newStart = info.event.start.toISOString();
    const newEnd = info.event.end?.toISOString();

    try {
      const response = await axios.put(`${apiUrl}/events/${updatedEvent.id}`, {
        ...updatedEvent,
        start_time: newStart,
        end_time: newEnd,
      });
      setEvents((prev) =>
        prev.map((event) =>
          event.id === updatedEvent.id
            ? { 
                ...event, 
                start: newStart, 
                end: newEnd,
              }
            : event
        )
      );
    } catch (error) {
      console.error('Error updating event date:', error);
    }
  };

  const handleSelectRole = (role: { role: string }) => {
    if (selectedRoles.includes(role.role)) {
      setSelectedRoles(prev => prev.filter(r => r !== role.role));
    } else {
      setSelectedRoles(prev => [...prev, role.role]);
    }
    setShowAssignedTo(true);
    setError(null);
  };

  const handleSelectAssignee = (user: User) => {
    setSelectedAssignees(prev => [...prev, user]);
  };

  const handleRemoveAssignee = (userid: string) => {
    setSelectedAssignees(prev => prev.filter(user => user.userid !== userid));
  };

  const renderForm = (
    event: NewEvent | Event,
    setEvent: React.Dispatch<React.SetStateAction<NewEvent | Event>>,
    isEdit: boolean = false
  ) => (
    <Form className="tw-space-y-4">
      <Form.Group className="tw-mb-4">
        <Form.Label className="tw-flex tw-items-center tw-text-purple-700 tw-font-semibold tw-mb-2">
          <FaStickyNote className="tw-mr-2 tw-text-purple-600" />
          Title <span className="tw-text-red-500 tw-ml-1">*</span>
        </Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter event title"
          value={event.title || ''}
          onChange={(e) => setEvent({ ...event, title: e.target.value })}
          className="tw-border-purple-300 focus:tw-border-purple-500 focus:tw-ring-purple-500"
        />
      </Form.Group>

      <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
        <Form.Group>
          <Form.Label className="tw-flex tw-items-center tw-text-purple-700 tw-font-semibold tw-mb-2">
            <FaClock className="tw-mr-2 tw-text-purple-600" />
            Start Time <span className="tw-text-red-500 tw-ml-1">*</span>
          </Form.Label>
          <Form.Control
            type="datetime-local"
            value={event.start ? event.start.substring(0,16) : ''}
            onChange={(e) => setEvent({ ...event, start: e.target.value })}
            className="tw-border-purple-300 focus:tw-border-purple-500 focus:tw-ring-purple-500"
          />
        </Form.Group>

        <Form.Group>
          <Form.Label className="tw-flex tw-items-center tw-text-purple-700 tw-font-semibold tw-mb-2">
            <FaClock className="tw-mr-2 tw-text-purple-600" />
            End Time <span className="tw-text-red-500 tw-ml-1">*</span>
          </Form.Label>
          <Form.Control
            type="datetime-local"
            value={event.end ? event.end.substring(0,16) : ''}
            onChange={(e) => setEvent({ ...event, end: e.target.value })}
            className="tw-border-purple-300 focus:tw-border-purple-500 focus:tw-ring-purple-500"
          />
        </Form.Group>
      </div>

      <Card className="tw-border-purple-200">
        <Card.Body className="tw-p-4">
          <Form.Group>
            <RoleSearch onSelectRole={handleSelectRole} selectedRoles={selectedRoles} />
          </Form.Group>

          {selectedRoles.length > 0 && (
            <div className="tw-mt-3">
              <Form.Label className="tw-text-purple-700 tw-font-semibold tw-mb-2">Selected Roles:</Form.Label>
              <div className="tw-flex tw-flex-wrap tw-gap-2">
                {selectedRoles.map((role, index) => (
                  <Badge 
                    key={index} 
                    className="tw-bg-purple-600 tw-text-white tw-px-3 tw-py-2 tw-rounded-full tw-flex tw-items-center"
                  >
                    {role}
                    <button
                      type="button"
                      className="tw-ml-2 tw-bg-transparent tw-border-0 tw-text-white hover:tw-text-purple-200"
                      onClick={() => {
                        setSelectedRoles(prev => prev.filter(r => r !== role));
                      }}
                    >
                      <FaTimes />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {showAssignedTo && selectedRoles.length > 0 && (
        <Card className="tw-border-purple-200">
          <Card.Body className="tw-p-4">
            <Form.Group>
              <Form.Label className="tw-flex tw-items-center tw-text-purple-700 tw-font-semibold tw-mb-3">
                <FaUsers className="tw-mr-2 tw-text-purple-600" />
                Assigned To
              </Form.Label>
              <AssigneeSearch
                onSelectAssignee={handleSelectAssignee}
                selectedAssigneeIds={selectedAssignees.map(user => user.userid)}
                roles={selectedRoles}
              />
              {selectedAssignees.length > 0 && (
                <div className="tw-mt-3">
                  <div className="tw-flex tw-flex-wrap tw-gap-2">
                    {selectedAssignees.map(user => (
                      <Badge 
                        key={user.userid} 
                        className="tw-bg-indigo-600 tw-text-white tw-px-3 tw-py-2 tw-rounded-full tw-flex tw-items-center"
                      >
                        {user.name}
                        <button
                          type="button"
                          className="tw-ml-2 tw-bg-transparent tw-border-0 tw-text-white hover:tw-text-indigo-200"
                          onClick={() => handleRemoveAssignee(user.userid)}
                        >
                          <FaTimes />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Form.Group>
          </Card.Body>
        </Card>
      )}

      <Form.Group>
        <Form.Label className="tw-flex tw-items-center tw-text-purple-700 tw-font-semibold tw-mb-2">
          <FaUserCog className="tw-mr-2 tw-text-purple-600" />
          Starter User
        </Form.Label>
        <Form.Select
          value={event.starter_user_id || ''}
          onChange={(e) => setEvent({ ...event, starter_user_id: e.target.value })}
          disabled={selectedAssignees.length === 0}
          className="tw-border-purple-300 focus:tw-border-purple-500 focus:tw-ring-purple-500"
        >
          <option value="">Select Starter User</option>
          {selectedAssignees.map((user) => (
            <option key={user.userid} value={user.userid}>
              {user.name}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group>
        <Form.Label className="tw-flex tw-items-center tw-text-purple-700 tw-font-semibold tw-mb-2">
          <FaStickyNote className="tw-mr-2 tw-text-purple-600" />
          Notes
        </Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          placeholder="Enter additional notes"
          value={event.notes || ''}
          onChange={(e) => setEvent({ ...event, notes: e.target.value })}
          className="tw-border-purple-300 focus:tw-border-purple-500 focus:tw-ring-purple-500 tw-resize-none"
        />
      </Form.Group>
    </Form>
  );

  return (
    <MainLayout>
      <div className="tw-min-h-screen tw-bg-gradient-to-br tw-from-purple-50 tw-to-indigo-100">
        <div className="tw-container tw-mx-auto tw-px-4 tw-py-6">
          <Card className="tw-shadow-xl tw-border-0 tw-bg-white/80 tw-backdrop-blur-sm">
            <Card.Body className="tw-p-6">
              <div className="tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-items-start sm:tw-items-center tw-mb-6 tw-gap-4">
                <h1 className="tw-text-3xl tw-font-bold tw-text-purple-800 tw-flex tw-items-center">
                  <FaCalendarPlus className="tw-mr-3 tw-text-purple-600" />
                  Event Calendar
                </h1>
                <Button 
                  className="tw-bg-gradient-to-r tw-from-purple-600 tw-to-indigo-600 tw-border-0 tw-px-6 tw-py-2 tw-rounded-full tw-shadow-lg hover:tw-shadow-xl tw-transition-all tw-duration-300 hover:tw-scale-105" 
                  onClick={() => setShowAddModal(true)} 
                  type="button"
                >
                  <FaCalendarPlus className="tw-mr-2" />
                  Add Event
                </Button>
              </div>
              
              <div className="tw-bg-white tw-rounded-xl tw-shadow-lg tw-p-4" style={{
                '--fc-border-color': '#e9d5ff',
                '--fc-button-bg-color': '#8b5cf6',
                '--fc-button-border-color': '#8b5cf6',
                '--fc-button-hover-bg-color': '#7c3aed',
                '--fc-button-hover-border-color': '#7c3aed',
                '--fc-button-active-bg-color': '#6d28d9',
                '--fc-button-active-border-color': '#6d28d9',
                '--fc-today-bg-color': '#f3e8ff'
              } as React.CSSProperties}>
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
                  }}
                  events={events}
                  editable
                  droppable
                  dateClick={handleDateClick}
                  eventClick={handleEventClick}
                  eventDrop={handleEventDrop}
                  height="auto"
                  eventContent={(eventInfo) => (
                    <div
                      className="tw-px-2 tw-py-1 tw-rounded-md tw-text-white tw-text-xs tw-font-medium tw-shadow-sm"
                      style={{
                        backgroundColor: eventInfo.event.extendedProps.backgroundColor,
                      }}
                    >
                      {eventInfo.event.title}
                    </div>
                  )}
                />
              </div>
            </Card.Body>
          </Card>
        </div>

        <Modal 
          show={showDayModal} 
          onHide={() => setShowDayModal(false)}
          size="lg"
          centered
          className="tw-backdrop-blur-sm"
        >
          <Modal.Header closeButton className="tw-bg-gradient-to-r tw-from-purple-600 tw-to-indigo-600 tw-text-white tw-border-0">
            <Modal.Title className="tw-flex tw-items-center">
              <FaCalendarPlus className="tw-mr-2" />
              Events for Selected Day
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="tw-p-4">
            {selectedDateEvents.length > 0 ? (
              <div className="tw-overflow-x-auto">
                <Table className="tw-w-full" responsive>
                  <thead className="tw-bg-purple-50">
                    <tr>
                      <th className="tw-text-purple-800 tw-font-semibold">Title</th>
                      <th className="tw-text-purple-800 tw-font-semibold">Time</th>
                      <th className="tw-text-purple-800 tw-font-semibold">Roles</th>
                      <th className="tw-text-purple-800 tw-font-semibold">Assigned To</th>
                      <th className="tw-text-purple-800 tw-font-semibold">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDateEvents.map((event) => (
                      <tr key={event.id} className="hover:tw-bg-purple-25">
                        <td className="tw-font-medium">{event.title}</td>
                        <td className="tw-text-sm">
                          {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                          {new Date(event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td>
                          <div className="tw-flex tw-flex-wrap tw-gap-1">
                            {event.role.map((role, idx) => (
                              <Badge key={idx} className="tw-bg-purple-600 tw-text-white tw-text-xs">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td>
                          <div className="tw-flex tw-flex-wrap tw-gap-1">
                            {event.assignedTo.map((user, idx) => (
                              <Badge key={idx} className="tw-bg-indigo-600 tw-text-white tw-text-xs">
                                {user.name}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="tw-text-sm tw-max-w-xs tw-truncate">{event.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <div className="tw-text-center tw-py-8">
                <FaCalendarPlus className="tw-text-4xl tw-text-purple-300 tw-mb-3" />
                <p className="tw-text-purple-600">No events scheduled for this day.</p>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="tw-border-0">
            <Button 
              variant="outline-secondary" 
              onClick={() => setShowDayModal(false)} 
              type="button"
              className="tw-border-purple-300 tw-text-purple-600 hover:tw-bg-purple-50"
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal 
          show={showEditModal} 
          onHide={() => setShowEditModal(false)} 
          size="lg" 
          centered 
          backdrop="static"
          className="tw-backdrop-blur-sm"
        >
          <Modal.Header closeButton className="tw-bg-gradient-to-r tw-from-purple-600 tw-to-indigo-600 tw-text-white tw-border-0">
            <Modal.Title className="tw-flex tw-items-center">
              <FaUserCog className="tw-mr-2" />
              Edit Event
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="tw-p-4 tw-max-h-96 tw-overflow-y-auto">
            {error && <Alert variant="danger" className="tw-border-red-200 tw-bg-red-50 tw-text-red-800">{error}</Alert>}
            {editEvent && renderForm(editEvent, setEditEvent as React.Dispatch<React.SetStateAction<NewEvent | Event>>, true)}
          </Modal.Body>
          <Modal.Footer className="tw-border-0 tw-bg-gray-50">
            <Button 
              variant="outline-secondary" 
              onClick={() => setShowEditModal(false)} 
              type="button"
              className="tw-border-purple-300 tw-text-purple-600 hover:tw-bg-purple-50"
            >
              Cancel
            </Button>
            <Button 
              className="tw-bg-gradient-to-r tw-from-purple-600 tw-to-indigo-600 tw-border-0 hover:tw-shadow-lg"
              onClick={handleEditEventSave} 
              disabled={loading} 
              type="button"
            >
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="tw-mr-2" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal 
          show={showAddModal} 
          onHide={() => setShowAddModal(false)} 
          size="lg" 
          centered 
          backdrop="static"
          className="tw-backdrop-blur-sm"
        >
          <Modal.Header closeButton className="tw-bg-gradient-to-r tw-from-purple-600 tw-to-indigo-600 tw-text-white tw-border-0">
            <Modal.Title className="tw-flex tw-items-center">
              <FaCalendarPlus className="tw-mr-2" />
              Add New Event
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="tw-p-4 tw-max-h-96 tw-overflow-y-auto">
            {error && <Alert variant="danger" className="tw-border-red-200 tw-bg-red-50 tw-text-red-800">{error}</Alert>}
            {renderForm(newEvent, setNewEvent as React.Dispatch<React.SetStateAction<NewEvent | Event>>)}
          </Modal.Body>
          <Modal.Footer className="tw-border-0 tw-bg-gray-50">
            <Button 
              variant="outline-secondary" 
              onClick={() => setShowAddModal(false)} 
              type="button"
              className="tw-border-purple-300 tw-text-purple-600 hover:tw-bg-purple-50"
            >
              Cancel
            </Button>
            <Button 
              className="tw-bg-gradient-to-r tw-from-purple-600 tw-to-indigo-600 tw-border-0 hover:tw-shadow-lg"
              onClick={handleAddEvent} 
              disabled={loading} 
              type="button"
            >
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="tw-mr-2" />
                  Saving...
                </>
              ) : (
                'Save Event'
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default CalendarPage;