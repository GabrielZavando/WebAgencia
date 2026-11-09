'use client';

import * as React from 'react';
import { apiClient, ApiError } from '../../lib/api-client';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';

interface LoginResponse {
  data: {
    user: {
      id: string;
      email: string;
      full_name: string;
      role: 'admin';
      is_active: boolean;
      created_at: string;
      updated_at: string;
    };
  };
  meta: {
    message: string;
  };
}

interface FormErrors {
  email?: string;
  password?: string;
  form?: string;
}

interface TailAdminLoginProps {
  onSuccess?: () => void;
}

export default function TailAdminLogin({ onSuccess }: TailAdminLoginProps = {}) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [honeypot, setHoneypot] = React.useState('');
  const [rateLimitDelay, setRateLimitDelay] = React.useState<number | null>(null);
  const [errorKey, setErrorKey] = React.useState(0);
  const [submitted, setSubmitted] = React.useState(false);
  const [touched, setTouched] = React.useState<{ email?: boolean; password?: boolean }>({});

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateEmailField = (value: string): string | undefined => {
    if (!value.trim()) return 'Email es requerido';
    if (!validateEmail(value)) return 'Email inválido';
    return undefined;
  };

  const validatePasswordField = (value: string): string | undefined => {
    if (!value) return 'Contraseña es requerida';
    if (value.trim().length < 8) return 'Contraseña debe tener al menos 8 caracteres';
    if (value.length > 128) return 'Contraseña es demasiado larga';
    return undefined;
  };

  const validateForm = (): boolean => {
    const emailError = validateEmailField(email);
    const passwordError = validatePasswordField(password);
    const newErrors: FormErrors = {};
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;
    setErrors(newErrors);
    return !emailError && !passwordError;
  };

  const handleEmailBlur = () => {
    setTouched((prev) => ({ ...prev, email: true }));
    const emailError = validateEmailField(email);
    setErrors((prev) => ({ ...prev, email: emailError }));
  };

  const handlePasswordBlur = () => {
    setTouched((prev) => ({ ...prev, password: true }));
    const passwordError = validatePasswordField(password);
    setErrors((prev) => ({ ...prev, password: passwordError }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (honeypot) {
      console.warn('Honeypot triggered - bot detected');
      return;
    }

    setSubmitted(true);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      if (!auth) {
        throw new Error('Firebase no está configurado. Verifica las variables de entorno PUBLIC_FIREBASE_*.');
      }

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password.trim(),
      );

      const idToken = await userCredential.user.getIdToken();

      const response = await apiClient.post<LoginResponse>('/auth/login', {
        id_token: idToken,
      });

      if (response.data && response.data.user && response.data.user.role === 'admin') {
        setIsSuccess(true);
        onSuccess?.();

        setTimeout(() => {
          window.location.assign('/admin');
        }, 500);
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setErrors({ form: 'Credenciales inválidas' });
        } else if (err.status === 429) {
          setErrors({ form: 'Demasiados intentos, espera unos minutos' });
          setRateLimitDelay(60);
        } else if (err.type === 'NETWORK_ERROR' || err.type === 'TIMEOUT_ERROR') {
          setErrors({ form: 'Error de conexión, intenta más tarde' });
        } else if (err.status === 400) {
          setErrors({ form: 'Datos inválidos, verifica el formulario' });
        } else {
          setErrors({ form: 'Error en el servidor, intenta más tarde' });
        }
      } else if (err instanceof Error) {
        const firebaseError = err as { code?: string };
        if (firebaseError.code) {
          if (firebaseError.code === 'auth/invalid-credential' || firebaseError.code === 'auth/wrong-password') {
            setErrors({ form: 'Credenciales inválidas' });
          } else if (firebaseError.code === 'auth/too-many-requests') {
            setErrors({ form: 'Demasiados intentos, espera unos minutos' });
            setRateLimitDelay(60);
          } else if (firebaseError.code === 'auth/invalid-email') {
            setErrors({ form: 'Email inválido' });
          } else if (firebaseError.code === 'auth/user-disabled') {
            setErrors({ form: 'Usuario deshabilitado' });
          } else if (firebaseError.code === 'auth/user-not-found') {
            setErrors({ form: 'Usuario no encontrado' });
          } else {
            setErrors({ form: 'Error de autenticación, intenta más tarde' });
          }
        } else {
          setErrors({ form: 'Error de autenticación, intenta más tarde' });
        }
      } else {
        setErrors({ form: 'Error inesperado, intenta más tarde' });
      }
      setErrorKey((prev) => prev + 1);
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    if (rateLimitDelay !== null && rateLimitDelay > 0) {
      const timer = setTimeout(() => {
        setRateLimitDelay(null);
      }, rateLimitDelay * 1000);
      return () => clearTimeout(timer);
    }
  }, [rateLimitDelay]);

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center" role="status" aria-label="Autenticación exitosa">
        <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-4" aria-hidden="true">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-gray-900 text-base">Iniciando sesión...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
        key={errorKey}
        noValidate
      >
        {/* Honeypot */}
        <input
          type="text"
          name="website-url"
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          aria-hidden="true"
        />

        {/* Tarjeta de login */}
        <div className="bg-white border border-gray-300 rounded-md shadow-sm p-8 sm:p-10 space-y-6">
          {/* Header centrado */}
          <div className="text-center mb-9">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tighter">Bienvenido</h1>
            <p className="text-gray-500 text-sm">Ingresa a tu panel de control</p>
          </div>

          {/* Email field */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
              CORREO ELECTRÓNICO
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={handleEmailBlur}
              disabled={isSubmitting || rateLimitDelay !== null}
              autoFocus
              required
              aria-invalid={(submitted || touched.email) && !!errors.email}
              aria-describedby={(submitted || touched.email) && errors.email ? 'email-error' : undefined}
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 bg-transparent outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 disabled:opacity-60 disabled:cursor-not-allowed placeholder-gray-400"
              placeholder="tu@correo.com"
            />
            {(submitted || touched.email) && errors.email && (
              <span id="email-error" className="text-red-600 text-xs font-semibold" role="alert">
                {errors.email}
              </span>
            )}
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
              CONTRASEÑA
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={handlePasswordBlur}
              disabled={isSubmitting || rateLimitDelay !== null}
              required
              minLength={8}
              maxLength={128}
              aria-invalid={(submitted || touched.password) && !!errors.password}
              aria-describedby={(submitted || touched.password) && errors.password ? 'password-error' : undefined}
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 bg-transparent outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 disabled:opacity-60 disabled:cursor-not-allowed placeholder-gray-400"
              placeholder="••••••••"
            />
            {(submitted || touched.password) && errors.password && (
              <span id="password-error" className="text-red-600 text-xs font-semibold" role="alert">
                {errors.password}
              </span>
            )}
          </div>

          {/* Form error */}
          {submitted && errors.form && (
            <div className="form-error p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm font-semibold" role="alert">
              {errors.form}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 py-3 text-white font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:bg-blue-700"
            disabled={isSubmitting || rateLimitDelay !== null}
          >
            {isSubmitting ? (
              <>
                <span className="mr-2 inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Iniciando sesión...
              </>
            ) : rateLimitDelay !== null ? (
              `Espera ${rateLimitDelay}s`
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
