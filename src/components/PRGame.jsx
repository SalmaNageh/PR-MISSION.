
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import "./PRGame.css";

export default function PRGame({ competition, user, onBack }) {
  const competitionId = competition?.id;

  const [session, setSession] = useState(null);
  const [question, setQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());

  // Load the shared game session and current question.
  const loadGame = useCallback(async () => {
    if (!competitionId) {
      setError("Competition information is missing.");
      setLoading(false);
      return;
    }

    const { data: sessionData, error: sessionError } =
      await supabase
        .from("game_sessions")
        .select(
          "competition_id, current_position, game_status, question_started_at, updated_at"
        )
        .eq("competition_id", competitionId)
        .maybeSingle();

    if (sessionError) {
      setError(sessionError.message);
      setLoading(false);
      return;
    }

    setSession(sessionData);

    if (!sessionData || sessionData.game_status !== "playing") {
      setQuestion(null);
      setLoading(false);
      return;
    }

    const { data: questionData, error: questionError } =
      await supabase
        .from("competition_questions")
        .select(
          "id, prompt, options, time_limit_seconds, position"
        )
        .eq("competition_id", competitionId)
        .eq("position", sessionData.current_position)
        .maybeSingle();

    if (questionError) {
      setError(questionError.message);
      setLoading(false);
      return;
    }

    setError("");

    // Reset the player's local state only when the question changes.
    setQuestion((previous) => {
      if (previous?.id !== questionData?.id) {
        setSelectedOption(null);
        setAnswerSubmitted(false);
        setResult(null);
        setError("");
      }

      return questionData;
    });

    setLoading(false);
  }, [competitionId]);

  // Poll the shared session so every player's screen stays synchronized.
  useEffect(() => {
    loadGame();

    const poll = window.setInterval(() => {
      setNow(Date.now());
      loadGame();
    }, 2000);

    return () => window.clearInterval(poll);
  }, [loadGame]);

  const timeLimit =
    Number(question?.time_limit_seconds) || 60;

  const startedAt = session?.question_started_at
    ? new Date(session.question_started_at).getTime()
    : null;

  const elapsedSeconds = startedAt
    ? Math.max(
        0,
        Math.floor((now - startedAt) / 1000)
      )
    : 0;

  const remainingSeconds = Math.max(
    0,
    timeLimit - elapsedSeconds
  );

  const timeExpired =
    Boolean(question) && remainingSeconds <= 0;

  const timerPercent = Math.min(
    100,
    (remainingSeconds / timeLimit) * 100
  );

  const options = Array.isArray(question?.options)
    ? question.options
    : [];

  // Submit the selected answer to Supabase.
  const submitAnswer = async () => {
    if (
      !question ||
      !user?.id ||
      selectedOption === null ||
      answerSubmitted ||
      submitting ||
      timeExpired
    ) {
      return;
    }

    setSubmitting(true);
    setError("");

    const { error: answerError } = await supabase.rpc(
      "submit_pr_answer",
      {
        p_competition_id: competitionId,
        p_question_id: question.id,
        p_selected_option: selectedOption,
      }
    );

    if (answerError) {
      setError(answerError.message);
      setSubmitting(false);
      return;
    }

    setAnswerSubmitted(true);
    setSubmitting(false);
  };

  // Reveal the answer and explanation after the timer expires.
  useEffect(() => {
    if (!question || !timeExpired || result) {
      return;
    }

    let cancelled = false;

    const revealResult = async () => {
      const { data, error: resultError } =
        await supabase.rpc("get_pr_question_result", {
          p_competition_id: competitionId,
          p_question_id: question.id,
        });

      if (cancelled) return;

      if (resultError) {
        setError(resultError.message);
        return;
      }

      const row = Array.isArray(data) ? data[0] : data;

      setResult(row || null);
    };

    revealResult();

    return () => {
      cancelled = true;
    };
  }, [
    competitionId,
    question?.id,
    timeExpired,
    result,
  ]);

  // Automatically advance after the timer and 5-second reveal period.
  useEffect(() => {
    if (
      !question ||
      !session ||
      session.game_status !== "playing" ||
      !timeExpired ||
      elapsedSeconds < timeLimit + 5
    ) {
      return;
    }

    let cancelled = false;

    const advance = async () => {
      const { error: advanceError } = await supabase.rpc(
        "advance_pr_game",
        {
          p_competition_id: competitionId,
        }
      );

      if (cancelled) return;

      if (advanceError) {
        console.error(
          "Automatic advance error:",
          advanceError.message
        );
        setError(advanceError.message);
        return;
      }

      await loadGame();
    };

    advance();

    return () => {
      cancelled = true;
    };
  }, [
    competitionId,
    question?.id,
    session?.game_status,
    session?.current_position,
    timeExpired,
    elapsedSeconds,
    timeLimit,
    loadGame,
  ]);

  // Loading screen.
  if (loading) {
    return (
      <main className="pr-game-page">
        <div className="pr-game-panel pr-game-center">
          <div className="pr-game-spinner" />
          <h2>Preparing your challenge...</h2>
          <p>Getting the competition ready.</p>
        </div>
      </main>
    );
  }

  // Initial load error.
  if (error && !session && !question) {
    return (
      <main className="pr-game-page">
        <div className="pr-game-panel">
          <p className="pr-game-error">{error}</p>

          <button
            className="pr-game-secondary"
            onClick={loadGame}
          >
            Try again
          </button>

          <button
            className="pr-game-secondary"
            onClick={onBack}
          >
            Back to Lobby
          </button>
        </div>
      </main>
    );
  }

  // Waiting for the Head to start the competition.
  if (!session || session.game_status === "waiting") {
    return (
      <main className="pr-game-page">
        <div className="pr-game-panel pr-game-center">
          <div className="pr-game-symbol">🎯</div>
          <p className="pr-game-eyebrow">PR MISSION</p>
          <h1>Get ready!</h1>
          <p>
            The Head will start the competition shortly.
          </p>

          <button
            className="pr-game-secondary"
            onClick={onBack}
          >
            Back to Lobby
          </button>
        </div>
      </main>
    );
  }

  // Competition completed.
  if (session.game_status === "completed") {
    return (
      <main className="pr-game-page">
        <div className="pr-game-panel pr-game-center">
          <div className="pr-game-symbol">🏆</div>
          <p className="pr-game-eyebrow">MISSION COMPLETE</p>
          <h1>That’s a wrap!</h1>
          <p>
            The competition has ended. Great work, team.
          </p>

          <button
            className="pr-game-primary"
            onClick={onBack}
          >
            Back to Lobby
          </button>
        </div>
      </main>
    );
  }

  // No question found for the current position.
  if (!question) {
    return (
      <main className="pr-game-page">
        <div className="pr-game-panel pr-game-center">
          <h2>Loading question...</h2>
          <p>
            If this takes too long, check the competition
            questions in Supabase.
          </p>

          {error && (
            <p className="pr-game-error">{error}</p>
          )}

          <button
            className="pr-game-secondary"
            onClick={loadGame}
          >
            Refresh
          </button>
        </div>
      </main>
    );
  }

  const optionLetters = ["A", "B", "C", "D", "E", "F"];

  const correctIndex =
    result?.correct_option === null ||
    result?.correct_option === undefined
      ? null
      : Number(result.correct_option);

  return (
    <main className="pr-game-page">
      <header className="pr-game-header">
        <button
          className="pr-game-back"
          onClick={onBack}
        >
          ← Lobby
        </button>

        <div className="pr-game-brand">
          <span className="pr-game-brand-icon">🎯</span>
          <span>
            PR <strong>MISSION</strong>
          </span>
        </div>

        <span className="pr-game-live">
          <span />
          LIVE
        </span>
      </header>

      <section className="pr-game-content">
        <div className="pr-game-meta">
          <span className="pr-game-eyebrow">
            TEAM CHALLENGE
          </span>

          <span className="pr-game-question-number">
            QUESTION {session.current_position}
          </span>
        </div>

        {/* Countdown timer */}
        <div
          className={`pr-game-timer ${
            remainingSeconds <= 10 ? "urgent" : ""
          }`}
        >
          <div className="pr-game-timer-top">
            <span>TIME REMAINING</span>

            <strong>
              {String(
                Math.floor(remainingSeconds / 60)
              ).padStart(2, "0")}
              :
              {String(remainingSeconds % 60).padStart(
                2,
                "0"
              )}
            </strong>
          </div>

          <div className="pr-game-timer-track">
            <div
              className="pr-game-timer-fill"
              style={{
                width: `${timerPercent}%`,
              }}
            />
          </div>
        </div>

        {/* Question */}
        <article className="pr-game-question-card">
          <span className="pr-game-card-label">
            YOUR MISSION
          </span>

          <h1>{question.prompt}</h1>

          <p className="pr-game-instruction">
            Choose the answer that best fits this specific
            opportunity.
          </p>
        </article>

        {/* Answer options */}
        <div className="pr-game-options">
          {options.map((option, index) => {
            const optionText =
              typeof option === "string"
                ? option
                : option?.text ??
                  option?.label ??
                  String(option);

            const isSelected =
              selectedOption === index;

            const isCorrect =
              timeExpired && correctIndex === index;

            const isWrong =
              timeExpired &&
              isSelected &&
              correctIndex !== null &&
              !isCorrect;

            return (
              <button
                key={`${question.id}-${index}`}
                type="button"
                className={[
                  "pr-game-option",
                  isSelected ? "selected" : "",
                  isCorrect ? "correct" : "",
                  isWrong ? "wrong" : "",
                  answerSubmitted || timeExpired
                    ? "locked"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => {
                  if (
                    !answerSubmitted &&
                    !timeExpired
                  ) {
                    setSelectedOption(index);
                  }
                }}
                disabled={
                  answerSubmitted || timeExpired
                }
              >
                <span className="pr-game-option-letter">
                  {optionLetters[index] || index + 1}
                </span>

                <span className="pr-game-option-text">
                  {optionText}
                </span>

                <span className="pr-game-option-mark">
                  {isCorrect
                    ? "✓"
                    : isSelected
                      ? "●"
                      : ""}
                </span>
              </button>
            );
          })}
        </div>

        {error && (
          <p className="pr-game-error">{error}</p>
        )}

        {/* Submit answer */}
        {!timeExpired && !answerSubmitted && (
          <button
            className="pr-game-primary pr-game-submit"
            onClick={submitAnswer}
            disabled={
              selectedOption === null || submitting
            }
          >
            {submitting
              ? "Submitting..."
              : "Submit Answer →"}
          </button>
        )}

        {/* Submitted status */}
        {answerSubmitted && !timeExpired && (
          <div className="pr-game-status">
            <span>✓</span>
            Answer submitted! Wait for the timer to finish.
          </div>
        )}

        {/* Waiting for the answer reveal */}
        {timeExpired && !result && (
          <div className="pr-game-status">
            Time is up! Revealing the answer...
          </div>
        )}

        {/* Correct answer and explanation */}
        {timeExpired && result && (
          <section className="pr-game-explanation">
            <div className="pr-game-explanation-title">
              <span>✦</span>
              ANSWER REVEALED
            </div>

            <p>
              <strong>Correct answer: </strong>

              {correctIndex !== null
                ? options[correctIndex] == null
                  ? `Option ${correctIndex + 1}`
                  : typeof options[correctIndex] ===
                      "string"
                    ? options[correctIndex]
                    : options[correctIndex]?.text ??
                      options[correctIndex]?.label ??
                      String(options[correctIndex])
                : "See the explanation below."}
            </p>

            {result.explanation && (
              <p>{result.explanation}</p>
            )}

            <span className="pr-game-next-note">
              Moving to the next question automatically...
            </span>
          </section>
        )}
      </section>
    </main>
  );
}
