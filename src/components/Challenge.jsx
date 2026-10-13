
import { useMemo, useState } from "react";
import { cases } from "../data/cases";
import { quizQuestions } from "../data/quizQuestions";
import "./Challenge.css";
import TeamMode from "./TeamMode";

const LEVELS = [
  {
    id: 1,
    title: "PR Rookie",
    subtitle: "Learn the basics",
    description: "Understand the difference between Sponsor, Partner and CSR.",
    icon: "🎯",
    color: "yellow",
  },
  {
    id: 2,
    title: "Company Detective",
    subtitle: "Research before you pitch",
    description: "Study the company, its goals and the opportunity.",
    icon: "🔎",
    color: "red",
  },
  {
    id: 3,
    title: "PR Strategist",
    subtitle: "Think beyond the brand",
    description: "Choose the relationship that best fits the situation.",
    icon: "🧠",
    color: "yellow",
  },
  {
    id: 4,
    title: "The Negotiator",
    subtitle: "Turn no into an opportunity",
    description: "Adapt your pitch when the first offer is rejected.",
    icon: "🤝",
    color: "red",
  },
];

const PITCH_OPTIONS = [
  {
    id: "Sponsor",
    title: "Visibility Package",
    description:
      "Request funding or in-kind support and offer defined promotional benefits.",
  },
  {
    id: "Partner",
    title: "Collaboration Proposal",
    description:
      "Request resources or expertise and offer active collaboration toward a shared goal.",
  },
  {
    id: "CSR",
    title: "Impact Proposal",
    description:
      "Request support for a social or environmental goal and offer measurable impact reporting.",
  },
];

const LEVEL_PASS_SCORE = 60;

function getLevelCases(levelId) {
  return cases.filter((item) => Number(item.level || 1) === levelId);
}

function getLevelQuizQuestions(levelId) {
  const questionsPerLevel = 5;
  const start = (levelId - 1) * questionsPerLevel;

  return quizQuestions
    .slice(start, start + questionsPerLevel)
    .map((question) => {
      // The quiz dataset uses a zero-based correctAnswer index.
      const correctAnswer =
        typeof question.correctAnswer === "number"
          ? question.options[question.correctAnswer]
          : question.correctAnswer;

      return {
        id: `mcq-${question.id}`,
        type: "mcq",
        level: levelId,
        title: question.question,
        question: question.question,
        company: "PR Knowledge",
        companyType: "PR Quiz",
        difficulty: "Knowledge Check",
        situation: question.question,
        options: question.options,
        correctAnswer,
        explanation: question.explanation,
        learningPoint: question.explanation,
      };
    });
}

function getIndividualQuestions(levelId) {
  const scenarioQuestions = getLevelCases(levelId).map((item) => ({
    ...item,
    type: "scenario",
  }));

  const knowledgeQuestions = getLevelQuizQuestions(levelId);

  // Interleave scenario questions and MCQs.
  // Five scenarios + five MCQs = ten questions per level.
  const combined = [];

  for (
    let i = 0;
    i < Math.max(scenarioQuestions.length, knowledgeQuestions.length);
    i++
  ) {
    if (scenarioQuestions[i]) combined.push(scenarioQuestions[i]);
    if (knowledgeQuestions[i]) combined.push(knowledgeQuestions[i]);
  }

  return combined;
}

function getPitchType(caseItem) {
  return caseItem.correctAnswer;
}

function getLevelStatus(levelId, unlockedLevel) {
  if (levelId < unlockedLevel) return "completed";
  if (levelId === unlockedLevel) return "unlocked";
  return "locked";
}

