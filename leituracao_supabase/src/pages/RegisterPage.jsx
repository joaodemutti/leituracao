import { useState } from "react";
import { loginWithOAuth, registerUser } from "../services/AuthService";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas nao coincidem.");
      return;
    }

    setLoading(true);
    const result = await registerUser({ name, username, email, password });

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    window.location.hash = "login?confirm=1";
  };

  const handleOAuth = async (provider) => {
    setError("");
    const result = await loginWithOAuth(provider);
    if (result.error) {
      setError(result.error);
    }
  };

  return (
    <div className="page-section">
      <div className="container flex items-center justify-center">
        <div className="soft-shadow grid w-full max-w-[980px] overflow-hidden rounded-[34px] border border-[#e8dfcf] bg-white lg:grid-cols-[0.9fr_1.1fr]">
          <section className="bg-[#faf6ef] px-7 py-10 md:px-10 lg:min-h-[680px]">
            <p className="inline-flex rounded-full bg-[#fef0ca] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#9c6d1b]">
              Comece agora, e gratis
            </p>
            <h1 className="mt-6 font-serif text-5xl leading-none text-navy">Crie sua conta</h1>
            <p className="mt-5 max-w-[34ch] text-base text-[#5e6b7c]">
              Junte-se aos leitores que acompanham progresso, registram leituras, ganham pontos e sobem no ranking.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                ["1", "Conta e perfil"],
                ["2", "Leituras e metas"],
                ["3", "XP e ranking"],
              ].map(([step, label]) => (
                <article key={step} className="rounded-[24px] border border-[#e8dfcf] bg-white px-4 py-5">
                  <p className="font-serif text-3xl text-gold">{step}</p>
                  <p className="mt-2 text-sm font-medium text-navy">{label}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="px-7 py-10 md:px-10 lg:py-14">
            <div className="mx-auto w-full max-w-[430px]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Criacao de conta</p>
              <h2 className="mt-3 font-serif text-4xl text-navy">Cadastre-se gratuitamente</h2>
              <p className="mt-3 text-sm text-[#5e6b7c]">
                Seu cadastro libera historico de leitura, recomendacoes e progresso sincronizado.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() => handleOAuth("google")}
                  className="rounded-2xl border border-[#ddd5c8] bg-[#faf6ef] px-4 py-3 text-sm font-medium text-navy"
                >
                  Entrar com Google
                </button>
                <button
                  onClick={() => handleOAuth("facebook")}
                  className="rounded-2xl border border-[#ddd5c8] bg-[#faf6ef] px-4 py-3 text-sm font-medium text-navy"
                >
                  Facebook
                </button>
              </div>

              {error && (
                <div className="mt-6 rounded-[20px] border border-[#f2d2d2] bg-[#fff4f4] px-4 py-3 text-sm text-[#a33d3d]">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <label className="block text-sm font-medium text-navy">
                  Nome completo
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-[#ddd5c8] px-4 py-3 focus:border-blue focus:outline-none"
                    placeholder="Seu nome"
                    required
                  />
                </label>

                <label className="block text-sm font-medium text-navy">
                  Nome de usuario
                  <input
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value.toLowerCase())}
                    className="mt-2 w-full rounded-2xl border border-[#ddd5c8] px-4 py-3 focus:border-blue focus:outline-none"
                    placeholder="sem espacos"
                    required
                  />
                </label>

                <label className="block text-sm font-medium text-navy">
                  E-mail
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-[#ddd5c8] px-4 py-3 focus:border-blue focus:outline-none"
                    placeholder="seu@email.com"
                    required
                  />
                </label>

                <label className="block text-sm font-medium text-navy">
                  Senha
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-[#ddd5c8] px-4 py-3 focus:border-blue focus:outline-none"
                    placeholder="Minimo 6 caracteres"
                    required
                  />
                </label>

                <label className="block text-sm font-medium text-navy">
                  Confirmar senha
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-[#ddd5c8] px-4 py-3 focus:border-blue focus:outline-none"
                    placeholder="Repita a senha"
                    required
                  />
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-light disabled:opacity-60"
                >
                  {loading ? "Criando conta..." : "Criar conta gratuita"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-[#64748b]">
                Ja tem conta?{" "}
                <button
                  onClick={() => {
                    window.location.hash = "login";
                  }}
                  className="font-semibold text-blue"
                >
                  Fazer login
                </button>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
