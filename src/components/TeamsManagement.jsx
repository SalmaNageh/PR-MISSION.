
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import './TeamsManagement.css';

export default function TeamsManagement() {
  const [competitions, setCompetitions] = useState([]);
  const [competitionId, setCompetitionId] = useState('');

  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [participants, setParticipants] = useState([]);

  const [teamName, setTeamName] = useState('');
  const [manualMemberName, setManualMemberName] = useState('');
  const [selectedProfiles, setSelectedProfiles] = useState({});
  const [memberRoles, setMemberRoles] = useState({});
  const [teamSize, setTeamSize] = useState(4);
  const [expandedTeam, setExpandedTeam] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoAssigning, setAutoAssigning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const selectedCompetition = competitions.find(
    (competition) => competition.id === competitionId
  );

  const loadCompetitions = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from('competitions')
      .select('id, name, status, created_at')
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;

    setCompetitions(data || []);
  }, []);

  const loadProfiles = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('user_id, display_name, email')
      .order('display_name', { ascending: true });

    if (fetchError) throw fetchError;

    setProfiles(data || []);
  }, []);

  const loadTeams = useCallback(async () => {
    let teamsQuery = supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: true });

    if (competitionId) {
      teamsQuery = teamsQuery.eq('competition_id', competitionId);
    }

    const { data: teamData, error: teamsError } = await teamsQuery;

    if (teamsError) throw teamsError;

    const loadedTeams = teamData || [];
    setTeams(loadedTeams);

    const teamIds = loadedTeams.map((team) => team.id);

    if (teamIds.length === 0) {
      setMembers([]);
      return;
    }

    const { data: memberData, error: membersError } = await supabase
      .from('team_members')
      .select('*')
      .in('team_id', teamIds)
      .order('created_at', { ascending: true });

    if (membersError) throw membersError;

    setMembers(memberData || []);
  }, [competitionId]);

  const loadParticipants = useCallback(async () => {
    if (!competitionId) {
      setParticipants([]);
      return;
    }

    const { data, error: participantsError } = await supabase
      .from('competition_participants')
      .select('id, competition_id, user_id, joined_at')
      .eq('competition_id', competitionId)
      .order('joined_at', { ascending: true });

    if (participantsError) throw participantsError;

    setParticipants(data || []);
  }, [competitionId]);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      await Promise.all([
        loadCompetitions(),
        loadProfiles(),
        loadTeams(),
        loadParticipants(),
      ]);
    } catch (err) {
      console.error('Teams Management loading error:', err);
      setError(err.message || 'Could not load team management data.');
    } finally {
      setLoading(false);
    }
  }, [loadCompetitions, loadProfiles, loadTeams, loadParticipants]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const competitionTeams = teams.filter(
    (team) => !competitionId || team.competition_id === competitionId
  );

  const assignedUserIds = new Set(
    members
      .filter((member) => member.user_id)
      .map((member) => member.user_id)
  );

  const unassignedParticipants = participants.filter(
    (participant) => !assignedUserIds.has(participant.user_id)
  );

  const assignedParticipantsCount = participants.length -
    unassignedParticipants.length;

  const getTeamMembers = (teamId) =>
    members.filter((member) => member.team_id === teamId);

  const getTeamLeader = (teamId) =>
    getTeamMembers(teamId).find(
      (member) => member.role === 'team_leader'
    );

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleCompetitionChange = (event) => {
    setCompetitionId(event.target.value);
    setExpandedTeam(null);
    setSelectedProfiles({});
    clearMessages();
  };

  const handleCreateTeam = async (event) => {
    event.preventDefault();

    if (!competitionId) {
      setError('Please select a competition first.');
      return;
    }

    if (!teamName.trim()) {
      setError('Enter a team name.');
      return;
    }

    if (saving || autoAssigning) return;

    setSaving(true);
    clearMessages();

    try {
      const { error: insertError } = await supabase
        .from('teams')
        .insert({
          competition_id: competitionId,
          name: teamName.trim(),
        });

      if (insertError) throw insertError;

      setTeamName('');
      setSuccess('Team created successfully.');
      await loadTeams();
    } catch (err) {
      console.error('Create team error:', err);
      setError(err.message || 'Could not create team.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddManualMember = async (event, team) => {
    event.preventDefault();

    const displayName = (manualMemberName[team.id] || '').trim();

    if (!displayName) {
      setError('Enter the member name.');
      return;
    }

    if (saving || autoAssigning) return;

    const teamMembers = getTeamMembers(team.id);
    const role = memberRoles[team.id] || 'member';

    if (
      role === 'team_leader' &&
      teamMembers.some((member) => member.role === 'team_leader')
    ) {
      setError('This team already has a leader.');
      return;
    }

    setSaving(true);
    clearMessages();

    try {
      const { error: insertError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: null,
          display_name: displayName,
          role,
        });

      if (insertError) throw insertError;

      setManualMemberName((previous) => ({
        ...previous,
        [team.id]: '',
      }));

      setSuccess(`${displayName} added to ${team.name}.`);
      await loadTeams();
    } catch (err) {
      console.error('Add manual member error:', err);
      setError(err.message || 'Could not add member.');
    } finally {
      setSaving(false);
    }
  };

  const handleAssignProfile = async (team) => {
    const userId = selectedProfiles[team.id];

    if (!userId) {
      setError('Choose a registered member first.');
      return;
    }

    if (saving || autoAssigning) return;

    const profile = profiles.find(
      (item) => item.user_id === userId
    );

    if (!profile) {
      setError('Selected profile was not found.');
      return;
    }

    const existingMember = members.find(
      (member) => member.user_id === userId
    );

    if (existingMember) {
      setError('This account is already assigned to a team.');
      return;
    }

    const role = memberRoles[team.id] || 'member';

    if (
      role === 'team_leader' &&
      getTeamMembers(team.id).some(
        (member) => member.role === 'team_leader'
      )
    ) {
      setError('This team already has a leader.');
      return;
    }

    setSaving(true);
    clearMessages();

    try {
      const displayName =
        profile.display_name?.trim() ||
        profile.email?.trim() ||
        'Member';

      const { error: insertError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: profile.user_id,
          display_name: displayName,
          role,
        });

      if (insertError) throw insertError;

      setSelectedProfiles((previous) => ({
        ...previous,
        [team.id]: '',
      }));

      setSuccess(`${displayName} assigned to ${team.name}.`);

      await loadTeams();
    } catch (err) {
      console.error('Assign registered member error:', err);
      setError(err.message || 'Could not assign member.');
    } finally {
      setSaving(false);
    }
  };

  const handleAutoAssign = async () => {
    if (!competitionId) {
      setError('Select a specific competition first.');
      return;
    }

    if (saving || autoAssigning) return;

    if (unassignedParticipants.length === 0) {
      setError('There are no unassigned registered participants.');
      return;
    }

    const confirmed = window.confirm(
      `Automatically assign ${unassignedParticipants.length} unassigned ` +
      `participants to balanced teams of approximately ${teamSize} members? ` +
      'Existing teams and assignments will be preserved.'
    );

    if (!confirmed) return;

    setAutoAssigning(true);
    clearMessages();

    try {
      const { data, error: rpcError } = await supabase.rpc(
        'auto_assign_competition_teams',
        {
          p_competition_id: competitionId,
          p_team_size: Number(teamSize),
        }
      );

      if (rpcError) throw rpcError;

      if (!data?.success) {
        throw new Error(
          data?.message || 'Automatic team assignment failed.'
        );
      }

      setSuccess(
        `${data.teams_created} new teams created. ` +
        `${data.members_assigned} participants assigned.`
      );

      await Promise.all([loadTeams(), loadParticipants()]);
    } catch (err) {
      console.error('Auto-assign error:', err);
      setError(err.message || 'Could not assign teams.');
    } finally {
      setAutoAssigning(false);
    }
  };

  if (loading) {
    return (
      <section className="teams-management">
        <div className="tm-loading">Loading teams and members...</div>
      </section>
    );
  }

  return (
    <section className="teams-management">
      <header className="tm-header">
        <div>
          <h2>Teams Management</h2>
          <p>Organize teams, assign members, and select team leaders.</p>
        </div>

        <button
          type="button"
          className="tm-refresh-btn"
          onClick={refreshAll}
          disabled={saving || autoAssigning}
        >
          Refresh
        </button>
      </header>

      {error && (
        <div className="tm-alert tm-alert-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setError('')}>
            Dismiss
          </button>
        </div>
      )}

      {success && (
        <div className="tm-alert tm-alert-success" role="status">
          <span>{success}</span>
          <button type="button" onClick={() => setSuccess('')}>
            Dismiss
          </button>
        </div>
      )}

      <section className="tm-panel">
        <div className="tm-panel-heading">
          <h3>Competition</h3>
          <span className="tm-muted">
            Select a competition to manage its teams.
          </span>
        </div>

        <label className="tm-label" htmlFor="tm-competition">
          Competition
        </label>

        <select
          id="tm-competition"
          className="tm-input"
          value={competitionId}
          onChange={handleCompetitionChange}
        >
          <option value="">All competitions</option>
          {competitions.map((competition) => (
            <option key={competition.id} value={competition.id}>
              {competition.name} ({competition.status})
            </option>
          ))}
        </select>

        {competitionId && selectedCompetition && (
          <div className="tm-selected-competition">
            <strong>{selectedCompetition.name}</strong>
            <span className={`tm-status tm-status-${selectedCompetition.status}`}>
              {selectedCompetition.status}
            </span>
          </div>
        )}
      </section>

      {competitionId && (
        <>
          <section className="tm-stats">
            <div className="tm-stat-card">
              <span className="tm-stat-number">
                {participants.length}
              </span>
              <span className="tm-stat-label">
                Registered participants
              </span>
            </div>

            <div className="tm-stat-card">
              <span className="tm-stat-number">
                {assignedParticipantsCount}
              </span>
              <span className="tm-stat-label">
                Already assigned
              </span>
            </div>

            <div className="tm-stat-card">
              <span className="tm-stat-number">
                {unassignedParticipants.length}
              </span>
              <span className="tm-stat-label">
                Waiting for a team
              </span>
            </div>

            <div className="tm-stat-card">
              <span className="tm-stat-number">
                {competitionTeams.length}
              </span>
              <span className="tm-stat-label">
                Existing teams
              </span>
            </div>
          </section>

          <section className="tm-panel tm-auto-panel">
            <div className="tm-panel-heading">
              <div>
                <h3>Automatic Team Assignment</h3>
                <p>
                  Randomly distribute unassigned participants into
                  balanced teams and select one leader per new team.
                </p>
              </div>
            </div>

            <div className="tm-auto-controls">
              <div className="tm-field">
                <label className="tm-label" htmlFor="tm-team-size">
                  Target members per team
                </label>

                <select
                  id="tm-team-size"
                  className="tm-input"
                  value={teamSize}
                  onChange={(event) =>
                    setTeamSize(Number(event.target.value))
                  }
                  disabled={autoAssigning || saving}
                >
                  {[2, 3, 4, 5, 6, 8, 10].map((size) => (
                    <option key={size} value={size}>
                      {size} members
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="tm-primary-btn"
                onClick={handleAutoAssign}
                disabled={
                  !competitionId ||
                  unassignedParticipants.length === 0 ||
                  autoAssigning ||
                  saving
                }
              >
                {autoAssigning
                  ? 'Assigning...'
                  : 'Auto-Assign Teams'}
              </button>
            </div>

            <p className="tm-hint">
              Existing assignments are preserved. Team sizes may be
              smaller than the selected target to keep the distribution
              balanced.
            </p>
          </section>
        </>
      )}

      <section className="tm-panel">
        <div className="tm-panel-heading">
          <div>
            <h3>Create a Team</h3>
            <p>Create a team manually for the selected competition.</p>
          </div>
        </div>

        <form className="tm-create-form" onSubmit={handleCreateTeam}>
          <input
            className="tm-input"
            type="text"
            placeholder="Enter team name"
            value={teamName}
            onChange={(event) => setTeamName(event.target.value)}
            maxLength={80}
            required
          />

          <button
            type="submit"
            className="tm-primary-btn"
            disabled={!competitionId || saving || autoAssigning}
          >
            {saving ? 'Saving...' : 'Create Team'}
          </button>
        </form>

        {!competitionId && (
          <p className="tm-hint">
            Select a specific competition before creating a team.
          </p>
        )}
      </section>

      <section className="tm-team-section">
        <div className="tm-section-heading">
          <div>
            <h3>Teams and Rosters</h3>
            <p>{competitionTeams.length} teams found</p>
          </div>
        </div>

        {competitionTeams.length === 0 ? (
          <div className="tm-empty">
            <h4>No teams yet</h4>
            <p>
              Select a competition, create a team, or use automatic
              assignment to get started.
            </p>
          </div>
        ) : (
          <div className="tm-team-grid">
            {competitionTeams.map((team) => {
              const teamMembers = getTeamMembers(team.id);
              const leader = getTeamLeader(team.id);
              const isExpanded = expandedTeam === team.id;

              const availableProfiles = profiles.filter((profile) => {
                const alreadyAssigned = members.some(
                  (member) => member.user_id === profile.user_id
                );

                return !alreadyAssigned;
              });

              return (
                <article className="tm-team-card" key={team.id}>
                  <div className="tm-team-card-header">
                    <div className="tm-team-icon" aria-hidden="true">
                      👥
                    </div>

                    <div className="tm-team-title">
                      <h4>{team.name}</h4>
                      <p>
                        {teamMembers.length}{' '}
                        {teamMembers.length === 1 ? 'member' : 'members'}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="tm-expand-btn"
                      onClick={() =>
                        setExpandedTeam(isExpanded ? null : team.id)
                      }
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? 'Collapse' : 'Manage'}
                    </button>
                  </div>

                  <div className="tm-team-leader">
                    <span className="tm-leader-icon" aria-hidden="true">
                      ★
                    </span>
                    <span>
                      <strong>Team Leader:</strong>{' '}
                      {leader?.display_name || 'Not assigned'}
                    </span>
                  </div>

                  {!leader && teamMembers.length > 0 && (
                    <p className="tm-hint">
                      Assign a leader using the member role selector below.
                    </p>
                  )}

                  {isExpanded && (
                    <div className="tm-team-details">
                      <h5>Roster</h5>

                      {teamMembers.length === 0 ? (
                        <p className="tm-muted">
                          No members have been added to this team.
                        </p>
                      ) : (
                        <ul className="tm-member-list">
                          {teamMembers.map((member) => (
                            <li
                              className="tm-member-item"
                              key={member.id}
                            >
                              <div className="tm-member-info">
                                <span className="tm-avatar">
                                  {(member.display_name || 'M')
                                    .charAt(0)
                                    .toUpperCase()}
                                </span>

                                <span className="tm-member-name">
                                  {member.display_name || 'Member'}
                                  {member.role === 'team_leader' && (
                                    <span className="tm-leader-badge">
                                      Leader
                                    </span>
                                  )}
                                </span>
                              </div>

                              {member.user_id && (
                                <span className="tm-account-badge">
                                  Registered
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className="tm-divider" />

                      <h5>Add a Registered Member</h5>

                      <div className="tm-form-stack">
                        <label
                          className="tm-label"
                          htmlFor={`profile-${team.id}`}
                        >
                          Registered account
                        </label>

                        <select
                          id={`profile-${team.id}`}
                          className="tm-input"
                          value={selectedProfiles[team.id] || ''}
                          onChange={(event) =>
                            setSelectedProfiles((previous) => ({
                              ...previous,
                              [team.id]: event.target.value,
                            }))
                          }
                          disabled={saving || autoAssigning}
                        >
                          <option value="">Select a member</option>

                          {availableProfiles.map((profile) => (
                            <option
                              key={profile.user_id}
                              value={profile.user_id}
                            >
                              {profile.display_name ||
                                profile.email ||
                                profile.user_id}
                            </option>
                          ))}
                        </select>

                        <label
                          className="tm-label"
                          htmlFor={`role-profile-${team.id}`}
                        >
                          Role
                        </label>

                        <select
                          id={`role-profile-${team.id}`}
                          className="tm-input"
                          value={memberRoles[team.id] || 'member'}
                          onChange={(event) =>
                            setMemberRoles((previous) => ({
                              ...previous,
                              [team.id]: event.target.value,
                            }))
                          }
                          disabled={saving || autoAssigning}
                        >
                          <option value="member">Member</option>
                          <option
                            value="team_leader"
                            disabled={Boolean(leader)}
                          >
                            Team Leader
                          </option>
                        </select>

                        <button
                          type="button"
                          className="tm-secondary-btn"
                          onClick={() => handleAssignProfile(team)}
                          disabled={
                            !selectedProfiles[team.id] ||
                            saving ||
                            autoAssigning
                          }
                        >
                          Assign Registered Member
                        </button>
                      </div>

                      <div className="tm-divider" />

                      <h5>Add a Manual Roster Entry</h5>

                      <p className="tm-hint">
                        Use this for planning only. A manual name is not
                        linked to a member account and cannot log in.
                      </p>

                      <form
                        className="tm-form-stack"
                        onSubmit={(event) =>
                          handleAddManualMember(event, team)
                        }
                      >
                        <label
                          className="tm-label"
                          htmlFor={`manual-name-${team.id}`}
                        >
                          Member display name
                        </label>

                        <input
                          id={`manual-name-${team.id}`}
                          className="tm-input"
                          type="text"
                          placeholder="Enter member name"
                          value={manualMemberName[team.id] || ''}
                          onChange={(event) =>
                            setManualMemberName((previous) => ({
                              ...previous,
                              [team.id]: event.target.value,
                            }))
                          }
                          maxLength={100}
                          required
                          disabled={saving || autoAssigning}
                        />

                        <button
                          type="submit"
                          className="tm-secondary-btn"
                          disabled={saving || autoAssigning}
                        >
                          Add Manual Entry
                        </button>
                      </form>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
}
