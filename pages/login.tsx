/* pages/login.tsx */
import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios, { AxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';
import {
  Container,
  Form,
  Button,
} from 'react-bootstrap';
import {
  FaGoogle,
  FaLock,
  FaUserAlt,
  FaRegEye,
  FaRegEyeSlash,
} from 'react-icons/fa';

/* ----- komponen modal (pastikan sudah ada) ----- */
import SuccessModal from '../components/modals/auth/SuccessModal';
import FailureModal from '../components/modals/auth/FailureModal';

/* ----- context auth ----- */
import { useAuth } from '../context/AuthContext';

/* env var Next: awali dengan NEXT_PUBLIC_ agar bisa di-expose ke browser */
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

/* ------------------------------------------------ */
/* -------------------- KOMPUTASI ------------------ */
/* ------------------------------------------------ */

interface LoginForm {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  /* ----- state ----- */
  const [form, setForm] = useState<LoginForm>({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /* ----- redirect jika sudah login ----- */
  useEffect(() => {
    if (isAuthenticated) router.replace('/');
  }, [isAuthenticated, router]);

  /* ----- input handler ----- */
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /* ----- password toggle ----- */
  const togglePasswordVisibility = () => setShowPassword((v) => !v);

  /* ----- submit ----- */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data } = await axios.post(
        `${apiUrl}/users/login`,
        form,
        { withCredentials: true }
      );

      const { username, role, token } = data;
      const { id } = jwtDecode<{ id: number }>(token);
      if (!role) throw new Error('Role is missing in response');

      /* simpan token lokal, lalu update context */
      localStorage.setItem('authToken', token);
      localStorage.setItem('role', role);
      login(username, role, id, token); 

      setModalMessage('Login successful!');
      setShowSuccessModal(true);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      const msg =
        error.response?.data?.message ??
        'Login failed. Please check your username and password.';
      setModalMessage(msg);
      setShowFailureModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  /* ----- modal close handler ----- */
  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    router.replace('/');
  };
  const handleFailureClose = () => setShowFailureModal(false);

  /* ------------------------------------------------ */
  /* -------------------- MARK-UP -------------------- */
  /* ------------------------------------------------ */

  return (
    <>
      <Head>
        <title>Login | Futuredu</title>
      </Head>

      <div className="tw-min-h-screen tw-flex tw-items-center tw-justify-center tw-bg-gradient-to-br tw-from-purple-900 tw-via-purple-700 tw-to-indigo-800 tw-p-4">
        {/* pola abstrak di belakang (opsional) */}
        <div className="tw-fixed tw-inset-0 -tw-z-10 tw-opacity-10">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 1200 800"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#fff" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <path
              d="M0,200 Q300,150 600,300 T1200,200 V800 H0 Z"
              fill="url(#grad1)"
            />
            <circle cx="200" cy="200" r="80" fill="#fff" fillOpacity="0.2" />
            <circle cx="950" cy="350" r="120" fill="#fff" fillOpacity="0.1" />
            <circle cx="500" cy="600" r="160" fill="#fff" fillOpacity="0.05" />
          </svg>
        </div>

        <Container className="tw-max-w-5xl">
          <div className="tw-bg-white/10 tw-backdrop-blur-lg tw-rounded-3xl tw-shadow-2xl tw-overflow-hidden tw-border tw-border-white/20">
            <div className="tw-grid md:tw-grid-cols-2">
              {/* ---------------- WELCOME / SIDEBAR (desktop) ------------- */}
              <aside className="tw-hidden md:tw-flex tw-flex-col tw-justify-between tw-bg-gradient-to-br tw-from-purple-500/70 tw-to-purple-900/70 tw-text-white tw-p-10">
                <div>
                  <h1 className="tw-text-4xl tw-font-bold">Welcome Back</h1>
                  <p className="tw-text-purple-100 tw-mt-2">
                    We're excited to see you again
                  </p>
                  <div className="tw-w-12 tw-h-1 tw-bg-purple-300 tw-my-8" />
                  <p className="tw-text-purple-100">
                    Access your account to continue your journey with our
                    platform.
                  </p>
                </div>

                <div className="tw-space-y-6">
                  <p className="tw-text-purple-100">
                    Don&apos;t have an account yet?
                  </p>
                  <Link
                    href="/register"
                    className="tw-inline-block tw-border-2 tw-border-white tw-rounded-xl tw-px-8 tw-py-3 tw-font-semibold hover:tw-bg-white/20"
                  >
                    Create Account
                  </Link>
                </div>
              </aside>

              {/* --------------------- FORM LOGIN ------------------------ */}
              <section className="tw-bg-white tw-p-8 md:tw-p-10">
                <div className="tw-text-center tw-mb-10">
                  <div className="tw-w-16 tw-h-16 tw-rounded-full tw-bg-purple-100 tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4">
                    <div className="tw-w-10 tw-h-10 tw-rounded-full tw-bg-purple-700 tw-flex tw-items-center tw-justify-center">
                      <FaUserAlt className="tw-text-white" />
                    </div>
                  </div>
                  <h2 className="tw-text-3xl tw-font-bold tw-text-gray-800">
                    Sign In
                  </h2>
                  <p className="tw-text-gray-500">
                    Enter your credentials to access your account
                  </p>
                </div>

                <Form onSubmit={handleSubmit} className="tw-space-y-6">
                  {/* username */}
                  <Form.Group controlId="formBasicUsername">
                    <div className="tw-relative">
                      <span className="tw-absolute tw-left-4 tw-top-1/2 -tw-translate-y-1/2 tw-text-purple-600">
                        <FaUserAlt />
                      </span>
                      <Form.Control
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={form.username}
                        onChange={handleInputChange}
                        required
                        className="tw-pl-12 tw-py-4 tw-rounded-xl tw-border tw-border-purple-200 tw-bg-purple-50/50 focus:tw-ring-2 focus:tw-ring-purple-500 focus:tw-border-transparent"
                      />
                    </div>
                  </Form.Group>

                  {/* password */}
                  <Form.Group controlId="formBasicPassword">
                    <div className="tw-relative">
                      <span className="tw-absolute tw-left-4 tw-top-1/2 -tw-translate-y-1/2 tw-text-purple-600">
                        <FaLock />
                      </span>
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleInputChange}
                        required
                        className="tw-pl-12 tw-pr-12 tw-py-4 tw-rounded-xl tw-border tw-border-purple-200 tw-bg-purple-50/50 focus:tw-ring-2 focus:tw-ring-purple-500 focus:tw-border-transparent"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="tw-absolute tw-right-4 tw-top-1/2 -tw-translate-y-1/2 tw-text-gray-500 hover:tw-text-purple-600"
                      >
                        {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                      </button>
                    </div>
                  </Form.Group>

                  {/* remember + forgot */}
                  <div className="tw-flex tw-justify-between tw-items-center">
                    <Form.Check
                      type="checkbox"
                      label="Remember me"
                      className="tw-text-gray-600"
                    />
                    <Link
                      href="/forgot-password"
                      className="tw-text-sm tw-text-purple-700 hover:tw-text-purple-900"
                    >
                      Forgot Password?
                    </Link>
                  </div>

                  {/* submit */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="tw-w-full tw-bg-gradient-to-r tw-from-purple-600 tw-to-purple-800 tw-rounded-xl tw-py-4 tw-font-medium hover:tw-from-purple-700 hover:tw-to-purple-900"
                  >
                    {isLoading ? (
                      <span className="tw-flex tw-items-center tw-justify-center">
                        <span className="tw-animate-spin tw-rounded-full tw-h-5 tw-w-5 tw-border-t-2 tw-border-b-2 tw-border-white tw-mr-2" />
                        Signing in...
                      </span>
                    ) : (
                      'Sign In'
                    )}
                  </Button>

                  {/* separator */}
                  <div className="tw-relative tw-my-6">
                    <div className="tw-absolute tw-inset-0 tw-flex tw-items-center">
                      <div className="tw-w-full tw-border-t tw-border-gray-200" />
                    </div>
                    <div className="tw-relative tw-flex tw-justify-center tw-text-sm">
                      <span className="tw-bg-white tw-px-3 tw-text-gray-500">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  {/* google */}
                  <Button
                    type="button"
                    variant="light"
                    className="tw-w-full tw-flex tw-items-center tw-justify-center tw-gap-3 tw-rounded-xl tw-py-3 tw-border tw-border-gray-200 tw-bg-white hover:tw-bg-gray-50"
                  >
                    <FaGoogle className="tw-text-red-500" />
                    <span className="tw-font-medium">
                      Sign in with Google
                    </span>
                  </Button>

                  {/* sign-up link (mobile) */}
                  <p className="tw-text-center tw-mt-8 tw-text-gray-600 md:tw-hidden">
                    Don&apos;t have an account?{' '}
                    <Link
                      href="/register"
                      className="tw-text-purple-700 tw-font-semibold"
                    >
                      Sign Up
                    </Link>
                  </p>
                </Form>
              </section>
            </div>
          </div>

          {/* footer kecil */}
          <div className="tw-text-center tw-mt-8 tw-text-white/70 tw-text-sm">
            © {new Date().getFullYear()} Your Company Name. All rights
            reserved.
          </div>
        </Container>

        {/* modal success / failure */}
        <SuccessModal
          show={showSuccessModal}
          message={modalMessage ?? undefined}
          onClose={handleSuccessClose}
        />
        <FailureModal
          show={showFailureModal}
          message={modalMessage ?? undefined}
          onClose={handleFailureClose}
        />
      </div>
    </>
  );
};

export default Login;
