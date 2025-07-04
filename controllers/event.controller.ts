// controllers/event.controller.ts
import { NextApiRequest, NextApiResponse } from 'next';
import * as eventModel from '../models/event.model';
import { AuthenticatedRequest } from '../lib/middleware/auth';

const rolesColors: { [key: string]: string } = {
  Admin: '#ff6666',
  Manager: '#66b3ff',
  Staff: '#85e085',
  Supervisor: '#ffcc99',
  Operator: '#c2c2f0',
  Engineer: '#c2f0c2',
  Consultant: '#f0c2c2',
};

// Get all events
export const getAllEvents = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const events = await eventModel.getAllEvents();
    // Mengubah assigned_users menjadi assignedTo (array of objects)
    const formattedEvents: eventModel.FormattedEvent[] = events.map(event => ({
      id: event.id.toString(),
      title: event.title,
      start: event.start_time,
      end: event.end_time,
      role: event.role,
      assignedTo: event.assigned_users, // Array of { userid, name }
      notes: event.notes,
      backgroundColor: rolesColors[event.role[0]] || '#ccc',
    }));
    res.status(200).json(formattedEvents);
  } catch (err: any) {
    console.error('Error fetching all events:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get event by ID
export const getEventById = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const { id } = req.query;
    if (typeof id !== 'string') {
      return res.status(400).json({ message: "Invalid event ID." });
    }

    const event = await eventModel.getEventById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }
    
    const formattedEvent: eventModel.FormattedEvent = {
      id: event.id.toString(),
      title: event.title,
      start: event.start_time,
      end: event.end_time,
      role: event.role,
      assignedTo: event.assigned_users, // Array of { userid, name }
      notes: event.notes,
      backgroundColor: event.role && event.role.length > 0
        ? event.role.map((r) => rolesColors[r] || '#ccc').join(', ')
        : '#ccc', // Kombinasikan warna untuk semua role,
    };
    res.status(200).json(formattedEvent);
  } catch (err: any) {
    console.error('Error fetching event by ID:', err);
    res.status(500).json({ error: err.message });
  }
};

// Create a new event
export const createEventController = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const newEvent = await eventModel.createEvent(req.body);
    // Mendapatkan assigned_users dengan nama
    const eventWithNames = await eventModel.getEventById(newEvent.id.toString());
    
    if (!eventWithNames) {
      return res.status(500).json({ error: "Failed to retrieve created event." });
    }

    const formattedEvent: eventModel.FormattedEvent = {
      id: eventWithNames.id.toString(),
      title: eventWithNames.title,
      start: eventWithNames.start_time,
      end: eventWithNames.end_time,
      role: eventWithNames.role,
      assignedTo: eventWithNames.assigned_users, // Array of { userid, name }
      notes: eventWithNames.notes,
      backgroundColor: eventWithNames.role && eventWithNames.role.length > 0
        ? eventWithNames.role.map((r) => rolesColors[r] || '#ccc').join(', ')
        : '#ccc', // Kombinasikan warna untuk semua role
    };
    res.status(201).json(formattedEvent);
  } catch (err: any) {
    console.error('Error creating event:', err);
    res.status(500).json({ error: err.message });
  } 
};

// Update an event
export const updateEventController = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    console.log('Received update payload:', req.body); // Tambahkan ini untuk debugging
    const { id } = req.query;
    if (typeof id !== 'string') {
      return res.status(400).json({ message: "Invalid event ID." });
    }

    const updatedEvent = await eventModel.updateEvent(id, req.body);
    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found." });
    }
    
    // Mendapatkan assigned_users dengan nama
    const eventWithNames = await eventModel.getEventById(updatedEvent.id.toString());
    
    if (!eventWithNames) {
      return res.status(500).json({ error: "Failed to retrieve updated event." });
    }

    const formattedEvent: eventModel.FormattedEvent = {
      id: eventWithNames.id.toString(),
      title: eventWithNames.title,
      start: eventWithNames.start_time,
      end: eventWithNames.end_time,
      role: eventWithNames.role,
      assignedTo: eventWithNames.assigned_users, // Array of { userid, name }
      notes: eventWithNames.notes,
      backgroundColor: rolesColors[eventWithNames.role[0]] || '#ccc',
    };
    res.status(200).json(formattedEvent);
  } catch (err: any) {
    console.error('Error updating event:', err);
    res.status(500).json({ error: err.message });
  }
};

// Delete an event
export const deleteEventController = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const { id } = req.query;
    if (typeof id !== 'string') {
      return res.status(400).json({ message: "Invalid event ID." });
    }

    const deletedEvent = await eventModel.deleteEvent(id);
    if (!deletedEvent) {
      return res.status(404).json({ message: "Event not found." });
    }
    res.status(200).json({ message: "Event deleted successfully." });
  } catch (err: any) {
    console.error('Error deleting event:', err);
    res.status(500).json({ error: err.message });
  }
};