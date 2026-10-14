import { useState, useRef, useLayoutEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/api/client';
import { AVATARS } from '@/app/layouts/PortalLayout';
import '../portal.css';

export default function Account() {
  const { user, clear } = useAuthStore();
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) {
      setPwMsg({ ok: false, text: 'New passwords do not match.' });
      return;
    }
    if (pwForm.next.length < 8) {
      setPwMsg({ ok: false, text: 'Password must be at least 8 characters.' });
      return;
    }
    setPwBusy(true);
    setPwMsg(null);
    try {
      await api.post('/auth/change-password', {
        current_password: pwForm.current,
        new_password: pwForm.next,
      });
      setPwMsg({ ok: true, text: 'Password updated successfully.' });
      setPwForm({ current: '', next: '', confirm: '' });
    } catch {
      setPwMsg({ ok: false, text: 'Could not update password. Check your current password and try again.' });
    } finally {
      setPwBusy(false);
    }
  }

  const avatar = user ? (user.avatar ?? AVATARS[user.id] ?? null) : null;
  const initials =
    user?.full_name
      ?.split(' ')
      .map((n: string) => n[0])
      .slice(0, 2)
      .join('') ?? '?';

  const gridRef = useRef<HTMLDivElement>(null);
  const [avatarSize, setAvatarSize] = useState(180);
  useLayoutEffect(() => {
    if (gridRef.current) setAvatarSize(gridRef.current.offsetHeight);
  });

  return (
    <div className="pt-doc">
      <div
        className="pt-page-head"
        style={{
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: 0,
          minHeight: 72,
        }}
      >
        <img
          src="/brand/TCOIN LOGO OFFICIAL.svg"
          alt=""
          aria-hidden
          style={{
            position: 'absolute',
            right: -10,
            top: '50%',
            transform: 'translateY(-50%)',
            height: '160%',
            width: 'auto',
            opacity: 0.07,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />
        <div
          style={{
            width: 72,
            height: 72,
            flexShrink: 0,
            overflow: 'hidden',
            background: avatar ? undefined : 'linear-gradient(135deg,#1D6434,#155228)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 26,
            fontWeight: 800,
            color: '#fff',
          }}
        >
          {avatar ? (
            <img
              src={avatar}
              alt={user?.full_name ?? ''}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
            />
          ) : (
            initials
          )}
        </div>
        <div style={{ padding: '14px 22px 12px 0' }}>
          <h1>My Account</h1>
          <p>Manage your profile and security settings.</p>
        </div>
      </div>

      {/* Profile */}
      <div className="pt-section">
        <div className="pt-section-head">
          <h2>Profile</h2>
        </div>
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #e0e5e2' }}>
          {/* Info grid */}
          <div
            ref={gridRef}
            style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', alignContent: 'start' }}
          >
            {[
              { label: 'Full name', value: user?.full_name },
              { label: 'Account type', value: user?.user_type },
              { label: 'Customer ID', value: user?.customer_id ?? '—' },
              { label: 'User ID', value: user?.id },
              { label: 'Roles', value: (user?.roles ?? []).join(', ') || '—' },
              { label: 'Permissions', value: `${user?.permissions?.length ?? 0} granted` },
            ].map(({ label, value }, i) => (
              <div
                key={label}
                style={{
                  padding: '0 22px',
                  height: 60,
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: '1px solid #f1f4f1',
                  borderRight: i % 2 === 0 ? '1px solid #f1f4f1' : 'none',
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    color: '#69736d',
                    minWidth: 120,
                  }}
                >
                  {label} :
                </span>
                <span
                  style={{ fontSize: 18, fontWeight: 700, color: '#1d2f25', textTransform: 'capitalize' }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Avatar — true square matching grid height */}
          <div
            style={{
              width: avatarSize,
              height: avatarSize,
              flexShrink: 0,
              borderRight: '1px solid #e0e5e2',
              overflow: 'hidden',
              background: avatar ? undefined : '#1d6434',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
            }}
          >
            {avatar ? (
              <img
                src={avatar}
                alt={user?.full_name ?? ''}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
              />
            ) : (
              <>
                <div
                  style={{
                    fontSize: 80,
                    color: '#fff',
                    fontFamily: 'Georgia, serif',
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  {user?.full_name?.charAt(0).toUpperCase() ?? '?'}
                </div>
                <div style={{ textAlign: 'center', padding: '0 12px' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{user?.full_name}</div>
                  <div style={{ fontSize: 16, color: '#a8d5b5', marginTop: 4, textTransform: 'capitalize' }}>
                    {user?.user_type}
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 4,
                    justifyContent: 'center',
                    padding: '0 12px',
                  }}
                >
                  {(user?.roles ?? []).map((r) => (
                    <span
                      key={r}
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        padding: '4px 12px',
                        background: 'rgba(255,255,255,0.15)',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.3)',
                      }}
                    >
                      {r}
                    </span>
                  ))}
                  {(user?.roles ?? []).length === 0 && (
                    <span style={{ fontSize: 13, color: '#a8d5b5' }}>No roles</span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="pt-section">
        <div className="pt-section-head">
          <h2>Change Password</h2>
        </div>
        <div className="pt-section-body" style={{ padding: '16px 22px' }}>
          {pwMsg && (
            <div
              className={pwMsg.ok ? 'pt-alert pt-alert-green' : 'pt-alert pt-alert-red'}
              style={{ marginBottom: 14, borderBottom: 'none' }}
            >
              {pwMsg.text}
            </div>
          )}
          <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(['current', 'next', 'confirm'] as const).map((k) => (
              <div key={k} className="pt-field">
                <label className="pt-label" htmlFor={k}>
                  {k === 'current'
                    ? 'Current password'
                    : k === 'next'
                      ? 'New password'
                      : 'Confirm new password'}
                </label>
                <input
                  id={k}
                  type="password"
                  className="pt-input"
                  required
                  value={pwForm[k]}
                  onChange={(e) => setPwForm((f) => ({ ...f, [k]: e.target.value }))}
                />
              </div>
            ))}
            <button
              type="submit"
              className="pt-btn-primary"
              disabled={pwBusy}
              style={{ alignSelf: 'flex-start' }}
            >
              {pwBusy ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Session */}
      <div className="pt-section">
        <div className="pt-section-head">
          <h2>Session</h2>
        </div>
        <div className="pt-section-body" style={{ padding: '16px 22px' }}>
          <p style={{ margin: '0 0 14px', fontSize: 13, color: '#69736d' }}>
            Signing out will end your current session on this device.
          </p>
          <button onClick={clear} className="pt-btn-danger">
            Sign Out
          </button>
        </div>
      </div>

      <div className="pt-doc-footer">
        <span>TCOIN Solar UG · Customer Portal</span>
      </div>
    </div>
  );
}
