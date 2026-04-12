# ✅ Checklist de Implementação — Sistema de Gamificação

## 🔧 Estrutura Criada

- ✅ **SQL Script**: `manual/GAMIFICATION_SETUP.sql`
- ✅ **Serviço**: `services/ReadingService.js`
- ✅ **Componentes**: `components/GamificationWidget.js`
- ✅ **Estilos**: `css/gamification.css`
- ✅ **Guia**: `manual/GUIA_GAMIFICACAO.md`
- ✅ **Exemplos**: `manual/example-gamification-integration.js`

---

## 📋 Próximas Ações (Por Ordem)

### ⚠️ Fase 1: Configuração do Banco (OBRIGATÓRIO)

- [ ] Abrir painel do **Supabase**
- [ ] Ir para **SQL Editor**
- [ ] Criar uma **Nova Query**
- [ ] Copiar arquivo: `manual/GAMIFICATION_SETUP.sql`
- [ ] Colar no SQL Editor
- [ ] Executar o script (clicar em "Run")
- [ ] ✅ Confirmar que as 3 tabelas foram criadas:
  - `reading_progress`
  - `user_stats`
  - `daily_reading`

### 📦 Fase 2: Integração no Projeto

- [ ] Abrir `index.html`
- [ ] Adicionar no `<head>`:

  ```html
  <link rel="stylesheet" href="./css/gamification.css" />
  ```

- [ ] Abrir `core/main.js`
- [ ] Adicionar no topo (com os outros imports):

  ```javascript
  import {
    getUserStats,
    getUserReadingProgress,
    getReadingAnalytics,
    getLeaderboard,
  } from "../services/ReadingService.js";
  ```

- [ ] ✅ Validar que os arquivos estão sem erros de sintaxe

### 🎨 Fase 3: Implementação Visual

#### Opção A: Mostrar no Perfil do Usuário

- [ ] Abrir `pages/ProfilePage.js`
- [ ] Importar componentes:
  ```javascript
  import {
    StatsCard,
    BadgesDisplay,
    SimpleReadingChart,
    ReadingCard,
  } from "../components/GamificationWidget.js";
  ```
- [ ] Chamar funções e renderizar HTML
- [ ] Testar em browser

#### Opção B: Mini Widget na Home

- [ ] Criar seção "Seu Progresso" na página inicial
- [ ] Usar `loadDashboard(userId)`
- [ ] Adicionar links para iniciar leitura

#### Opção C: Leaderboard Global

- [ ] Criar página de leaderboard (`pages/LeaderboardPage.js`)
- [ ] Usar componente `Leaderboard(users, currentUserId)`

### 🎮 Fase 4: Fluxo de Leitura

Você precisa de um **leitor de livros** onde implementar:

- [ ] Botão "Começar a Ler" → chama `startReading()`
- [ ] Clique em "Próxima Página" → chama `updateReadingProgress()`
- [ ] Botão "Marcar como Lido" → detecta conclusão
- [ ] Mostrar barra de progresso usando `ProgressBar()`

Exemplo básico:

```javascript
document.getElementById("next-btn").onclick = async () => {
  await updateReadingProgress(userId, bookId, currentPage, minutosGastos);
  refreshProgressUI();
};
```

### 📊 Fase 5: Análises (Opcional)

- [ ] Criar dashboard de análises com `getReadingAnalytics()`
- [ ] Integrar biblioteca de gráficos (Chart.js, Recharts, etc)
- [ ] Exibir tendências de leitura

### 🏆 Fase 6: Extras (Opcional)

- [ ] Adicionar notificações quando conquistar badges
- [ ] Criar "Daily Challenge" de leitura
- [ ] Implementar streak (dias consecutivos)
- [ ] Sistema de achievements extras

---

## 🧪 Testando

### Teste 1: Banco de Dados

```bash
# No Supabase SQL Editor, execute:
SELECT COUNT(*) FROM reading_progress;
SELECT COUNT(*) FROM user_stats;
SELECT COUNT(*) FROM daily_reading;
```

Deve retornar 0 registros (ou seus dados, se já tiver testado).

### Teste 2: Serviço ReadingService

```javascript
// No console do browser, com user ID real:
import {
  startReading,
  updateReadingProgress,
  getUserStats,
} from "./services/ReadingService.js";

const userId = "seu-uuid-real";
await startReading(userId, "test-book", 300);
await updateReadingProgress(userId, "test-book", 50, 30);
const stats = await getUserStats(userId);
console.log(stats);
```

### Teste 3: Componentes

```javascript
import { StatsCard } from "./components/GamificationWidget.js";

const mockStats = {
  level: 3,
  xp_points: 2500,
  total_books_read: 8,
  total_pages_read: 1200,
  badges: ["first_book", "five_books"],
};

const html = StatsCard(mockStats);
console.log(html); // Verificar se gerou HTML válido
```

---

## 🐛 Troubleshooting

### ❌ "Table does not exist"

- [ ] Verifique se executou o SQL script completamente
- [ ] Confirme em Supabase Dashboard → DB → Tables
- [ ] Tente executar novamente

### ❌ "Row Level Security (RLS) violation"

- [ ] Confirme que o usuário está autenticado
- [ ] Verifique se `auth.uid()` está retornando valor
- [ ] Teste as politicas RLS no SQL:
  ```sql
  -- Teste de leitura
  SELECT * FROM reading_progress WHERE user_id = auth.uid();
  ```

### ❌ "Import error: Cannot find module"

- [ ] Verifique se os caminhos estão corretos
- [ ] Certifique que não há typos nos nomes dos arquivos
- [ ] Use caminhos relativos `./` corretamente

### ❌ CSS não aparecendo

- [ ] Verifique se o `<link>` foi adicionado ao `<head>`
- [ ] Abra DevTools (F12) → Network e procure por `gamification.css`
- [ ] Limpe cache do browser (Ctrl+Shift+Del)

---

## 📞 Precisando de Ajuda?

Se algo não funcionar:

1. **Verifique o console** (F12 → Console)
2. **Procure mensagens de erro**
3. **Consulte GUIA_GAMIFICACAO.md**
4. **Veja os exemplos** em `example-gamification-integration.js`

---

## 🎯 Status de Implementação

```
[████████░░] 80% — Estrutura pronta, falta integração
        ↓
        Você está aqui ⬅️
```

**Depois que terminar:**

- Sistema gamificação 100% funcional ✨
- Users vendo progresso de leitura 📊
- Badges e XP sendo rastreados 🏆
- Dados prontos para análises futuras 📈

---

**Boa sorte! 🚀**
