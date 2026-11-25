import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonIcon,
  IonLoading,
  IonToast,
} from '@ionic/react';
import {
  lockClosedOutline,
  mailOutline,
  eyeOutline,
  eyeOffOutline,
  arrowForwardOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services';
import { useHistory } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { login } = useAuth();
  const history = useHistory();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setToastMessage('Please enter your email and password');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.login(cleanEmail, cleanPassword);
      login(res.token, res.user);
      history.replace(res.user.role === 'admin' ? '/admin/dashboard' : '/resident/dashboard');
    } catch (err: any) {
      setToastMessage(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage className="login-page">
      <IonContent fullscreen className="auth-content">
        <style>{`
          .auth-content { --background: #f7f5f0; }
          .auth-layout {
            box-sizing: border-box;
            display: flex;
            min-height: 100vh;
            min-height: 100dvh;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0;
            padding: max(18px, env(safe-area-inset-top)) 12px max(18px, env(safe-area-inset-bottom));
            background: #f7f5f0;
            color: #303b3c;
            font-family: var(--ion-font-family);
          }

          .auth-hero {
            position: relative;
            isolation: isolate;
            box-sizing: border-box;
            width: 100%;
            max-width: 440px;
            min-height: 220px;
            overflow: hidden;
            padding: 24px 23px 38px;
            border: 1px solid rgba(255,255,255,.12);
            border-radius: 24px;
            color: #fff;
            background: linear-gradient(145deg, #397b80 0%, #326d75 55%, #285b62 100%);
            box-shadow: 0 12px 28px rgba(37,86,93,.2);
          }

          .auth-hero::before,
          .auth-hero::after {
            position: absolute;
            z-index: -1;
            content: '';
            pointer-events: none;
          }
          .auth-hero::before {
            top: -70px;
            right: -55px;
            width: 210px;
            height: 210px;
            border: 1px solid rgba(255,255,255,.12);
            border-radius: 50%;
            box-shadow: 0 0 0 18px rgba(255,255,255,.035), 0 0 0 38px rgba(255,255,255,.025);
          }
          .auth-hero::after {
            right: 24px;
            bottom: 20px;
            width: 58px;
            height: 3px;
            border-radius: 99px;
            background: #f2c982;
            opacity: .9;
          }

          .auth-wordmark {
            position: relative;
            z-index: 1;
            margin: 0 0 34px;
            color: #fff;
            font: 800 23px/1 'Manrope', sans-serif;
            letter-spacing: -.055em;
          }
          .auth-wordmark span { color: #f2c982; }
          .auth-eyebrow {
            display: block;
            margin: 0 0 9px;
            color: #f2c982;
            font-size: 9px;
            font-weight: 800;
            letter-spacing: .16em;
            text-transform: uppercase;
          }
          .auth-hero h1 {
            max-width: 340px;
            margin: 0 0 9px;
            color: #fff !important;
            font: 800 clamp(28px, 8vw, 36px)/1.08 'Manrope', sans-serif;
            letter-spacing: -.05em;
          }
          .auth-hero h1 span { color: #f2c982; }
          .auth-hero-copy {
            max-width: 290px;
            margin: 0;
            color: rgba(255,255,255,.86);
            font-size: 12px;
            font-weight: 500;
            line-height: 1.5;
          }

          .auth-card {
            position: relative;
            z-index: 2;
            box-sizing: border-box;
            flex: 0 0 auto;
            width: 100%;
            max-width: 416px;
            margin: -8px 0 0;
            padding: 21px 18px 17px;
            border: 1px solid #ece8df;
            border-radius: 21px;
            background: #fff;
            box-shadow: 0 12px 30px rgba(46,58,57,.1);
          }
          .auth-card-heading {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 17px;
          }
          .auth-card-heading p { margin: 0 0 4px; color: #7d918a; font-size: 11px; font-weight: 700; letter-spacing: .01em; }
          .auth-card-heading h2 {
            margin: 0;
            color: #303b3c !important;
            font: 800 22px/1.15 'Manrope', sans-serif;
            letter-spacing: -.035em;
          }
          .auth-shield {
            display: grid;
            width: 38px;
            height: 38px;
            place-items: center;
            border-radius: 13px;
            color: #326d75;
            background: #eaf1ee;
            font-size: 18px;
          }

          .auth-field { margin: 0 0 12px; }
          .auth-field label {
            display: block;
            margin: 0 0 7px 2px;
            color: #526662;
            font-size: 12px;
            font-weight: 700;
          }
          .auth-input-wrap {
            display: flex;
            min-height: 50px;
            box-sizing: border-box;
            align-items: center;
            gap: 10px;
            padding: 0 12px;
            border: 1px solid #e5ebe7;
            border-radius: 12px;
            background: #f7f8f6;
            transition: border-color .18s ease, box-shadow .18s ease, background .18s ease;
          }
          .auth-input-wrap:focus-within {
            border-color: #326d75;
            background: #fff;
            box-shadow: 0 0 0 3px rgba(50,109,117,.1);
          }
          .auth-input-wrap > ion-icon { flex: 0 0 auto; color: #668083; font-size: 17px; }
          .auth-input-wrap ion-input {
            min-width: 0;
            --color: #303b3c;
            --placeholder-color: #8b9992;
            --placeholder-opacity: 1;
            font-size: 14px;
          }
          .auth-password-toggle {
            display: grid;
            width: 32px;
            height: 36px;
            flex: 0 0 auto;
            place-items: center;
            border: 0;
            border-radius: 9px;
            color: #668083;
            background: transparent;
            cursor: pointer;
          }
          .auth-password-toggle:focus-visible,
          .auth-google:focus-visible { outline: 3px solid rgba(50,109,117,.25); outline-offset: 2px; }

          .auth-submit {
            height: 50px;
            margin: 5px 0 7px;
            --background: #326d75;
            --background-activated: #25565d;
            --color: #fff;
            --border-radius: 12px;
            --box-shadow: 0 6px 16px rgba(50,109,117,.2);
            font-size: 13px;
            font-weight: 800;
          }
          .auth-divider {
            display: flex;
            align-items: center;
            gap: 11px;
            margin: 9px 0;
            color: #96a49f;
            font-size: 9px;
            font-weight: 700;
            letter-spacing: .12em;
          }
          .auth-divider::before,
          .auth-divider::after { height: 1px; flex: 1; background: #e8eeeb; content: ''; }
          .auth-google {
            display: flex;
            width: 100%;
            height: 46px;
            align-items: center;
            justify-content: center;
            gap: 9px;
            margin: 0 0 13px;
            border: 1px solid #e1e8e3;
            border-radius: 12px;
            color: #30494a;
            background: #fff;
            font: 700 12px var(--ion-font-family);
            cursor: pointer;
            transition: background .18s ease, border-color .18s ease;
          }
          .auth-google:hover { border-color: #b8ceca; background: #f8faf9; }
          .auth-safe-note {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            min-height: 34px;
            padding-top: 16px;
            border-top: 1px solid #edf0ed;
            color: #82918a;
            font-size: 11px;
          }
          .auth-safe-note ion-icon { color: #326d75; font-size: 14px; }

          @media (max-height: 680px) {
            .auth-layout { justify-content: flex-start; padding-top: max(12px, env(safe-area-inset-top)); padding-bottom: max(12px, env(safe-area-inset-bottom)); }
            .auth-hero { min-height: 160px; padding: 14px 18px 26px; }
            .auth-wordmark { margin-bottom: 18px; font-size: 21px; }
            .auth-eyebrow { margin-bottom: 6px; }
            .auth-hero h1 { margin-bottom: 6px; font-size: 26px; }
            .auth-hero-copy { font-size: 11px; }
            .auth-card { margin-top: -6px; padding: 13px 14px 11px; }
            .auth-card-heading { margin-bottom: 10px; }
            .auth-card-heading p { font-size: 9px; }
            .auth-card-heading h2 { font-size: 18px; }
            .auth-shield { width: 32px; height: 32px; border-radius: 11px; font-size: 16px; }
            .auth-field { margin-bottom: 7px; }
            .auth-field label { margin-bottom: 4px; font-size: 10px; }
            .auth-input-wrap { min-height: 38px; }
            .auth-submit { height: 39px; margin-block: 3px 4px; }
            .auth-divider { margin: 5px 0; }
            .auth-google { height: 35px; margin-bottom: 8px; }
          }
          @media (min-width: 900px) {
            .auth-layout {
              display: grid;
              grid-template-columns: minmax(0, 1.05fr) minmax(360px, .85fr);
              align-content: center;
              gap: 0;
              max-width: 1120px;
              margin-inline: auto;
              padding: 48px;
            }
            .auth-hero {
              display: flex;
              min-height: min(620px, calc(100dvh - 96px));
              flex-direction: column;
              justify-content: center;
              max-width: none;
              padding: 54px;
              border-radius: 28px;
            }
            .auth-wordmark { margin-bottom: auto; font-size: 26px; }
            .auth-hero h1 { max-width: 460px; font-size: clamp(40px, 5vw, 58px); }
            .auth-hero-copy { max-width: 360px; font-size: 14px; }
            .auth-card { width: min(100%, 440px); max-width: none; margin: 0 0 0 -34px; padding: 34px 32px 27px; }
            .auth-card-heading { margin-bottom: 24px; }
            .auth-card-heading h2 { font-size: 25px; }
            .auth-field { margin-bottom: 16px; }
            .auth-input-wrap { min-height: 54px; }
            .auth-submit { height: 52px; margin-top: 9px; }
            .auth-google { height: 48px; }
          }

          /* Full-height mobile layout: the hero and sign-in surface use the screen together. */
          .auth-layout {
            justify-content: flex-start;
            max-width: 440px;
            margin: 0 auto;
            padding: 0 0 env(safe-area-inset-bottom);
            overflow-x: hidden;
          }
          .auth-hero {
            display: flex;
            height: clamp(194px, 31dvh, 260px);
            min-height: 194px;
            flex: 0 0 auto;
            flex-direction: column;
            justify-content: flex-end;
            padding: max(22px, env(safe-area-inset-top)) 22px 38px;
            border-radius: 0;
          }
          .auth-hero::before {
            top: -95px;
            right: -65px;
            width: 230px;
            height: 230px;
            border: 0;
            background: radial-gradient(circle, rgba(242,201,130,.2), rgba(255,255,255,.05) 36%, transparent 70%);
            box-shadow: none;
          }
          .auth-hero::after { right: 22px; bottom: 21px; width: 38px; height: 3px; }
          .auth-wordmark { margin-bottom: 23px; }
          .auth-card {
            display: flex;
            width: 100%;
            max-width: none;
            min-height: 0;
            flex: 1 0 auto;
            flex-direction: column;
            margin: -8px 0 0;
            padding: 22px 20px max(20px, env(safe-area-inset-bottom));
            border-radius: 24px 24px 0 0;
            box-shadow: 0 -6px 24px rgba(46,58,57,.07);
          }
          .auth-card-heading h2 { color: #303b3c !important; }
          .auth-card form { flex: 0 0 auto; }
          .auth-safe-note { margin-top: auto; padding-top: 22px; }

          @media (max-height: 680px) {
            .auth-layout { padding-top: 0; }
            .auth-hero { height: 190px; min-height: 190px; padding: max(16px, env(safe-area-inset-top)) 18px 30px; }
            .auth-wordmark { margin-bottom: 16px; }
            .auth-card { margin-top: -6px; padding: 15px 15px max(14px, env(safe-area-inset-bottom)); }
            .auth-safe-note { padding-top: 12px; }
          }

          @media (min-width: 900px) {
            .auth-layout {
              display: grid;
              grid-template-columns: minmax(0, 1.05fr) minmax(360px, .85fr);
              align-content: center;
              max-width: 1120px;
              min-height: 100dvh;
              margin-inline: auto;
              padding: 48px;
              overflow: visible;
              background: transparent;
            }
            .auth-hero {
              height: auto;
              min-height: min(620px, calc(100dvh - 96px));
              max-width: none;
              justify-content: space-between;
              padding: 52px;
              border-radius: 28px;
            }
            .auth-wordmark { margin-bottom: auto; font-size: 26px; }
            .auth-card {
              width: min(100%, 440px);
              max-width: none;
              min-height: 0;
              flex: 0 0 auto;
              align-self: center;
              margin: 0 0 0 -34px;
              padding: 34px 32px 27px;
              border-radius: 24px;
              box-shadow: 0 20px 50px rgba(31,64,61,.15);
            }
            .auth-safe-note { padding-top: 0; }
          }
        `}</style>

        <main className="auth-layout">
          <section className="auth-hero" aria-label="HostTech welcome">
            <div className="auth-wordmark">Host<span>Tech</span></div>
            <div>
              <span className="auth-eyebrow">A better way to stay</span>
              <h1>Welcome to <span>your space.</span></h1>
              <p className="auth-hero-copy">Manage your stay, payments, and everyday essentials in one place.</p>
            </div>
          </section>

          <section className="auth-card" aria-labelledby="auth-title">
            <div className="auth-card-heading">
              <div>
                <p>Resident & property portal</p>
                <h2 id="auth-title">Welcome back</h2>
              </div>
              <span className="auth-shield" aria-hidden="true">
                <IonIcon icon={shieldCheckmarkOutline} />
              </span>
            </div>

            <form onSubmit={handleLogin} autoComplete="on">
              <div className="auth-field">
                <label htmlFor="login-email">Email address</label>
                <div className="auth-input-wrap">
                  <IonIcon icon={mailOutline} aria-hidden="true" />
                  <IonInput
                    id="login-email"
                    name="email"
                    type="email"
                    value={email}
                    placeholder="you@example.com"
                    onIonChange={(e) => setEmail(e.detail.value || '')}
                    autocomplete="email"
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="login-password">Password</label>
                <div className="auth-input-wrap">
                  <IonIcon icon={lockClosedOutline} aria-hidden="true" />
                  <IonInput
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    placeholder="Enter your password"
                    onIonChange={(e) => setPassword(e.detail.value || '')}
                    autocomplete="current-password"
                    required
                  />
                  <button
                    className="auth-password-toggle"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <IonIcon icon={showPassword ? eyeOffOutline : eyeOutline} />
                  </button>
                </div>
              </div>

              <IonButton expand="block" type="submit" disabled={loading} className="auth-submit">
                <span>Continue</span>
                <IonIcon icon={arrowForwardOutline} slot="end" />
              </IonButton>
            </form>

            <div className="auth-divider"><span>OR</span></div>
            <button
              type="button"
              onClick={() => setToastMessage('Google sign-in is not available yet.')}
              className="auth-google"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.66-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84z" />
              </svg>
              <span>Continue with Google</span>
            </button>
            <div className="auth-safe-note">
              <IonIcon icon={shieldCheckmarkOutline} aria-hidden="true" />
              <span>Your account is protected</span>
            </div>
          </section>
        </main>

        <IonLoading isOpen={loading} message="Signing in..." />
        <IonToast
          isOpen={!!toastMessage}
          message={toastMessage || ''}
          duration={3000}
          onDidDismiss={() => setToastMessage(null)}
          color="danger"
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;
