// controllers/productType.controller.ts
import { NextApiRequest, NextApiResponse } from 'next';
import * as productTypeModel from '../models/productType.model';

// Types
export interface ProductTypeApiRequest extends NextApiRequest {
  query: {
    group_product?: string;
    series?: string;
    exam_type?: string;
    search?: string;
  };
}

export const getFilters = async (req: ProductTypeApiRequest, res: NextApiResponse) => {
  try {
    const filters = {
      group_product: req.query.group_product || '',
      series: req.query.series || '',
      exam_type: req.query.exam_type || ''
    };

    const productTypes = await productTypeModel.getProductTypes(filters);
    res.status(200).json({ productTypes: productTypes.rows });
  } catch (error) {
    console.error('Error fetching filters:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Controller untuk mencari Group Product
export const getGroupProducts = async (req: ProductTypeApiRequest, res: NextApiResponse) => {
  try {
    const search = req.query.search || ''; // Mengambil search query parameter
    const groupProducts = await productTypeModel.getGroupProducts(search);
    res.status(200).json({ groupProducts });
  } catch (error) {
    console.error('Error fetching group products:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Controller untuk mencari Series berdasarkan Group Product
export const getSeries = async (req: ProductTypeApiRequest, res: NextApiResponse) => {
  try {
    const { group_product, search } = req.query;
    const series = await productTypeModel.getSeries(group_product, search);
    res.status(200).json({ series });
  } catch (error) {
    console.error('Error fetching series:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Controller untuk mencari Exam Types berdasarkan Group Product dan Series
export const getExamTypes = async (req: ProductTypeApiRequest, res: NextApiResponse) => {
  try {
    const { group_product, series, search } = req.query;
    const examTypes = await productTypeModel.getExamTypes(group_product, series, search);
    res.status(200).json({ examTypes });
  } catch (error) {
    console.error('Error fetching exam types:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};