export default function Challenge() {
  const [mode, setMode] = useState("");
  const [selectedLevel, setSelectedLevel] = useState(1);

  const [teamNames, setTeamNames] = useState([
    "PR Legends",
    "Pitch Perfect",
  ]);

  const [teamCount, setTeamCount] = useState(2);
  const [activeTeam, setActiveTeam] = useState(0);

  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [completedLevels, setCompletedLevels] = useState([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [selectedPitch, setSelectedPitch] = useState("");
  const [phase, setPhase] = useState("setup");
  const [showCompanyIntel, setShowCompanyIntel] = useState(false);

  const [roundScore, setRoundScore] = useState(0);
  const [roundResults, setRoundResults] = useState([]);

  const [scores, setScores] = useState({});
  const [playerStats, setPlayerStats] = useState({});
  const [lastRound, setLastRound] = useState(null);

  const activeTeams = teamNames.slice(0, teamCount);

  const activeCases = useMemo(() => {
    if (mode === "teams") {
      // Teams Mode stays scenario-only.
      return cases.map((item) => ({
        ...item,
        type: "scenario",
      }));
    }

    if (mode === "solo") {
      return getIndividualQuestions(selectedLevel);
    }

    return [];
  }, [mode, selectedLevel]);

  const currentCase = activeCases[currentIndex];
  const isTeamsMode = mode === "teams";
  const isMCQ = currentCase?.type === "mcq";

  const currentTeamName = isTeamsMode
    ? activeTeams[activeTeam]
    : "Solo Player";

  const teamScore = scores[currentTeamName] || 0;

  const updateTeamScore = (teamName, points) => {
    setScores((previous) => ({
      ...previous,
      [teamName]: (previous[teamName] || 0) + points,
    }));
  };

  const updatePlayerStats = (teamName, correct) => {
    setPlayerStats((previous) => {
      const oldStats = previous[teamName] || {
        correct: 0,
        answered: 0,
      };

      return {
        ...previous,
        [teamName]: {
          correct: oldStats.correct + (correct ? 1 : 0),
          answered: oldStats.answered + 1,
        },
      };
    });
  };

  const startGame = (gameMode, level = 1) => {
    setMode(gameMode);
    setSelectedLevel(level);
    setCurrentIndex(0);
    setSelectedAnswer("");
    setSelectedPitch("");
    setRoundScore(0);
    setRoundResults([]);
    setLastRound(null);
    setActiveTeam(0);
    setShowCompanyIntel(false);
    setPhase("question");
  };

  const submitAnswer = () => {
    if (!selectedAnswer || !currentCase) return;

    if (isMCQ) {
      const answerCorrect =
        selectedAnswer === currentCase.correctAnswer;

      const pointsEarned = answerCorrect ? 100 : 0;

      const result = {
        caseId: currentCase.id,
        type: "mcq",
        company: currentCase.company,
        title: currentCase.title,
        selectedAnswer,
        correctAnswer: currentCase.correctAnswer,
        answerCorrect,
        pitchCorrect: null,
        pointsEarned,
      };

      updateTeamScore(currentTeamName, pointsEarned);
      updatePlayerStats(currentTeamName, answerCorrect);
      setRoundScore((previous) => previous + pointsEarned);
      setRoundResults((previous) => [...previous, result]);
      setPhase("feedback");
      return;
    }

    setPhase("pitch");
  };

  const submitPitch = () => {
    if (!selectedPitch || !currentCase) return;

    const answerCorrect =
      selectedAnswer === currentCase.correctAnswer;

    const pitchCorrect =
      selectedPitch === getPitchType(currentCase);

    const answerPoints = answerCorrect ? 70 : 0;
    const pitchPoints = pitchCorrect ? 30 : 0;
    const pointsEarned = answerPoints + pitchPoints;

    const result = {
      caseId: currentCase.id,
      type: "scenario",
      company: currentCase.company,
      title: currentCase.title || currentCase.company,
      selectedAnswer,
      correctAnswer: currentCase.correctAnswer,
      selectedPitch,
      answerCorrect,
      pitchCorrect,
      pointsEarned,
    };

    updateTeamScore(currentTeamName, pointsEarned);
    updatePlayerStats(currentTeamName, answerCorrect);
    setRoundScore((previous) => previous + pointsEarned);
    setRoundResults((previous) => [...previous, result]);
    setPhase("feedback");
  };

  const nextCase = () => {
    const isLastCase = currentIndex >= activeCases.length - 1;

    if (!isLastCase) {
      setCurrentIndex((previous) => previous + 1);
      setSelectedAnswer("");
      setSelectedPitch("");
      setShowCompanyIntel(false);
      setPhase("question");

      if (isTeamsMode) {
        setActiveTeam(
          (previous) => (previous + 1) % activeTeams.length
        );
      }

      return;
    }

    if (isTeamsMode) {
      setLastRound({
        mode: "teams",
        score: roundScore,
        results: roundResults,
      });
      setPhase("results");
      return;
    }

    const possiblePoints = activeCases.length * 100;
    const percentage = possiblePoints
      ? Math.round((roundScore / possiblePoints) * 100)
      : 0;

    const passed = percentage >= LEVEL_PASS_SCORE;

    if (passed) {
      setCompletedLevels((previous) =>
        previous.includes(selectedLevel)
          ? previous
          : [...previous, selectedLevel]
      );

      setUnlockedLevel((previous) =>
        Math.max(previous, Math.min(4, selectedLevel + 1))
      );
    }

    setLastRound({
      mode: "solo",
      level: selectedLevel,
      score: roundScore,
      percentage,
      passed,
      results: roundResults,
    });

    setPhase("results");
  };

  const resetToMenu = () => {
    setMode("");
    setPhase("setup");
    setCurrentIndex(0);
    setSelectedAnswer("");
    setSelectedPitch("");
    setRoundScore(0);
    setRoundResults([]);
    setLastRound(null);
    setShowCompanyIntel(false);
  };

  const restartGame = () => {
    if (mode === "teams") {
      startGame("teams");
    } else {
      startGame("solo", selectedLevel);
    }
  };

  const restartWithNextLevel = () => {
    const nextLevel = Math.min(4, selectedLevel + 1);
    startGame("solo", nextLevel);
  };
  if (mode === "teams") {
  return <TeamMode onBack={resetToMenu} />;
}

  if (phase === "setup") {
    return (
      <section className="pr-game">
        <div className="pr-game-heading">
          <span className="pr-eyebrow">ENACTUS • PR TRAINING</span>
          <h1>
            PR <span>MISSION</span>
          </h1>
          <p>
            Think like a PR professional. Build relationships.
            Make your move.
          </p>
        </div>

        <div className="pr-mode-grid">
          <button
            className={`pr-mode-card ${mode === "solo" ? "selected" : ""}`}
            onClick={() => setMode("solo")}
          >
            <span className="pr-mode-icon">🎯</span>
            <span className="pr-card-tag">INDIVIDUAL</span>
            <h2>Level Mode</h2>
            <p>
              Start as a PR Rookie, improve your strategy, and unlock
              harder missions.
            </p>
            <span className="pr-mode-cta">Explore levels →</span>
          </button>

          <button
            className={`pr-mode-card ${mode === "teams" ? "selected" : ""}`}
            onClick={() => setMode("teams")}
          >
            <span className="pr-mode-icon">⚡</span>
            <span className="pr-card-tag">TEAM BATTLE</span>
            <h2>Teams Mode</h2>
            <p>
              Compete with your PR team. Discuss the case, choose a
              strategy, and collect points.
            </p>
            <span className="pr-mode-cta">Build your teams →</span>
          </button>
        </div>

        {mode === "solo" && (
          <div className="pr-setup-panel">
            <div className="pr-section-heading">
              <span className="pr-eyebrow">YOUR JOURNEY</span>
              <h2>Choose your mission</h2>
            </div>

            <div className="pr-level-grid">
              {LEVELS.map((level) => {
                const status = getLevelStatus(
                  level.id,
                  unlockedLevel
                );

                return (
                  <button
                    key={level.id}
                    className={`pr-level-card ${level.color} ${status}`}
                    disabled={status === "locked"}
                    onClick={() => startGame("solo", level.id)}
                  >
                    <div className="pr-level-top">
                      <span>{level.icon}</span>
                      <span className="pr-level-number">
                        LEVEL {level.id}
                      </span>
                    </div>

                    <h3>{level.title}</h3>
                    <p>{level.description}</p>

                    <span className="pr-level-status">
                      {status === "completed"
                        ? "✓ COMPLETED"
                        : status === "locked"
                        ? "🔒 LOCKED"
                        : "START MISSION →"}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="pr-note">
              Each level contains 5 scenarios and 5 knowledge questions.
              Score at least {LEVEL_PASS_SCORE}% to unlock the next level.
            </p>
          </div>
        )}

        {mode === "teams" && (
          <div className="pr-setup-panel">
            <div className="pr-section-heading">
              <span className="pr-eyebrow">TEAM BATTLE</span>
              <h2>Who's competing today?</h2>
              <p>Choose two to four teams and give each team a name.</p>
            </div>

            <label className="pr-field-label">
              Number of teams
              <select
                value={teamCount}
                onChange={(event) =>
                  setTeamCount(Number(event.target.value))
                }
                className="pr-select"
              >
                <option value={2}>2 teams</option>
                <option value={3}>3 teams</option>
                <option value={4}>4 teams</option>
              </select>
            </label>

            <div className="pr-team-inputs">
              {teamNames.slice(0, teamCount).map((name, index) => (
                <label key={index} className="pr-team-field">
                  <span>TEAM {index + 1}</span>
                  <input
                    value={name}
                    maxLength={28}
                    onChange={(event) => {
                      const value = event.target.value;

                      setTeamNames((previous) =>
                        previous.map((oldName, i) =>
                          i === index ? value : oldName
                        )
                      );
                    }}
                    placeholder={`Team ${index + 1}`}
                  />
                </label>
              ))}
            </div>

            <button
              className="pr-primary-button"
              onClick={() => {
                const cleanedNames = teamNames.map(
                  (name, index) =>
                    name.trim() || `Team ${index + 1}`
                );

                setTeamNames(cleanedNames);
                setScores({});
                setPlayerStats({});
                startGame("teams");
              }}
            >
              START TEAM BATTLE <span>→</span>
            </button>
          </div>
        )}
      </section>
    );
  }

  if (phase === "results" && lastRound) {
    const sortedTeams = activeTeams
      .map((name) => ({
        name,
        score: scores[name] || 0,
      }))
      .sort((a, b) => b.score - a.score);

    return (
      <section className="pr-game">
        <div className="pr-results-panel">
          <span className="pr-eyebrow">MISSION COMPLETE</span>

          <div className="pr-results-icon">
            {lastRound.mode === "teams"
              ? "🏆"
              : lastRound.passed
              ? "🎉"
              : "💪"}
          </div>

          <h1>
            {lastRound.mode === "teams"
              ? "Team Battle Results"
              : lastRound.passed
              ? "Level Cleared!"
              : "Mission Completed"}
          </h1>

          {lastRound.mode === "solo" ? (
            <>
              <div className="pr-big-score">
                {lastRound.percentage}%
              </div>
              <p>
                You earned {lastRound.score} out of{" "}
                {lastRound.results.length * 100} points.
              </p>
              <p className="pr-result-message">
                {lastRound.passed
                  ? "Your strategy is getting stronger. Keep going!"
                  : `You need ${LEVEL_PASS_SCORE}% to unlock the next level. Review your decisions and try again.`}
              </p>
            </>
          ) : (
            <div className="pr-leaderboard">
              {sortedTeams.map((team, index) => (
                <div
                  className={`pr-leaderboard-row ${
                    index === 0 ? "winner" : ""
                  }`}
                  key={team.name}
                >
                  <span className="pr-rank">
                    {index === 0 ? "🏆" : `#${index + 1}`}
                  </span>
                  <strong>{team.name}</strong>
                  <span className="pr-team-score">
                    {team.score} pts
                  </span>
                </div>
              ))}

              <p className="pr-result-message">
                {sortedTeams[0]?.score === sortedTeams[1]?.score
                  ? "It's a tie! Run another round to decide the winner."
                  : `${sortedTeams[0]?.name} takes the lead!`}
              </p>
            </div>
          )}

          <div className="pr-results-breakdown">
            <h3>MISSION REVIEW</h3>
            {lastRound.results.map((result, index) => (
              <div
                className="pr-review-row"
                key={`${result.caseId}-${index}`}
              >
                <span>{result.answerCorrect ? "✓" : "○"}</span>
                <div>
                  <strong>
                    {index + 1}. {result.title}
                  </strong>
                  <p>
                    Your answer: {result.selectedAnswer}
                    {" • "}
                    Correct answer: {result.correctAnswer}
                  </p>
                  {result.type === "scenario" && (
                    <p>
                      Pitch: {result.selectedPitch || "—"}
                    </p>
                  )}
                </div>
                <b>+{result.pointsEarned}</b>
              </div>
            ))}
          </div>

          <div className="pr-results-actions">
            <button
              className="pr-secondary-button"
              onClick={resetToMenu}
            >
              BACK TO MENU
            </button>

            {lastRound.mode === "teams" ? (
              <button
                className="pr-primary-button"
                onClick={restartGame}
              >
                PLAY AGAIN →
              </button>
            ) : (
              <>
                <button
                  className="pr-secondary-button"
                  onClick={restartGame}
                >
                  TRY AGAIN
                </button>

                {lastRound.passed && selectedLevel < 4 && (
                  <button
                    className="pr-primary-button"
                    onClick={restartWithNextLevel}
                  >
                    NEXT LEVEL →
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (!currentCase) {
    return (
      <section className="pr-game">
        <p>
          No questions found for this level. Check your quizQuestions.js
          file and make sure it exports 20 questions.
        </p>
        <button
          className="pr-primary-button"
          onClick={resetToMenu}
        >
          BACK TO MENU
        </button>
      </section>
    );
  }

  const progress = Math.round(
    ((currentIndex + 1) / activeCases.length) * 100
  );

  const feedback =
    currentCase.answerFeedback?.[selectedAnswer] ||
    currentCase.explanation;

  const companyProfile = currentCase.companyProfile || {};
  const opportunity = currentCase.opportunity || {};

  return (
    <section className="pr-game">
      <div className="pr-play-topbar">
        <button
          className="pr-back-button"
          onClick={resetToMenu}
        >
          ← EXIT MISSION
        </button>

        <div className="pr-active-score">
          <span>{isTeamsMode ? "TEAM SCORE" : "YOUR SCORE"}</span>
          <strong>{teamScore} PTS</strong>
        </div>
      </div>

      <div className="pr-progress-header">
        <div>
          <span className="pr-eyebrow">
            {isTeamsMode
              ? "TEAM BATTLE"
              : `LEVEL ${selectedLevel}`}
          </span>
          <h2>
            {isTeamsMode
              ? currentTeamName
              : LEVELS[selectedLevel - 1].title}
          </h2>
        </div>

        <span className="pr-case-counter">
          {isMCQ ? "QUESTION" : "CASE"} {currentIndex + 1} /{" "}
          {activeCases.length}
        </span>
      </div>

      <div className="pr-progress-track">
        <div
          className="pr-progress-value"
          style={{ width: `${progress}%` }}
        />
      </div>

      {isTeamsMode && (
        <div className="pr-turn-banner">
          <span>⚡</span>
          <div>
            <strong>{currentTeamName}'s turn</strong>
            <p>
              Discuss the case with your team before submitting.
            </p>
          </div>
        </div>
      )}

      <article
        className={`pr-case-card ${isMCQ ? "pr-mcq-card" : ""}`}
      >
        <div className="pr-case-meta">
          <span>{currentCase.companyType}</span>
          <span>{currentCase.difficulty}</span>
          {isMCQ && <span>KNOWLEDGE CHECK</span>}
        </div>

        <h1>{currentCase.title || currentCase.company}</h1>

        {isMCQ ? (
          <div className="pr-situation-box">
            <span className="pr-eyebrow">YOUR QUESTION</span>
            <p>{currentCase.question}</p>
          </div>
        ) : (
          <>
            <div className="pr-company-banner">
              <div className="pr-company-avatar">
                {currentCase.company?.charAt(0) || "P"}
              </div>
              <div>
                <span>COMPANY / ORGANIZATION</span>
                <strong>{currentCase.company}</strong>
              </div>
              <span className="pr-local-tag">MINYA CASE</span>
            </div>

            <div className="pr-situation-box">
              <span className="pr-eyebrow">THE SITUATION</span>
              <p>{currentCase.situation}</p>
            </div>
          </>
        )}

        {phase === "question" && (
          <>
            {!isMCQ && (
              <>
                <button
                  className="pr-intel-toggle"
                  onClick={() =>
                    setShowCompanyIntel((previous) => !previous)
                  }
                >
                  {showCompanyIntel
                    ? "− Hide company intelligence"
                    : "+ Open company intelligence"}
                </button>

                {showCompanyIntel && (
                  <div className="pr-intel-panel">
                    <div>
                      <h3>Company Goals</h3>
                      <ul>
                        {(companyProfile.goals || []).map((goal) => (
                          <li key={goal}>{goal}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3>Target Audience</h3>
                      <p>
                        {companyProfile.targetAudience ||
                          "Not specified in this training case."}
                      </p>
                    </div>

                    <div>
                      <h3>Available Resources</h3>
                      <div className="pr-chip-list">
                        {(companyProfile.availableResources || []).map(
                          (resource) => (
                            <span key={resource}>{resource}</span>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <h3>Opportunity Goal</h3>
                      <p>
                        {opportunity.goal ||
                          "Review the situation to identify the goal."}
                      </p>
                    </div>

                    <div>
                      <h3>Collaboration History</h3>
                      <p>
                        {companyProfile.history ||
                          "No history supplied in this fictional case."}
                      </p>
                    </div>

                    <p className="pr-fiction-note">
                      Training scenario: verify real company information
                      before using it in an actual PR pitch.
                    </p>
                  </div>
                )}
              </>
            )}

            <div className="pr-question-area">
              <span className="pr-eyebrow">
                {isMCQ ? "TEST YOUR KNOWLEDGE" : "MAKE YOUR DECISION"}
              </span>

              <h2>
                {isMCQ
                  ? "Choose the correct answer."
                  : "What type of relationship fits this opportunity best?"}
              </h2>

              <p>
                {isMCQ
                  ? "Select one answer. You'll see the explanation after submitting."
                  : "Think about the goal, the exchange, and each side's contribution — not just the company name."}
              </p>

              <div className="pr-answer-grid">
                {currentCase.options.map((option, index) => (
                  <button
                    key={option}
                    className={`pr-answer-card ${
                      selectedAnswer === option ? "chosen" : ""
                    }`}
                    onClick={() => setSelectedAnswer(option)}
                  >
                    <span className="pr-answer-number">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <strong>{option}</strong>
                    <span className="pr-answer-mark">
                      {selectedAnswer === option ? "✓" : "+"}
                    </span>
                  </button>
                ))}
              </div>

              <button
                className="pr-primary-button pr-full-button"
                disabled={!selectedAnswer}
                onClick={submitAnswer}
              >
                {isMCQ ? "SUBMIT ANSWER →" : "CONFIRM DECISION →"}
              </button>
            </div>
          </>
        )}

        {phase === "pitch" && !isMCQ && (
          <div className="pr-question-area">
            <span className="pr-eyebrow">
              ROUND 2 / BUILD YOUR PITCH
            </span>
            <h2>What would your proposal focus on?</h2>
            <p>
              Your decision is only part of the job. Pick the pitch
              approach that best matches the relationship you chose.
            </p>

            <div className="pr-pitch-grid">
              {PITCH_OPTIONS.map((pitch) => (
                <button
                  key={pitch.id}
                  className={`pr-pitch-card ${
                    selectedPitch === pitch.id ? "chosen" : ""
                  }`}
                  onClick={() => setSelectedPitch(pitch.id)}
                >
                  <span className="pr-pitch-label">{pitch.id}</span>
                  <strong>{pitch.title}</strong>
                  <p>{pitch.description}</p>
                  <span>
                    {selectedPitch === pitch.id
                      ? "SELECTED ✓"
                      : "SELECT PITCH →"}
                  </span>
                </button>
              ))}
            </div>

            <div className="pr-pitch-hint">
              <strong>PR TIP</strong>
              <p>
                A strong pitch explains what you need, what the
                company gains, and how the outcome will be measured.
              </p>
            </div>

            <button
              className="pr-primary-button pr-full-button"
              disabled={!selectedPitch}
              onClick={submitPitch}
            >
              SUBMIT MY PITCH →
            </button>

            <button
              className="pr-text-button"
              onClick={() => setPhase("question")}
            >
              ← Change my decision
            </button>
          </div>
        )}

        {phase === "feedback" && (
          <div className="pr-feedback-panel">
            <div
              className={`pr-feedback-icon ${
                selectedAnswer === currentCase.correctAnswer
                  ? "correct"
                  : "review"
              }`}
            >
              {selectedAnswer === currentCase.correctAnswer
                ? "✓"
                : "!"}
            </div>

            <span className="pr-eyebrow">
              {isMCQ ? "ANSWER EXPLANATION" : "MISSION FEEDBACK"}
            </span>

            <h2>
              {selectedAnswer === currentCase.correctAnswer
                ? isMCQ
                  ? "Correct answer!"
                  : "Strong decision!"
                : "Let's review your answer"}
            </h2>

            <div className="pr-points-earned">
              +
              {isMCQ
                ? selectedAnswer === currentCase.correctAnswer
                  ? 100
                  : 0
                : (selectedAnswer === currentCase.correctAnswer
                    ? 70
                    : 0) +
                  (selectedPitch === currentCase.correctAnswer
                    ? 30
                    : 0)}{" "}
              POINTS
            </div>

            <p>{feedback}</p>

            <div className="pr-correct-answer">
              <span>CORRECT ANSWER</span>
              <strong>{currentCase.correctAnswer}</strong>
            </div>

            {!isMCQ && (
              <div className="pr-pitch-feedback">
                <h3>Your Pitch</h3>
                <p>
                  {selectedPitch === currentCase.correctAnswer
                    ? "Your pitch approach matches the primary relationship in this scenario."
                    : "Review whether your pitch matches the relationship you are proposing. A different arrangement could work if the agreement changes."}
                </p>

                <h3>Suggested Ask</h3>
                <p>{currentCase.ask}</p>

                <h3>Suggested Offer</h3>
                <p>{currentCase.offer}</p>
              </div>
            )}

            <div className="pr-learning-point">
              <span>💡 THE TAKEAWAY</span>
              <p>
                {currentCase.learningPoint || currentCase.explanation}
              </p>
            </div>

            <button
              className="pr-primary-button pr-full-button"
              onClick={nextCase}
            >
              {currentIndex < activeCases.length - 1
                ? "NEXT QUESTION →"
                : "VIEW RESULTS →"}
            </button>
          </div>
        )}
      </article>
    </section>
  );
}
