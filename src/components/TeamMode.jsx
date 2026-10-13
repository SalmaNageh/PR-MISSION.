
import { useEffect, useMemo, useState } from "react";
import { cases } from "../data/cases";
import "./TeamMode.css";

const MIN_TEAMS = 4;
const MAX_TEAMS = 8;
const MAX_TIME = 60;

const RELATIONSHIPS = [
  {
    id: "Sponsor",
    title: "Sponsor",
    description: "Funding or in-kind support in exchange for promotional benefits.",
  },
  {
    id: "Partner",
    title: "Partner",
    description: "Active collaboration with shared responsibilities and goals.",
  },
  {
    id: "CSR",
    title: "CSR",
    description: "Support focused on social or environmental impact.",
  },
];

const shuffle = (items) => {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
};

const normalize = (value) =>
  String(value ?? "").trim().toLowerCase();

function getCorrectAnswer(item) {
  return String(item?.correctAnswer ?? "").trim();
}

function getSpeedPoints(seconds) {
  return Math.max(
    0,
    Math.round(15 * (1 - Math.min(seconds, MAX_TIME) / MAX_TIME))
  );
}

function makeTeam(id) {
  return {
    id,
    name: "",
    score: 0,
    answers: [],
  };
}

export default function TeamMode({ onBack }) {
  const availableCases = useMemo(
    () =>
      cases.filter(
        (item) =>
          Array.isArray(item.options) &&
          item.options.length > 0 &&
          getCorrectAnswer(item)
      ),
    []
  );

  const [stage, setStage] = useState("registration");
  const [teamCount, setTeamCount] = useState(4);
  const [teams, setTeams] = useState(
    Array.from({ length: 4 }, (_, index) => makeTeam(index + 1))
  );

  const [setupError, setSetupError] = useState("");
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);

  const [answer, setAnswer] = useState("");
  const [pitch, setPitch] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(MAX_TIME);
  const [turnStartedAt, setTurnStartedAt] = useState(null);

  const [turnResults, setTurnResults] = useState([]);
  const [lastResult, setLastResult] = useState(null);
  const [finalWinner, setFinalWinner] = useState(null);

  const currentCase = availableCases[currentCaseIndex];
  const currentTeam = teams[currentTeamIndex];

  const isAnswering =
    stage === "question" || stage === "pitch";

  useEffect(() => {
    if (!isAnswering || !turnStartedAt) return undefined;

    const updateTimer = () => {
      const elapsed = Math.floor(
        (Date.now() - turnStartedAt) / 1000
      );

      const remaining = Math.max(0, MAX_TIME - elapsed);
      setSecondsLeft(remaining);

      if (remaining === 0) {
        setStage((previous) =>
          previous === "question" || previous === "pitch"
            ? "timeup"
            : previous
        );
      }
    };

    updateTimer();

    const timerId = window.setInterval(updateTimer, 250);

    return () => window.clearInterval(timerId);
  }, [isAnswering, turnStartedAt]);

  function changeTeamCount(count) {
    setTeamCount(count);
    setTeams((previous) =>
      Array.from({ length: count }, (_, index) => {
        const existing = previous[index];

        return existing
          ? { ...existing, id: index + 1 }
          : makeTeam(index + 1);
      })
    );
    setSetupError("");
  }

  function updateTeamName(teamId, name) {
    setTeams((previous) =>
      previous.map((team) =>
        team.id === teamId ? { ...team, name } : team
      )
    );
  }

  function registerTeams(event) {
    event.preventDefault();
    setSetupError("");

    const cleanedTeams = teams.map((team) => ({
      ...team,
      name: team.name.trim(),
    }));

    if (cleanedTeams.some((team) => !team.name)) {
      setSetupError("Please enter a name for every team.");
      return;
    }

    const uniqueNames = cleanedTeams.map((team) =>
      normalize(team.name)
    );

    if (new Set(uniqueNames).size !== uniqueNames.length) {
      setSetupError("Every team must have a unique name.");
      return;
    }

    if (availableCases.length === 0) {
      setSetupError(
        "No playable scenarios were found. Check the cases data and correctAnswer fields."
      );
      return;
    }

    setTeams(
      cleanedTeams.map((team) => ({
        ...team,
        score: 0,
        answers: [],
      }))
    );

    setCurrentCaseIndex(0);
    setCurrentTeamIndex(0);
    setTurnResults([]);
    setLastResult(null);
    setFinalWinner(null);

    startTurn();
  }

  function startTurn() {
    setAnswer("");
    setPitch("");
    setSecondsLeft(MAX_TIME);
    setTurnStartedAt(Date.now());
    setStage("question");
  }

  function selectAnswer(option) {
    if (stage !== "question") return;
    setAnswer(option);
  }

  function submitAnswer() {
    if (!answer || stage !== "question") return;
    setStage("pitch");
  }

  function submitPitch() {
    if (!pitch || stage !== "pitch" || !currentCase || !currentTeam) {
      return;
    }

    saveTurnResult(answer, pitch);
  }

  function saveTurnResult(selectedAnswer, selectedPitch) {
    if (!currentCase || !currentTeam) return;

    const elapsed = Math.min(
      MAX_TIME,
      Math.max(
        0,
        Math.floor(
          (Date.now() - (turnStartedAt ?? Date.now())) / 1000
        )
      )
    );

    const correct =
      normalize(selectedAnswer) ===
      normalize(getCorrectAnswer(currentCase));

    const pitchCorrect =
      normalize(selectedPitch) ===
      normalize(getCorrectAnswer(currentCase));

    const decisionPoints = correct ? 60 : 0;
    const pitchPoints = pitchCorrect ? 25 : 0;
    const speedPoints = getSpeedPoints(elapsed);
    const earned = decisionPoints + pitchPoints + speedPoints;

    const result = {
      teamId: currentTeam.id,
      teamName: currentTeam.name,
      caseId: currentCase.id,
      caseTitle:
        currentCase.title ||
        currentCase.company ||
        `Case ${currentCaseIndex + 1}`,
      selectedAnswer,
      selectedPitch,
      correct,
      pitchCorrect,
      elapsed,
      decisionPoints,
      pitchPoints,
      speedPoints,
      earned,
    };

    setLastResult(result);

    setTeams((previous) =>
      previous.map((team) =>
        team.id === currentTeam.id
          ? {
              ...team,
              score: team.score + earned,
              answers: [...team.answers, result],
            }
          : team
      )
    );

    setTurnResults((previous) => [...previous, result]);
    setStage("turnResult");
  }

  function handleTimeUp() {
    if (stage === "timeup") {
      saveTurnResult(answer, pitch);
    }
  }

  function nextTurn() {
    const nextTeamIndex = currentTeamIndex + 1;

    if (nextTeamIndex < teams.length) {
      setCurrentTeamIndex(nextTeamIndex);
      startTurn();
      return;
    }

    setStage("roundResults");
  }

  function nextRound() {
    const nextCaseIndex = currentCaseIndex + 1;

    if (nextCaseIndex >= availableCases.length) {
      const ranked = [...teams].sort(
        (a, b) => b.score - a.score
      );

      setFinalWinner(ranked[0] ?? null);
      setStage("finalResults");
      return;
    }

    setCurrentCaseIndex(nextCaseIndex);
    setCurrentTeamIndex(0);
    startTurn();
  }

  function startNewBattle() {
    setStage("registration");
    setTeamCount(4);
    setTeams(
      Array.from({ length: 4 }, (_, index) => makeTeam(index + 1))
    );
    setSetupError("");
    setCurrentCaseIndex(0);
    setCurrentTeamIndex(0);
    setTurnResults([]);
    setLastResult(null);
    setFinalWinner(null);
  }

  const sortedTeams = [...teams].sort(
    (a, b) => b.score - a.score
  );

  const progress =
    availableCases.length > 0
      ? ((currentCaseIndex + 1) / availableCases.length) * 100
      : 0;

  return (
    <main className="pr-game pr-team-mode">
      <header className="pr-play-topbar">
        <button
          type="button"
          className="pr-back-button"
          onClick={onBack}
        >
          ← Back
        </button>

        <div className="pr-team-brand">
          <span className="pr-team-brand-mark">PR</span>
          <span>
            MISSION{" "}
            <span className="pr-team-brand-accent">/ TEAM BATTLE</span>
          </span>
        </div>

        {teams.length > 0 && (
          <div className="pr-active-score">
            {teams.length} TEAMS
          </div>
        )}
      </header>

      <section className="pr-team-shell">
        {stage === "registration" && (
          <form className="pr-team-panel" onSubmit={registerTeams}>
            <p className="pr-eyebrow">TEAM MODE / SETUP</p>
            <h1>Build the <span>battle.</span></h1>
            <p className="pr-team-subtitle">
              Register your teams, give each one a unique name, and
              compete across realistic PR challenges. No member
              registration required.
            </p>

            <div className="pr-team-count-row">
              <label className="pr-field-label" htmlFor="team-count">
                NUMBER OF TEAMS
              </label>

              <select
                id="team-count"
                className="pr-select"
                value={teamCount}
                onChange={(event) =>
                  changeTeamCount(Number(event.target.value))
                }
              >
                {Array.from(
                  { length: MAX_TEAMS - MIN_TEAMS + 1 },
                  (_, index) => MIN_TEAMS + index
                ).map((number) => (
                  <option key={number} value={number}>
                    {number} teams
                  </option>
                ))}
              </select>
            </div>

            <div className="pr-team-section-heading">
              <div>
                <h2>Team registration</h2>
                <p>Enter the names that will appear throughout the battle.</p>
              </div>
              <span className="pr-team-count-badge">
                {teamCount} teams
              </span>
            </div>

            <div className="pr-team-participant-list">
              {teams.map((team, index) => (
                <div className="pr-team-participant-row" key={team.id}>
                  <span className="pr-team-player-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <input
                    className="pr-team-input"
                    value={team.name}
                    onChange={(event) =>
                      updateTeamName(team.id, event.target.value)
                    }
                    placeholder={`Team ${index + 1} name`}
                    aria-label={`Team ${index + 1} name`}
                    maxLength={40}
                  />
                </div>
              ))}
            </div>

            {setupError && (
              <p className="pr-team-error" role="alert">
                {setupError}
              </p>
            )}

            <div className="pr-team-rules">
              <span>01 / Name your teams</span>
              <span>02 / Compete in each case</span>
              <span>03 / Earn points & win</span>
            </div>

            <button
              className="pr-primary-button pr-full-button"
              type="submit"
            >
              Start team battle →
            </button>
          </form>
        )}

        {isAnswering && currentCase && currentTeam && (
          <>
            <div className="pr-progress-header">
              <span className="pr-case-counter">
                CASE {currentCaseIndex + 1} / {availableCases.length}
              </span>
              <span className="pr-case-counter">
                TEAM {currentTeamIndex + 1} / {teams.length}
              </span>
            </div>

            <div className="pr-progress-track">
              <div
                className="pr-progress-value"
                style={{ width: `${progress}%` }}
              />
            </div>

            <section className="pr-team-turn-banner">
              <div>
                <p className="pr-eyebrow">IT'S YOUR TURN</p>
                <h2>{currentTeam.name}</h2>
                <p>Make the decision. Earn the points.</p>
              </div>

              <div
                className={`pr-team-clock ${
                  secondsLeft <= 10 ? "is-urgent" : ""
                }`}
              >
                <span className="pr-team-clock-label">TIME LEFT</span>
                <strong>00:{String(secondsLeft).padStart(2, "0")}</strong>
              </div>
            </section>

            <article className="pr-case-card">
              <div className="pr-case-meta">
                <span>{currentCase.companyType || "PR CHALLENGE"}</span>
                <span>{currentCase.difficulty || "CHALLENGE"}</span>
              </div>

              <h2>
                {currentCase.title || currentCase.company || "PR Mission"}
              </h2>

              {currentCase.company && currentCase.title && (
                <p className="pr-team-company-name">
                  {currentCase.company}
                </p>
              )}

              <p className="pr-team-situation">
                {currentCase.situation || currentCase.description}
              </p>

              {currentCase.ask && (
                <div className="pr-team-opportunity">
                  <span>THE OPPORTUNITY</span>
                  <p>{currentCase.ask}</p>
                </div>
              )}
            </article>

            {stage === "question" && (
              <section className="pr-question-area">
                <div className="pr-team-question-heading">
                  <p className="pr-eyebrow">ROUND DECISION / +60 PTS</p>
                  <h2>What relationship makes sense?</h2>
                  <p>Select the most suitable relationship for this opportunity.</p>
                </div>

                <div className="pr-answer-grid">
                  {currentCase.options.map((option, index) => (
                    <button
                      type="button"
                      key={`${option}-${index}`}
                      className={`pr-answer-card ${
                        answer === option ? "is-selected" : ""
                      }`}
                      onClick={() => selectAnswer(option)}
                    >
                      <span className="pr-answer-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{option}</span>
                      {answer === option && (
                        <span className="pr-answer-mark">✓</span>
                      )}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="pr-primary-button pr-full-button"
                  disabled={!answer}
                  onClick={submitAnswer}
                >
                  Confirm relationship →
                </button>
              </section>
            )}

            {stage === "pitch" && (
              <section className="pr-question-area">
                <div className="pr-team-question-heading">
                  <p className="pr-eyebrow">ROUND PITCH / +25 PTS</p>
                  <h2>Choose your pitch strategy.</h2>
                  <p>
                    Select the relationship your team would pitch to this
                    company for this opportunity.
                  </p>
                </div>

                <div className="pr-pitch-grid">
                  {RELATIONSHIPS.map((option) => (
                    <button
                      type="button"
                      key={option.id}
                      className={`pr-pitch-card ${
                        pitch === option.id ? "is-selected" : ""
                      }`}
                      onClick={() => setPitch(option.id)}
                    >
                      <span className="pr-pitch-label">{option.id}</span>
                      <strong>{option.title}</strong>
                      <span>{option.description}</span>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="pr-primary-button pr-full-button"
                  disabled={!pitch}
                  onClick={submitPitch}
                >
                  Submit final answer →
                </button>
              </section>
            )}
          </>
        )}

        {stage === "timeup" && (
          <section className="pr-team-panel pr-team-centered">
            <p className="pr-eyebrow">TIME'S UP</p>
            <h1>Clock <span>ended.</span></h1>
            <p className="pr-team-subtitle">
              Time is over. Unselected answers receive zero points.
            </p>
            <button
              type="button"
              className="pr-primary-button"
              onClick={handleTimeUp}
            >
              Record score & continue →
            </button>
          </section>
        )}

        {stage === "turnResult" && lastResult && (
          <section className="pr-team-panel">
            <p className="pr-eyebrow">TURN RESULT</p>
            <h1>{lastResult.teamName} <span>scored.</span></h1>

            <div className="pr-team-score-total">
              <span>POINTS EARNED</span>
              <strong>+{lastResult.earned}</strong>
              <small>out of 100 points</small>
            </div>

            <div className="pr-team-score-breakdown">
              <div>
                <span>Relationship answer</span>
                <strong>{lastResult.decisionPoints}/60</strong>
              </div>
              <div>
                <span>Pitch selection</span>
                <strong>{lastResult.pitchPoints}/25</strong>
              </div>
              <div>
                <span>Speed bonus</span>
                <strong>{lastResult.speedPoints}/15</strong>
              </div>
            </div>

            <p className="pr-team-feedback">
              {lastResult.correct
                ? "Correct relationship decision."
                : `Correct relationship: ${getCorrectAnswer(currentCase)}.`}
            </p>

            {currentCase?.explanation && (
              <div className="pr-team-explanation">
                <span>WHY?</span>
                <p>{currentCase.explanation}</p>
              </div>
            )}

            <button
              type="button"
              className="pr-primary-button pr-full-button"
              onClick={nextTurn}
            >
              {currentTeamIndex + 1 < teams.length
                ? "Next team's turn →"
                : "View round results →"}
            </button>
          </section>
        )}

        {stage === "roundResults" && (
          <section className="pr-team-panel">
            <p className="pr-eyebrow">
              CASE {currentCaseIndex + 1} COMPLETE
            </p>
            <h1>Team <span>standings.</span></h1>
            <p className="pr-team-subtitle">
              Every team has answered the same case. Here is the current ranking.
            </p>

            <div className="pr-team-leaderboard">
              {[...teams]
                .sort((a, b) => b.score - a.score)
                .map((team, index) => (
                  <div className="pr-team-leaderboard-row" key={team.id}>
                    <span className="pr-team-rank">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="pr-team-rank-info">
                      <strong>{team.name}</strong>
                      <span>
                        {team.answers.length} answers submitted
                      </span>
                    </div>
                    <strong className="pr-team-rank-score">
                      {team.score} pts
                    </strong>
                  </div>
                ))}
            </div>

            <button
              type="button"
              className="pr-primary-button pr-full-button"
              onClick={nextRound}
            >
              {currentCaseIndex + 1 < availableCases.length
                ? "Start next case →"
                : "Reveal final winner →"}
            </button>
          </section>
        )}

        {stage === "finalResults" && (
          <section className="pr-team-panel">
            <p className="pr-eyebrow">PR MISSION / BATTLE COMPLETE</p>
            <h1>We have a <span>winner.</span></h1>

            {finalWinner && (
              <div className="pr-team-winner-card">
                <span className="pr-team-winner-icon">♛</span>
                <span className="pr-eyebrow">CHAMPIONS</span>
                <h2>{finalWinner.name}</h2>
                <strong>{finalWinner.score} POINTS</strong>
                <p>
                  Congratulations to the team that earned the highest total
                  score across the competition.
                </p>
              </div>
            )}

            <h2 className="pr-team-final-heading">Final leaderboard</h2>

            <div className="pr-team-leaderboard">
              {sortedTeams.map((team, index) => (
                <div className="pr-team-leaderboard-row" key={team.id}>
                  <span className="pr-team-rank">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="pr-team-rank-info">
                    <strong>{team.name}</strong>
                    <span>{team.answers.length} answers submitted</span>
                  </div>
                  <strong className="pr-team-rank-score">
                    {team.score} pts
                  </strong>
                </div>
              ))}
            </div>

            <div className="pr-team-final-actions">
              <button
                type="button"
                className="pr-primary-button"
                onClick={startNewBattle}
              >
                Start a new battle
              </button>
              <button
                type="button"
                className="pr-secondary-button"
                onClick={onBack}
              >
                Back to menu
              </button>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
