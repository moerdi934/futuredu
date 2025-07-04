// models/productType.model.ts
import pool from '../lib/db';

// Types
export interface ProductTypeFilters {
  group_product?: string;
  series?: string;
  exam_type?: string;
}

export interface ProductType {
  exam_type: string;
  series: string;
  group_product: string;
}

export interface GroupProduct {
  group_product: string;
}

export interface Series {
  series: string;
}

export interface ExamType {
  id: number;
  exam_type: string;
}

export const getProductTypes = async (filters: ProductTypeFilters) => {
  const { group_product, series, exam_type } = filters;

  const baseQuery = `
    SELECT description AS exam_type, series, group_product 
    FROM product_type
    WHERE 1 = 1
  `;

  let whereClauses: string[] = [];
  let values: any[] = [];
  let valueIndex = 1;

  if (group_product) {
    whereClauses.push(`group_product ILIKE $${valueIndex}`);
    values.push(`%${group_product}%`);
    valueIndex++;
  }

  if (series) {
    whereClauses.push(`series ILIKE $${valueIndex}`);
    values.push(`%${series}%`);
    valueIndex++;
  }

  if (exam_type) {
    whereClauses.push(`description ILIKE $${valueIndex}`);
    values.push(`%${exam_type}%`);
    valueIndex++;
  }

  if (whereClauses.length > 0) {
    const whereClause = ' AND ' + whereClauses.join(' AND ');
    return pool.query(baseQuery + whereClause, values);
  }

  return pool.query(baseQuery, values);
};

// Model untuk mencari Group Product
export const getGroupProducts = async (search: string) => {
  const query = `
    SELECT DISTINCT group_product 
    FROM product_type
    WHERE group_product ILIKE $1
    LIMIT 5;
  `;

  const result = await pool.query(query, [`%${search}%`]);
  return result.rows;
};

// Model untuk mencari Series berdasarkan Group Product
export const getSeries = async (groupProduct?: string, search?: string) => {
  let query = `SELECT DISTINCT series FROM product_type WHERE 1 = 1`;
  let values: any[] = [];
  let parameterIndex = 1;
  
  // Check if groupProduct exists and is not 'All'
  if (groupProduct && groupProduct !== 'All') {
    query += ` AND group_product = $${parameterIndex}::VARCHAR`;
    values.push(groupProduct);
    parameterIndex++;
  }
  
  // Check if search exists
  if (search) {
    query += ` AND series ILIKE $${parameterIndex}::TEXT`;
    values.push(`%${search}%`);
  }
  
  query += ` LIMIT 5`;
  
  try {
    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    console.error('Error fetching series:', error);
    throw error;
  }
};

// Model untuk mencari Exam Type berdasarkan Group Product dan Series
export const getExamTypes = async (groupProduct?: string, series?: string, search?: string) => {
  let query = `SELECT DISTINCT id, description AS exam_type FROM product_type WHERE 1 = 1`;
  let values: any[] = [];
  let parameterIndex = 1;

  // Check if groupProduct exists and is not 'All'
  if (groupProduct && groupProduct !== 'All') {
    query += ` AND group_product = $${parameterIndex}::VARCHAR`;
    values.push(groupProduct);
    parameterIndex++;
  }

  // Check if series exists and is not 'All'
  if (series && series !== 'All') {
    query += ` AND series = $${parameterIndex}::VARCHAR`;
    values.push(series);
    parameterIndex++;
  }

  // Check if search exists
  if (search) {
    query += ` AND description ILIKE $${parameterIndex}::TEXT`;
    values.push(`%${search}%`);
  }

  query += ` LIMIT 5`;

  try {
    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    console.error('Error fetching exam types:', error);
    throw error;
  }
};