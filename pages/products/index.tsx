import { GetServerSideProps, NextPage } from 'next';
import axios from 'axios';
import NavigationBar from '../../components/layout/NavigationBar';
import ProductsClient from './ProductsClient';

/* ------------------------------------------------------------------ */
/*  TYPES                                                             */
/* ------------------------------------------------------------------ */

interface Package {
  product_id: number;
  name:        string;
  price:       number;
  no_promo_price?: number;
  promo_description?: string;
  features:    string[];
}

interface PageProps {
  initialData: Package[];
}

/* ------------------------------------------------------------------ */
/*  PAGE COMPONENT (SSR)                                              */
/* ------------------------------------------------------------------ */

const ProductsPage: NextPage<PageProps> = ({ initialData }) => (
  <div className="tw-h-full" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '125vh'}}>
    <NavigationBar />
    
    <div className="tw-relative tw-overflow-hidden tw-pb-12" style={{minHeight: '125vh'}}>
      <div className="tw-absolute tw-inset-0 tw-bg-gradient-to-br tw-from-violet-600/20 tw-to-purple-800/20"></div>
      <div className="tw-absolute tw-top-10 tw-right-10 tw-w-20 tw-h-20 tw-bg-yellow-300/30 tw-rounded-full tw-blur-xl tw-animate-pulse"></div>
      <div className="tw-absolute tw-bottom-10 tw-left-10 tw-w-32 tw-h-32 tw-bg-pink-300/20 tw-rounded-full tw-blur-2xl tw-animate-pulse tw-delay-1000"></div>
      <div className="tw-absolute tw-top-1/2 tw-left-1/4 tw-w-16 tw-h-16 tw-bg-blue-300/20 tw-rounded-full tw-blur-xl tw-animate-pulse tw-delay-500"></div>
      
      {/* ---------------- CLIENT-SIDE GRID & INTERAKSI -------- */}
      <ProductsClient initialData={initialData} />
    </div>
  </div>
);

export default ProductsPage;

/* ------------------------------------------------------------------ */
/*  SERVER-SIDE DATA FETCH                                            */
/* ------------------------------------------------------------------ */

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

export const getServerSideProps: GetServerSideProps<PageProps> = async () => {
  try {
    const { data } = await axios.get<{ success: boolean; data: Package[] }>(
      `${apiUrl}/products/paket/STAN`
    );

    return {
      props: { initialData: data?.data ?? [] },
    };
  } catch (err) {
    // log agar mudah dilacak di console server
    console.error('SSR fetch /products/paket/STAN failed:', err);
    return {
      props: { initialData: [] },
    };
  }
};