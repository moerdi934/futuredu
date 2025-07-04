// models/codeAttendance.model.ts
import pool from '../lib/db';

// Types
export interface CodeAttendance {
  id: number;
  session_id: number;
  event_id: number;
  create_user_id: string;
  creator_name?: string;
  qr_data: string;
  token: string;
  expiration_time: Date;
  status: string;
  create_date: Date;
  qr_image?: Buffer | string;
}

export interface CodeAttendanceFilters {
  session_id?: number;
  status?: string;
}

export interface CreateCodeAttendanceData {
  session_id: number;
  event_id: number;
  create_user_id: string;
  qr_data: string;
  token: string;
  expiration_time: Date;
  status: string;
  qr_image: Buffer;
}

export interface UpdateCodeAttendanceData {
  session_id: number;
  event_id: number;
  create_user_id: string;
  qr_data: string;
  token: string;
  expiration_time: Date;
  status: string;
}

export const getCodeAttendances = async (filters: CodeAttendanceFilters = {}): Promise<CodeAttendance[]> => {
    let query = `
        SELECT 
            dca.id,
            dca.session_id,
            dca.event_id,
            dca.create_user_id,
            u.username AS creator_name,
            dca.qr_data,
            dca.token,
            dca.expiration_time,
            dca.status,
            dca.create_date
        FROM dimCodeAttendance dca
        LEFT JOIN Users u ON dca.create_user_id = u.id
        WHERE 1=1
    `;
    
    const values: any[] = [];
    let counter = 1;

    if (filters.session_id) {
        query += ` AND dca.session_id = $${counter}`;
        values.push(filters.session_id);
        counter++;
    }

    if (filters.status) {
        query += ` AND dca.status = $${counter}`;
        values.push(filters.status);
        counter++;
    }

    const result = await pool.query(query, values);
    return result.rows;
};

export const getCodeAttendanceById = async (id: number): Promise<CodeAttendance | null> => {
    const query = `
        SELECT 
            dca.id,
            dca.session_id,
            dca.event_id,
            dca.create_user_id,
            u.username AS creator_name,
            dca.qr_data,
            dca.token,
            dca.expiration_time,
            dca.status,
            dca.create_date
        FROM dimCodeAttendance dca
        LEFT JOIN Users u ON dca.create_user_id = u.id
        WHERE dca.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
};

export const getValidCodeAttendances = async (session_id: number): Promise<CodeAttendance | null> => {
    const query = `
        SELECT 
            dca.id,
            dca.session_id,
            dca.event_id,
            dca.create_user_id,
            u.username AS creator_name,
            dca.qr_data,
            dca.token,
            dca.expiration_time,
            dca.status,
            dca.create_date,
            dca.qr_image
        FROM dimCodeAttendance dca
        LEFT JOIN Users u ON dca.create_user_id = u.id
        WHERE dca.session_id = $1 
            AND dca.expiration_time >= NOW() AT TIME ZONE 'Asia/Jakarta'  -- Pastikan waktu kedaluwarsa lebih besar atau sama dengan waktu sekarang dalam zona waktu Jakarta
            AND dca.qr_image IS NOT NULL      -- Pastikan ada gambar QR Code
        ORDER BY dca.expiration_time DESC   -- Urutkan berdasarkan waktu kedaluwarsa terbaru
        LIMIT 1;                            -- Ambil satu hasil yang paling valid (terbaru)
    `;
    
    const result = await pool.query(query, [session_id]);
    const code = result.rows[0];
    console.log(code);

    if (code && code.qr_image) {
        // Konversi Buffer menjadi Base64 string
        code.qr_image = `data:image/png;base64,${code.qr_image.toString('base64')}`;
    }

    return code || null;  // Mengembalikan hasil dengan qr_image dalam format Base64
};

export const getCodeAttendanceByToken = async (token: string): Promise<CodeAttendance | null> => {
    const query = `
      SELECT * FROM dimCodeAttendance 
      WHERE token = $1 AND expiration_time >= NOW();
    `;
    const result = await pool.query(query, [token]);
    return result.rows[0] || null;
};
 
export const createCodeAttendance = async (data: CreateCodeAttendanceData): Promise<CodeAttendance> => {
    const query = `
        INSERT INTO dimCodeAttendance 
            (session_id, event_id, create_user_id, qr_data, token, expiration_time, status, create_date, qr_image)
        VALUES 
            ($1, $2, $3, $4, $5, $6, $7, NOW(), $8)
        RETURNING *;
    `; 
    const values = [
        data.session_id,
        data.event_id,
        data.create_user_id,
        data.qr_data,
        data.token,
        data.expiration_time,
        data.status,
        data.qr_image
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const updateCodeAttendance = async (id: number, data: UpdateCodeAttendanceData): Promise<CodeAttendance | null> => {
    const query = `
        UPDATE dimCodeAttendance 
        SET 
            session_id = $1,
            event_id = $2,
            create_user_id = $3,
            qr_data = $4,
            token = $5,
            expiration_time = $6,
            status = $7,
            create_date = NOW()
        WHERE id = $8
        RETURNING *;
    `;
    const values = [
        data.session_id,
        data.event_id,
        data.create_user_id,
        data.qr_data,
        data.token,
        data.expiration_time,
        data.status,
        id,
    ];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
};

export const updateCodeAttendanceStatus = async (token: string, status: string): Promise<CodeAttendance | null> => {
    const query = `
        UPDATE dimCodeAttendance 
        SET status = $1
        WHERE token = $2
        RETURNING *;
    `;
    const values = [status, token];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
};