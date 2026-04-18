import { useState } from "react";
import { loginUser } from "../services/AuthService";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [, queryString = ""] = window.location.hash.split("?");
  const showConfirmNotice = new URLSearchParams(queryString).get("confirm") === "1";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error: loginError } = await loginUser({ email, password });
      if (loginError) {
        setError(loginError);
        return;
      }
      window.location.hash = "home";
    } catch (err) {
      setError(err.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-serif font-bold text-navy mb-2">
            Entrar
          </h1>
          <p className="text-gray-600 mb-6">Acesse sua conta LeiturAção</p>

          {showConfirmNotice && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm">
              Conta criada. Verifique seu e-mail para confirmar o cadastro antes de entrar.
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-1">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue text-white font-semibold rounded hover:bg-blue/90 disabled:opacity-50 transition-colors"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600 text-sm">
            Não tem conta?{" "}
            <button
              onClick={() => (window.location.hash = "register")}
              className="text-blue font-semibold hover:underline"
            >
              Cadastre-se
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
