// models/user.model.ts
import pool from '../lib/db';
import { PoolClient } from 'pg';

// Types
export interface User {
  id?: number;
  username: string;
  fullName?: string;
  email: string;
  password: string;
  role: string;
  create_date?: Date;
  last_login?: Date;
}

export interface UserAccount {
  user_id: number;
  nama_lengkap: string;
  is_manual: boolean;
  tanggal_lahir?: Date;
  nomor_whatsapp?: string;
  tahun_lulus_sma_smk?: string;
  tahun_masuk?: string;
  tahun_lulus?: string;
  nomor_whatsapp_ortu?: string;
  provinsi?: string;
  kota?: string;
  kecamatan?: string;
  kelurahan?: string;
  pendidikan_sekarang?: string;
  sekolah?: string;
  kelas?: string;
  jurusan?: string;
  pendidikan_terakhir?: string;
  strata?: string;
  nama_panggilan?: string;
  jenis_kelamin?: string;
  universitas?: string;
  program_studi?: string;
}

export interface UserFilters {
  sortField?: string;
  sortOrder?: string;
  search?: string;
  page?: number;
  limit?: number;
  role?: string;
  education?: string;
  city?: string;
  province?: string;
  status?: string;
}

export interface UserStatistics {
  totalUsers: number;
  growthPercentage: number;
}

export interface RevenuePerUser {
  avg_revenue_current_quarter: number;
  avg_revenue_previous_quarter: number;
  growth_percentage: number;
}

export interface PendidikanDistribution {
  pendidikan_group: string;
  total: number;
}

export interface StudentGrowth {
  pendidikan_group: string;
  year_week: string;
  total: number;
}

export interface UserDetails extends User {
  tanggal_lahir?: Date;
  nomor_whatsapp?: string;
  tahun_lulus_sma_smk?: string;
  tahun_masuk?: string;
  tahun_lulus?: string;
  nomor_whatsapp_ortu?: string;
  provinsi?: string;
  kota?: string;
  kecamatan?: string;
  kelurahan?: string;
  pendidikan_sekarang?: string;
  sekolah?: string;
  kelas?: string;
  jurusan?: string;
  pendidikan_terakhir?: string;
  strata?: string;
  nama_lengkap?: string;
  nama_panggilan?: string;
  jenis_kelamin?: string;
  universitas?: string;
  program_studi?: string;
}

export interface SearchUser {
  userid: number;
  name: string;
  username?: string;
}

export interface StudentGroup {
  id: number;
  name: string;
  id_list: number[];
  user_names: string[];
}

// User Model Class
class UserModel {
  // Create new user
  static async create(newUser: User): Promise<User> {
    try {
      const result = await pool.query(
        "INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
        [newUser.username, newUser.email, newUser.password, newUser.role]
      );

      if (newUser.fullName) {
        await pool.query(
          "INSERT INTO user_account (user_id, nama_lengkap, is_manual) VALUES ($1, $2, false)",
          [result.rows[0].user_id, newUser.fullName]
        );
      }

      console.log("created user: ", result.rows[0].user_id);
      return result.rows[0];
    } catch (error) {
      console.log("error: ", error);
      throw error;
    }
  }

  // Get cart count
  static async getCartCount(userId: number): Promise<number> {
    const { rows } = await pool.query(
      `SELECT COALESCE(SUM(ci.quantity),0) AS cartcount
         FROM cart_items ci
         JOIN cart        c  ON ci.cart_id = c.id
        WHERE c.user_id = $1`,
      [userId]
    );
    return parseInt(rows[0].cartcount, 10);
  }

  // Get unpaid count
  static async getUnpaidCount(userId: number): Promise<number> {
    const { rows } = await pool.query(
      `SELECT COUNT(*) AS unpaidcount
         FROM sales_order_header
        WHERE user_id = $1
          AND payment_status = 'pending'`,
      [userId]
    );
    return parseInt(rows[0].unpaidcount, 10);
  }

