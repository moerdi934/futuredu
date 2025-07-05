// controllers/user.controller.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { 
  createUser,
  getCartCount,
  getUnpaidCount,
  updateUser,
  deleteUser as deleteUserById,
  findByUsername,
  findById,
  updateLastLogin,
  getUserDataByRole,
  searchUsersByRoleAndName,
  searchUsersByRolesAndName,
  getPaginatedUsers,
  getTotalUsersAndGrowthByRole,
  getActiveUsersAndGrowthByRole,
  getNewUsersAndGrowthByRole,
  getRevenuePerUser,
  getStudentPendidikanDistribution,
  getStudentGrowth,
  getUserDetailsById,
  getStudentGroup,
  User,
  UserFilters
} from '../models/user.model';
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

// Create user with CAPTCHA
export const create = async (req: NextApiRequest, res: NextApiResponse) => {
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
    const data = await createUser(user);
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Some error occurred while creating the User."
    });
  }
};

// Get user status
export const getStatus = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const userId = req.user!.id;
    const cartCount = await getCartCount(parseInt(userId));
    const unpaidCount = await getUnpaidCount(parseInt(userId));
    return res.json({ success: true, cartCount, unpaidCount });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create user without CAPTCHA
export const createNoCaptcha = async (req: NextApiRequest, res: NextApiResponse) => {
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
    const data = await createUser(user);
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Some error occurred while creating the User."
    });
  }
};

// Update user
export const updateUserController = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    console.log('start update user');
    const userId = req.query.id as string;
    const { username, email, oldPassword, newPassword }: UpdateUserRequest = req.body;
    console.log(req.body);
    console.log(req.query.id);

    if (!username || !email || !oldPassword) {
      return res.status(400).json({ message: 'Username, email, and old password are required.' });
    }

    const data = await updateUser(parseInt(userId), { username, email, oldPassword, newPassword });
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
};

// Delete user by ID
export const deleteUserController = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const userId = req.query.id as string;
    await deleteUserById(parseInt(userId));
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
};

// Login user
export const login = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { username, password }: LoginRequest = req.body;

    const user = await findByUsername(username);

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

    await updateLastLogin(username);

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
};

// Refresh token
export const refreshToken = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const refreshTokenFromCookie = req.cookies.refreshToken;

    if (!refreshTokenFromCookie || !refreshTokens.includes(refreshTokenFromCookie)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const decoded = jwt.verify(refreshTokenFromCookie, refreshTokenSecret) as any;
    const newToken = jwt.sign({ id: decoded.id, username: decoded.username, role: decoded.role }, secretKey, { expiresIn: '6h' });

    res.setHeader('Set-Cookie', `authToken=${newToken}; HttpOnly; Secure=${process.env.NODE_ENV === 'production'}; SameSite=Strict; Max-Age=${6 * 60 * 60}; Path=/`);

    res.json({
      token: newToken
    });
  } catch (error) {
    return res.status(403).json({ message: 'Forbidden' });
  }
};

// Logout user
export const logout = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const refreshTokenFromCookie = req.cookies.refreshToken;
    const index = refreshTokens.indexOf(refreshTokenFromCookie);
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
};

// Find user by username
export const findUserByUsername = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const username = req.query.username as string;
    console.log('Finding user by username:', username);

    const user = await findByUsername(username);
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
};

// Find user by ID
export const findUserById = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const id = req.query.id as string;
    console.log('Finding user by id:', id);

    const user = await findById(parseInt(id));
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
};

// Get user data by role
export const getUsersByRole = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const role = req.query.role as string;
    console.log('Finding users by role:', role);

    const users = await getUserDataByRole(role);
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
};

// Search users by role and name
export const searchUsersByRoleAndNameController = async (req: NextApiRequest, res: NextApiResponse) => {
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

    const users = await searchUsersByRoleAndName(role, searchTerm, parsedLimit);
    res.status(200).json({ users });
  } catch (error: any) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

