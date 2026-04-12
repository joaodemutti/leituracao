#!/bin/bash
# ============================================================
# VALIDAÇÃO DE GAMIFICAÇÃO
# Script para verificar se tudo foi integrado corretamente
# ============================================================

echo "🔍 Validando integração de gamificação..."
echo ""

# Verificar se CSS foi adicionado no HTML
if grep -q "gamification.css" "/home/samuel/Área de trabalho/extensao/leituracao_supabase/index.html"; then
  echo "✅ CSS adicionado em index.html"
else
  echo "❌ CSS não encontrado em index.html"
fi

# Verificar se imports foram adicionados em main.js
if grep -q "ReadingService" "/home/samuel/Área de trabalho/extensao/leituracao_supabase/core/main.js"; then
  echo "✅ ReadingService importado em main.js"
else
  echo "❌ ReadingService não importado em main.js"
fi

if grep -q "GamificationWidget" "/home/samuel/Área de trabalho/extensao/leituracao_supabase/core/main.js"; then
  echo "✅ GamificationWidget importado em main.js"
else
  echo "❌ GamificationWidget não importado em main.js"
fi

# Verificar se ProfilePage foi atualizado
if grep -q "StatsCard" "/home/samuel/Área de trabalho/extensao/leituracao_supabase/pages/ProfilePage.js"; then
  echo "✅ StatsCard integrado em ProfilePage"
else
  echo "❌ StatsCard não está em ProfilePage"
fi

if grep -q "BadgesDisplay" "/home/samuel/Área de trabalho/extensao/leituracao_supabase/pages/ProfilePage.js"; then
  echo "✅ BadgesDisplay integrado em ProfilePage"
else
  echo "❌ BadgesDisplay não está em ProfilePage"
fi

if grep -q "getUserStats" "/home/samuel/Área de trabalho/extensao/leituracao_supabase/pages/ProfilePage.js"; then
  echo "✅ getUserStats registrado em ProfilePage"
else
  echo "❌ getUserStats não está em ProfilePage"
fi

# Verificar se router foi atualizado para assíncrono
if grep -q "async function resolveAndRender" "/home/samuel/Área de trabalho/extensao/leituracao_supabase/core/router.js"; then
  echo "✅ Router atualizado para assíncrono"
else
  echo "❌ Router não está assíncrono"
fi

echo ""
echo "✅ Validação completa!"
echo ""
echo "📋 Próximos passos:"
echo "1. Execute o SQL script em Supabase: manual/GAMIFICATION_SETUP.sql"
echo "2. Abra http://localhost:5173 (ou seu URL)"
echo "3. Faça login para ver o perfil com gamificação"
echo "4. Verifique Console (F12) para qualquer erro"
