// controllers/user.controller.ts
import { NextApiRequest, NextApiResponse } from 'next';
import UserModel, { User, UserFilters } from '../models/user.model';
import { AuthenticatedRequest } from '../lib/middleware/auth';
import jwt from 'jsonwebtoken';
import axios from 'axios';

const secretKey = process.env.JWT_SECRET_KEY!;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET!;
const refreshTokens: string[] = [];

// Types for request bodies
interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  captchaToken?: string;
  fullName?: string;
  role?: string;
}

interface LoginRequest {
  username: string;
  password: string;
}

interface UpdateUserRequest {
  username: string;
  email: string;
  oldPassword: string;
  newPassword: string;
}

interface SearchRequest {
  searchTerm: string;
  role?: string;
  roles?: string[];
  limit?: number;
}

// User Controller Class
class UserController {
  // Create user with CAPTCHA
  static async create(req: NextApiRequest, res: NextApiResponse) {
    try {
      if (!req.body) {
        return res.status(400).json({
          message: "Content cannot be empty!"
        });
      }

      const { username, email, password, captchaToken }: CreateUserRequest = req.body;

      // Verify CAPTCHA
      try {
        const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`);
        const { success } = response.data;

        if (!success) {
          return res.status(400).json({
            message: "CAPTCHA verification failed. Please try again."
          });
        }
      } catch (error) {
        console.error("Error verifying CAPTCHA:", error);
        return res.status(500).json({
          message: "Error verifying CAPTCHA."
        });
      }

      // Create user
      const user: User = { username, email, password, role: 'student' };
      const data = await UserModel.create(user);
      res.status(201).json(data);
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Some error occurred while creating the User."
      });
    }
  }

  // Get user status
  static async getStatus(req: AuthenticatedRequest, res: NextApiResponse) {
    try {
      const userId = req.user!.id;
      const cartCount = await UserModel.getCartCount(parseInt(userId));
      const unpaidCount = await UserModel.getUnpaidCount(parseInt(userId));
      return res.json({ success: true, cartCount, unpaidCount });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Create user without CAPTCHA
  static async createNoCaptcha(req: NextApiRequest, res: NextApiResponse) {
    try {
      if (!req.body) {
        return res.status(400).json({
          message: "Content cannot be empty!"
        });
      }

      const { username, fullName, email, password, role }: CreateUserRequest = req.body;

      // Validate input data
      if (!username || !email || !password || !fullName) {
        return res.status(400).json({
          message: "Username, full name, email, and password are required!"
        });
      }

      // Default role if not provided
      const userRole = role || 'student';

      // Create user
      const user: User = { username, fullName, email, password, role: userRole };
      const data = await UserModel.create(user);
      res.status(201).json(data);
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Some error occurred while creating the User."
      });
    }
  }

  // Update user
  static async updateUser(req: NextApiRequest, res: NextApiResponse) {
    try {
      console.log('start update user');
      const userId = req.query.id as string;
      const { username, email, oldPassword, newPassword }: UpdateUserRequest = req.body;
      console.log(req.body);
      console.log(req.query.id);

      if (!username || !email || !oldPassword) {
        return res.status(400).json({ message: 'Username, email, and old password are required.' });
      }

      const data = await UserModel.updateUser(parseInt(userId), { username, email, oldPassword, newPassword });
      res.status(200).json({ message: 'User updated successfully.', data });
    } catch (error: any) {
      if (error.kind === 'not_found') {
        return res.status(404).json({ message: 'User not found.' });
      }
      if (error.message === 'Old password does not match') {
        return res.status(400).json({ message: 'Invalid old password.' });
      }
      return res.status(500).json({ message: 'Error updating user.' });
    }
  }

  // Delete user by ID
  static async deleteUser(req: NextApiRequest, res: NextApiResponse) {
    try {
      const userId = req.query.id as string;
      await UserModel.deleteUser(parseInt(userId));
      res.status(200).json({
        message: `User with id ${userId} was deleted successfully.`
      });
    } catch (error: any) {
      if (error.kind === "not_found") {
        return res.status(404).json({
          message: `User not found with id ${userId}`
        });
      }
      return res.status(500).json({
        message: `Could not delete user with id ${userId}`
      });
    }
  }

  // Login user
  static async login(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { username, password }: LoginRequest = req.body;

      const user = await UserModel.findByUsername(username);

      if (!user) {
        return res.status(404).json({
          message: "User not found."
        });
      }

      // Check if password matches
      if (user.password !== password) {
        return res.status(401).json({
          message: "Invalid password."
        });
      }

      await UserModel.updateLastLogin(username);

      // Create JWT token if login successful
      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, secretKey, { expiresIn: '6h' });
      const refreshToken = jwt.sign({ id: user.id, username: user.username, role: user.role }, refreshTokenSecret, { expiresIn: '30d' });

      refreshTokens.push(refreshToken);

      // Send token in cookie
      res.setHeader('Set-Cookie', [
        `authToken=${token}; HttpOnly; Secure=${process.env.NODE_ENV === 'production'}; SameSite=Strict; Max-Age=${6 * 60 * 60}; Path=/`,
        `refreshToken=${refreshToken}; HttpOnly; Secure=${process.env.NODE_ENV === 'production'}; SameSite=Strict; Max-Age=${30 * 24 * 60 * 60}; Path=/`
      ]);

      res.json({
        message: "Login successful!",
        username: user.username,
        role: user.role,
        token
      });
    } catch (error: any) {
      console.error("Error during login:", error);
      res.status(500).json({
        message: "An error occurred during login."
      });
    }
  }

  // Refresh token
  static async refreshToken(req: NextApiRequest, res: NextApiResponse) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken || !refreshTokens.includes(refreshToken)) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const decoded = jwt.verify(refreshToken, refreshTokenSecret) as any;
      const newToken = jwt.sign({ id: decoded.id, username: decoded.username, role: decoded.role }, secretKey, { expiresIn: '6h' });

      res.setHeader('Set-Cookie', `authToken=${newToken}; HttpOnly; Secure=${process.env.NODE_ENV === 'production'}; SameSite=Strict; Max-Age=${6 * 60 * 60}; Path=/`);

      res.json({
        token: newToken
      });
    } catch (error) {
      return res.status(403).json({ message: 'Forbidden' });
    }
  }

  // Logout user
  static async logout(req: NextApiRequest, res: NextApiResponse) {
    try {
      const refreshToken = req.cookies.refreshToken;
      const index = refreshTokens.indexOf(refreshToken);
      if (index > -1) {
        refreshTokens.splice(index, 1);
      }

      res.setHeader('Set-Cookie', [
        `authToken=; HttpOnly; Secure=${process.env.NODE_ENV === 'production'}; SameSite=Strict; Max-Age=0; Path=/`,
        `refreshToken=; HttpOnly; Secure=${process.env.NODE_ENV === 'production'}; SameSite=Strict; Max-Age=0; Path=/`
      ]);

      res.json({ message: "Logout successful!" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Find user by username
  static async findByUsername(req: NextApiRequest, res: NextApiResponse) {
    try {
      const username = req.query.username as string;
      console.log('Finding user by username:', username);

      const user = await UserModel.findByUsername(username);
      console.log('User found:', user);
      res.json({ user_id: (user as any).user_id, id: user.id });
    } catch (error: any) {
      console.error('Error finding user by username:', error);
      if (error.kind === 'not_found') {
        return res.status(404).json({
          message: 'User not found.'
        });
      }
      return res.status(500).json({
        message: error.message || 'Some error occurred while finding the User.'
      });
    }
  }

  // Find user by ID
  static async findById(req: NextApiRequest, res: NextApiResponse) {
    try {
      const id = req.query.id as string;
      console.log('Finding user by id:', id);

      const user = await UserModel.findById(parseInt(id));
      console.log('User found:', user);
      res.json({
        id: user.id,
        username: user.username,
        email: user.email
      });
    } catch (error: any) {
      console.error('Error finding user by id:', error);
      if (error.kind === 'not_found') {
        return res.status(404).json({
          message: 'User not found.'
        });
      }
      return res.status(500).json({
        message: error.message || 'Some error occurred while finding the User.'
      });
    }
  }

  // Get user data by role
  static async getUserDataByRole(req: NextApiRequest, res: NextApiResponse) {
    try {
      const role = req.query.role as string;
      console.log('Finding users by role:', role);

      const users = await UserModel.getUserDataByRole(role);
      console.log('Users found:', users);
      res.json(users);
    } catch (error: any) {
      console.error('Error finding users by role:', error);
      if (error.kind === 'not_found') {
        return res.status(404).json({
          message: 'No users found for this role.'
        });
      }
      return res.status(500).json({
        message: error.message || 'Some error occurred while finding the Users.'
      });
    }
  }

  // Search users by role and name
  static async searchUsersByRoleAndName(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { searchTerm, role, limit = 10 }: SearchRequest = req.body;
      console.log(req.body);

      // Validate input
      if (!searchTerm || typeof searchTerm !== 'string') {
        return res.status(400).json({ message: "searchTerm diperlukan dan harus berupa string." });
      }

      if (!role || typeof role !== 'string') {
        return res.status(400).json({ message: "Role diperlukan dan harus berupa string." });
      }

      // Validate limit
      const parsedLimit = parseInt(limit.toString());
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        return res.status(400).json({ message: "Limit harus berupa angka positif." });
      }

      const users = await UserModel.searchUsersByRoleAndName(role, searchTerm, parsedLimit);
      res.status(200).json({ users });
    } catch (error: any) {
      console.error('Error searching users:', error);
      res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
  }

  // Search users by multiple roles and name
  static async searchUsersByMultipleRolesAndName(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { searchTerm, roles }: SearchRequest = req.body;

      if (!searchTerm || typeof searchTerm !== 'string') {
        return res.status(400).json({ message: "searchTerm diperlukan dan harus berupa string." });
      }

      if (!Array.isArray(roles) || roles.length === 0) {
        return res.status(400).json({ message: "Roles harus berupa array dengan setidaknya satu item." });
      }

      const parsedRoles = JSON.parse(JSON.stringify(roles));
      const users = await UserModel.searchUsersByRolesAndName(parsedRoles, searchTerm);
      res.status(200).json({ users });
    } catch (error: any) {
      console.error('Error searching users:', error);
      res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
  }

  // Get paginated users
  static async getPaginatedUsers(req: NextApiRequest, res: NextApiResponse) {
    try {
      const params: UserFilters = {
        sortField: (req.query.sortField as string) || 'id',
        sortOrder: (req.query.sortOrder as string) || 'asc',
        search: (req.query.search as string) || '',
        page: parseInt((req.query.page as string) || '1'),
        limit: parseInt((req.query.limit as string) || '10'),
        role: (req.query.role as string) || '',
        education: (req.query.education as string) || '',
        city: (req.query.city as string) || '',
        province: (req.query.province as string) || '',
        status: (req.query.status as string) || ''
      };

      const { users, total } = await UserModel.getPaginatedUsers(params);

      res.json({
        data: users,
        total,
        page: parseInt(params.page?.toString() || '1'),
        totalPages: Math.ceil(total / (params.limit || 10))
      });
    } catch (error: any) {
      console.error('Get Paginated Users Error:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  }

  // Get total users and growth by role
  static async getTotalUsersAndGrowthByRole(req: NextApiRequest, res: NextApiResponse) {
    try {
      const role = req.query.role as string;

      if (!role) {
        return res.status(400).json({
          message: 'Role parameter is required.'
        });
      }

      const data = await UserModel.getTotalUsersAndGrowthByRole(role);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({
        message: error.message || 'Some error occurred while fetching total users and growth.'
      });
    }
  }

  // Get active users and growth by role
  static async getActiveUsersAndGrowthByRole(req: NextApiRequest, res: NextApiResponse) {
    try {
      const role = req.query.role as string;

      if (!role) {
        return res.status(400).json({ message: 'Role parameter is required' });
      }

      const data = await UserModel.getActiveUsersAndGrowthByRole(role);
      res.json(data);
    } catch (error: any) {
      console.error('Error fetching active users and growth:', error);
      return res.status(500).json({ message: 'Error retrieving active users and growth' });
    }
  }

  // Get new users and growth
  static async getNewUsersAndGrowth(req: NextApiRequest, res: NextApiResponse) {
    try {
      const role = req.query.role as string;

      if (!role) {
        return res.status(400).json({ message: "Role parameter is required." });
      }

      const data = await UserModel.getNewUsersAndGrowthByRole(role);
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching new users and growth:", error);
      return res.status(500).json({
        message: "An error occurred while fetching new users and growth."
      });
    }
  }

  // Get revenue per user
  static async getRevenuePerUser(req: NextApiRequest, res: NextApiResponse) {
    try {
      const role = req.query.role as string;

      if (!role) {
        return res.status(400).json({ message: "Role parameter is required." });
      }

      const data = await UserModel.getRevenuePerUser(role);
      res.json(data);
    } catch (error: any) {
      return res.status(500).json({ message: "Error fetching revenue per user." });
    }
  }

  // Get student pendidikan distribution
  static async getStudentPendidikanDistribution(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await UserModel.getStudentPendidikanDistribution();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Some error occurred while retrieving pendidikan distribution."
      });
    }
  }

  // Get student growth
  static async getStudentGrowth(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await UserModel.getStudentGrowth();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({
        message: "Error retrieving student growth data.",
      });
    }
  }

  // Get user details
  static async getUserDetails(req: NextApiRequest, res: NextApiResponse) {
    try {
      const userId = req.query.userId as string;
      const data = await UserModel.getUserDetailsById(parseInt(userId));
      res.status(200).json(data);
    } catch (error: any) {
      if (error.kind === 'not_found') {
        return res.status(404).json({
          message: "User not found."
        });
      }
      res.status(500).json({
        message: "Error retrieving user details.",
      });
    }
  }

  // Get student group
  static async getStudentGroup(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await UserModel.getStudentGroup();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Error fetching student groups."
      });
    }
  }
}

export default UserController;  