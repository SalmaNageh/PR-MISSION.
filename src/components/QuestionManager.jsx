
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const DEFAULT_QUESTIONS = [
  {
    prompt:
      "A university is organizing a hackathon and needs a company to pay for prizes and receive its logo on event materials. What relationship fits best?",
    options: ["Sponsor", "Partner", "CSR", "None of the above"],
    correct_option: 0,
    explanation:
      "Sponsorship involves financial or in-kind support in exchange for visibility or agreed benefits.",
  },
  {
    prompt:
      "A university and a technology company jointly organize workshops, provide mentors, and plan the event together. What is this relationship?",
    options: ["Sponsor", "Partner", "CSR", "Customer"],
    correct_option: 1,
    explanation:
      "A partnership involves collaboration toward shared goals, with both sides contributing to the activity.",
  },
  {
    prompt:
      "A company funds free digital-literacy workshops for students in underserved communities, with social impact as the main goal. Which approach fits best?",
    options: ["Sponsor", "Partner", "CSR", "Paid advertisement"],
    correct_option: 2,
    explanation:
      "CSR focuses on a company's social and environmental responsibilities and its positive impact on the community.",
  },
  {
    prompt:
      "A company gives an event money but asks for a booth, logo placement, and promotional mentions. What is the primary relationship?",
    options: ["CSR", "Sponsor", "Volunteer activity", "Supplier contract"],
    correct_option: 1,
    explanation:
      "The requested promotional benefits indicate a sponsorship arrangement.",
  },
  {
    prompt:
      "A company provides experts to help students build prototypes and evaluates their projects, while the university provides labs and student teams. What fits best?",
    options: ["Partner", "Sponsor", "CSR in every case", "Customer"],
    correct_option: 0,
    explanation:
      "Both sides contribute resources and expertise to a shared activity, which is characteristic of a partnership.",
  },
  {
    prompt:
      "A restaurant donates meals to families in need without asking for advertising or event benefits. What is the main purpose?",
    options: [
      "Sponsorship",
      "Partnership",
      "CSR / community support",
      "Paid promotion",
    ],
    correct_option: 2,
    explanation:
      "The main purpose is community support rather than an exchange for promotional benefits.",
  },
  {
    prompt:
      "A company pays for an event but receives no publicity, booth, or other agreed benefit. What should the PR team clarify first?",
    options: [
      "Assume it is sponsorship",
      "Clarify the company's objective and the agreed relationship",
      "Always classify it as partnership",
      "Reject the support immediately",
    ],
    correct_option: 1,
    explanation:
      "Classify the relationship based on the actual objective, contributions, and agreed benefits—not just the company name.",
  },
  {
    prompt:
      "A company and a student organization run a recycling campaign together. Both contribute volunteers, logistics, and planning. What fits best?",
    options: ["Partner", "Sponsor", "Customer", "Paid advertisement"],
    correct_option: 0,
    explanation:
      "Joint planning and shared contributions indicate a partnership.",
  },
];

const EMPTY_QUESTION = {
  prompt: "",
  options: ["", "", "", ""],
  correct_option: 0,
  explanation: "",
  time_limit_seconds: 30,
  position: 1,
};

const COMPETITION_ID = "";

