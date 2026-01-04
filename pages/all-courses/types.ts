// pages/all-courses/types.ts - Shared types for all-courses page

export interface LiveCourse {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  learning_point?: string[];
  course_string?: string;
  product_id: number;
  product_name: string;
  price: number;
  is_promo: boolean;
  no_promo_price?: number;
  promo_description?: string;
  stock: number;
  features?: string[];
  classtype: string;
  creator_name?: string;
  create_date: string;
  coin_price?: number;
  coin_type?: 'course';
}

export interface LiveClass {
  id: number;
  name: string;
  description: string;
  teacher_name: string;
  teacher_id: number;
  student_list_ids: number[];
  student_list_names: string[];
  start_date: string;
  end_date: string;
  class_mode: string;
  meeting_url?: string;
  course_name: string;
  course_id: number;
  product_id: number;
  product_name: string;
  price: number;
  is_promo: boolean;
  no_promo_price?: number;
  promo_description?: string;
  stock: number;
  max_students: number;
  current_students: number;
  features?: string[];
  classtype: string;
  effective_start: string;
  effective_end?: string;
  creator_name?: string;
  create_date: string;
  coin_price?: number;
  coin_type?: 'class';
}

export interface EnrolledClass {
  id: number;
  name: string;
  description: string;
  teacher_name: string;
  teacher_id: string | number;
  course_name: string;
  course_id: string | number;
  start_date: string;
  end_date: string;
  real_start_datetime?: string;
  real_end_datetime?: string;
  class_mode: string;
  meeting_url?: string;
  status: 'Not Start' | 'Started' | 'Finished' | 'Need Approve' | 'Rejected' | 'Deleted';
  create_date: string;
}

export interface UserCourseProgress {
  id: number;
  title: string;
  description: string;
  imageurl: string | null;
  type: number;
  learning_point: string[] | null;
  course_string: string;
  user_id: string;
  finished_quiz_topics: number;
  finished_materials: number;
  quiz: number;
  material: number;
  quiz_progress_percentage: number;
  material_progress_percentage: number;
  overall_progress_percentage: number;
}

export interface CoinBalance {
  coin_type: 'class' | 'course' | 'tryout';
  total_balance: number;
  expiring_soon: number;
}

export interface QuoteType {
  text: string;
  author: string;
}
