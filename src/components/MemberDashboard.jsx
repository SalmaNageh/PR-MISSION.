
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import './MemberDashboard.css';
import PRGame from './PRGame';

function MemberDashboard({ user, onLogout }) {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState(null);
  const [joinedCompetition, setJoinedCompetition] = useState(null);
  const [team, setTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [lobbyLoading, setLobbyLoading] = useState(false);
  const [error, setError] = useState('');
  const [lobbyError, setLobbyError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [gameMode, setGameMode] = useState(false);

  const displayName =
    user?.user_metadata?.display_name ||
    user?.email ||
    'PR Mission Player';

  // 1. Load available live competitions.
  const loadCompetitions = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const { data, error: queryError } = await supabase
        .from('competitions')
        .select(
          'id, name, status, created_at, starts_at, started_at, ended_at, completed_at'
        )
        .eq('status', 'live')
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;

      setCompetitions(data || []);
    } catch (err) {
      console.error('Load competitions error:', err);
      setError(err.message || 'Could not load available missions.');
      setCompetitions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Restore the latest competition the user joined.
  const restoreJoinedCompetition = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data: participations, error: participationError } =
        await supabase
          .from('competition_participants')
          .select('competition_id, joined_at')
          .eq('user_id', user.id)
          .order('joined_at', { ascending: false })
          .limit(1);

      if (participationError) throw participationError;

      const participation = participations?.[0];

      if (!participation) return;

      const { data: competition, error: competitionError } =
        await supabase
          .from('competitions')
          .select(
            'id, name, status, created_at, starts_at, started_at, ended_at, completed_at'
          )
          .eq('id', participation.competition_id)
          .maybeSingle();

      if (competitionError) throw competitionError;

      if (competition) {
        setJoinedCompetition(competition);
      }
    } catch (err) {
      console.error('Restore joined competition error:', err);
      setError(`Could not restore your previous session: ${err.message}`);
    }
  }, [user?.id]);

  // 3. Initialize dashboard.
  useEffect(() => {
    loadCompetitions();
    restoreJoinedCompetition();
  }, [loadCompetitions, restoreJoinedCompetition]);

  // 4. Load the user's team, roster and competition status.
  const loadLobbyData = useCallback(
    async (competitionId, silent = false) => {
      if (!competitionId || !user?.id) return;

      if (!silent) {
        setLobbyLoading(true);
        setLobbyError('');
      } else {
        setRefreshing(true);
      }

      try {
        const { data: memberships, error: membershipError } =
          await supabase
            .from('team_members')
            .select(
              'id, team_id, user_id, display_name, role, created_at'
            )
            .eq('user_id', user.id);

        if (membershipError) throw membershipError;

        const membershipList = memberships || [];

        let foundTeam = null;
        let foundMembership = null;
        let foundMembers = [];

        const teamIds = membershipList
          .map((membership) => membership.team_id)
          .filter(Boolean);

        if (teamIds.length > 0) {
          const { data: teamRows, error: teamsError } =
            await supabase
              .from('teams')
              .select('id, competition_id, name, created_at')
              .eq('competition_id', competitionId)
              .in('id', teamIds);

          if (teamsError) throw teamsError;

          foundTeam = teamRows?.[0] || null;

          if (foundTeam) {
            foundMembership =
              membershipList.find(
                (membership) => membership.team_id === foundTeam.id
              ) || null;

            const { data: roster, error: rosterError } =
              await supabase
                .from('team_members')
                .select(
                  'id, team_id, user_id, display_name, role, created_at'
                )
                .eq('team_id', foundTeam.id)
                .order('created_at', { ascending: true });

            if (rosterError) throw rosterError;

            foundMembers = roster || [];
          }
        }

        const { data: competition, error: competitionError } =
          await supabase
            .from('competitions')
            .select(
              'id, name, status, starts_at, started_at, ended_at, completed_at'
            )
            .eq('id', competitionId)
            .maybeSingle();

        if (competitionError) throw competitionError;

        if (competition) {
          setJoinedCompetition((previous) => ({
            ...(previous || {}),
            ...competition,
          }));
        }

        setTeam(
          foundTeam && foundMembership
            ? {
                ...foundTeam,
                myRole: foundMembership.role,
              }
            : null
        );

        setTeamMembers(foundMembers);
        setLobbyError('');
      } catch (err) {
        console.error('Load lobby error:', err);

        if (!silent) {
          setLobbyError(
            err.message || 'Could not load your team information.'
          );
        }
      } finally {
        setLobbyLoading(false);
        setRefreshing(false);
      }
    },
    [user?.id]
  );

  // 5. Register the user for a competition.
  const joinCompetition = async (competition) => {
    if (!user?.id || joiningId) return;

    setJoiningId(competition.id);
    setError('');

    try {
      const { data: currentCompetition, error: checkError } =
        await supabase
          .from('competitions')
          .select(
            'id, name, status, created_at, starts_at, started_at, ended_at, completed_at'
          )
          .eq('id', competition.id)
          .eq('status', 'live')
          .maybeSingle();

      if (checkError) throw checkError;

      if (!currentCompetition) {
        await loadCompetitions();

        throw new Error(
          'This mission is no longer open. Refresh the list and try another mission.'
        );
      }

      const { error: joinError } = await supabase
        .from('competition_participants')
        .upsert(
          {
            competition_id: currentCompetition.id,
            user_id: user.id,
          },
          {
            onConflict: 'competition_id,user_id',
            ignoreDuplicates: true,
          }
        );

      if (joinError) throw joinError;

      setJoinedCompetition(currentCompetition);
      setTeam(null);
      setTeamMembers([]);
      setLobbyError('');
      setGameMode(false);

      await loadLobbyData(currentCompetition.id);
    } catch (err) {
      console.error('Join competition error:', err);
      setError(`Could not join mission: ${err.message}`);
    } finally {
      setJoiningId(null);
    }
  };

  // 6. Keep the lobby synchronized.
  useEffect(() => {
    if (!joinedCompetition?.id || !user?.id) return;

    const competitionId = joinedCompetition.id;

    loadLobbyData(competitionId, true);

    const channel = supabase
      .channel(`member-lobby-${competitionId}-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'competitions',
          filter: `id=eq.${competitionId}`,
        },
        () => loadLobbyData(competitionId, true)
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_members',
          filter: `user_id=eq.${user.id}`,
        },
        () => loadLobbyData(competitionId, true)
      )
      .subscribe();

    const refreshInterval = window.setInterval(() => {
      loadLobbyData(competitionId, true);
    }, 5000);

    return () => {
      window.clearInterval(refreshInterval);
      supabase.removeChannel(channel);
    };
  }, [joinedCompetition?.id, user?.id, loadLobbyData]);

  // 7. Return to missions list.
  const goBackToMissions = () => {
    setGameMode(false);
    setJoinedCompetition(null);
    setTeam(null);
    setTeamMembers([]);
    setLobbyError('');
    setError('');
    loadCompetitions();
  };

  const challengeStarted = Boolean(joinedCompetition?.started_at);

  const challengeCompleted = Boolean(
    joinedCompetition?.completed_at ||
      joinedCompetition?.ended_at ||
      joinedCompetition?.status === 'completed'
  );

  // =========================
  // GAME SCREEN
  // =========================
  if (joinedCompetition && gameMode) {
    return (
      <PRGame
        competition={joinedCompetition}
        user={user}
        onBack={() => {
          setGameMode(false);
          loadLobbyData(joinedCompetition.id, true);
        }}
      />
    );
  }

  // =========================
  // MISSION LOBBY
  // =========================
  if (joinedCompetition) {
    return (
      <main className="player-page">
        <header className="player-topbar">
          <div className="player-brand">
            <span>PR</span> MISSION
          </div>

          <button className="player-logout" onClick={onLogout}>
            Log Out
          </button>
        </header>

        <section className="player-content">
          <div className="player-welcome">
            <p className="player-eyebrow">MISSION LOBBY</p>
            <h1>{joinedCompetition.name}</h1>
            <p>
              Your registration is confirmed. Your lobby will update
              when your team is assigned and the mission status changes.
            </p>
          </div>

          {lobbyError && (
            <div className="player-state player-error" role="alert">
              <h3>Couldn’t refresh lobby</h3>
              <p>{lobbyError}</p>

              <button
                className="player-primary-button"
                onClick={() => loadLobbyData(joinedCompetition.id)}
              >
                Try Again
              </button>
            </div>
          )}

          <div className="player-empty">
            <div className="player-empty-icon">
              {challengeCompleted ? '✓' : team ? '👥' : '✓'}
            </div>

            <p className="player-eyebrow">
              {challengeCompleted
                ? 'MISSION COMPLETED'
                : challengeStarted
                  ? 'CHALLENGE STARTED'
                  : 'REGISTRATION CONFIRMED'}
            </p>

            <h3>
              {challengeCompleted
                ? 'This mission has ended.'
                : team
                  ? `Welcome to ${team.name}!`
                  : 'You’re in the lobby!'}
            </h3>

            {lobbyLoading && !team ? (
              <p>Checking your team assignment...</p>
            ) : team ? (
              <>
                <p>
                  Your team has been organized. Here are your team details.
                </p>

                <div className="player-profile">
                  <div className="player-avatar">👥</div>

                  <div>
                    <p className="player-profile-label">YOUR TEAM</p>
                    <h3>{team.name}</h3>
                    <p>
                      Your role:{' '}
                      <strong>
                        {team.myRole === 'team_leader'
                          ? 'Team Leader'
                          : 'Member'}
                      </strong>
                    </p>
                  </div>

                  <span className="player-status">
                    <span className="player-status-dot" />
                    Assigned
                  </span>
                </div>

                <div className="player-section-heading">
                  <div>
                    <p className="player-eyebrow">TEAM ROSTER</p>
                    <h2>Your Teammates</h2>
                  </div>

                  <span className="player-count">
                    {teamMembers.length} members
                  </span>
                </div>

                <div className="player-competition-grid">
                  {teamMembers.map((member) => (
                    <article
                      className="player-competition-card"
                      key={member.id}
                    >
                      <div className="player-card-top">
                        <span className="player-live-badge">
                          {member.role === 'team_leader'
                            ? '★ TEAM LEADER'
                            : 'TEAM MEMBER'}
                        </span>
                      </div>

                      <h3>
                        {member.display_name || 'PR Mission Player'}
                      </h3>

                      <p>
                        {member.user_id === user.id
                          ? 'That’s you.'
                          : 'Your teammate'}
                      </p>
                    </article>
                  ))}
                </div>

                <div className="player-waiting">
                  <span className="player-status-dot" />
                  {challengeCompleted
                    ? 'Waiting for the results'
                    : challengeStarted
                      ? 'The challenge has started.'
                      : 'Team assigned — waiting for the Head of PR to start'}
                </div>
              </>
            ) : (
              <>
                <p>
                  {challengeCompleted
                    ? 'This mission has ended.'
                    : challengeStarted
                      ? 'The challenge has started. If you have not been assigned to a team, contact the Head of PR.'
                      : 'Your registration is saved. Wait for the Head of PR to organize the teams. This lobby refreshes automatically.'}
                </p>

                <div className="player-waiting">
                  <span className="player-status-dot" />
                  {refreshing
                    ? 'Refreshing lobby...'
                    : challengeCompleted
                      ? 'Mission ended'
                      : challengeStarted
                        ? 'Challenge started'
                        : 'Waiting for team assignment'}
                </div>
              </>
            )}

            <button
              className="player-primary-button"
              onClick={() => loadLobbyData(joinedCompetition.id)}
              disabled={lobbyLoading}
            >
              {lobbyLoading ? 'Refreshing...' : 'Refresh Lobby'}
            </button>

            {challengeStarted && !challengeCompleted && (
              <button
                className="player-primary-button"
                onClick={() => setGameMode(true)}
              >
                Enter Game →
              </button>
            )}

            <button
              className="player-primary-button"
              onClick={goBackToMissions}
            >
              Back to Missions
            </button>
          </div>

          <footer className="player-footer">
            <span>PR MISSION</span>
            <span>Think together. Decide smarter.</span>
          </footer>
        </section>
      </main>
    );
  }

  // =========================
  // MEMBER DASHBOARD
  // =========================
  return (
    <main className="player-page">
      <header className="player-topbar">
        <div className="player-brand">
          <span>PR</span> MISSION
        </div>

        <button className="player-logout" onClick={onLogout}>
          Log Out
        </button>
      </header>

      <section className="player-content">
        <div className="player-welcome">
          <p className="player-eyebrow">PLAYER WORKSPACE</p>
          <h1>Your next mission starts here.</h1>
          <p>
            Welcome back, {displayName}. Get ready to think,
            discuss, and make your team’s decision.
          </p>
        </div>

        <div className="player-profile">
          <div className="player-avatar">
            {displayName.charAt(0).toUpperCase()}
          </div>

          <div>
            <p className="player-profile-label">SIGNED IN AS</p>
            <h3>
              {user?.user_metadata?.display_name || 'PR Mission Player'}
            </h3>
            <p>{user?.email}</p>
          </div>

          <span className="player-status">
            <span className="player-status-dot" />
            Online
          </span>
        </div>

        <div className="player-section-heading">
          <div>
            <p className="player-eyebrow">LIVE EXPERIENCE</p>
            <h2>Available Missions</h2>
          </div>

          <span className="player-count">
            {competitions.length} available
          </span>
        </div>

        {loading ? (
          <div className="player-state">
            <div className="player-spinner" />
            <p>Finding available missions...</p>
          </div>
        ) : error && competitions.length === 0 ? (
          <div className="player-state player-error">
            <h3>Unable to load missions</h3>
            <p>{error}</p>

            <button
              className="player-primary-button"
              onClick={async () => {
                await loadCompetitions();
                await restoreJoinedCompetition();
              }}
            >
              Try Again
            </button>
          </div>
        ) : competitions.length === 0 ? (
          <div className="player-empty">
            <div className="player-empty-icon">✦</div>

            <p className="player-eyebrow">NO LIVE SESSION</p>
            <h3>The room is quiet for now.</h3>

            <p>
              There are no live competitions right now. When your Head
              of PR opens a live mission, it will appear here.
            </p>

            {error && <p role="alert">{error}</p>}

            <button
              className="player-primary-button"
              onClick={loadCompetitions}
            >
              Refresh Missions
            </button>

            <div className="player-waiting">
              <span className="player-status-dot" />
              Waiting for the next mission
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="player-state player-error" role="alert">
                <p>{error}</p>
              </div>
            )}

            <div className="player-competition-grid">
              {competitions.map((competition) => (
                <article
                  className="player-competition-card"
                  key={competition.id}
                >
                  <div className="player-card-top">
                    <span className="player-live-badge">
                      <span className="player-status-dot" />
                      LIVE
                    </span>

                    <span className="player-card-symbol">✦</span>
                  </div>

                  <h3>{competition.name}</h3>

                  <p>
                    A PR challenge is available. Join the session and
                    get ready to work with your team.
                  </p>

                  <div className="player-card-footer">
                    <span>Team challenge</span>
                    <span>
                      {competition.starts_at
                        ? new Date(competition.starts_at).toLocaleString()
                        : 'Live now'}
                    </span>
                  </div>

                  <button
                    className="player-primary-button"
                    disabled={joiningId !== null}
                    onClick={() => joinCompetition(competition)}
                  >
                    {joiningId === competition.id
                      ? 'Joining...'
                      : 'Join Competition →'}
                  </button>
                </article>
              ))}
            </div>
          </>
        )}

        <footer className="player-footer">
          <span>PR MISSION</span>
          <span>Think together. Decide smarter.</span>
        </footer>
      </section>
    </main>
  );
}

export default MemberDashboard;
