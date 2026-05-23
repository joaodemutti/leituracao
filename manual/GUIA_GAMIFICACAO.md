# 🎮 Guia: Sistema de Gamificação — LeiturAção

## 📋 O Que Foi Criado

Seu sistema de gamificação contém 4 componentes principais:

1. **Tabelas no Supabase** (`GAMIFICATION_SETUP.sql`)
2. **Serviço de Rastreamento** (`services/ReadingService.js`)
3. **Componentes Visuais** (`components/GamificationWidget.js`)
4. **Estilos CSS** (`css/gamification.css`)

---

## 🚀 Como Implementar (Passo a Passo)

### Passo 1: Criar Tabelas no Supabase

1. Abra seu **painel Supabase**
2. Vá para **SQL Editor**
3. Clique em **"New query"**
4. Copie o arquivo: [`manual/GAMIFICATION_SETUP.sql`](./GAMIFICATION_SETUP.sql)
5. Cole no SQL Editor
6. Clique em **"Run"**

As 3 tabelas serão criadas:

- `reading_progress` — Rastreia página atual por livro
- `user_stats` — Estatísticas gerais (XP, nível, badges)
- `daily_reading` — Registro de leitura diária para análises

---

### Passo 2: Importar o Serviço no main.js

Adicione ao topo do [`core/main.js`](../core/main.js):

```javascript
import {
  getUserStats,
  getUserReadingProgress,
  getReadingAnalytics,
} from "../services/ReadingService.js";
```

---

### Passo 3: Adicionar CSS ao index.html

Abra [`index.html`](../index.html) e adicione no `<head>`:

```html
<link rel="stylesheet" href="./css/gamification.css" />
```

---

### Passo 4: Integrar Componentes no Perfil

Atualize [`pages/ProfilePage.js`](../pages/ProfilePage.js) para mostrar estatísticas:

```javascript
import {
  StatsCard,
  BadgesDisplay,
  ReadingCard,
  SimpleReadingChart,
} from "../components/GamificationWidget.js";
import {
  getUserStats,
  getUserReadingProgress,
  getReadingAnalytics,
} from "../services/ReadingService.js";

export async function ProfilePage(user) {
  if (!user) return;

  // Carrega dados
  const { data: stats } = await getUserStats(user.id);
  const { data: progress } = await getUserReadingProgress(user.id);
  const { data: analytics } = await getReadingAnalytics(user.id, 30);

  // Monta HTML
  const statsHTML = StatsCard(stats);
  const badgesHTML = BadgesDisplay(stats.badges);
  const chartHTML = SimpleReadingChart(analytics);

  const readingCardsHTML = progress
    .map((p) => ReadingCard({ title: p.book_id }, p))
    .join("");

  return `
    <div class="page profile-page">
      <div class="container">
        <h1>Perfil de ${user.name}</h1>

        <!-- Seção de estatísticas -->
        ${statsHTML}

        <!-- Badges -->
        ${badgesHTML}

        <!-- Gráfico de atividade -->
        ${chartHTML}

        <!-- Livros em leitura -->
        <div class="reading-section">
          <h3>Minha Biblioteca</h3>
          <div class="reading-grid">
            ${readingCardsHTML}
          </div>
        </div>
      </div>
    </div>
  `;
}
```

---

## 💻 Funções Principais

### Iniciar Leitura

```javascript
import { startReading } from "./services/ReadingService.js";

await startReading(userId, "book-123", 250); // 250 páginas
```

### Atualizar Progresso

```javascript
import { updateReadingProgress } from "./services/ReadingService.js";

// Usuário chegou na página 80, gastou 45 minutos
await updateReadingProgress(userId, "book-123", 80, 45);
```

### Obter Estatísticas

```javascript
import { getUserStats } from "./services/ReadingService.js";

const { data: stats } = await getUserStats(userId);
console.log(stats.level); // nível atual
console.log(stats.xp_points); // XP total
console.log(stats.badges); // badges conquistados
```

### Obter Análise de Dados

```javascript
import { getReadingAnalytics } from "./services/ReadingService.js";

// Últimos 30 dias
const { data: analytics } = await getReadingAnalytics(userId, 30);
// Resultado: { "2026-04-09": { pages: 50, minutes: 120 }, ... }
```

---

## 🎯 Sistema de Pontos (XP e Níveis)

| Ação                          | XP Ganho     |
| ----------------------------- | ------------ |
| Ler 1 página                  | 10 XP        |
| Terminar livro de 250 páginas | 2500 XP      |
| Ler a cada dia (streak)       | Bônus futuro |

### Progressão de Nível

- **Nível 1** → 0 XP
- **Nível 2** → 1,000 XP
- **Nível 3** → 2,000 XP
- ... (1,000 XP por nível)

---

## 🏅 Badges Disponíveis

| Badge        | Gatilho            | Emoji |
| ------------ | ------------------ | ----- |
| `first_book` | Terminar 1º livro  | 🎓    |
| `five_books` | Terminar 5 livros  | ⭐    |
| `ten_books`  | Terminar 10 livros | ✨    |
| `bookworm`   | Terminar 25 livros | 🐛    |
| `xp_master`  | Atingir 5,000 XP   | ⚡    |
| `legend`     | Atingir 10,000 XP  | 👑    |

