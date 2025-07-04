// models/userAccount.model.ts
import pool from '../lib/db';

// Types
export interface UserAccountData {
  user_id: string;
  nama_lengkap?: string | null;
  nama_panggilan?: string | null;
  jenis_kelamin?: string | null;
  tanggal_lahir?: string | null;
  nomor_whatsapp?: number | null;
  nomor_whatsapp_ortu?: number | null;
  provinsi?: string | null;
  kota?: string | null;
  kecamatan?: string | null;
  kelurahan?: string | null;
  pendidikan_sekarang?: string | null;
  sekolah?: string | null;
  kelas?: string | null;
  jurusan?: string | null;
  tahun_lulus_sma_smk?: string | null;
  strata?: string | null;
  universitas?: string | null;
  program_studi?: string | null;
  tahun_masuk?: string | null;
  pendidikan_terakhir?: string | null;
  tahun_lulus?: string | null;
}

export interface UserAccountCreateData extends Omit<UserAccountData, 'user_id'> {
  user_id: string;
}

export interface UserAccountUpdateData extends Omit<UserAccountData, 'user_id'> {}

export interface FilterUser {
  userid: string;
  name: string;
}

export interface DatabaseResult<T> {
  success: boolean;
  data?: T;
  error?: any;
  kind?: string;
}

// Utility functions
const convertEmptyToNull = (value: string | undefined | null): string | null => {
  return value === '' || value === ' ' || value === undefined ? null : value;
};

const formatDate = (date: string): string => {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) 
    month = '0' + month;
  if (day.length < 2) 
    day = '0' + day;

  return [year, month, day].join('-');
};

// User Account Model Functions
export const findByUserId = async (user_id: string): Promise<DatabaseResult<UserAccountData>> => {
  try {
    const result = await pool.query(
      "SELECT * FROM user_account WHERE user_id = $1",
      [user_id]
    );

    if (result.rows.length) {
      console.log("found user account: ", result.rows[0]);
      return {
        success: true,
        data: result.rows[0]
      };
    }

    return {
      success: false,
      kind: "not_found"
    };
  } catch (err) {
    console.log("error: ", err);
    return {
      success: false,
      error: err
    };
  }
};

export const create = async (newAccount: UserAccountCreateData): Promise<DatabaseResult<UserAccountData>> => {
  try {
    const tanggal_lahir = newAccount.tanggal_lahir ? formatDate(newAccount.tanggal_lahir) : null;
    const nomor_whatsapp = newAccount.nomor_whatsapp ? parseInt(newAccount.nomor_whatsapp.toString()) : null;
    const nomor_whatsapp_ortu = newAccount.nomor_whatsapp_ortu ? parseInt(newAccount.nomor_whatsapp_ortu.toString()) : null;

    const result = await pool.query(
      "INSERT INTO user_account (user_id, nama_lengkap, nama_panggilan, jenis_kelamin, tanggal_lahir, nomor_whatsapp, nomor_whatsapp_ortu, provinsi, kota, kecamatan, kelurahan, pendidikan_sekarang, sekolah, kelas, jurusan, tahun_lulus_sma_smk, strata, universitas, program_studi, tahun_masuk, pendidikan_terakhir, tahun_lulus) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22) RETURNING *",
      [
        newAccount.user_id,
        convertEmptyToNull(newAccount.nama_lengkap),
        convertEmptyToNull(newAccount.nama_panggilan),
        convertEmptyToNull(newAccount.jenis_kelamin),
        tanggal_lahir,
        nomor_whatsapp,
        nomor_whatsapp_ortu,
        convertEmptyToNull(newAccount.provinsi),
        convertEmptyToNull(newAccount.kota),
        convertEmptyToNull(newAccount.kecamatan),
        convertEmptyToNull(newAccount.kelurahan),
        convertEmptyToNull(newAccount.pendidikan_sekarang),
        convertEmptyToNull(newAccount.sekolah),
        convertEmptyToNull(newAccount.kelas),
        convertEmptyToNull(newAccount.jurusan),
        convertEmptyToNull(newAccount.tahun_lulus_sma_smk),
        convertEmptyToNull(newAccount.strata),
        convertEmptyToNull(newAccount.universitas),
        convertEmptyToNull(newAccount.program_studi),
        convertEmptyToNull(newAccount.tahun_masuk),
        convertEmptyToNull(newAccount.pendidikan_terakhir),
        convertEmptyToNull(newAccount.tahun_lulus)
      ]
    );

    console.log("created user account: ", result.rows[0]);
    return {
      success: true,
      data: result.rows[0]
    };
  } catch (err) {
    console.log("error: ", err);
    return {
      success: false,
      error: err
    };
  }
};

