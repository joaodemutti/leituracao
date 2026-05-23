import { supabase } from "../lib/supabase.js";

function calculateLevel(xpPoints) {
  return Math.floor(xpPoints / 1000) + 1;
}

async function ensureUserStats(userId) {
  const { data, error } = await supabase
    .from("estatisticas_usuario")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!error && data) return data;

  const { data: inserted, error: insertError } = await supabase
    .from("estatisticas_usuario")
    .insert({ user_id: userId })
    .select()
    .single();

  if (insertError) throw insertError;
  return inserted;
}

async function awardGoalReward(goal) {
  if (!goal.reward_xp) return;

  const { data: existingEvent } = await supabase
    .from("eventos_gamificacao")
    .select("id")
    .eq("user_id", goal.user_id)
    .eq("event_type", "goal_completed")
    .contains("metadata", { goal_id: goal.id })
    .maybeSingle();

  if (existingEvent) return;

  const { error: eventError } = await supabase.from("eventos_gamificacao").insert({
    user_id: goal.user_id,
    event_type: "goal_completed",
    xp_delta: goal.reward_xp,
    metadata: {
      goal_id: goal.id,
      title: goal.title,
    },
  });

  if (eventError) throw eventError;

  const stats = await ensureUserStats(goal.user_id);
  const nextXpPoints = stats.xp_points + goal.reward_xp;

  const { error: statsError } = await supabase
    .from("estatisticas_usuario")
    .update({
      xp_points: nextXpPoints,
      level: calculateLevel(nextXpPoints),
    })
    .eq("user_id", goal.user_id);

  if (statsError) throw statsError;
}

export async function syncGoalStatuses(userId) {
  const { data, error } = await supabase
    .from("progresso_metas")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["active", "completed"]);

  if (error) return { error: error.message };

  const today = new Date().toISOString().split("T")[0];

  for (const goal of data || []) {
    if (goal.status === "active" && goal.progress_percentage >= 100) {
      const { error: updateError } = await supabase
        .from("metas_leitura")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", goal.id);

      if (!updateError) {
        await awardGoalReward(goal);
      }
      continue;
    }

    if (goal.status === "active" && goal.period_end < today) {
      await supabase
        .from("metas_leitura")
        .update({ status: "expired" })
        .eq("id", goal.id);
    }
  }

  return { data: true };
}

export async function getGoalProgress(userId, status = null) {
  await syncGoalStatuses(userId);

  let query = supabase
    .from("progresso_metas")
    .select("*")
    .eq("user_id", userId)
    .order("period_end", { ascending: true });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { data: data || [] };
}

export async function createReadingGoal(userId, goalInput) {
  const payload = {
    user_id: userId,
    title: goalInput.title.trim(),
    goal_type: goalInput.goalType,
    metric_type: goalInput.metricType,
    target_value: Number(goalInput.targetValue),
    period_start: goalInput.periodStart,
    period_end: goalInput.periodEnd,
    reward_xp: Number(goalInput.rewardXp || 0),
  };

  const { data, error } = await supabase
    .from("metas_leitura")
    .insert(payload)
    .select()
    .single();

  if (error) return { error: error.message };
  return { data };
}

export async function getGoalSummary(userId) {
  const goalsResult = await getGoalProgress(userId);
  if (goalsResult.error) return goalsResult;

  const goals = goalsResult.data;
  const active = goals.filter((goal) => goal.status === "active");
  const completed = goals.filter((goal) => goal.status === "completed");
  const finished = goals.filter((goal) => ["completed", "expired", "cancelled"].includes(goal.status));
  const successRate = finished.length
    ? Math.round((completed.length / finished.length) * 100)
    : 0;

  return {
    data: {
      activeCount: active.length,
      completedCount: completed.length,
      successRate,
    },
  };
}



