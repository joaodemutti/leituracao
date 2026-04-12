/**
 * services/supabase.js
 *
 * Configuração da conexão com o Supabase.
 *
 * ⚠️  IMPORTANTE: Substitua os valores abaixo pelos do seu projeto.
 *    Acesse: painel Supabase → Settings → API
 */

const SUPABASE_URL = "https://twyjrmcjfgiexqjuwbxd.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3eWpybWNqZmdpZXhxanV3YnhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MDIwNjEsImV4cCI6MjA5MTI3ODA2MX0.G4kl-cD6NoUFw3iFk203iGrbZZfDR73_Oec1yIQzScc";

/**
 * Cliente Supabase simples usando fetch (sem dependência externa)
 * Faz requisições REST direto para o Supabase
 */
export class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
    this.auth = {
      getSession: async () => this._getSession(),
      getUser: async () => this._getUser(),
      signUp: async (options) => this._signUp(options),
      signInWithPassword: async (options) => this._signIn(options),
      signOut: async () => this._signOut(),
    };
  }

  from(table) {
    return new TableClient(this.url, this.key, table);
  }

  async _getSession() {
    try {
      const token = localStorage.getItem("supabase_token");
      if (!token) return { data: { session: null } };
      return { data: { session: JSON.parse(token) } };
    } catch {
      return { data: { session: null } };
    }
  }

  async _getUser() {
    try {
      const token = localStorage.getItem("supabase_token");
      if (!token) return { data: { user: null } };
      const session = JSON.parse(token);

      // Extrair o user_id do JWT (formato: header.payload.signature)
      if (session.access_token) {
        const payload = session.access_token.split(".")[1];
        const decoded = JSON.parse(atob(payload));
        return { data: { user: { id: decoded.sub, email: decoded.email } } };
      }

      return { data: { user: null } };
    } catch (error) {
      console.error("Erro ao obter usuário:", error);
      return { data: { user: null } };
    }
  }

  async _signUp({ email, password }) {
    try {
      const response = await fetch(`${this.url}/auth/v1/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: this.key,
          Authorization: `Bearer ${this.key}`,
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { data: null, error };
      }

      const data = await response.json();
      localStorage.setItem("supabase_token", JSON.stringify(data));
      return { data, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  async _signIn({ email, password }) {
    try {
      const response = await fetch(
        `${this.url}/auth/v1/token?grant_type=password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: this.key,
          },
          body: JSON.stringify({ email, password }),
        },
      );

      if (!response.ok) {
        return { data: null, error: { message: "E-mail ou senha inválidos" } };
      }

      const data = await response.json();
      localStorage.setItem("supabase_token", JSON.stringify(data));
      return { data, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  async _signOut() {
    localStorage.removeItem("supabase_token");
    return {};
  }
}

class TableClient {
  constructor(url, key, table) {
    this.url = url;
    this.key = key;
    this.table = table;
    this._columns = "*";
    this._filters = {};
    this._order = null;
    this._limit = null;
    this._single = false;
    this._data = null;
    this._insertData = null;
    this._updateData = null;
  }

  select(columns = "*") {
    this._columns = columns;
    return this;
  }

  insert(data) {
    this._insertData = data;
    return this;
  }

  update(data) {
    this._updateData = data;
    return this;
  }

  eq(column, value) {
    this._filters[column] = { op: "eq", value };
    return this;
  }

  gte(column, value) {
    this._filters[column] = { op: "gte", value };
    return this;
  }

  order(column, options = {}) {
    this._order = { column, ascending: options.ascending !== false };
    return this;
  }

  limit(count) {
    this._limit = count;
    return this;
  }

  single() {
    this._single = true;
    return this;
  }

  then(onFulfilled, onRejected) {
    return this.exec().then(onFulfilled, onRejected);
  }

  catch(onRejected) {
    return this.exec().catch(onRejected);
  }

  async exec() {
    try {
      const token = localStorage.getItem("supabase_token");
      const tokenData = token ? JSON.parse(token) : null;

      const headers = {
        "Content-Type": "application/json",
        apikey: this.key,
        Accept: "application/json",
      };

      if (tokenData?.access_token) {
        headers.Authorization = `Bearer ${tokenData.access_token}`;
      }

      let url = `${this.url}/rest/v1/${this.table}`;
      const params = new URLSearchParams();

      // Adiciona colunas
      if (this._columns) params.append("select", this._columns);

      // Adiciona filtros
      Object.entries(this._filters).forEach(([key, filterObj]) => {
        const op = filterObj.op || "eq";
        params.append(key, `${op}.${filterObj.value}`);
      });

      // Adiciona ordenação
      if (this._order) {
        const orderStr = `${this._order.column}.${this._order.ascending ? "asc" : "desc"}`;
        params.append("order", orderStr);
      }

      // Adiciona limite
      if (this._limit) params.append("limit", this._limit);

      const queryString = params.toString();
      if (queryString) url += "?" + queryString;

      let method = "GET";
      let body = null;

      if (this._insertData) {
        method = "POST";
        body = JSON.stringify(this._insertData);
      } else if (this._updateData) {
        method = "PATCH";
        body = JSON.stringify(this._updateData);
      }

      const options = { method, headers };
      if (body) options.body = body;

      const response = await fetch(url, options);

      if (!response.ok) {
        let errorMessage = response.statusText;
        try {
          const errorData = await response.json();
          errorMessage =
            errorData.message || errorData.error_description || errorMessage;
        } catch {}

        const error = {
          status: response.status,
          message: errorMessage,
          code: response.status === 429 ? "RATE_LIMIT" : "DB_ERROR",
        };

        return { data: null, error };
      }

      const result = await response.json();
      const data =
        this._single && Array.isArray(result) ? result[0] || null : result;

      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message: error.message,
          code: "FETCH_ERROR",
        },
      };
    }
  }
}

// Criar instância global
export const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_KEY);
