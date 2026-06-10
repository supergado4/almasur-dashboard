import React, { useState } from "react";
import { Shield, Lock, User, AlertCircle, Loader2 } from "lucide-react";
import { apiService, type AuthUser } from "../services/apiService";

interface LoginProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await apiService.login(email, password);
      onLoginSuccess(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Quick-fill only available in local dev (VITE_USE_REAL_APIS=false)
  const fillCredentials = (userEmail: string, pass: string) => {
    setEmail(userEmail);
    setPassword(pass);
  };

  const isDev = import.meta.env.DEV && import.meta.env.VITE_USE_REAL_APIS !== "true";

  return (
    <div className="min-h-screen flex items-center justify-center bg-google-gray50 py-12 px-4 sm:px-6 lg:px-8 fade-in">
      <div className="max-w-md w-full bg-white border border-google-gray300 rounded-lg p-8 shadow-sm">
        {/* Header Branding */}
        <div className="flex flex-col items-center">
          <img
            src="https://jpedesign.cl/wp-content/uploads/2026/04/657703961_18039370931716598_5734186209565692188_n-Photoroom.png"
            alt="JPEdesign Logo"
            className="h-16 w-auto object-contain mb-4"
          />
          <h2 className="text-xl font-medium text-google-gray800">Iniciar sesión</h2>
          <p className="text-sm text-google-gray600 mt-1">
            para acceder al Centro de Mando Almasur
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-google-redLight border-l-4 border-google-red p-4 rounded text-sm text-google-red flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-google-gray500" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-md relative block w-full pl-10 pr-3 py-2.5 border border-google-gray300 placeholder-google-gray500 text-google-gray800 focus:outline-none focus:ring-1 focus:ring-google-blue focus:border-google-blue text-sm"
                  placeholder="Correo electrónico"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-google-gray500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-md relative block w-full pl-10 pr-3 py-2.5 border border-google-gray300 placeholder-google-gray500 text-google-gray800 focus:outline-none focus:ring-1 focus:ring-google-blue focus:border-google-blue text-sm"
                  placeholder="Contraseña"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-google-gray600">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                defaultChecked
                className="h-4 w-4 text-google-blue focus:ring-google-blue border-google-gray300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block">
                Recordarme en este equipo
              </label>
            </div>
            <a href="#" className="font-medium text-google-blue hover:text-google-blueHover">
              ¿Olvidaste la contraseña?
            </a>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-google-blue hover:bg-google-blueHover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-google-blue transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Verificando..." : "Siguiente"}
            </button>
          </div>
        </form>

        {/* Demo Credentials Quick Helper — only visible in local dev mode */}
        {isDev && (
          <div className="mt-8 pt-6 border-t border-google-gray200 text-center">
            <span className="text-xs text-google-gray500 block mb-3 font-medium">
              MODO DEMO — ACCESOS RÁPIDOS:
            </span>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => fillCredentials("carla.medici@almasur.cl", "")}
                className="text-xs text-left bg-google-gray50 hover:bg-google-gray100 border border-google-gray300 rounded p-2.5 flex items-center justify-between group transition-colors"
              >
                <div>
                  <span className="font-semibold block text-google-gray700">Carla Medici (Almasur)</span>
                  <span className="text-google-gray600">carla.medici@almasur.cl</span>
                </div>
                <span className="text-google-blue group-hover:underline text-[10px] font-bold">CARGAR</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials("juan.p@jpedesign.cl", "")}
                className="text-xs text-left bg-google-gray50 hover:bg-google-gray100 border border-google-gray300 rounded p-2.5 flex items-center justify-between group transition-colors"
              >
                <div>
                  <span className="font-semibold block text-google-gray700">Juan F. Pérez (JPEdesign)</span>
                  <span className="text-google-gray600">juan.p@jpedesign.cl</span>
                </div>
                <span className="text-google-blue group-hover:underline text-[10px] font-bold">CARGAR</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