export const update = async (user_id: string, accountData: UserAccountUpdateData): Promise<DatabaseResult<UserAccountData>> => {
  try {
    const tanggal_lahir = accountData.tanggal_lahir ? formatDate(accountData.tanggal_lahir) : null;
    const nomor_whatsapp = accountData.nomor_whatsapp ? parseInt(accountData.nomor_whatsapp.toString()) : null;
    const nomor_whatsapp_ortu = accountData.nomor_whatsapp_ortu ? parseInt(accountData.nomor_whatsapp_ortu.toString()) : null;

    const result = await pool.query(
      "UPDATE user_account SET nama_lengkap = $1, nama_panggilan = $2, jenis_kelamin = $3, tanggal_lahir = $4, nomor_whatsapp = $5, nomor_whatsapp_ortu = $6, provinsi = $7, kota = $8, kecamatan = $9, kelurahan = $10, pendidikan_sekarang = $11, sekolah = $12, kelas = $13, jurusan = $14, tahun_lulus_sma_smk = $15, strata = $16, universitas = $17, program_studi = $18, tahun_masuk = $19, pendidikan_terakhir = $20, tahun_lulus = $21 WHERE user_id = $22 RETURNING *",
      [
        convertEmptyToNull(accountData.nama_lengkap),
        convertEmptyToNull(accountData.nama_panggilan),
        convertEmptyToNull(accountData.jenis_kelamin),
        tanggal_lahir,
        nomor_whatsapp,
        nomor_whatsapp_ortu,
        convertEmptyToNull(accountData.provinsi),
        convertEmptyToNull(accountData.kota),
        convertEmptyToNull(accountData.kecamatan),
        convertEmptyToNull(accountData.kelurahan),
        convertEmptyToNull(accountData.pendidikan_sekarang),
        convertEmptyToNull(accountData.sekolah),
        convertEmptyToNull(accountData.kelas),
        convertEmptyToNull(accountData.jurusan),
        convertEmptyToNull(accountData.tahun_lulus_sma_smk),
        convertEmptyToNull(accountData.strata),
        convertEmptyToNull(accountData.universitas),
        convertEmptyToNull(accountData.program_studi),
        convertEmptyToNull(accountData.tahun_masuk),
        convertEmptyToNull(accountData.pendidikan_terakhir),
        convertEmptyToNull(accountData.tahun_lulus),
        user_id
      ]
    );

    if (result.rowCount === 0) {
      return {
        success: false,
        kind: "not_found"
      };
    }

    console.log("updated user account: ", result.rows[0]);
    return {
      success: true,
      data: result.rows[0]
    };
  } catch (err) {
    console.log("error: ", err);
    return {
      success: false,
      error: err
    };
  }
};

export const getFilterUser = async (role: string, search: string): Promise<FilterUser[]> => {
  const query = `
    SELECT DISTINCT userid, name 
    FROM v_dashboard_userdata
    WHERE name ILIKE $2 AND role = $1
    LIMIT 5;
  `;

  console.log(search);
  const result = await pool.query(query, [role, `%${search}%`]);
  return result.rows;
};