// Search users by multiple roles and name
export const searchUsersByMultipleRolesAndNameController = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { searchTerm, roles }: SearchRequest = req.body;

    if (!searchTerm || typeof searchTerm !== 'string') {
      return res.status(400).json({ message: "searchTerm diperlukan dan harus berupa string." });
    }

    if (!Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({ message: "Roles harus berupa array dengan setidaknya satu item." });
    }

    const parsedRoles = JSON.parse(JSON.stringify(roles));
    const users = await searchUsersByRolesAndName(parsedRoles, searchTerm);
    res.status(200).json({ users });
  } catch (error: any) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

// Get paginated users
export const getPaginatedUsersController = async (req: NextApiRequest, res: NextApiResponse) => {
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

    const { users, total } = await getPaginatedUsers(params);

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
};

// Get total users and growth by role
export const getTotalUsersAndGrowthByRoleController = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const role = req.query.role as string;

    if (!role) {
      return res.status(400).json({
        message: 'Role parameter is required.'
      });
    }

    const data = await getTotalUsersAndGrowthByRole(role);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({
      message: error.message || 'Some error occurred while fetching total users and growth.'
    });
  }
};

// Get active users and growth by role
export const getActiveUsersAndGrowthByRoleController = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const role = req.query.role as string;

    if (!role) {
      return res.status(400).json({ message: 'Role parameter is required' });
    }

    const data = await getActiveUsersAndGrowthByRole(role);
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching active users and growth:', error);
    return res.status(500).json({ message: 'Error retrieving active users and growth' });
  }
};

// Get new users and growth
export const getNewUsersAndGrowthController = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const role = req.query.role as string;

    if (!role) {
      return res.status(400).json({ message: "Role parameter is required." });
    }

    const data = await getNewUsersAndGrowthByRole(role);
    res.json(data);
  } catch (error: any) {
    console.error("Error fetching new users and growth:", error);
    return res.status(500).json({
      message: "An error occurred while fetching new users and growth."
    });
  }
};

// Get revenue per user
export const getRevenuePerUserController = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const role = req.query.role as string;

    if (!role) {
      return res.status(400).json({ message: "Role parameter is required." });
    }

    const data = await getRevenuePerUser(role);
    res.json(data);
  } catch (error: any) {
    return res.status(500).json({ message: "Error fetching revenue per user." });
  }
};

// Get student pendidikan distribution
export const getStudentPendidikanDistributionController = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const data = await getStudentPendidikanDistribution();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Some error occurred while retrieving pendidikan distribution."
    });
  }
};

// Get student growth
export const getStudentGrowthController = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const data = await getStudentGrowth();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({
      message: "Error retrieving student growth data.",
    });
  }
};

// Get user details
export const getUserDetailsController = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const userId = req.query.userId as string;
    const data = await getUserDetailsById(parseInt(userId));
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
};

// Get student group
export const getStudentGroupController = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const data = await getStudentGroup();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Error fetching student groups."
    });
  }
};

/* controllers/user.controller.ts – di paling bawah */
const UserController = {
  // auth & session
  login,
  refreshToken,
  logout,

  // register
  create,
  createNoCaptcha,

  // profile & status
  getStatus,
  updateUserController,
  deleteUserController,

  // lookup
  findUserByUsername,
  findUserById,
  getUsersByRole,
  searchUsersByRoleAndNameController,
  searchUsersByMultipleRolesAndNameController,

  // list / dashboard
  getPaginatedUsersController,
  getTotalUsersAndGrowthByRoleController,
  getActiveUsersAndGrowthByRoleController,
  getNewUsersAndGrowthController,
  getRevenuePerUserController,
  getStudentPendidikanDistributionController,
  getStudentGrowthController,
  getUserDetailsController,
  getStudentGroupController,
};

export default UserController;          // ⬅⬅⬅