  // Delete user by ID
  static async deleteUser(userId: number): Promise<User> {
    try {
      const result = await pool.query(
        `DELETE FROM users WHERE id = $1 RETURNING id`,
        [userId]
      );

      if (result.rows.length === 0) {
        throw { kind: "not_found" };
      }

      console.log("Deleted user with id:", result.rows[0].id);
      return result.rows[0];
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  // Update user data
  static async updateUser(userId: number, updatedData: {
    username: string;
    email: string;
    oldPassword: string;
    newPassword: string;
  }): Promise<User> {
    const { username, email, oldPassword, newPassword } = updatedData;

    try {
      // Check old password
      const checkResult = await pool.query(
        `SELECT password FROM users WHERE id = $1`,
        [userId]
      );

      if (checkResult.rows.length === 0) {
        throw { message: "User not found" };
      }

      const currentPassword = checkResult.rows[0].password;

      if (currentPassword !== oldPassword) {
        throw { message: "Old password does not match" };
      }

      // Update user data
      const updateResult = await pool.query(
        `UPDATE users
         SET username = $1, email = $2, password = $3
         WHERE id = $4
         RETURNING id, username, email, role, last_login, create_date`,
        [username, email, newPassword, userId]
      );

      if (updateResult.rows.length === 0) {
        throw { message: "Update failed" };
      }

      return updateResult.rows[0];
    } catch (error) {
      console.error("Error updating user data:", error);
      throw error;
    }
  }

  // Check if username or email exists
  static async checkExistence(username: string, email: string): Promise<User[]> {
    try {
      const result = await pool.query(
        "SELECT * FROM users WHERE username = $1 OR email = $2",
        [username, email]
      );
      return result.rows;
    } catch (error) {
      console.log("error: ", error);
      throw error;
    }
  }

  // Find user by username
  static async findByUsername(username: string): Promise<User> {
    try {
      console.log('Executing query to find user by username:', username);
      const result = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
      );

      console.log('Query result:', result.rows);
      if (result.rows.length === 0) {
        console.log('User not found for username:', username);
        throw { kind: "not_found" };
      }

      console.log('User found:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.log("error executing query: ", error);
      throw error;
    }
  }

  // Find user by ID
  static async findById(id: number): Promise<User> {
    try {
      console.log('Executing query to find user by id:', id);
      const result = await pool.query(
        "SELECT id, username, email FROM users WHERE id = $1",
        [id]
      );

      console.log('Query result:', result.rows);
      if (result.rows.length === 0) {
        console.log('User not found for id:', id);
        throw { kind: "not_found" };
      }

      console.log('User found:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.log("error executing query: ", error);
      throw error;
    }
  }

  // Update last login
  static async updateLastLogin(username: string): Promise<User> {
    try {
      const result = await pool.query(
        "UPDATE users SET last_login = NOW() WHERE username = $1 RETURNING *",
        [username]
      );
      console.log("Updated last_login for user:", result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.log("Error updating last_login:", error);
      throw error;
    }
  }

  // Get user data by role
  static async getUserDataByRole(role: string): Promise<User[]> {
    try {
      console.log('Executing query to find users by role:', role);
      const result = await pool.query(
        "SELECT * FROM v_dashboard_UserData WHERE role = $1",
        [role]
      );

      console.log('Query result:', result.rows);
      if (result.rows.length === 0) {
        console.log('No users found for role:', role);
        throw { kind: "not_found" };
      }

      return result.rows;
    } catch (error) {
      console.error("Error executing query:", error);
      throw error;
    }
  }

  // Get paginated users
  static async getPaginatedUsers(options: UserFilters = {}): Promise<{
    users: any[];
    total: number;
  }> {
    const {
      sortField = 'id',
      sortOrder = 'asc',
      search = '',
      page = 1,
      limit = 10,
      role = '',
      education = '',
      city = '',
      province = '',
      status = ''
    } = options;

    const offset = (page - 1) * limit;
    let query = `
    WITH filtered_users AS (
      SELECT 
        userid id,*
      FROM v_dashboard_UserData u
      WHERE 1=1
    `;

    const values: any[] = [];
    const conditions: string[] = [];

    // Filter by role
    if (role && role !== 'All') {
      values.push(role);
      conditions.push(`AND u.role = $${values.length}`);
    }

    // Filter by education
    if (education && education !== 'All') {
      values.push(education);
      conditions.push(`AND u.pendidikan = $${values.length}`);
    }

    // Filter by city
    if (city && city !== 'All') {
      values.push(city);
      conditions.push(`AND u.kota = $${values.length}`);
    }

    // Filter by province
    if (province && province !== 'All') {
      values.push(province);
      conditions.push(`AND u.provinsi = $${values.length}`);
    }

    // Filter by status
    if (status && status !== 'All') {
      values.push(status);
      conditions.push(`AND u.status = $${values.length}`);
    }

    // Search in user_code, nama_lengkap, and email
    if (search) {
      values.push(`%${search}%`);
      values.push(`%${search}%`);
      values.push(`%${search}%`);
      conditions.push(`AND (
        u.user_code ILIKE $${values.length - 2} OR 
        u.nama_lengkap ILIKE $${values.length - 1} OR 
        u.email ILIKE $${values.length}
      )`);
    }

    if (conditions.length > 0) {
      query += conditions.join(' ');
    }

    query += `) 
      SELECT 
        *, 
        COUNT(*) OVER() AS total 
      FROM filtered_users
    `;

    // Sorting
    const validSortFields = ['userid', 'user_code', 'nama_lengkap', 'email', 'pendidikan', 'kota', 'provinsi', 'status'];
    if (validSortFields.includes(sortField.toLowerCase()) && ['asc', 'desc'].includes(sortOrder.toLowerCase())) {
      query += ` ORDER BY ${sortField} ${sortOrder.toUpperCase()}`;
    } else {
      query += ` ORDER BY userid ASC`;
    }

    query += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;

    const result = await pool.query(query, [...values, limit, offset]);
    return {
      users: result.rows,
      total: result.rows.length > 0 ? result.rows[0].total : 0
    };
  }

  // Get total users and growth by role
  static async getTotalUsersAndGrowthByRole(role: string): Promise<UserStatistics> {
    try {
      const currentCountQuery = `
          SELECT COUNT(*) AS total 
          FROM users
          WHERE role = $1;
      `;
      const lastMonthCountQuery = `
          SELECT COUNT(*) AS total 
          FROM users
          WHERE role = $1 AND create_date >= NOW() - INTERVAL '1 MONTH';
      `;

      const currentCountResult = await pool.query(currentCountQuery, [role]);
      const lastMonthCountResult = await pool.query(lastMonthCountQuery, [role]);

      const totalUsers = currentCountResult.rows[0].total;
      const lastMonthUsers = lastMonthCountResult.rows[0].total;

      // Calculate growth
      const growthPercentage = lastMonthUsers === 0
        ? 0
        : ((totalUsers - lastMonthUsers) / lastMonthUsers) * 100;

      return {
        totalUsers,
        growthPercentage: parseFloat(growthPercentage.toFixed(2))
      };
    } catch (error) {
      console.error('Error fetching total users and growth:', error);
      throw error;
    }
  }

  // Get active users and growth by role
  static async getActiveUsersAndGrowthByRole(role: string): Promise<UserStatistics> {
    try {
      const activeUsersQuery = `
          SELECT COUNT(*) AS activeUsers
          FROM users
          WHERE role = $1 AND last_login >= NOW() - INTERVAL '14 DAYS';
      `;

      const lastMonthActiveUsersQuery = `
          SELECT COUNT(*) AS lastMonthActiveUsers
          FROM users
          WHERE role = $1 AND last_login >= NOW() - INTERVAL '30 DAYS';
      `;

      const activeUsersResult = await pool.query(activeUsersQuery, [role]);
      const lastMonthActiveUsersResult = await pool.query(lastMonthActiveUsersQuery, [role]);

      const activeUsers = parseInt(activeUsersResult.rows[0].activeusers, 10);
      const lastMonthActiveUsers = parseInt(lastMonthActiveUsersResult.rows[0].lastmonthactiveusers, 10);

      // Calculate growth
      const growthPercentage = lastMonthActiveUsers === 0
        ? 0
        : ((activeUsers - lastMonthActiveUsers) / lastMonthActiveUsers) * 100;

      return {
        activeUsers,
        growthPercentage: parseFloat(growthPercentage.toFixed(2))
      };
    } catch (error) {
      console.error("Error fetching active users and growth: ", error);
      throw error;
    }
  }

  // Get new users and growth by role
  static async getNewUsersAndGrowthByRole(role: string): Promise<UserStatistics> {
    try {
      // Query untuk pengguna baru bulan ini
      const currentMonthQuery = `
          SELECT COUNT(*) AS newUsers
          FROM users
          WHERE role = $1 AND create_date >= DATE_TRUNC('month', NOW());
      `;

      // Query untuk pengguna baru bulan lalu
      const previousMonthQuery = `
          SELECT COUNT(*) AS previousMonthUsers
          FROM users
          WHERE role = $1 AND create_date >= DATE_TRUNC('month', NOW()) - INTERVAL '1 MONTH'
            AND create_date < DATE_TRUNC('month', NOW());
      `;

      const currentMonthResult = await pool.query(currentMonthQuery, [role]);
      const previousMonthResult = await pool.query(previousMonthQuery, [role]);

      const newUsers = parseInt(currentMonthResult.rows[0].newusers, 10);
      const previousMonthUsers = parseInt(previousMonthResult.rows[0].previousmonthusers, 10);

      // Hitung pertumbuhan
      const growthPercentage = previousMonthUsers === 0
        ? 0
        : ((newUsers - previousMonthUsers) / previousMonthUsers) * 100;

      return {
        newUsers,
        growthPercentage: parseFloat(growthPercentage.toFixed(2))
      };
    } catch (error) {
      console.error("Error fetching new users and growth: ", error);
      throw error;
    }
  }

  // Get revenue per user
  static async getRevenuePerUser(role: string): Promise<RevenuePerUser> {
    try {
      const query = `
          WITH current_quarter_revenue AS (
              SELECT 
                  COALESCE(AVG(o.total_price)::NUMERIC, 0) AS avg_revenue_current_quarter
              FROM 
                  payments p
              JOIN 
                  users u ON p.user_id = u.id
              JOIN 
                  orders o ON o.order_id = p.order_id
              WHERE 
                  p.status = 'Settlement'
                  AND u.role = $1
                  AND EXTRACT(QUARTER FROM p.payment_date) = EXTRACT(QUARTER FROM CURRENT_DATE)
                  AND EXTRACT(YEAR FROM p.payment_date) = EXTRACT(YEAR FROM CURRENT_DATE)
          ),
          previous_quarter_revenue AS (
              SELECT 
                  COALESCE(AVG(o.total_price)::NUMERIC, 0) AS avg_revenue_previous_quarter
              FROM 
                  payments p
              JOIN 
                  users u ON p.user_id = u.id
              JOIN 
                  orders o ON o.order_id = p.order_id
              WHERE 
                  p.status = 'Settlement'
                  AND u.role = $1
                  AND (
                      (EXTRACT(QUARTER FROM p.payment_date) = EXTRACT(QUARTER FROM CURRENT_DATE) - 1
                      AND EXTRACT(YEAR FROM p.payment_date) = EXTRACT(YEAR FROM CURRENT_DATE))
                      OR (EXTRACT(QUARTER FROM CURRENT_DATE) = 1 AND EXTRACT(QUARTER FROM p.payment_date) = 4 
                      AND EXTRACT(YEAR FROM p.payment_date) = EXTRACT(YEAR FROM CURRENT_DATE) - 1)
                  )
          )
          SELECT 
              current_quarter_revenue.avg_revenue_current_quarter,
              previous_quarter_revenue.avg_revenue_previous_quarter,
              CASE 
                  WHEN previous_quarter_revenue.avg_revenue_previous_quarter = 0 THEN 0
                  ELSE ((current_quarter_revenue.avg_revenue_current_quarter - previous_quarter_revenue.avg_revenue_previous_quarter) 
                        / previous_quarter_revenue.avg_revenue_previous_quarter) * 100
              END AS growth_percentage
          FROM 
              current_quarter_revenue, 
              previous_quarter_revenue;
      `;
      const values = [role];
      const { rows } = await pool.query(query, values);

      if (rows[0]) {
        rows[0].avg_revenue_current_quarter = parseFloat(rows[0].avg_revenue_current_quarter);
        rows[0].avg_revenue_previous_quarter = parseFloat(rows[0].avg_revenue_previous_quarter);
        rows[0].growth_percentage = parseFloat(rows[0].growth_percentage);
      }

      return rows[0];
    } catch (error) {
      console.error('Error fetching revenue per user:', error);
      throw error;
    }
  }

  // Get student pendidikan distribution
  static async getStudentPendidikanDistribution(): Promise<PendidikanDistribution[]> {
    try {
      const query = `
          SELECT 
              CASE
                  WHEN ua.pendidikan_sekarang = 'Kuliah' THEN 
                      COALESCE(ua.strata, 'Other')
                  WHEN ua.pendidikan_sekarang IS NULL OR ua.pendidikan_sekarang = '' THEN 'Other'
                  ELSE ua.pendidikan_sekarang
              END AS pendidikan_group,
              COUNT(*) AS total
          FROM 
              users u
          LEFT JOIN 
              user_account ua ON u.id = ua.id
          WHERE
              u.role = 'student'
          GROUP BY 
              CASE
                  WHEN ua.pendidikan_sekarang = 'Kuliah' THEN 
                      COALESCE(ua.strata, 'Other')
                  WHEN ua.pendidikan_sekarang IS NULL OR ua.pendidikan_sekarang = '' THEN 'Other'
                  ELSE ua.pendidikan_sekarang
              END;
      `;
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      console.error('Error fetching pendidikan distribution:', error);
      throw error;
    }
  }

  // Get student growth
  static async getStudentGrowth(): Promise<StudentGrowth[]> {
    try {
      const query = `
          WITH student_data AS (
              SELECT
                  COALESCE(
                      CASE
                          WHEN ua.pendidikan_sekarang = 'Kuliah' THEN CONCAT('Kuliah - ', ua.strata)
                          WHEN ua.pendidikan_sekarang IS NULL OR ua.pendidikan_sekarang = '' THEN 'Other'
                          ELSE ua.pendidikan_sekarang
                      END,
                      'Other'
                  ) AS pendidikan_group,
                  to_char(
                      (u.create_date AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta'),
                      'IYYY-IW'
                  ) AS year_week
              FROM users u
              LEFT JOIN user_account ua ON u.id = ua.id
          )
          SELECT
              pendidikan_group,
              year_week,
              COUNT(*) AS total
          FROM student_data
          GROUP BY pendidikan_group, year_week
          ORDER BY year_week ASC, pendidikan_group ASC;
      `;

      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      console.error("Error fetching student growth data:", error);
      throw error;
    }
  }

  // Get user details by ID
  static async getUserDetailsById(userId: number): Promise<UserDetails> {
    try {
      const query = `
          SELECT
              u.username,
              u.email,
              u.create_date,
              u.last_login,
              ua.tanggal_lahir,
              ua.nomor_whatsapp,
              ua.tahun_lulus_sma_smk,
              ua.tahun_masuk,
              ua.tahun_lulus,
              ua.nomor_whatsapp_ortu,
              ua.provinsi,
              ua.kota,
              ua.kecamatan,
              ua.kelurahan,
              ua.pendidikan_sekarang,
              ua.sekolah,
              ua.kelas,
              ua.jurusan,
              ua.pendidikan_terakhir,
              ua.strata,
              ua.nama_lengkap,
              ua.nama_panggilan,
              ua.jenis_kelamin,
              ua.universitas,
              ua.program_studi
          FROM users u
          JOIN user_account ua ON u.id = ua.id
          WHERE u.id = $1
      `;

      const result = await pool.query(query, [userId]);
      
      if (result.rows.length === 0) {
        throw { kind: "not_found" };
      }

      const filteredData: any = {};
      for (const key in result.rows[0]) {
        if (result.rows[0][key] !== null) {
          filteredData[key] = result.rows[0][key];
        }
      }
      return filteredData;
    } catch (error) {
      console.error("Error fetching user details:", error);
      throw error;
    }
  }

  // Search users by role and name
  static async searchUsersByRoleAndName(role: string, searchTerm: string, limit: number = 10): Promise<SearchUser[]> {
    const query = `
        SELECT userid, name, username
        FROM v_dashboard_userdata
        WHERE role = $1 
        AND (
            name ILIKE $2 
            OR username ILIKE $2
        )
        ORDER BY name ASC
        LIMIT $3
    `;
    const values = [role, `%${searchTerm}%`, limit];

    try {
      const res = await pool.query(query, values);
      return res.rows;
    } catch (error) {
      throw error;
    }
  }

  // Search users by roles and name
  static async searchUsersByRolesAndName(roles: string[], searchTerm: string): Promise<SearchUser[]> {
    const query = `
        SELECT userid, name
        FROM v_dashboard_userdata
        WHERE role IN (${roles.map((_, i) => `$${i + 1}`).join(', ')})
        AND name ILIKE $${roles.length + 1}
        ORDER BY name ASC
        LIMIT 50
    `;

    const values = [...roles, `%${searchTerm}%`];

    try {
      const res = await pool.query(query, values);
      return res.rows;
    } catch (error) {
      console.error('Query error:', error.message);
      throw error;
    }
  }

  // Get student group
  static async getStudentGroup(): Promise<StudentGroup[]> {
    try {
      const query = `
        SELECT 
          dgu.id,
          dgu.name,
          dgu.id_list,
          array_agg(vdu.name) AS user_names
        FROM 
          dimgroupstudent dgu
        CROSS JOIN LATERAL UNNEST(dgu.id_list) AS user_id
        JOIN 
          v_dashboard_userdata vdu ON vdu.userid = user_id
        WHERE dgu.status = 1
        GROUP BY 
          dgu.id, dgu.name;
      `;
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching student groups: ${error.message}`);
    }
  }
}

export default UserModel;