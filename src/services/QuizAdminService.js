import { supabase } from "../lib/supabase.js";

export async function listAdminQuizSets() {
  const { data, error } = await supabase
    .from("quiz_sets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };
  return { data: data || [] };
}

export async function listBooksForSelector() {
  const { data, error } = await supabase
    .from("livros")
    .select("id, title, author")
    .order("title", { ascending: true });

  if (error) return { error: error.message };
  return { data: data || [] };
}

export async function createQuizSet(payload) {
  const { data, error } = await supabase
    .from("quiz_sets")
    .insert(payload)
    .select()
    .single();

  if (error) return { error: error.message };
  return { data };
}

export async function updateQuizSet(id, payload) {
  const { data, error } = await supabase
    .from("quiz_sets")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };
  return { data };
}

export async function deleteQuizSet(id) {
  const { error } = await supabase.from("quiz_sets").delete().eq("id", id);
  if (error) return { error: error.message };
  return {};
}

export async function listAdminQuestions(quizSetId) {
  const { data, error } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("quiz_set_id", quizSetId)
    .order("question_order", { ascending: true });

  if (error) return { error: error.message };
  return { data: data || [] };
}

export async function createQuestion(payload) {
  const { data, error } = await supabase
    .from("quiz_questions")
    .insert(payload)
    .select()
    .single();

  if (error) return { error: error.message };
  return { data };
}

export async function updateQuestion(id, payload) {
  const { data, error } = await supabase
    .from("quiz_questions")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };
  return { data };
}

export async function deleteQuestion(id) {
  const { error } = await supabase.from("quiz_questions").delete().eq("id", id);
  if (error) return { error: error.message };
  return {};
}

export async function listAdminOptions(questionId) {
  const { data, error } = await supabase
    .from("quiz_options")
    .select("*")
    .eq("question_id", questionId)
    .order("option_order", { ascending: true });

  if (error) return { error: error.message };
  return { data: data || [] };
}

export async function createOption(payload) {
  const { data, error } = await supabase
    .from("quiz_options")
    .insert(payload)
    .select()
    .single();

  if (error) return { error: error.message };
  return { data };
}

export async function updateOption(id, payload) {
  const { data, error } = await supabase
    .from("quiz_options")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };
  return { data };
}

export async function deleteOption(id) {
  const { error } = await supabase.from("quiz_options").delete().eq("id", id);
  if (error) return { error: error.message };
  return {};
}

export async function markOptionCorrect(questionId, optionId) {
  const { error: clearError } = await supabase
    .from("quiz_options")
    .update({ is_correct: false })
    .eq("question_id", questionId);

  if (clearError) return { error: clearError.message };

  const { data, error } = await supabase
    .from("quiz_options")
    .update({ is_correct: true })
    .eq("id", optionId)
    .select()
    .single();

  if (error) return { error: error.message };
  return { data };
}
