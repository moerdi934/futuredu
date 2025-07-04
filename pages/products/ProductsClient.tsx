import { useEffect, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
} from 'react-bootstrap';
import axios from 'axios';
import {
  BookOpen,
  Trophy,
  Target,
  Star,
  Zap,
  Users,
  Award,
  CheckCircle,
  Gift,
  Clock,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import BeliPaketModal from './BeliPaketModal';

/* ------------------------------------------------------------------ */
/*  TYPES & CONST                                                     */
/* ------------------------------------------------------------------ */

type Category = 'STAN' | 'STIS' | 'UTBK';

interface Package {
  product_id: number;
  name: string;
  price: number;
  no_promo_price?: number;
  promo_description?: string;
  features?: string[];
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

/* ------------------------------------------------------------------ */
/*  STYLES                                                            */
/* ------------------------------------------------------------------ */

const priceBoxStyles = {
  container: {
    position: 'relative' as const,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
  },
  containerHover: {
    transform: 'translateY(-5px) scale(1.02)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
  },
  animatedBorder: {
    position: 'absolute' as const,
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57)',
    backgroundSize: '300% 300%',
    borderRadius: '20px',
    animation: 'gradient 3s ease infinite',
    opacity: '0.8',
    zIndex: -1,
  },
  promoBadge: {
    position: 'absolute' as const,
    top: '-10px',
    right: '-10px',
    background: 'linear-gradient(135deg, #ff6b6b, #feca57)',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)',
    transform: 'rotate(15deg)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 10,
  },
  promoBadgeHover: {
    transform: 'rotate(15deg) scale(1.1)',
  },
  priceDisplay: {
    textAlign: 'center' as const,
    position: 'relative' as const,
    zIndex: 5,
  },
  priceText: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: 'white',
    margin: '0',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  priceTextHover: {
    transform: 'scale(1.05)',
  },
  originalPrice: {
    fontSize: '16px',
    color: 'rgba(255, 255, 255, 0.7)',
    margin: '8px 0 0 0',
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
  },
};

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                         */
/* ------------------------------------------------------------------ */

interface Props {
  initialData: Package[];
}

