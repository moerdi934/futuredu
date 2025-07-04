// models/event.model.ts
import pool from '../lib/db';

// Types
export interface Event {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
  role: string[];
  assigned_to: number[];
  notes: string;
  starter_user_id?: number;
  master_id?: number;
  event_master_id?: number;
  event_type?: string;
  is_started?: boolean;
}

export interface EventWithUsers {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
  role: string[];
  assigned_to: number[];
  notes: string;
  assigned_users: AssignedUser[];
}

export interface AssignedUser {
  userid: number;
  name: string;
}

export interface FormattedEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  role: string[];
  assignedTo: AssignedUser[];
  notes: string;
  backgroundColor: string;
}

export interface CreateEventPayload {
  title: string;
  start_time: string;
  end_time: string;
  role: string[];
  assigned_to: number[];
  notes: string;
  starter_user_id?: number;
  master_id?: number;
  event_master_id?: number;
  event_type?: string;
}

export interface UpdateEventPayload {
  name: string;
  start_time: string;
  end_time: string;
  role?: string[];
  teacher_id: number;
  student_list_ids: number[];
  description: string;
}

// Get all events with assigned user details
export const getAllEvents = async (): Promise<EventWithUsers[]> => {
  const query = `
    SELECT 
      e.id, 
      e.title, 
      e.start_time, 
      e.end_time, 
      e.role, 
      e.assigned_to, 
      e.notes,
      COALESCE(
        json_agg(
          json_build_object('userid', u.userid, 'name', u.name)
        ) FILTER (WHERE u.userid IS NOT NULL), '[]'
      ) AS assigned_users
    FROM events e
    LEFT JOIN LATERAL json_array_elements_text(e.assigned_to) AS assigned_user_id(user_id)
      ON TRUE
    LEFT JOIN v_dashboard_userdata u 
      ON u.userid = assigned_user_id.user_id::integer
    Where e.start_time > now() or e.end_time  > now()
    GROUP BY e.id
    ORDER BY e.start_time ASC
    LIMIT 100
  `;
  
  const { rows } = await pool.query(query);
  return rows as EventWithUsers[];
};

// Get event by ID with assigned user details
export const getEventById = async (id: string): Promise<EventWithUsers | undefined> => {
  const query = `
    SELECT 
      e.id, 
      e.title, 
      e.start_time, 
      e.end_time, 
      e.role, 
      e.assigned_to, 
      e.notes,
      COALESCE(
        json_agg(
          json_build_object('userid', u.userid, 'name', u.name)
        ) FILTER (WHERE u.userid IS NOT NULL), '[]'
      ) AS assigned_users
    FROM events e
    LEFT JOIN LATERAL json_array_elements_text(e.assigned_to) AS assigned_user_id(user_id)
      ON TRUE
    LEFT JOIN v_dashboard_userdata u 
      ON u.userid = assigned_user_id.user_id::integer
    WHERE e.id = $1
    GROUP BY e.id
  `;  
  
  const { rows } = await pool.query(query, [id]);
  return rows[0] as EventWithUsers;
};

// Create a new event 
export const createEvent = async (event: CreateEventPayload): Promise<Event> => {
  const query = `
  INSERT INTO events (title, start_time, end_time, role, assigned_to, notes, starter_user_id, master_id, event_master_id, event_type)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *
  `;
  const values = [
    event.title,
    event.start_time,  
    event.end_time,
    JSON.stringify(event.role),
    JSON.stringify(event.assigned_to), // Store as JSON
    event.notes,
    event.starter_user_id, // Tambahkan starter_user_id,
    event.master_id, // Tambahkan master_id
    event.event_master_id, // Tambahkan event_master_id
    event.event_type, // Tambahkan event_type
  ];
  const { rows } = await pool.query(query, values);
  return rows[0] as Event;
};

// Update an event
export const updateEvent = async (id: string, event: UpdateEventPayload): Promise<Event | undefined> => {
  const assignedTo = [event.teacher_id, ...event.student_list_ids];

  const query = `
  UPDATE events
  SET title = $1, start_time = $2, end_time = $3, role = $4, assigned_to = $5, notes = $6, starter_user_id = $7
  WHERE id = $8 RETURNING *
  `;  
  const values = [
    event.name,
    event.start_time, // Pastikan menggunakan 'start_time' sesuai kolom di database
    event.end_time,   // Pastikan menggunakan 'end_time' sesuai kolom di database
    JSON.stringify(event.role) || JSON.stringify(['teacher','student']),
    JSON.stringify(assignedTo),
    event.description,
    event.teacher_id, // Tambahkan starter_user_id
    id,
  ];
  const { rows } = await pool.query(query, values);
  return rows[0] as Event;
};

export const startEvent = async (id: string): Promise<Event | undefined> => {
  const query = `
  UPDATE events
  SET is_started = true
  WHERE id = $1 RETURNING *
  `;  
  const values = [
    id,
  ];
  const { rows } = await pool.query(query, values);
  return rows[0] as Event;
};

// Delete an event
export const deleteEvent = async (id: string): Promise<Event | undefined> => {
  const query = 'DELETE FROM events WHERE id = $1 RETURNING *';
  const { rows } = await pool.query(query, [id]);
  return rows[0] as Event;
};