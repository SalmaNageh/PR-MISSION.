
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import HeadDashboard from './HeadDashboard';
import MemberDashboard from './MemberDashboard';
import './Auth.css';

function Auth({ onBack }) {
  const [mode, setMode] = useState('signup');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Load the signed-in user and their role.
  useEffect(() => {
    let mounted = true;

    const loadRole = async (currentUser) => {
      if (!currentUser) {
        if (mounted) {
          setUserRole(null);
          setRoleLoading(false);
        }
        return;
      }

      if (mounted) {
        setRoleLoading(true);
        setUserRole(null);
      }

      try {
        const { data, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', currentUser.id)
          .maybeSingle();

        if (roleError) {
          throw roleError;
        }

        if (mounted) {
          // Accounts without an assigned role are regular members.
          setUserRole(data?.role ?? 'member');
          setError('');
        }
      } catch (err) {
        console.error('Could not load user role:', err);

        if (mounted) {
          setUserRole(null);
          setError(
            'Could not load your account role. Check your Supabase permissions and refresh the page.'
          );
        }
      } finally {
        if (mounted) {
          setRoleLoading(false);
        }
      }
    };

    const initializeSession = async () => {
      const { data, error: sessionError } =
        await supabase.auth.getSession();

      if (!mounted) return;

      if (sessionError) {
        setError(sessionError.message);
        return;
      }

      const currentUser = data.session?.user ?? null;

      setUser(currentUser);
      await loadRole(currentUser);
    };

    initializeSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;

      if (!mounted) return;

      setUser(currentUser);
      setUserRole(null);
      setError('');

      // Defer the database request until the auth callback completes.
      Promise.resolve().then(() => {
        if (mounted) {
          loadRole(currentUser);
        }
      });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Sign up or log in.
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error: signupError } =
          await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              data: {
                display_name: displayName.trim(),
              },
            },
          });

        if (signupError) {
          throw signupError;
        }

        if (data.session) {
          setUser(data.session.user);
          setMessage('Your account was created successfully!');
        } else {
          setMessage(
            'Account created! Check your email to confirm your account, then log in.'
          );
        }
      } else {
        const { data, error: loginError } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

        if (loginError) {
          throw loginError;
        }

        setUser(data.user);
        setMessage('Login successful!');
      }
    } catch (err) {
      setError(
        err.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Log out.
  const handleLogout = async () => {
    setError('');
    setMessage('');

    const { error: logoutError } = await supabase.auth.signOut();

    if (logoutError) {
      setError(logoutError.message);
      return;
    }

    setUser(null);
    setUserRole(null);
    setPassword('');
    setMessage('You have been logged out.');
  };

  // Show a loading screen while the user's role is being checked.
  if (user && roleLoading) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <div className="auth-brand">
            <span>PR</span> MISSION
          </div>

          <div className="auth-success-icon">...</div>

          <p className="auth-eyebrow">PREPARING YOUR MISSION</p>
          <h1>Welcome back.</h1>

          <p className="auth-description">
            Loading your account and dashboard...
          </p>
        </section>
      </main>
    );
  }

  // Head of PR dashboard.
  if (user && userRole === 'head_of_pr') {
    return (
      <HeadDashboard
        user={user}
        onLogout={handleLogout}
        onBack={onBack}
      />
    );
  }

  // Team leader and regular member dashboard.
  if (
    user &&
    userRole !== null &&
    userRole !== 'head_of_pr'
  ) {
    return (
      <MemberDashboard
        user={user}
        userRole={userRole}
        onLogout={handleLogout}
        onBack={onBack}
      />
    );
  }

  // Signed-in account, but role could not be loaded.
  if (user && !roleLoading && userRole === null) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <div className="auth-brand">
            <span>PR</span> MISSION
          </div>

          <p className="auth-eyebrow">ACCOUNT ACCESS</p>
          <h1>We couldn't load your dashboard.</h1>

          <p className="auth-description">
            Your account is signed in, but we couldn't verify your
            role. Please check your connection or Supabase permissions.
          </p>

          {error && <p className="auth-error">{error}</p>}

          <button
            className="auth-submit"
            type="button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>

          <button
            className="auth-back"
            type="button"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </section>
      </main>
    );
  }

  // Login and signup screen.
  return (
    <main className="auth-page">
      <button
        className="auth-back"
        onClick={onBack}
        type="button"
      >
        ← Back to Home
      </button>

      <section className="auth-card">
        <div className="auth-brand">
          <span>PR</span> MISSION
        </div>

        <p className="auth-eyebrow">
          YOUR PR JOURNEY STARTS HERE
        </p>

        <h1>
          {mode === 'signup'
            ? 'Join the mission.'
            : 'Welcome back.'}
        </h1>

        <p className="auth-description">
          {mode === 'signup'
            ? 'Create your account to join a team and take on PR challenges.'
            : 'Log in to continue your PR MISSION experience.'}
        </p>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === 'signup' ? 'active' : ''}
            onClick={() => {
              setMode('signup');
              setError('');
              setMessage('');
            }}
          >
            Create Account
          </button>

          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => {
              setMode('login');
              setError('');
              setMessage('');
            }}
          >
            Login
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <label className="auth-field">
              Full Name
              <input
                type="text"
                value={displayName}
                onChange={(event) =>
                  setDisplayName(event.target.value)
                }
                placeholder="Enter your name"
                autoComplete="name"
                required
              />
            </label>
          )}

          <label className="auth-field">
            Email Address
            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label className="auth-field">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              autoComplete={
                mode === 'signup'
                  ? 'new-password'
                  : 'current-password'
              }
              minLength={6}
              required
            />
          </label>

          {error && <p className="auth-error">{error}</p>}
          {message && <p className="auth-message">{message}</p>}

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : mode === 'signup'
                ? 'Create Account →'
                : 'Login →'}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'signup'
            ? 'Already have an account?'
            : "Don't have an account?"}{' '}

          <button
            type="button"
            onClick={() => {
              setMode(
                mode === 'signup' ? 'login' : 'signup'
              );
              setError('');
              setMessage('');
            }}
          >
            {mode === 'signup' ? 'Login' : 'Sign Up'}
          </button>
        </p>

        <p className="auth-footer">
          Learn. Decide. Build Relationships.
        </p>
      </section>
    </main>
  );
}

export default Auth;