import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import NProgress from 'nprogress';
import { AuthProvider } from '../context/AuthContext';
import { StatusProvider } from '../context/StatusContext';
import { ExamProvider } from '../context/ExamContext';
import '../components/layout/sidebar.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css';

NProgress.configure({
  minimum: 0.3,
  easing: 'ease',
  speed: 800,
  showSpinner: true,
  trickleSpeed: 200,
  parent: 'body'
});

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const handleStart = () => {
      NProgress.start();
    };
    
    const handleStop = () => {
      NProgress.done();
    };

    const handleError = () => {
      NProgress.done();
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleStop);
    router.events.on('routeChangeError', handleError);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleStop);
      router.events.off('routeChangeError', handleError);
    };
  }, [router]);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      #nprogress {
        pointer-events: none;
      }
      
      #nprogress .bar {
        background: linear-gradient(90deg, #8b5cf6, #a855f7, #c084fc) !important;
        position: fixed;
        z-index: 9999;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
        border-radius: 0 0 2px 2px;
        box-shadow: 0 0 10px rgba(139, 92, 246, 0.6);
      }
      
      #nprogress .peg {
        display: block;
        position: absolute;
        right: 0px;
        width: 100px;
        height: 100%;
        box-shadow: 0 0 10px rgba(139, 92, 246, 1), 0 0 5px rgba(139, 92, 246, 1);
        opacity: 1.0;
        transform: rotate(3deg) translate(0px, -4px);
      }
      
      #nprogress .spinner {
        display: block;
        position: fixed;
        z-index: 9999;
        top: 20px;
        right: 20px;
      }
      
      #nprogress .spinner-icon {
        width: 24px;
        height: 24px;
        box-sizing: border-box;
        border: solid 3px transparent;
        border-top-color: #8b5cf6;
        border-left-color: #8b5cf6;
        border-radius: 50%;
        animation: nprogress-spinner 400ms linear infinite;
      }
      
      .nprogress-custom {
        margin-top: 2px;
        color: #8b5cf6;
      }
      
      @keyframes nprogress-spinner {
        0%   { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      @media (max-width: 768px) {
        #nprogress .bar {
          height: 2px;
        }
        
        #nprogress .spinner {
          top: 15px;
          right: 15px;
        }
        
        #nprogress .spinner-icon {
          width: 20px;
          height: 20px;
          border-width: 2px;
        }
      }
      
      @media (max-width: 480px) {
        #nprogress .bar {
          height: 2px;
        }
        
        #nprogress .spinner {
          top: 10px;
          right: 10px;
        }
        
        #nprogress .spinner-icon {
          width: 18px;
          height: 18px;
          border-width: 2px;
        }
      }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <ExamProvider>
      <AuthProvider>
        <StatusProvider>
          <Component {...pageProps} />
        </StatusProvider>
      </AuthProvider>
    </ExamProvider>
  );
}

export default MyApp;