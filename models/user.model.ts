// models/user.model.ts
import pool from '../lib/db';
import { PoolClient } from 'pg';
import bcrypt from 'bcryptjs'; // npm install bcryptjs @types/bcryptjs

// Types
export interface User {
  id?: number;
  username: string;
  fullName?: string;
  email: string;
  password: string;
  hash_password?: string; // Temporary column for migration
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

// Helper function to hash password
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Helper function to verify password
export const verifyPassword = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// Helper function to check if password is already hashed
const isPasswordHashed = (password: string): boolean => {
  return /^\$2[aby]\$\d{2}\$.{53}$/.test(password);
};

// Create new user (always create with hashed password)
export const createUser = async (newUser: User): Promise<User> => {
  try {
    // Hash password for new users
    const hashedPassword = await hashPassword(newUser.password);
    
    const result = await pool.query(
      "INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
      [newUser.username, newUser.email, hashedPassword, newUser.role]
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
};

// Get cart count
export const getCartCount = async (userId: number): Promise<number> => {
  const { rows } = await pool.query(
    `SELECT COALESCE(SUM(ci.quantity),0) AS cartcount
       FROM cart_items ci
       JOIN cart        c  ON ci.cart_id = c.id
      WHERE c.user_id = $1`,
    [userId]
  );
  return parseInt(rows[0].cartcount, 10);
};

// Get unpaid count
export const getUnpaidCount = async (userId: number): Promise<number> => {
  const { rows } = await pool.query(
    `SELECT COUNT(*) AS unpaidcount
       FROM sales_order_header
      WHERE user_id = $1
        AND payment_status = 'pending' and expired_at > NOW()`,
    [userId]
  );
  return parseInt(rows[0].unpaidcount, 10);
};

// Delete user by ID
export const deleteUser = async (userId: number): Promise<User> => {
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
};

// Update user data
export const updateUser = async (userId: number, updatedData: {
  username: string;
  email: string;
  oldPassword: string;
  newPassword: string;
}): Promise<User> => {
  const { username, email, oldPassword, newPassword } = updatedData;

  try {
    // Get current user data
    const checkResult = await pool.query(
      `SELECT password FROM users WHERE id = $1`,
      [userId]
    );

    if (checkResult.rows.length === 0) {
      throw { message: "User not found" };
    }

    const currentPassword = checkResult.rows[0].password;

    // Verify old password (support both hashed and plain text)
    let isOldPasswordValid = false;
    
    if (isPasswordHashed(currentPassword)) {
      // Current password is hashed, use bcrypt to verify
      isOldPasswordValid = await verifyPassword(oldPassword, currentPassword);
    } else {
      // Current password is plain text, compare directly
      isOldPasswordValid = currentPassword === oldPassword;
    }

    if (!isOldPasswordValid) {
      throw { message: "Old password does not match" };
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update user data with hashed password
    const updateResult = await pool.query(
      `UPDATE users
       SET username = $1, email = $2, password = $3
       WHERE id = $4
       RETURNING id, username, email, role, last_login, create_date`,
      [username, email, hashedNewPassword, userId]
    );

    if (updateResult.rows.length === 0) {
      throw { message: "Update failed" };
    }

    return updateResult.rows[0];
  } catch (error) {
    console.error("Error updating user data:", error);
    throw error;
  }
};

// Check if username or email exists
export const checkExistence = async (username: string, email: string): Promise<User[]> => {
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
};

// Find user by username
export const findByUsername = async (username: string): Promise<User> => {
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
};

// Verify user credentials for login
export const verifyUserCredentials = async (username: string, password: string): Promise<User | null> => {
  try {
    const user = await findByUsername(username);
    
    if (!user) {
      return null;
    }

    let isPasswordValid = false;
    
    if (isPasswordHashed(user.password)) {
      // Password is hashed, use bcrypt to verify
      isPasswordValid = await verifyPassword(password, user.password);
      console.log('Verified against hashed password');
    } else {
      // Password is plain text, compare directly
      isPasswordValid = user.password === password;
      console.log('Verified against plain password');
    }

    if (isPasswordValid) {
      return user;
    } else {
      return null;
    }
  } catch (error) {
    console.log("error verifying credentials: ", error);
    throw error;
  }
};

// Find user by ID
export const findById = async (id: number): Promise<User> => {
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
};

// Update last login
export const updateLastLogin = async (username: string): Promise<User> => {
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
};

// MIGRATION FUNCTIONS

// Step 1: Add hash_password column with hashed versions
export const addHashPasswordColumn = async (): Promise<void> => {
  try {
    console.log('Step 1: Adding hash_password column and populating with hashed passwords...');
    
    // Add column if not exists
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS hash_password VARCHAR(255)
    `);
    
    // Get all users with plain text passwords
    const result = await pool.query(
      "SELECT id, username, password FROM users WHERE hash_password IS NULL"
    );

    console.log(`Found ${result.rows.length} users to process`);

    let processedCount = 0;
    for (const user of result.rows) {
      try {
        const hashedPassword = await hashPassword(user.password);
        
        await pool.query(
          "UPDATE users SET hash_password = $1 WHERE id = $2",
          [hashedPassword, user.id]
        );
        
        processedCount++;
        console.log(`✓ Processed user: ${user.username} (ID: ${user.id})`);
      } catch (error) {
        console.error(`✗ Failed to process user: ${user.username} (ID: ${user.id})`, error);
      }
    }

    console.log(`\nStep 1 completed!`);
    console.log(`Total users processed: ${result.rows.length}`);
    console.log(`Successfully processed: ${processedCount}`);
    
  } catch (error) {
    console.error('Error in Step 1:', error);
    throw error;
  }
};

// Step 2: Replace password column with hashed versions
export const replacePasswordsWithHashed = async (): Promise<void> => {
  try {
    console.log('Step 2: Replacing password column with hashed versions...');
    
    // Update password column with hash_password values
    const result = await pool.query(`
      UPDATE users 
      SET password = hash_password 
      WHERE hash_password IS NOT NULL
      RETURNING id, username
    `);

    console.log(`✓ Updated ${result.rows.length} user passwords with hashed versions`);
    
    // Verify all passwords are now hashed
    const verifyResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN password ~ '^\\$2[aby]\\$\\d{2}\\$.{53}$' THEN 1 END) as hashed
      FROM users
    `);
    
    const { total, hashed } = verifyResult.rows[0];
    
    if (parseInt(total) === parseInt(hashed)) {
      console.log(`✓ Verification successful: All ${total} passwords are now hashed`);
    } else {
      throw new Error(`Verification failed: ${total} total, ${hashed} hashed`);
    }
    
  } catch (error) {
    console.error('Error in Step 2:', error);
    throw error;
  }
};

// Step 3: Remove hash_password column
export const removeHashPasswordColumn = async (): Promise<void> => {
  try {
    console.log('Step 3: Removing hash_password column...');
    
    // Drop the temporary column
    await pool.query('ALTER TABLE users DROP COLUMN IF EXISTS hash_password');
    
    console.log('✓ Successfully removed hash_password column');
    console.log('🎉 Migration completed! All passwords are now hashed in the password column.');
    
  } catch (error) {
    console.error('Error in Step 3:', error);
    throw error;
  }
};

// Complete migration (all steps)
export const migrateAllPasswordsToHash = async (): Promise<void> => {
  try {
    console.log('🚀 Starting complete password migration...\n');
    
    await addHashPasswordColumn();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await replacePasswordsWithHashed();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await removeHashPasswordColumn();
    
    console.log('\n🎉 MIGRATION COMPLETED SUCCESSFULLY! 🎉');
    console.log('All passwords are now securely hashed with bcrypt.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

// Get migration status
export const getMigrationStatus = async (): Promise<{
  total_users: number;
  hashed_passwords: number;
  plain_passwords: number;
  has_temp_column: boolean;
  migration_completed: boolean;
}> => {
  try {
    // Check if hash_password column exists
    const columnCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'hash_password'
    `);
    
    const hasTempColumn = columnCheck.rows.length > 0;
    
    // Get password status
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN password ~ '^\\$2[aby]\\$\\d{2}\\$.{53}$' THEN 1 END) as hashed_passwords,
        COUNT(*) - COUNT(CASE WHEN password ~ '^\\$2[aby]\\$\\d{2}\\$.{53}$' THEN 1 END) as plain_passwords
      FROM users
    `);
    
    const stats = result.rows[0];
    const total = parseInt(stats.total_users);
    const hashed = parseInt(stats.hashed_passwords);
    const plain = parseInt(stats.plain_passwords);
    
    return {
      total_users: total,
      hashed_passwords: hashed,
      plain_passwords: plain,
      has_temp_column: hasTempColumn,
      migration_completed: (plain === 0 && !hasTempColumn)
    };
  } catch (error) {
    console.error('Error getting migration status:', error);
    throw error;
  }
};

// Get user data by role
export const getUserDataByRole = async (role: string): Promise<User[]> => {
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
};

// Get paginated users
export const getPaginatedUsers = async (options: UserFilters = {}): Promise<{
  users: any[];
  total: number;
}> => {
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
};

// Get total users and growth by role
export const getTotalUsersAndGrowthByRole = async (role: string): Promise<UserStatistics> => {
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
};

// Get active users and growth by role
export const getActiveUsersAndGrowthByRole = async (role: string): Promise<UserStatistics> => {
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
};

// Get new users and growth by role
export const getNewUsersAndGrowthByRole = async (role: string): Promise<UserStatistics> => {
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
};

// Get revenue per user
export const getRevenuePerUser = async (role: string): Promise<RevenuePerUser> => {
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
};

// Get student pendidikan distribution
export const getStudentPendidikanDistribution = async (): Promise<PendidikanDistribution[]> => {
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
};

// Get student growth
export const getStudentGrowth = async (): Promise<StudentGrowth[]> => {
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
};

// Get user details by ID
export const getUserDetailsById = async (userId: number): Promise<UserDetails> => {
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
};

// Search users by role and name
export const searchUsersByRoleAndName = async (role: string, searchTerm: string, limit: number = 10): Promise<SearchUser[]> => {
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
};

// Search users by roles and name
export const searchUsersByRolesAndName = async (roles: string[], searchTerm: string): Promise<SearchUser[]> => {
  const query = `
      SELECT userid, name
      FROM v_dashboard_userdata
      WHERE role IN (${roles.map((_, i) => `${i + 1}`).join(', ')})
      AND name ILIKE ${roles.length + 1}
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
};

// Get student group
export const getStudentGroup = async (): Promise<StudentGroup[]> => {
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
};

// Tambahkan fungsi ini ke models/user.model.ts

// Change password function
export const changePassword = async (userId: number, currentPassword: string, newPassword: string): Promise<User> => {
  try {
    console.log('Changing password for user ID:', userId);

    // Get current user data
    const checkResult = await pool.query(
      `SELECT id, username, password FROM users WHERE id = $1`,
      [userId]
    );

    if (checkResult.rows.length === 0) {
      throw { message: "User not found" };
    }

    const user = checkResult.rows[0];
    const currentStoredPassword = user.password;

    console.log('User found, verifying current password...');

    // Verify current password (support both hashed and plain text)
    let isCurrentPasswordValid = false;
    
    if (isPasswordHashed(currentStoredPassword)) {
      // Current password is hashed, use bcrypt to verify
      isCurrentPasswordValid = await verifyPassword(currentPassword, currentStoredPassword);
      console.log('Verified against hashed password');
    } else {
      // Current password is plain text, compare directly
      isCurrentPasswordValid = currentStoredPassword === currentPassword;
      console.log('Verified against plain password');
    }

    if (!isCurrentPasswordValid) {
      console.log('Current password verification failed');
      throw { message: "Password saat ini tidak sesuai" };
    }

    console.log('Current password verified, hashing new password...');

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    console.log('Updating password in database...');

    // Update password in database
    const updateResult = await pool.query(
      `UPDATE users
       SET password = $1
       WHERE id = $2
       RETURNING id, username, email, role, last_login, create_date`,
      [hashedNewPassword, userId]
    );

    if (updateResult.rows.length === 0) {
      throw { message: "Update failed" };
    }

    console.log('Password updated successfully for user:', updateResult.rows[0].username);
    return updateResult.rows[0];
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
};