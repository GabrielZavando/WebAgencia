'use client';

import * as React from 'react';
import { apiClient, ApiError } from '../../lib/api-client';

interface LoginResponse {
  token: string;
  user: {
    email: string;
    role: 'admin';
  };
  expiresAt: string;
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
  const [honeypot, setHoneypot] = React.useState('');
  const [rateLimitDelay, setRateLimitDelay] = React.useState<number | null>(null);

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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

    apiClient.post<LoginResponse>('/api/v1/auth/login', {
      email: email.trim(),
      password: password.trim(),
    }, {
      injectTurnstile: true,
    })
      .then((response) => {
        if (response.user && response.user.role === 'admin') {
          window.location.href = '/';
        }
      })
      .catch((err: unknown) => {
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
        } else {
          setErrors({ form: 'Error inesperado, intenta más tarde' });
        }
      })
      .finally(() => {
        setIsSubmitting(false);
      });
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

  return (
    <form onSubmit={handleSubmit} className="login-form" noValidate>
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

      <div className="login-input-group fade-in">
        <label htmlFor="email" className="login-input-label">CORREO ELECTRÓNICO</label>
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
          className={`login-input ${errors.email ? 'error' : ''}`}
          placeholder="tu@correo.com"
        />
        {errors.email && (
          <span id="email-error" className="login-error-message" role="alert">
            {errors.email}
          </span>
        )}
      </div>

      <div className="login-input-group fade-in">
        <label htmlFor="password" className="login-input-label">CONTRASEÑA</label>
        <div className="login-password-wrapper">
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
            className={`login-input ${errors.password ? 'error' : ''}`}
            placeholder="••••••••"
          />
          <button
            type="button"
            className="login-password-toggle"
            onClick={togglePasswordVisibility}
            tabIndex={-1}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? (
              <span className="material-symbols-outlined">visibility_off</span>
            ) : (
              <span className="material-symbols-outlined">visibility</span>
            )}
          </button>
        </div>
        {errors.password && (
          <span id="password-error" className="login-error-message" role="alert">
            {errors.password}
          </span>
        )}
      </div>

      <div className="login-forgot-wrapper fade-in">
        <a href="#" className="login-forgot-link">¿Olvidaste tu contraseña?</a>
      </div>

      {errors.form && (
        <div className="login-form-error" role="alert">
          {errors.form}
        </div>
      )}

      <button
        type="submit"
        className="login-submit-btn fade-in"
        disabled={isSubmitting || rateLimitDelay !== null}
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