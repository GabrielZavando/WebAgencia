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

export default function LoginForm() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [honeypot, setHoneypot] = React.useState('');
  const [rateLimitDelay, setRateLimitDelay] = React.useState<number | null>(null);
  const [rememberMe, setRememberMe] = React.useState(false);
  const [errorKey, setErrorKey] = React.useState(0);

  // Load remembered email on mount
  React.useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email es requerido';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!password) {
      newErrors.password = 'Contraseña es requerida';
    } else if (password.trim().length < 8) {
      newErrors.password = 'Contraseña debe tener al menos 8 caracteres';
    } else if (password.length > 128) {
      newErrors.password = 'Contraseña es demasiado larga';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (honeypot) {
      console.warn('Honeypot triggered - bot detected');
      return;
    }

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
        password.trim()
      );

      const idToken = await userCredential.user.getIdToken();

      const response = await apiClient.post<LoginResponse>('/auth/login', {
        id_token: idToken,
      });

      // 4. Verificar que el usuario es admin
      if (response.data && response.data.user && response.data.user.role === 'admin') {
        // Save or clear remembered email
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email.trim());
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        
        // Show success state
        setIsSuccess(true);
        
        // Redirect after brief delay
        setTimeout(() => {
          window.location.href = '/admin/dashboard';
        }, 500);
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setErrors({ form: 'Token inválido o expirado' });
        } else if (err.status === 429) {
          setErrors({ form: 'Demasiados intentos, espera unos minutos' });
          setRateLimitDelay(60);
        } else if (err.type === 'NETWORK_ERROR' || err.type === 'TIMEOUT_ERROR') {
          setErrors({ form: 'Error de conexión - verifica que la API esté corriendo en localhost:3000' });
        } else if (err.status === 400) {
          setErrors({ form: 'Datos inválidos, verifica el formulario' });
        } else {
          setErrors({ form: 'Error en el servidor, intenta más tarde' });
        }
      } else if (err instanceof Error) {
        const firebaseError = err as any;
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
      setErrorKey(prev => prev + 1);
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRememberMe(e.target.checked);
  };

  // Success state
  if (isSuccess) {
    return (
      <div className="login-success-check" role="status" aria-label="Autenticación exitosa">
        <div className="flex flex-col items-center gap-4 py-8">
          <span className="material-symbols-outlined text-[var(--color-success)] text-5xl">
            check_circle
          </span>
          <p className="text-[var(--color-text)] text-[var(--text-sm)]">
            Iniciando sesión...
          </p>
        </div>
      </div>
    );
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`login-form ${errors.form ? 'form-error' : ''}`}
      key={errorKey}
      noValidate
    >
      <input
        type="text"
        name="website-url"
        className="website-url"
        tabIndex={-1}
        autoComplete="off"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        style={{ display: 'none' }}
        aria-hidden="true"
      />

      <div className="form-group fade-in" suppressHydrationWarning>
        <label htmlFor="email" className="form-label">CORREO ELECTRÓNICO</label>
        <div className="login-input-wrapper">
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting || rateLimitDelay !== null}
            autoFocus
            required
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className={`form-input ${errors.email ? 'error' : ''}`}
            placeholder="tu@correo.com"
          />
          <span className="material-symbols-outlined login-input-icon" aria-hidden="true">mail</span>
        </div>
        {errors.email && (
          <span id="email-error" className="error-message" role="alert">
            {errors.email}
          </span>
        )}
      </div>

      <div className="form-group fade-in" suppressHydrationWarning>
        <label htmlFor="password" className="form-label">CONTRASEÑA</label>
        <div className="login-input-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting || rateLimitDelay !== null}
            required
            minLength={8}
            maxLength={128}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            className={`form-input ${errors.password ? 'error' : ''}`}
            placeholder="••••••••"
          />
          <button
            type="button"
            className="login-password-toggle login-input-icon"
            onClick={togglePasswordVisibility}
            tabIndex={-1}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        </div>
        {errors.password && (
          <span id="password-error" className="error-message" role="alert">
            {errors.password}
          </span>
        )}
      </div>

      <div className="login-checkbox-row fade-in" suppressHydrationWarning>
        <label className="login-checkbox-wrapper">
          <input
            type="checkbox"
            className="login-checkbox"
            checked={rememberMe}
            onChange={handleRememberMeChange}
            disabled={isSubmitting || rateLimitDelay !== null}
            aria-label="Recordarme mi correo electrónico"
          />
          <span className="login-checkbox-label">Recordarme</span>
        </label>
        <a href="#" className="login-forgot-link">¿Olvidaste tu contraseña?</a>
      </div>

      {errors.form && (
        <div className="login-form-error" role="alert">
          {errors.form}
        </div>
      )}

      <button
        type="submit"
        className="btn-form fade-in"
        disabled={isSubmitting || rateLimitDelay !== null}
        suppressHydrationWarning
      >
        {isSubmitting ? (
          <>
            <span className="login-btn-spinner"></span>
            Iniciando sesión...
          </>
        ) : rateLimitDelay !== null ? (
          `Espera ${rateLimitDelay}s`
        ) : (
          'INICIAR SESIÓN'
        )}
      </button>
    </form>
  );
}