const ProductsClient = ({ initialData }: Props) => {
  /* global auth */
  const { id } = useAuth();

  /* local state */
  const [category, setCategory] = useState<Category>('STAN');
  const [packages, setPackages] = useState<Package[]>(initialData);
  const [loading, setLoading] = useState(false);

  /* modal */
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Package | null>(null);

  /* ---------------------------------------------------------------- */
  /*  HANDLERS                                                        */
  /* ---------------------------------------------------------------- */

  /* fetch saat kategori berubah */
  useEffect(() => {
    if (category === 'STAN') return; // data STAN sudah di-SSR

    (async () => {
      setLoading(true);
      try {
        const { data } = await axios.get<{ success: boolean; data: Package[] }>(
          `${apiUrl}/products/paket/${category}`
        );
        setPackages(data.data ?? []);
      } catch (err) {
        console.error('Error fetching package list:', err);
        setPackages([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [category]);

  /* format IDR */
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  /* ---------------------------------------------------------------- */
  /*  RENDER                                                          */
  /* ---------------------------------------------------------------- */

  return (
    <div className="tw-w-full tw-px-3 sm:tw-px-6 lg:tw-px-8 xl:tw-px-12 2xl:tw-px-16 tw-py-12 tw-relative tw-z-10">
      {/* HERO SECTION */}
      <Row className="justify-content-center mb-5">
        <Col lg={10} className="text-center">
          <div className="tw-mb-8">
            <div className="tw-inline-flex tw-items-center tw-justify-center tw-w-24 tw-h-24 tw-bg-white/20 tw-backdrop-blur-sm tw-rounded-full tw-mb-6 tw-shadow-2xl tw-animate-float">
              <Gift className="tw-w-12 tw-h-12 tw-text-yellow-300" />
            </div>
            <h1 className="tw-text-5xl md:tw-text-6xl tw-font-bold tw-text-white tw-mb-4 tw-drop-shadow-lg">
              Produk Bimbel AZ
            </h1>
            <p className="tw-text-xl md:tw-text-2xl tw-text-white/90 tw-font-medium tw-drop-shadow tw-max-w-4xl tw-mx-auto">
              Bimbel AZ menyediakan semua amunisi yang kamu butuhkan untuk menuju kampus impianmu! 🚀✨
            </p>
          </div>
        </Col>
      </Row>

      {/* FILTER KATEGORI */}
      <Row className="tw-justify-center tw-mb-10">
        <Col xs={12} className="tw-flex tw-justify-center tw-flex-wrap tw-gap-3">
          {(['STAN', 'STIS', 'UTBK'] as Category[]).map((c, index) => (
            <Button
              key={c}
              onClick={() => setCategory(c)}
              className={`tw-px-8 tw-py-3 tw-rounded-full tw-font-bold tw-text-lg tw-transition-all tw-duration-300 tw-shadow-lg tw-border-2 ${
                category === c
                  ? 'tw-bg-white tw-text-purple-800 tw-border-white tw-shadow-2xl tw-scale-110'
                  : 'tw-bg-white/10 tw-text-white tw-border-white/30 hover:tw-bg-white/20 tw-backdrop-blur-sm hover:tw-scale-105'
              }`}
              style={{ animation: category === c ? 'bounce 2s infinite' : 'none' }}
            >
              <div className="tw-flex tw-items-center tw-gap-2">
                {index === 0 && <Trophy className="tw-w-5 tw-h-5" />}
                {index === 1 && <Target className="tw-w-5 tw-h-5" />}
                {index === 2 && <BookOpen className="tw-w-5 tw-h-5" />}
                {c}
              </div>
            </Button>
          ))}
        </Col>
      </Row>

      {/* PAKET TITLE SECTION */}
      <Row className="justify-content-center mb-12 lg:tw-mb-16">
        <Col lg={8} className="text-center">
          <div className="tw-bg-white/15 tw-backdrop-blur-sm tw-rounded-3xl tw-p-8 tw-border tw-border-white/30 tw-shadow-2xl">
            <h3 className="tw-text-3xl md:tw-text-4xl tw-font-bold tw-text-white tw-mb-4 tw-flex tw-items-center tw-justify-center tw-gap-3">
              <Star className="tw-w-10 tw-h-10 tw-text-yellow-300" style={{ animation: 'bounce 2s infinite' }} />
              PAKET BIMBEL {category}
              <Star className="tw-w-10 tw-h-10 tw-text-yellow-300" style={{ animation: 'bounce 2s infinite 0.5s' }} />
            </h3>
            <p className="tw-text-white/90 tw-text-xl tw-font-medium">
              Pilih paket terbaikmu dan raih mimpi masuk kampus impian! 🎯
            </p>
          </div>
        </Col>
      </Row>

      {/* GRID PAKET */}
      {loading ? (
        <div className="tw-text-center tw-py-16">
          <div className="tw-w-32 tw-h-32 tw-bg-white/20 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-6 tw-backdrop-blur-sm tw-shadow-2xl">
            <Spinner animation="border" className="tw-text-white" style={{ width: '4rem', height: '4rem' }} />
          </div>
          <p className="tw-text-2xl tw-font-semibold tw-text-white tw-drop-shadow">Memuat paket bimbel terbaik untukmu...</p>
        </div>
      ) : (
        <Row className="tw-g-4 lg:tw-g-6">
          {packages.length === 0 && (
            <Col xs={12} className="tw-text-center tw-text-white tw-text-lg">
              Paket belum tersedia.
            </Col>
          )}

          {packages.map((pkg, idx) => (
            <Col xs={12} sm={6} lg={4} xl={3} key={pkg.product_id} className="tw-mb-6">
              <Card className="tw-h-full tw-border-0 tw-rounded-2xl tw-shadow-2xl tw-transition-all tw-duration-500 hover:tw-shadow-3xl hover:tw-scale-105 tw-flex tw-flex-col tw-bg-white/95 tw-backdrop-blur-sm tw-overflow-hidden">
                {/* HEADER GRADASI */}
                <div
                  className={`tw-bg-gradient-to-r tw-text-white tw-p-6 tw-relative tw-overflow-hidden ${
                    idx % 4 === 0 ? 'tw-from-violet-600 tw-to-purple-600' :
                    idx % 4 === 1 ? 'tw-from-purple-600 tw-to-pink-600' :
                    idx % 4 === 2 ? 'tw-from-indigo-600 tw-to-blue-600' :
                    'tw-from-pink-600 tw-to-rose-600'
                  }`}
                >
                  <div className="tw-absolute tw-top-0 tw-right-0 tw-w-20 tw-h-20 tw-bg-white/10 tw-rounded-full tw--translate-y-10 tw-translate-x-10"></div>
                  <div className="tw-flex tw-items-center tw-justify-between tw-mb-2">
                    <div className={`tw-w-12 tw-h-12 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-font-bold tw-text-xl tw-shadow-lg ${
                      idx % 4 === 0 ? 'tw-bg-violet-500' :
                      idx % 4 === 1 ? 'tw-bg-purple-500' :
                      idx % 4 === 2 ? 'tw-bg-indigo-500' :
                      'tw-bg-pink-500'
                    }`}>
                      {idx + 1}
                    </div>
                    <Award className="tw-w-8 tw-h-8 tw-text-yellow-300" />
                  </div>
                  <h5 className="tw-font-bold tw-text-2xl tw-mb-0 tw-drop-shadow">{pkg.name}</h5>
                </div>

                {/* BODY */}
                <Card.Body className="tw-p-6 tw-flex-grow tw-flex tw-flex-col">
                  <div className="tw-flex-grow">
                    <div className="tw-mb-6">
                      <h6 className="tw-font-semibold tw-text-purple-800 tw-mb-3 tw-flex tw-items-center tw-gap-2">
                        <CheckCircle className="tw-w-5 tw-h-5 tw-text-green-500" />
                        Benefit yang kamu dapatkan:
                      </h6>
                      <ul className="tw-space-y-2">
                        {(pkg.features ?? []).map((feature, index) => (
                          <li key={index} className="tw-flex tw-items-start tw-gap-3 tw-text-gray-700">
                            <div className="tw-w-2 tw-h-2 tw-bg-purple-500 tw-rounded-full tw-mt-2 tw-flex-shrink-0"></div>
                            <span className="tw-text-sm tw-font-medium">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* PRICE BOX */}
                  <div
                    className="tw-price-box tw-mb-6"
                    style={priceBoxStyles.container}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = priceBoxStyles.containerHover.transform;
                      e.currentTarget.style.boxShadow = priceBoxStyles.containerHover.boxShadow;
                      const priceText = e.currentTarget.querySelector('.price-text');
                      if (priceText) priceText.style.transform = priceBoxStyles.priceTextHover.transform;
                      const promoBadge = e.currentTarget.querySelector('.promo-badge');
                      if (promoBadge) promoBadge.style.transform = priceBoxStyles.promoBadgeHover.transform;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = priceBoxStyles.container.boxShadow;
                      const priceText = e.currentTarget.querySelector('.price-text');
                      if (priceText) priceText.style.transform = 'none';
                      const promoBadge = e.currentTarget.querySelector('.promo-badge');
                      if (promoBadge) promoBadge.style.transform = priceBoxStyles.promoBadge.transform;
                    }}
                  >
                    <div style={priceBoxStyles.animatedBorder}></div>

                    <div className="promo-badge tw-flex tw-items-center tw-gap-1" style={priceBoxStyles.promoBadge}>
                      <Zap className="tw-w-4 tw-h-4" />
                      {pkg.promo_description || 'PROMO !!!'}
                    </div>

                    <div style={priceBoxStyles.priceDisplay}>
                      <p className="price-text tw-flex tw-items-center tw-justify-center tw-gap-2" style={priceBoxStyles.priceText}>
                        <Trophy className="tw-w-6 tw-h-6 tw-text-yellow-500" />
                        {formatCurrency(Number(pkg.price))}
                      </p>
                      <p style={priceBoxStyles.originalPrice}>
                        <del>{formatCurrency(Number(pkg.no_promo_price))}</del>
                      </p>
                    </div>
                  </div>

                  {/* BUTTONS */}
                  <div className="tw-space-y-3">
                    <Button
                      onClick={() => {
                        setSelected(pkg);
                        setModalOpen(true);
                      }}
                      className={`tw-w-full tw-py-3 tw-px-4 tw-rounded-xl tw-font-bold tw-text-lg tw-border-0 tw-transition-all tw-duration-300 tw-shadow-lg tw-flex tw-items-center tw-justify-center tw-gap-3 ${
                        idx % 4 === 0 ? 'tw-bg-gradient-to-r tw-from-violet-600 tw-to-purple-600 hover:tw-from-violet-700 hover:tw-to-purple-700' :
                        idx % 4 === 1 ? 'tw-bg-gradient-to-r tw-from-purple-600 tw-to-pink-600 hover:tw-from-purple-700 hover:tw-to-pink-700' :
                        idx % 4 === 2 ? 'tw-bg-gradient-to-r tw-from-indigo-600 tw-to-blue-600 hover:tw-from-indigo-700 hover:tw-to-blue-700' :
                        'tw-bg-gradient-to-r tw-from-pink-600 tw-to-rose-600 hover:tw-from-pink-700 hover:tw-to-rose-700'
                      } tw-text-white hover:tw-shadow-xl hover:tw-scale-105`}
                    >
                      <Star className="tw-w-5 tw-h-5 tw-text-yellow-300" />
                      Pesan Sekarang
                      <Zap className="tw-w-5 tw-h-5" />
                    </Button>
                    <Button
                      onClick={() => alert('Diskusi dengan Pengajar')}
                      className="tw-w-full tw-py-3 tw-px-4 tw-rounded-xl tw-font-bold tw-text-lg tw-bg-white/20 tw-text-purple-700 tw-border-2 tw-border-purple-500 hover:tw-bg-purple-50 tw-transition-all tw-duration-300 tw-flex tw-items-center tw-justify-center tw-gap-3 hover:tw-shadow-lg hover:tw-scale-105"
                    >
                      <Users className="tw-w-5 tw-h-5" />
                      Diskusi dengan Mentor
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* MODAL PEMBELIAN */}
      {selected && (
        <BeliPaketModal
          show={modalOpen}
          onClose={() => setModalOpen(false)}
          productId={selected.product_id}
          userId={id ?? 0}
          productPrice={selected.price}
        />
      )}

      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
          40%, 43% { transform: translate3d(0,-30px,0); }
          70% { transform: translate3d(0,-15px,0); }
          90% { transform: translate3d(0,-4px,0); }
        }
        
        .tw-animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        @keyframes float {
          0% { transform: translatey(0px); }
          50% { transform: translatey(-20px); }
          100% { transform: translatey(0px); }
        }
        
        .tw-animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
        
        .tw-delay-500 {
          animation-delay: 0.5s;
        }
        
        .tw-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};

export default ProductsClient;