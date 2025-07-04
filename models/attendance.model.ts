// models/attendance.model.ts
import pool from '../lib/db';

// Types
export interface AttendanceFilters {
  userid?: string | number;
  type_id?: string | number;
  session_id?: string | number;
}

export interface AttendanceData {
  userid: string | number;
  reff_userid?: string | number | null;
  type_id: string | number;
  notes?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  session_id?: string | number | null;
}

export interface Attendance {
  id: number;
  userid: number;
  reff_userid?: number | null;
  type_id: number;
  attendance_type?: string;
  notes?: string | null;
  timestamp: Date;
  latitude?: number | null;
  longitude?: number | null;
  session_id?: number | null;
  user_name?: string;
  referenced_user_name?: string;
}

export const getAttendances = async (filters: AttendanceFilters = {}): Promise<Attendance[]> => {
    let query = `
        SELECT 
            fa.id,
            fa.userid,
            fa.reff_userid,
            fa.type_id,
            dt.type AS attendance_type,
            fa.notes,
            fa.timestamp,
            fa.latitude,
            fa.longitude,
            u1.username AS user_name,
            u2.username AS referenced_user_name
        FROM fAttendances fa
        LEFT JOIN dimAttendanceType dt ON fa.type_id = dt.id
        LEFT JOIN Users u1 ON fa.userid = u1.id
        LEFT JOIN Users u2 ON fa.reff_userid = u2.id
        WHERE 1=1
    `; 
    
    const values: any[] = [];
    let counter = 1;

    if (filters.userid) {
        query += ` AND fa.userid = $${counter}`;
        values.push(filters.userid);
        counter++;
    }

    if (filters.type_id) {
        query += ` AND fa.type_id = $${counter}`;
        values.push(filters.type_id);
        counter++;
    }

    if (filters.session_id) {
        query += ` AND fa.session_id = $${counter}`;
        values.push(filters.session_id);
        counter++;
    }

    const result = await pool.query(query, values);
    return result.rows;
};

export const getAttendanceById = async (id: string | number): Promise<Attendance | null> => {
    const query = `
        SELECT 
            fa.id,
            fa.userid,
            fa.reff_userid,
            fa.type_id,
            dt.type AS attendance_type,
            fa.notes,
            fa.timestamp,
            fa.latitude,
            fa.longitude,
            u1.username AS user_name,
            u2.username AS referenced_user_name
        FROM fAttendances fa
        LEFT JOIN dimAttendanceType dt ON fa.type_id = dt.id
        LEFT JOIN Users u1 ON fa.userid = u1.id
        LEFT JOIN Users u2 ON fa.reff_userid = u2.id
        WHERE fa.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
};

export const createAttendance = async (data: AttendanceData): Promise<Attendance> => {
    const query = `
        INSERT INTO fAttendances 
            (userid, reff_userid, type_id, notes, timestamp, latitude, longitude, session_id)
        VALUES 
            ($1, $2, $3, $4, NOW(), $5, $6, $7)
        RETURNING *;
    `;
    const values = [
        data.userid,
        data.reff_userid || null,
        data.type_id,
        data.notes || null,
        data.latitude || null,
        data.longitude || null,
        data.session_id || null,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const updateAttendance = async (id: string | number, data: AttendanceData): Promise<Attendance | null> => {
    const query = `
        UPDATE fAttendances 
        SET 
            userid = $1,
            reff_userid = $2,
            type_id = $3,
            notes = $4,
            timestamp = NOW(),
            latitude = $5,
            longitude = $6,
            session_id = $7
        WHERE id = $8
        RETURNING *;
    `;
    const values = [
        data.userid,
        data.reff_userid || null,
        data.type_id,
        data.notes || null,
        data.latitude || null,
        data.longitude || null,
        data.session_id || null,
        id,
    ];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
};

export const deleteAttendance = async (id: string | number): Promise<Attendance | null> => {
    const query = `DELETE FROM fAttendances WHERE id = $1 RETURNING *;`;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
};