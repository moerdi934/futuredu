// controllers/cart.controller.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from '../lib/middleware/auth';
import * as Cart from '../models/cart.model';

// Types
export interface CartResponse {
  success: boolean;
  data?: any;
  message?: string;
}

export interface AddToCartRequest {
  productId: number;
}

export interface UpdateCartRequest {
  productId: number;
  action: 'increase' | 'decrease';
}

// Controller Functions
export const getCart = async (req: AuthenticatedRequest, res: NextApiResponse<CartResponse>) => {
  try {
    const userId = req.user!.id;
    const result = await Cart.getCartWithProducts(userId);
    res.json({ success: true, data: result });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addToCart = async (req: AuthenticatedRequest, res: NextApiResponse<CartResponse>) => {
  try {
    const userId = req.user!.id;
    const { productId }: AddToCartRequest = req.body;
    if (!productId) return res.status(400).json({ success: false, message: 'Product ID required' });

    const data = await Cart.addItem(userId, productId);
    res.json({ success: true, message: 'Added / increased quantity', data });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateCartQuantity = async (req: AuthenticatedRequest, res: NextApiResponse<CartResponse>) => {
  try {
    const userId = req.user!.id;
    const { productId, action }: UpdateCartRequest = req.body;
    if (!productId || !action) return res.status(400).json({ success: false, message: 'productId & action required' });

    let data;
    if (action === 'increase')       data = await Cart.addItem(userId, productId);
    else if (action === 'decrease')  data = await Cart.decreaseItem(userId, productId);
    else return res.status(400).json({ success: false, message: 'action must be "increase" or "decrease"' });

    res.json({ success: true, message: 'Cart updated', data });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ success: false, message: err.message });
  }
};

export const removeFromCart = async (req: AuthenticatedRequest, res: NextApiResponse<CartResponse>) => {
  try {
    const userId = req.user!.id;
    const { productId } = req.query;
    const data = await Cart.removeItem(userId, parseInt(productId as string));
    res.json({ success: true, message: 'Item removed', data });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ success: false, message: err.message });
  }
};

export const clearCart = async (req: AuthenticatedRequest, res: NextApiResponse<CartResponse>) => {
  try {
    const userId = req.user!.id;
    const data = await Cart.clearCart(userId);
    res.json({ success: true, message: 'Cart cleared', data });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ success: false, message: err.message });
  }
};