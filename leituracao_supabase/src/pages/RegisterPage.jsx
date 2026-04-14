import { useState } from "react";
import { registerUser } from "../services/AuthService";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    setLoading(true);

    try {
      const { error: registerError } = await registerUser({
        name: email.split("@")[0],
        username: email.split("@")[0],
        email,
        password,
      });
      if (registerError) {
        setError(registerError);
        return;
      }
      window.location.hash = "home";
    } catch (err) {
      setError(err.message || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-serif font-bold text-navy mb-2">
            Criar Conta
          </h1>
          <p className="text-gray-600 mb-6">Junte-se à comunidade LeiturAção</p>

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

            <div>
              <label className="block text-sm font-medium text-navy mb-1">
                Confirmar Senha
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue text-white font-semibold rounded hover:bg-blue/90 disabled:opacity-50 transition-colors"
            >
              {loading ? "Criando conta..." : "Criar Conta"}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600 text-sm">
            Já tem conta?{" "}
            <button
              onClick={() => (window.location.hash = "login")}
              className="text-blue font-semibold hover:underline"
            >
              Faça login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