Para adicionar novos badges, edite a função `_calculateNewBadges()` em [`services/ReadingService.js`](./ReadingService.js).

---

## 📊 Estrutura de Dados

### Tabela: `reading_progress`

```javascript
{
  id: "uuid",
  user_id: "uuid",
  book_id: "book-123",
  current_page: 150,
  total_pages: 300,
  completion_percentage: 50,
  status: "reading", // ou "finished", "abandoned"
  last_read_at: "2026-04-09T10:30:00Z",
  finished_at: null,
  started_at: "2026-04-01T09:00:00Z"
}
```

### Tabela: `user_stats`

```javascript
{
  id: "uuid (user_id)",
  level: 5,
  xp_points: 4200,
  total_books_read: 12,
  total_pages_read: 3500,
  badges: ["first_book", "five_books", "xp_master"],
  updated_at: "2026-04-09T10:30:00Z"
}
```

### Tabela: `daily_reading`

```javascript
{
  id: "uuid",
  user_id: "uuid",
  book_id: "book-123",
  pages_read: 30,
  minutes_spent: 60,
  read_date: "2026-04-09"
}
```

---

## 🎨 Componentes Disponíveis

### 1. `ProgressBar(progress)`

Mostra barra de progresso com porcentagem e páginas.

```javascript
import { ProgressBar } from "../components/GamificationWidget.js";
const html = ProgressBar({ current_page: 50, total_pages: 300 });
```

### 2. `StatsCard(stats)`

Card com nível, XP, livros lidos e barra de experiência.

```javascript
import { StatsCard } from "../components/GamificationWidget.js";
const html = StatsCard(stats);
```

### 3. `BadgesDisplay(badges)`

Grid de badges conquistados com tooltip.

```javascript
import { BadgesDisplay } from "../components/GamificationWidget.js";
const html = BadgesDisplay(["first_book", "five_books"]);
```

### 4. `ReadingCard(book, progress)`

Card mostrando livro em leitura com progresso.

```javascript
import { ReadingCard } from "../components/GamificationWidget.js";
const html = ReadingCard(
  { id: "b1", title: "1984", author: "Orwell" },
  { current_page: 150, total_pages: 328, completion_percentage: 46 },
);
```

### 5. `SimpleReadingChart(analyticsData)`

Gráfico de barras com atividade dos últimos 7 dias.

```javascript
import { SimpleReadingChart } from "../components/GamificationWidget.js";
const html = SimpleReadingChart({
  "2026-04-09": { pages: 50, minutes: 120 },
  "2026-04-08": { pages: 30, minutes: 90 },
});
```

### 6. `Leaderboard(users, currentUserId)`

Tabela com ranking de leitores.

```javascript
import {
  Leaderboard,
  getLeaderboard,
} from "../components/GamificationWidget.js";
import { getLeaderboard } from "../services/ReadingService.js";

const { data: topUsers } = await getLeaderboard(10);
const html = Leaderboard(topUsers, currentUserId);
```

---

## 🔧 Personalizações

### Mudar Valor de XP por Página

Abra [`services/ReadingService.js`](./ReadingService.js) e procure por:

```javascript
const newXP = stats.xp_points + pagesRead * 10; // ← Mude 10 para outro valor
```

### Mudar XP Necessário para Level Up

Procure por:

```javascript
const newLevel = Math.floor(newXP / 1000) + 1; // ← Mude 1000 para outro valor
```

### Adicionar Novo Badge

Na função `_calculateNewBadges()`:

```javascript
if (booksRead === 50) badges.add("epic_reader");
```

Depois no `getBadgeLabel()`:

```javascript
epic_reader: "Leitor Épico (50 livros)",
```

E em `GamificationWidget.js`:

```javascript
const badgeEmojis = {
  // ... outros
  epic_reader: "📖",
};
```

---

## ❓ FAQ

**P: Como reseto as estatísticas de um usuário?**
R: Execute no SQL Editor:

```sql
DELETE FROM user_stats WHERE id = 'user-uuid';
DELETE FROM reading_progress WHERE user_id = 'user-uuid';
DELETE FROM daily_reading WHERE user_id = 'user-uuid';
```

**P: Posso visualizar análises em gráficos mais avançados?**
R: Sim! Use a função `getReadingAnalytics()` e integre com bibliotecas como Chart.js ou Recharts.

**P: O progresso é sincronizado automaticamente?**
R: Não. Você precisa chamar `updateReadingProgress()` quando o usuário avançar na leitura. Recomenda-se fazer isso:

- Ao mover o slider de páginas
- Ao clicar em "Marcar como lido"
- A cada intervalo de tempo (ex: a cada 5 minutos)

---

## 📚 Próximos Passos

1. Teste em um livro pequeno para validar
2. Implemente um leitor integrado que rastreie posição
3. Adicione notificações quando conquistar badges
4. Criar competições entre leitores (daily challenges)
5. Implementar sistema de dicas baseado em leitura

Qualquer dúvida, me chama! 🚀
