import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { loginUser, loginWithOAuth, requestPasswordReset } from "../services/AuthService";
import GoogleLoginButton from "../components/GoogleLoginButton";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const showConfirmNotice = searchParams.get("confirm") === "1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const result = await loginUser({ email, password });
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    navigate("/home");
  };

  const handleOAuth = async (provider) => {
    setError("");
    const result = await loginWithOAuth(provider);
    if (result.error) {
      setError(result.error);
    }
  };

  const handlePasswordReset = async () => {
    setError("");
    setNotice("");
    const result = await requestPasswordReset(email);
    if (result.error) {
      setError(result.error);
      return;
    }
    setNotice("Enviamos um link de recuperacao para o seu e-mail.");
  };

  return (
    <div className="page-section">
      <div className="container flex items-center justify-center">
        <div className="soft-shadow grid w-full max-w-[980px] overflow-hidden rounded-[34px] border border-[#e8dfcf] bg-white lg:grid-cols-[0.92fr_1.08fr]">
          <section className="bg-crimson-dark px-7 py-10 text-white md:px-10 lg:min-h-[640px]">
            <div className="font-bold shadow-[inset_0_0_0_1px_rgba(26,95,168,0.08)] inline-flex rounded-full text-secondary bg-secondary-light px-4 py-2 text-xs uppercase tracking-[0.18em]">
              Bem-vindo de volta
            </div>
            <h1 className="mt-6 font-serif text-5xl leading-none">Entre na LeiturAcao</h1>
            <p className="mt-5 max-w-[32ch] text-base text-white/72">
              Acesse sua conta para continuar lendo, acumular pontos e manter sua sequencia.
            </p>
            <div className="mt-10 rounded-[26px] border border-white/20 bg-white/10 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">Leitura com continuidade</p>
              <p className="mt-3 text-sm text-white/70">
                Seu progresso, metas e ranking ficam sincronizados na sua conta.
              </p>
            </div>
          </section>

          <section className="px-7 py-10 md:px-10 lg:py-14">
            <div className="mx-auto w-full max-w-[420px]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Entrar com e-mail</p>
              <h2 className="mt-3 font-serif text-4xl text-crimson">Acesse sua conta</h2>
              <p className="mt-3 text-sm text-[#5e6b7c]">
                Continue de onde voce parou e mantenha sua evolucao registrada.
              </p>

              <div className="mt-8 flex justify-center">
                <GoogleLoginButton onClick={() => handleOAuth("google")} />
              </div>

              {showConfirmNotice && (
                <div className="mt-6 rounded-[20px] border border-[#d6e4f7] bg-[#eef5ff] px-4 py-3 text-sm text-secondary">
                  Conta criada. Verifique seu e-mail para confirmar o cadastro antes de entrar.
                </div>
              )}

              {notice && (
                <div className="mt-6 rounded-[20px] border border-[#d2f1dc] bg-[#eefcf3] px-4 py-3 text-sm text-[#1f7a42]">
                  {notice}
                </div>
              )}

              {error && (
                <div className="mt-6 rounded-[20px] border border-[#f2d2d2] bg-[#fff4f4] px-4 py-3 text-sm text-[#a33d3d]">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <label className="block text-sm font-medium text-crimson">
                  E-mail
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-[#ddd5c8] px-4 py-3 focus:border-secondary focus:outline-none"
                    placeholder="seu@email.com"
                    required
                  />
                </label>

                <label className="block text-sm font-medium text-crimson">
                  Senha
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-[#ddd5c8] px-4 py-3 focus:border-secondary focus:outline-none"
                    placeholder="Sua senha"
                    required
                  />
                </label>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    className="text-sm !font-semibold hover:!font-bold text-secondary"
                  >
                    Esqueceu a senha?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-crimson px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-crimson-mid disabled:opacity-60"
                >
                  {loading ? "Entrando..." : "Entrar"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-[#64748b]">
                Ainda nao tem conta?{" "}
                <button
                  onClick={() => {
                    navigate("/register");
                  }}
                  className="!font-semibold hover:!font-bold text-secondary"
                >
                  Cadastre-se gratuitamente
                </button>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