export default function QuestionManager({ competitionId: propCompetitionId }) {
  const competitionId = propCompetitionId || COMPETITION_ID;

  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState({ ...EMPTY_QUESTION });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const styles = {
    panel: {
      background: "#171717",
      color: "#f5f5f5",
      border: "1px solid #393939",
      borderRadius: 14,
      padding: 22,
      marginTop: 20,
      width: "100%",
      boxSizing: "border-box",
      overflowWrap: "anywhere",
    },
    field: {
      width: "100%",
      boxSizing: "border-box",
      padding: "11px 12px",
      borderRadius: 8,
      border: "1px solid #414141",
      background: "#222",
      color: "#fff",
      marginTop: 7,
      marginBottom: 14,
      font: "inherit",
    },
    button: {
      border: "1px solid #494949",
      borderRadius: 8,
      padding: "11px 15px",
      cursor: "pointer",
      fontWeight: 700,
      margin: "6px 6px 6px 0",
      fontSize: 14,
    },
    primary: {
      background: "#e8c547",
      color: "#171717",
      borderColor: "#e8c547",
    },
    secondary: {
      background: "#292929",
      color: "#f5f5f5",
    },
    card: {
      background: "#202020",
      border: "1px solid #393939",
      borderRadius: 10,
      padding: 16,
      marginTop: 12,
    },
    label: {
      display: "block",
      fontSize: 14,
      fontWeight: 600,
      color: "#d6d6d6",
    },
    message: {
      padding: 12,
      borderRadius: 8,
      marginTop: 16,
      overflowWrap: "anywhere",
    },
  };

  const loadQuestions = useCallback(async () => {
    if (!competitionId) {
      setQuestions([]);
      setLoading(false);
      setError("No competition selected. Select one from the Missions tab.");
      return false;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error: fetchError } = await supabase
        .from("competition_questions")
        .select("*")
        .eq("competition_id", competitionId)
        .order("position", { ascending: true });

      if (fetchError) throw fetchError;

      setQuestions(data ?? []);
      return true;
    } catch (err) {
      console.error("Could not load questions:", err);
      setQuestions([]);
      setError(`Could not load questions: ${err?.message ?? "Unknown error"}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [competitionId]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  async function addDefaultQuestions() {
    if (!competitionId || seeding || saving) return;

    if (
      !window.confirm(
        "Add the 8 default PR questions to this competition? Existing questions will not be overwritten."
      )
    ) {
      return;
    }

    setSeeding(true);
    setError("");
    setNotice("");

    try {
      const { data: existing, error: checkError } = await supabase
        .from("competition_questions")
        .select("id")
        .eq("competition_id", competitionId)
        .limit(1);

      if (checkError) throw checkError;

      if (existing?.length) {
        await loadQuestions();
        setNotice("This competition already has questions. No duplicates added.");
        return;
      }

      const payload = DEFAULT_QUESTIONS.map((question, index) => ({
        ...question,
        competition_id: competitionId,
        time_limit_seconds: 30,
        position: index + 1,
      }));

      const { data, error: insertError } = await supabase
        .from("competition_questions")
        .insert(payload)
        .select();

      if (insertError) throw insertError;

      setNotice(`Successfully added ${data?.length ?? 0} questions.`);
      await loadQuestions();
    } catch (err) {
      console.error("Could not add default questions:", err);
      setError(
        `Could not add default questions: ${err?.message ?? "Unknown error"}`
      );
    } finally {
      setSeeding(false);
    }
  }

  function startNewQuestion() {
    setEditingId(null);
    setForm({
      ...EMPTY_QUESTION,
      options: ["", "", "", ""],
      position: questions.length + 1,
    });
    setError("");
    setNotice("");
  }

  function startEditing(question) {
    const options = Array.isArray(question.options)
      ? question.options
      : ["", "", "", ""];

    setEditingId(question.id);
    setForm({
      prompt: question.prompt || "",
      options: [0, 1, 2, 3].map((i) => options[i] || ""),
      correct_option: Number(question.correct_option ?? 0),
      explanation: question.explanation || "",
      time_limit_seconds: Number(question.time_limit_seconds || 30),
      position: Number(question.position || 1),
    });
    setError("");
    setNotice("");
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateOption(index, value) {
    setForm((current) => ({
      ...current,
      options: current.options.map((option, i) =>
        i === index ? value : option
      ),
    }));
  }

  async function saveQuestion(event) {
    event.preventDefault();

    if (!competitionId) {
      setError("Select a competition first.");
      return;
    }

    if (!form.prompt.trim()) {
      setError("Write the question before saving.");
      return;
    }

    if (form.options.some((option) => !option.trim())) {
      setError("Fill in all four answer options.");
      return;
    }

    const timeLimit = Number(form.time_limit_seconds);
    const position = Number(form.position);
    const correctOption = Number(form.correct_option);

    if (!Number.isInteger(correctOption) || correctOption < 0 || correctOption > 3) {
      setError("Select a valid correct answer.");
      return;
    }

    if (!Number.isInteger(timeLimit) || timeLimit < 5) {
      setError("Time limit must be at least 5 seconds.");
      return;
    }

    if (!Number.isInteger(position) || position < 1) {
      setError("Question position must be 1 or greater.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const payload = {
        competition_id: competitionId,
        prompt: form.prompt.trim(),
        options: form.options.map((option) => option.trim()),
        correct_option: correctOption,
        explanation: form.explanation.trim(),
        time_limit_seconds: timeLimit,
        position,
      };

      const result = editingId
        ? await supabase
            .from("competition_questions")
            .update(payload)
            .eq("id", editingId)
            .eq("competition_id", competitionId)
            .select()
            .single()
        : await supabase
            .from("competition_questions")
            .insert(payload)
            .select()
            .single();

      if (result.error) throw result.error;
      if (!result.data) throw new Error("Supabase did not return the saved question.");

      setNotice(editingId ? "Question updated successfully." : "Question added successfully.");
      setEditingId(null);
      setForm({ ...EMPTY_QUESTION, options: ["", "", "", ""] });
      await loadQuestions();
    } catch (err) {
      console.error("Question save failed:", err);
      setError(`Failed to save question: ${err?.message ?? "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  }

  async function deleteQuestion(question) {
    if (!window.confirm(`Delete this question?\n\n${question.prompt}`)) return;

    setError("");
    setNotice("");

    try {
      const { error: deleteError } = await supabase
        .from("competition_questions")
        .delete()
        .eq("id", question.id)
        .eq("competition_id", competitionId);

      if (deleteError) throw deleteError;

      setNotice("Question deleted.");
      if (editingId === question.id) {
        setEditingId(null);
        setForm({ ...EMPTY_QUESTION, options: ["", "", "", ""] });
      }

      await loadQuestions();
    } catch (err) {
      console.error("Question delete failed:", err);
      setError(`Failed to delete question: ${err?.message ?? "Unknown error"}`);
    }
  }

  if (!competitionId) {
    return (
      <section style={styles.panel}>
        <h2 style={{ marginTop: 0 }}>Question Manager</h2>
        <p>Select a competition to manage its questions.</p>
      </section>
    );
  }

  return (
    <section style={styles.panel}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Question Manager</h2>
          <p style={{ color: "#aaa", marginBottom: 0 }}>
            {questions.length} question{questions.length === 1 ? "" : "s"} saved
          </p>
          <p style={{ color: "#888", fontSize: 12, marginTop: 6 }}>
            Competition ID: {competitionId}
          </p>
        </div>

        <button
          type="button"
          style={{ ...styles.button, ...styles.primary }}
          onClick={startNewQuestion}
        >
          + Add Question
        </button>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            ...styles.message,
            background: "#3a2020",
            color: "#ffbaba",
            border: "1px solid #733838",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {notice && (
        <div
          role="status"
          style={{
            ...styles.message,
            background: "#1e3525",
            color: "#b8f0c7",
            border: "1px solid #315a3b",
          }}
        >
          {notice}
        </div>
      )}

      {loading ? (
        <p style={{ padding: 12 }}>Loading questions...</p>
      ) : (
        <>
          {questions.length === 0 && (
            <div style={styles.card}>
              <h3>No questions yet</h3>
              <p style={{ color: "#bbb" }}>
                This competition has no saved questions. Add the eight defaults
                or create your own questions below.
              </p>
              <button
                type="button"
                disabled={seeding || saving}
                style={{
                  ...styles.button,
                  ...styles.primary,
                  opacity: seeding || saving ? 0.65 : 1,
                  cursor: seeding || saving ? "not-allowed" : "pointer",
                }}
                onClick={addDefaultQuestions}
              >
                {seeding ? "Adding questions..." : "Load Default Questions (8)"}
              </button>
            </div>
          )}

          {questions.map((question, index) => (
            <article key={question.id} style={styles.card}>
              <p style={{ color: "#e8c547", marginTop: 0 }}>
                QUESTION {index + 1} · {question.time_limit_seconds}s
              </p>
              <h3>{question.prompt}</h3>

              <ol type="A">
                {(question.options || []).map((option, optionIndex) => (
                  <li
                    key={`${question.id}-option-${optionIndex}`}
                    style={{
                      marginBottom: 6,
                      color:
                        optionIndex === Number(question.correct_option)
                          ? "#9ce6ad"
                          : "#ddd",
                    }}
                  >
                    {option}
                    {optionIndex === Number(question.correct_option) &&
                      " ✓ Correct answer"}
                  </li>
                ))}
              </ol>

              {question.explanation && (
                <p style={{ color: "#aaa" }}>
                  <strong>Explanation:</strong> {question.explanation}
                </p>
              )}

              <button
                type="button"
                style={{ ...styles.button, ...styles.secondary }}
                onClick={() => startEditing(question)}
              >
                Edit
              </button>
              <button
                type="button"
                style={{
                  ...styles.button,
                  background: "#3a2020",
                  color: "#ffbaba",
                }}
                onClick={() => deleteQuestion(question)}
              >
                Delete
              </button>
            </article>
          ))}
        </>
      )}

      <form onSubmit={saveQuestion} style={{ marginTop: 24 }}>
        <h3>{editingId ? "Edit Question" : "Add a New Question"}</h3>

        <label style={styles.label}>
          Question
          <textarea
            required
            rows={3}
            value={form.prompt}
            onChange={(event) => updateField("prompt", event.target.value)}
            style={styles.field}
            placeholder="Write the scenario or question..."
          />
        </label>

        <label style={styles.label}>Answer Options</label>

        {form.options.map((option, index) => (
          <label key={index} style={styles.label}>
            Option {String.fromCharCode(65 + index)}
            <input
              required
              value={option}
              onChange={(event) => updateOption(index, event.target.value)}
              style={styles.field}
              placeholder={`Enter option ${String.fromCharCode(65 + index)}`}
            />
          </label>
        ))}

        <label style={styles.label}>
          Correct Answer
          <select
            value={form.correct_option}
            onChange={(event) =>
              updateField("correct_option", Number(event.target.value))
            }
            style={styles.field}
          >
            {form.options.map((option, index) => (
              <option key={index} value={index}>
                {String.fromCharCode(65 + index)} — {option || "Empty option"}
              </option>
            ))}
          </select>
        </label>

        <label style={styles.label}>
          Explanation
          <textarea
            rows={3}
            value={form.explanation}
            onChange={(event) => updateField("explanation", event.target.value)}
            style={styles.field}
            placeholder="Explain why this answer is correct..."
          />
        </label>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 14,
          }}
        >
          <label style={styles.label}>
            Time Limit (seconds)
            <input
              type="number"
              min="5"
              step="1"
              required
              value={form.time_limit_seconds}
              onChange={(event) =>
                updateField("time_limit_seconds", event.target.value)
              }
              style={styles.field}
            />
          </label>

          <label style={styles.label}>
            Question Order
            <input
              type="number"
              min="1"
              step="1"
              required
              value={form.position}
              onChange={(event) => updateField("position", event.target.value)}
              style={styles.field}
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            ...styles.button,
            ...styles.primary,
            opacity: saving ? 0.65 : 1,
          }}
        >
          {saving
            ? "Saving..."
            : editingId
              ? "Save Changes"
              : "Add Question"}
        </button>

        <button
          type="button"
          style={{ ...styles.button, ...styles.secondary }}
          onClick={() => {
            setEditingId(null);
            setForm({ ...EMPTY_QUESTION, options: ["", "", "", ""] });
            setError("");
            setNotice("");
          }}
        >
          Cancel
        </button>
      </form>
    </section>
  );
}
