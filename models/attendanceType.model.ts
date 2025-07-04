// models/attendanceType.model.ts
import pool from '../lib/db';

// Types
export interface AttendanceType {
  id: number;
  type: string;
  description: string;
  create_user_id: string;
  create_time?: Date;
  edit_user_id?: string;
  edit_time?: Date;
}

export interface CreateAttendanceTypeData {
  type: string;
  description: string;
  create_user_id: string;
}

export interface UpdateAttendanceTypeData {
  type: string;
  description: string;
  edit_user_id: string;
}

export const getAttendanceTypes = async (): Promise<AttendanceType[]> => {
  const query = `SELECT * FROM dimAttendanceType;`;
  const result = await pool.query(query);
  return result.rows;
};

export const getAttendanceTypeById = async (id: string): Promise<AttendanceType | undefined> => {
  const query = `SELECT * FROM dimAttendanceType WHERE id = $1;`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

export const createAttendanceType = async (data: CreateAttendanceTypeData): Promise<AttendanceType> => {
  const query = `
    INSERT INTO dimAttendanceType 
        (type, description, create_user_id)
    VALUES 
        ($1, $2, $3)
    RETURNING *;
  `;
  const values = [
    data.type,
    data.description,
    data.create_user_id,
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const updateAttendanceType = async (id: string, data: UpdateAttendanceTypeData): Promise<AttendanceType> => {
  const query = `
    UPDATE dimAttendanceType 
    SET 
        type = $1,
        description = $2,
        edit_user_id = $3,
        edit_time = NOW()
    WHERE id = $4
    RETURNING *;
  `;
  const values = [
    data.type,
    data.description,
    data.edit_user_id,
    id,
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const deleteAttendanceType = async (id: string): Promise<AttendanceType | undefined> => {
  const query = `DELETE FROM dimAttendanceType WHERE id = $1 RETURNING *;`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};