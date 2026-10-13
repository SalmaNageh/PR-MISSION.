
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import './Auth.css';
import './HeadDashboard.css';
import TeamsManagement from './TeamsManagement';
import QuestionManager from './QuestionManager';

function HeadDashboard({ user, onLogout, onBack }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompetitionId, setSelectedCompetitionId] = useState('');

  const [stats, setStats] = useState({
    competitions: 0,
    teams: 0,
    members: 0,
    missions: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [competitionName, setCompetitionName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [
        competitionsResult,
        teamsResult,
        membersResult,
        missionsResult,
      ] = await Promise.all([
        supabase
          .from('competitions')
          .select('*')
          .order('created_at', { ascending: false }),

        supabase
          .from('teams')
          .select('*', { count: 'exact', head: true }),

        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true }),

        supabase
          .from('missions')
          .select('*', { count: 'exact', head: true }),
      ]);

      if (competitionsResult.error) throw competitionsResult.error;
      if (teamsResult.error) throw teamsResult.error;
      if (membersResult.error) throw membersResult.error;
      if (missionsResult.error) throw missionsResult.error;

      const competitionData = competitionsResult.data ?? [];

      setCompetitions(competitionData);
      setSelectedCompetitionId((currentId) => {
        if (
          currentId &&
          competitionData.some((competition) => competition.id === currentId)
        ) {
          return currentId;
        }

        return competitionData[0]?.id || '';
      });
      setStats({
        competitions: competitionData.length,
        teams: teamsResult.count ?? 0,
        members: membersResult.count ?? 0,
        missions: missionsResult.count ?? 0,
      });
    } catch (err) {
      console.error('Dashboard loading error:', err);
      setError(
        err.message ||
          'Could not load dashboard data. Check your Supabase permissions.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const createCompetition = async (event) => {
    event.preventDefault();

    const name = competitionName.trim();

    if (!name) {
      setError('Please enter a competition name.');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const { data, error: createError } = await supabase
        .from('competitions')
        .insert({
          name,
          status: 'draft',
          created_by: user.id,
        })
        .select()
        .single();

      if (createError) throw createError;
      setSelectedCompetitionId(data.id);

      setCompetitionName('');
      setShowCreateForm(false);
      setMessage('Competition created successfully!');
      setActiveTab('competitions');
      setActiveTab('missions');

      await loadDashboard();
    } catch (err) {
      console.error('Create competition error:', err);
      setError(err.message || 'Could not create competition.');
    } finally {
      setSaving(false);
    }
  };

  // Use the RPC to start the actual game session.
  const startCompetition = async (competition) => {
    if (competition.started_at) {
      setError('This competition has already started.');
      return;
    }

    const confirmed = window.confirm(
      `Start "${competition.name}" now? Make sure its questions are ready.`
    );

    if (!confirmed) return;

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const { error: startError } = await supabase.rpc(
        'start_pr_game',
        {
          p_competition_id: competition.id,
        }
      );

      if (startError) throw startError;

      setMessage(
        `"${competition.name}" has started successfully!`
      );

      await loadDashboard();
    } catch (err) {
      console.error('Start game error:', err);
      setError(
        err.message ||
          'Could not start the game. Check that questions exist and your account is Head of PR.'
      );
    } finally {
      setSaving(false);
    }
  };

  // Status changes are for setup/management, not for starting the game.
  const updateCompetitionStatus = async (competition, status) => {
    setError('');
    setMessage('');

    if (competition.started_at || competition.status === 'completed') {
      setError(
        'The status of a started or completed competition cannot be changed here.'
      );
      return;
    }

    if (status === 'live') {
      setError(
        'Use Start Game to launch the competition and initialize its game session.'
      );
      return;
    }

    setSaving(true);

    try {
      const { data, error: updateError } = await supabase
        .from('competitions')
        .update({ status })
        .eq('id', competition.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setCompetitions((previous) =>
        previous.map((item) =>
          item.id === competition.id ? data : item
        )
      );

      setMessage(`Competition status updated to ${status}.`);
    } catch (err) {
      console.error('Update competition error:', err);
      setError(err.message || 'Could not update competition status.');
    } finally {
      setSaving(false);
    }
  };

  const navigation = [
    { id: 'overview', icon: '◫', label: 'Overview' },
    { id: 'competitions', icon: '🏆', label: 'Competitions' },
    { id: 'teams', icon: '♟', label: 'Teams' },
    { id: 'members', icon: '♙', label: 'Members' },
    { id: 'missions', icon: '◎', label: 'Missions' },
    { id: 'scores', icon: '↗', label: 'Scores & Rankings' },
  ];

  const statCards = [
    { label: 'Competitions', value: stats.competitions, icon: '🏆', color: 'yellow' },
    { label: 'Teams', value: stats.teams, icon: '👥', color: 'red' },
    { label: 'Registered Members', value: stats.members, icon: '♙', color: 'blue' },
    { label: 'Missions', value: stats.missions, icon: '◎', color: 'green' },
  ];

  const tabDescriptions = {
    overview: 'Your PR competition control center.',
    competitions: 'Create and manage PR competitions.',
    teams: 'View and organize competition teams.',
    members: 'Monitor registered platform members.',
    missions: 'Manage challenges and mission rounds.',
    scores: 'Track team performance and rankings.',
  };

  return (
    <main className="hp-dashboard">
      <aside className="hp-sidebar">
        <button
          className="hp-brand"
          type="button"
          onClick={onBack}
          title="Back to home"
        >
          <span className="hp-brand-mark">PR</span>
          <span>
            MISSION
            <small>HEAD OF PR</small>
          </span>
        </button>

        <div className="hp-nav-label">WORKSPACE</div>

        <nav className="hp-navigation">
          {navigation.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`hp-nav-item ${
                activeTab === item.id ? 'active' : ''
              }`}
              onClick={() => {
                setActiveTab(item.id);
                setError('');
                setMessage('');
                setShowCreateForm(false);
              }}
            >
              <span className="hp-nav-icon">{item.icon}</span>
              {item.label}
              {activeTab === item.id && (
                <span className="hp-nav-indicator" />
              )}
            </button>
          ))}
        </nav>

        <div className="hp-sidebar-bottom">
          <div className="hp-user-avatar">
            {(user.email?.[0] || 'H').toUpperCase()}
          </div>

          <div className="hp-user-info">
            <strong>Head of PR</strong>
            <span title={user.email}>{user.email}</span>
          </div>

          <button
            className="hp-logout-icon"
            type="button"
            onClick={onLogout}
            title="Log out"
          >
            ↗
          </button>
        </div>
      </aside>

      <section className="hp-main">
        <header className="hp-topbar">
          <div>
            <div className="hp-breadcrumb">
              WORKSPACE <span>/</span> {activeTab.toUpperCase()}
            </div>
            <h1>
              {navigation.find((item) => item.id === activeTab)?.label}
            </h1>
          </div>

          <div className="hp-top-actions">
            <span className="hp-live-indicator">
              <span /> ADMIN ACCESS
            </span>

            <button
              type="button"
              className="hp-refresh-button"
              onClick={loadDashboard}
              disabled={loading}
              title="Refresh dashboard"
            >
              ↻ Refresh
            </button>
          </div>
        </header>

        <div className="hp-content">
          <section className="hp-welcome">
            <div className="hp-welcome-copy">
              <span className="hp-eyebrow">PR MISSION / MANAGEMENT</span>
              <h2>
                Make every <span>connection</span> count.
              </h2>
              <p>
                {tabDescriptions[activeTab]}
                <br />
                Manage your competitions and track your community.
              </p>
            </div>

            <div className="hp-welcome-symbol">
              PR<span>.</span>
            </div>
          </section>

          {error && (
            <div className="hp-alert hp-alert-error">
              <span>!</span>
              <p>{error}</p>
              <button
                type="button"
                onClick={() => setError('')}
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}

          {message && (
            <div className="hp-alert hp-alert-success">
              <span>✓</span>
              <p>{message}</p>
              <button
                type="button"
                onClick={() => setMessage('')}
                aria-label="Dismiss message"
              >
                ×
              </button>
            </div>
          )}

          {activeTab === 'overview' && (
            <>
              <div className="hp-section-heading">
                <div>
                  <span className="hp-section-kicker">AT A GLANCE</span>
                  <h3>Workspace overview</h3>
                </div>
                <span className="hp-updated-label">Live database counts</span>
              </div>

              <div className="hp-stats-grid">
                {statCards.map((card) => (
                  <article className="hp-stat-card" key={card.label}>
                    <div className="hp-stat-top">
                      <span>{card.label}</span>
                      <span className={`hp-stat-icon ${card.color}`}>
                        {card.icon}
                      </span>
                    </div>
                    <div className="hp-stat-number">
                      {loading ? '—' : card.value}
                    </div>
                    <div className="hp-stat-bottom">
                      <span className="hp-stat-dot" />
                      Database total
                    </div>
                  </article>
                ))}
              </div>

              <div className="hp-section-heading hp-competition-heading">
                <div>
                  <span className="hp-section-kicker">YOUR PROGRAMS</span>
                  <h3>Recent competitions</h3>
                </div>
                <button
                  type="button"
                  className="hp-text-button"
                  onClick={() => setActiveTab('competitions')}
                >
                  View all →
                </button>
              </div>

              <CompetitionList
                competitions={competitions.slice(0, 3)}
                loading={loading}
                saving={saving}
                onStatusChange={updateCompetitionStatus}
                onStart={startCompetition}
              />

              <div className="hp-quick-actions">
                <div>
                  <span className="hp-section-kicker">GET STARTED</span>
                  <h3>Ready for the next challenge?</h3>
                  <p>
                    Create a competition to start organizing your PR mission.
                  </p>
                </div>
                <button
                  type="button"
                  className="hp-primary-button"
                  onClick={() => {
                    setActiveTab('competitions');
                    setShowCreateForm(true);
                  }}
                >
                  + New Competition
                </button>
              </div>
            </>
          )}

          {activeTab === 'competitions' && (
            <>
              <div className="hp-section-heading">
                <div>
                  <span className="hp-section-kicker">COMPETITION CONTROL</span>
                  <h3>Manage competitions</h3>
                </div>
                <button
                  type="button"
                  className="hp-primary-button"
                  onClick={() => setShowCreateForm((value) => !value)}
                >
                  {showCreateForm ? 'Cancel' : '+ Create Competition'}
                </button>
              </div>

              {showCreateForm && (
                <form className="hp-create-form" onSubmit={createCompetition}>
                  <div>
                    <span className="hp-section-kicker">NEW COMPETITION</span>
                    <h3>Create a competition</h3>
                    <p>
                      Give your competition a name. You can organize its teams
                      and questions next.
                    </p>
                  </div>

                  <label className="hp-form-field">
                    Competition name
                    <input
                      value={competitionName}
                      onChange={(event) =>
                        setCompetitionName(event.target.value)
                      }
                      placeholder="e.g. PR Mission — Round 1"
                      maxLength={120}
                      required
                    />
                  </label>

                  <button
                    type="submit"
                    className="hp-primary-button"
                    disabled={saving}
                  >
                    {saving ? 'Creating...' : 'Create Competition →'}
                  </button>
                </form>
              )}

              <CompetitionList
                competitions={competitions}
                loading={loading}
                saving={saving}
                onStatusChange={updateCompetitionStatus}
                onStart={startCompetition}
              />
            </>
          )}

          {activeTab === 'teams' && (
            <TeamsManagement competitions={competitions} />
          )}

          {activeTab === 'members' && (
            <FeaturePanel
              icon="♙"
              title="Registered Members"
              description="Monitor registered members on the platform."
              count={stats.members}
              countLabel="registered profiles"
              onRefresh={loadDashboard}
            />
          )}

{activeTab === 'missions' && (
  <section className="hp-feature-panel">
    <span className="hp-section-kicker">QUESTION CONTROL</span>
    <h3>Manage Competition Questions</h3>
    <p>
      Select a competition to add, edit, and manage its questions.
    </p>

    {loading ? (
      <p>Loading competitions...</p>
    ) : competitions.length === 0 ? (
      <div>
        <p>No competitions found. Create a competition first.</p>
        <button
          type="button"
          className="hp-primary-button"
          onClick={() => {
            setActiveTab('competitions');
            setShowCreateForm(true);
          }}
        >
          + Create Competition
        </button>
      </div>
    ) : (
      <>
        <label className="hp-form-field">
          Select Competition
          <select
            value={selectedCompetitionId}
            onChange={(event) =>
              setSelectedCompetitionId(event.target.value)
            }
          >
            <option value="">Choose a competition...</option>
            {competitions.map((competition) => (
              <option key={competition.id} value={competition.id}>
                {competition.name}
              </option>
            ))}
          </select>
        </label>

        {selectedCompetitionId ? (
          <QuestionManager
            key={selectedCompetitionId}
            competitionId={selectedCompetitionId}
          />
        ) : (
          <p>Please select a competition above.</p>
        )}
      </>
    )}
  </section>
)}
          {activeTab === 'scores' && (
            <FeaturePanel
              icon="↗"
              title="Scores & Rankings"
              description="Connect team scores and submissions to calculate competition rankings."
              count={null}
              countLabel="Ranking interface not connected yet"
              onRefresh={loadDashboard}
            />
          )}

          <footer className="hp-footer">
            <span>PR MISSION</span>
            <span>Learn. Decide. Build Relationships.</span>
          </footer>
        </div>
      </section>
    </main>
  );
}

