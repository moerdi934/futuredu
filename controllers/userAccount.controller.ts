// controllers/userAccount.controller.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { findByUsername } from '../models/user.model';
import * as UserAccount from '../models/userAccount.model';
import { AuthenticatedRequest } from '../lib/middleware/auth';

// Types
interface SaveUserAccountRequest {
  username: string;
  nama_lengkap?: string;
  nama_panggilan?: string;
  jenis_kelamin?: string;
  tanggal_lahir?: string;
  nomor_whatsapp?: number;
  nomor_whatsapp_ortu?: number;
  provinsi?: string;
  kota?: string;
  kecamatan?: string;
  kelurahan?: string;
  pendidikan_sekarang?: string;
  sekolah?: string;
  kelas?: string;
  jurusan?: string;
  tahun_lulus_sma_smk?: string;
  strata?: string;
  universitas?: string;
  program_studi?: string;
  tahun_masuk?: string;
  pendidikan_terakhir?: string;
  tahun_lulus?: string;
}

// Fungsi untuk menyimpan atau memperbarui data akun user
export const saveUserAccount = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const { username, ...accountData }: SaveUserAccountRequest = req.body;
    console.log('Request body:', req.body);

    const userResult = await findByUsername(username);
    
    if (!userResult.success || !userResult.data) {
      return res.status(404).json({
        message: 'User not found.'
      });
    }

    const user_id = userResult.data.user_id;
    const accountDataWithUserId = { ...accountData, user_id };
    console.log('User ID Controller:', user_id);

    const existingAccountResult = await UserAccount.findByUserId(user_id);
    
    if (existingAccountResult.success && existingAccountResult.data) {
      console.log('Updating existing account');
      const updateResult = await UserAccount.update(user_id, accountData);
      
      if (!updateResult.success) {
        return res.status(500).json({
          message: updateResult.error?.message || 'Some error occurred while updating the User Account.'
        });
      }
      
      console.log('Updated account:', updateResult.data);
      res.json(updateResult.data);
    } else {
      console.log('Creating new account');
      console.log(accountDataWithUserId);
      const createResult = await UserAccount.create(accountDataWithUserId);
      
      if (!createResult.success) {
        return res.status(500).json({
          message: createResult.error?.message || 'Some error occurred while creating the User Account.'
        });
      }
      
      console.log('Created account:', createResult.data);
      res.json(createResult.data);
    }
  } catch (error) {
    console.error('Error in saveUserAccount:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Fungsi untuk mengambil data user account berdasarkan user_id
export const getUserAccount = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const user_id = req.query.user_id as string;
    console.log('Fetching account for user_id:', user_id);

    const result = await UserAccount.findByUserId(user_id);
    
    if (!result.success) {
      if (result.kind === "not_found") {
        return res.status(404).json({
          message: `Not found User Account with user_id ${user_id}.`
        });
      } else {
        return res.status(500).json({
          message: "Error retrieving User Account with user_id " + user_id
        });
      }
    }
    
    res.json(result.data);
  } catch (error) {
    console.error('Error in getUserAccount:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Fungsi untuk mengambil semua data user account
export const getAllUserAccounts = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Note: This function was referenced in the original controller but not implemented in the model
    // You'll need to implement getAll function in the model if needed
    res.status(501).json({
      message: "Function not implemented yet. Please implement getAll in userAccount.model.ts"
    });
  } catch (error) {
    console.error('Error in getAllUserAccounts:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Fungsi untuk menghapus data user account berdasarkan user_id
export const deleteUserAccount = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const user_id = req.query.user_id as string;
    console.log('Deleting account for user_id:', user_id);

    // Note: This function was referenced in the original controller but not implemented in the model
    // You'll need to implement delete function in the model if needed
    res.status(501).json({
      message: "Function not implemented yet. Please implement delete in userAccount.model.ts"
    });
  } catch (error) {
    console.error('Error in deleteUserAccount:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

export const getFilterUser = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const role = req.query.role as string;
    const search = (req.query.search as string) || '';
    
    const users = await UserAccount.getFilterUser(role, search);
    res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching filter users:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};