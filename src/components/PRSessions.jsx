
import { useState } from "react";
import { prSessions } from "../data/prSessions";
import "./PRSessions.css";

export default function PRSessions() {
  const [activeSession, setActiveSession] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const openQuiz = (session) => {
    setActiveSession(session);
    setAnswers({});
    setSubmitted(false);
  };

  const closeQuiz = () => {
    setActiveSession(null);
    setAnswers({});
    setSubmitted(false);
  };

  const score = activeSession
    ? activeSession.quiz.reduce(
        (total, question) =>
          total +
          (answers[question.id] === question.correctAnswer ? 1 : 0),
        0
      )
    : 0;

  return (
    <section id="sessions" className="pr-sessions-section">
      <div className="pr-sessions-heading">
        <p className="eyebrow">YOUR LEARNING PATH</p>

        <h2>
          Explore PR <span>Sessions.</span>
        </h2>

        <p>
          Learn the concepts, review each session's material, and
          test your understanding with a dedicated quiz.
        </p>
      </div>

     
<div className="pr-sessions-grid">
  {prSessions.map((session) => (
    <article className="pr-session-card" key={session.id}>

      {session.id === "pr-basics" && (
        <div className="pr-session-preview">
          <img
            src="/pdfs/pr-beyond-the-basics-preview.png"
            alt="PR Beyond the Basics — First Slide"
            loading="lazy"
          />
        </div>
      )}

      {session.id === "pr-unlocked" && (
        <div className="pr-session-preview">
          <img
            src="/pdfs/pr-unlocked-preview.png"
            alt="PR UNLOCKED — Cover Slide"
            loading="lazy"
          />
        </div>

      )}

          {session.id === "money-behind-the-scene" && (
              <div className="pr-session-preview">
                  <img
                      src="/pdfs/money-behind-the-scene-preview.png"
                      alt="Money Behind The Scene — Cover"
                      loading="lazy"
                  />
              </div>
          )}


      {/* سيبي باقي كود الكارد عندك هنا */}

          <div className="pr-session-card-top">
              <span className="pr-session-number">
                  {session.number}
              </span>

              <span className="pr-session-category">
                  {session.category}
              </span>
          </div>

          <div className="pr-session-meta">
              <span>{session.level}</span>
              <span>{session.duration}</span>
          </div>

          <h3>{session.title}</h3>

          <p className="pr-session-description">
              {session.description}
          </p>

          <ul className="pr-session-topics">
              {session.topics.map((topic) => (
                  <li key={topic}>{topic}</li>
              ))}
          </ul>

      {/* سيبي باقي كود الكارت والأزرار عندك زي ما هو */}


                <div className="pr-session-footer">
                    <button
                        type="button"
                        className="pr-session-pdf"
                        onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();

                            const pdfUrl = new URL(
                                session.pdfUrl,
                                window.location.origin
                            ).href;

                            window.open(pdfUrl, "_blank");
                        }}
                    >
                        View PDF ↗
                    </button>

                    <button
                        type="button"
                        className="pr-session-quiz-button"
                        onClick={() => openQuiz(session)}
                    >
                        Start Quiz →
                    </button>
                </div>

          </article>
        ))}
      </div>

      {activeSession && (
        <div
          className="pr-quiz-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeQuiz();
            }
          }}
        >
          <section
            className="pr-quiz-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pr-quiz-title"
          >
            <div className="pr-quiz-topbar">
              <div>
                <p className="eyebrow">
                  SESSION {activeSession.number} / KNOWLEDGE CHECK
                </p>

                <h2 id="pr-quiz-title">
                  {activeSession.title}
                </h2>
              </div>

              <button
                type="button"
                className="pr-quiz-close"
                onClick={closeQuiz}
                aria-label="Close quiz"
              >
                ×
              </button>
            </div>

            {!submitted ? (
              <>
                <p className="pr-quiz-instructions">
                  Answer every question, then submit to review your result.
                </p>

                {activeSession.quiz.map((question, questionIndex) => (
                  <fieldset
                    className="pr-quiz-question"
                    key={question.id}
                  >
                    <legend>
                      {questionIndex + 1}. {question.question}
                    </legend>

                    {question.options.map((option, optionIndex) => (
                      <label
                        className={`pr-quiz-option ${
                          answers[question.id] === optionIndex
                            ? "is-selected"
                            : ""
                        }`}
                        key={option}
                      >
                        <input
                          type="radio"
                          name={question.id}
                          checked={
                            answers[question.id] === optionIndex
                          }
                          onChange={() =>
                            setAnswers((previous) => ({
                              ...previous,
                              [question.id]: optionIndex,
                            }))
                          }
                        />

                        <span>{option}</span>
                      </label>
                    ))}
                  </fieldset>
                ))}

                <button
                  type="button"
                  className="pr-session-quiz-button pr-quiz-submit"
                  disabled={
                    Object.keys(answers).length !==
                    activeSession.quiz.length
                  }
                  onClick={() => setSubmitted(true)}
                >
                  Submit Quiz →
                </button>
              </>
            ) : (
              <div className="pr-quiz-results">
                <p className="eyebrow">QUIZ COMPLETED</p>

                <div className="pr-quiz-score">
                  {score} / {activeSession.quiz.length}
                </div>

                <p>
                  {score === activeSession.quiz.length
                    ? "Excellent work! You answered every question correctly."
                    : "Review the explanations below, then try again to improve your score."}
                </p>

                {activeSession.quiz.map((question, index) => {
                  const isCorrect =
                    answers[question.id] === question.correctAnswer;

                  return (
                    <div
                      className="pr-quiz-review"
                      key={question.id}
                    >
                      <strong>
                        {index + 1}.{" "}
                        {isCorrect
                          ? "Correct"
                          : "Review this answer"}
                      </strong>

                      <p>{question.question}</p>

                      <p>
                        <b>Correct answer:</b>{" "}
                        {question.options[question.correctAnswer]}
                      </p>

                      <p>{question.explanation}</p>
                    </div>
                  );
                })}

                <div className="pr-quiz-result-actions">
                  <button
                    type="button"
                    className="pr-session-quiz-button"
                    onClick={() => {
                      setAnswers({});
                      setSubmitted(false);
                    }}
                  >
                    Try Again
                  </button>

                  <button
                    type="button"
                    className="pr-session-pdf"
                    onClick={closeQuiz}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </section>
  );
}