function CompetitionList({
  competitions,
  loading,
  saving,
  onStatusChange,
  onStart,
}) {
  if (loading) {
    return (
      <div className="hp-empty-state">
        <div className="hp-loading-spinner" />
        <p>Loading competitions...</p>
      </div>
    );
  }

  if (competitions.length === 0) {
    return (
      <div className="hp-empty-state">
        <div className="hp-empty-icon">🏆</div>
        <h3>No competitions yet</h3>
        <p>Create your first competition to get started.</p>
      </div>
    );
  }

  return (
    <div className="hp-competition-list">
      {competitions.map((competition) => {
        const started = Boolean(competition.started_at);
        const completed = competition.status === 'completed';

        return (
          <article className="hp-competition-card" key={competition.id}>
            <div className="hp-competition-icon">🏆</div>

            <div className="hp-competition-details">
              <h4>{competition.name}</h4>
              <p>
                Created{' '}
                {competition.created_at
                  ? new Date(competition.created_at).toLocaleDateString()
                  : '—'}
              </p>
              {started && (
                <p>
                  Started{' '}
                  {new Date(competition.started_at).toLocaleString()}
                </p>
              )}
            </div>

            <span
              className={`hp-status hp-status-${String(
                competition.status || 'draft'
              )
                .toLowerCase()
                .replace(/[^a-z0-9_-]/g, '-')}`}
            >
              {competition.status || 'draft'}
            </span>

            {!started && !completed && (
              <label className="hp-status-control">
                <span>Setup status</span>
                <select
                  value={competition.status || 'draft'}
                  disabled={saving}
                  onChange={(event) =>
                    onStatusChange(competition, event.target.value)
                  }
                >
                  <option value="draft">Draft</option>
                </select>
              </label>
            )}

            {started ? (
              <span className="hp-updated-label">Game started</span>
            ) : completed ? (
              <span className="hp-updated-label">Completed</span>
            ) : (
              <button
                type="button"
                className="hp-primary-button"
                disabled={saving}
                onClick={() => onStart(competition)}
              >
                {saving ? 'Starting...' : '▶ Start Game'}
              </button>
            )}
          </article>
        );
      })}
    </div>
  );
}

function FeaturePanel({
  icon,
  title,
  description,
  count,
  countLabel,
  onRefresh,
}) {
  return (
    <section className="hp-feature-panel">
      <div className="hp-feature-icon">{icon}</div>
      <span className="hp-section-kicker">WORKSPACE MODULE</span>
      <h3>{title}</h3>
      <p>{description}</p>

      <div className="hp-feature-count">
        <strong>{count === null ? '—' : count}</strong>
        <span>{countLabel}</span>
      </div>

      <button
        type="button"
        className="hp-secondary-button"
        onClick={onRefresh}
      >
        ↻ Refresh data
      </button>
    </section>
  );
}

export default HeadDashboard;
