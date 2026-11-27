import React, { useEffect, useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon,
  IonCard, IonCardContent, IonRefresher, IonRefresherContent, IonButtons,
} from '@ionic/react';
import {
  cardOutline, documentTextOutline, chatbubbleEllipsesOutline, notificationsOutline,
  logOutOutline, homeOutline, shieldCheckmarkOutline, calendarOutline, arrowForwardOutline,
  wifiOutline, restaurantOutline, flashOutline, eyeOutline,
} from 'ionicons/icons';
import { rentService, paymentService, authService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { useHistory } from 'react-router-dom';
import './ResidentDashboard.css';

const ResidentDashboard: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [currentRent, setCurrentRent] = useState<any>(null);
  const [recentReceipt, setRecentReceipt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const history = useHistory();

  const loadData = async () => {
    try {
      const [meRes, rentRes, receiptsRes] = await Promise.all([
        authService.getMe(), rentService.getRentRecords(), paymentService.getReceipts(),
      ]);
      setProfile(meRes.residentProfile);
      if (rentRes?.length) setCurrentRent(rentRes.find((rent: any) => rent.status !== 'Paid') || rentRes[0]);
      if (receiptsRes?.length) setRecentReceipt(receiptsRes[0]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);
  const doRefresh = async (event: CustomEvent) => { await loadData(); event.detail.complete(); };
  const outstanding = currentRent?.outstandingAmount ?? 0;
  const rentIsDue = outstanding > 0;
  const roomNumber = profile?.roomId?.roomNumber;

  return (
    <IonPage className="resident-dashboard">
      <IonHeader>
        <IonToolbar className="dashboard-toolbar">
          <div className="dashboard-brand">
            <div className="brand-wordmark"><strong>Host<span>Tech</span></strong></div>
          </div>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={() => history.push('/resident/notifications')} aria-label="Notifications"><IonIcon icon={notificationsOutline} slot="icon-only" /></IonButton>
            <IonButton fill="clear" onClick={() => { logout(); history.replace('/login'); }} aria-label="Log out"><IonIcon icon={logOutOutline} slot="icon-only" /></IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="dashboard-content">
        <IonRefresher slot="fixed" onIonRefresh={doRefresh}><IonRefresherContent /></IonRefresher>
        <main className="resident-main">
          <section className="resident-welcome">
            <div className="resident-welcome-copy">
              <span className="resident-kicker"><IonIcon icon={shieldCheckmarkOutline} /> YOUR RESIDENCE</span>
              <h1>Hi, {profile?.fullName?.split(' ')[0] || user?.name?.split(' ')[0] || 'there'}</h1>
              <p>Everything you need for a comfortable stay.</p>
            </div>
            <div className="room-pill"><IonIcon icon={homeOutline} /> {roomNumber ? `Room ${roomNumber}` : 'Room details'}</div>
          </section>

          <section className={`rent-summary ${rentIsDue ? 'rent-due' : 'rent-clear'}`}>
            <div className="rent-summary-top">
              <div><span className="section-kicker">RENT & BILLING</span><h2>{rentIsDue ? 'Your rent is due' : 'You’re all caught up'}</h2></div>
              <span className={`rent-status ${rentIsDue ? 'status-due' : 'status-paid'}`}>{currentRent?.status || (loading ? 'Checking' : 'Paid')}</span>
            </div>
            <div className="rent-amount">₹{outstanding.toLocaleString('en-IN')}</div>
            {currentRent?.electricityAmount > 0 && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
                padding: '10px 14px',
                margin: '10px 0',
                fontSize: '13px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#fef08a', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 700 }}>
                    <IonIcon icon={flashOutline} /> Room Light Bill
                  </span>
                  <strong style={{ color: '#ffffff' }}>₹{currentRent.electricityAmount.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ fontSize: '11px', color: '#e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                  <span>
                    Rent: ₹{currentRent.rentAmount?.toLocaleString('en-IN')} + Electricity: ₹{currentRent.electricityAmount?.toLocaleString('en-IN')}
                  </span>
                  {currentRent.electricityBillUrl && (() => {
                    const token = localStorage.getItem('token');
                    const rawUrl = currentRent.electricityBillUrl.startsWith('http')
                      ? currentRent.electricityBillUrl
                      : `http://localhost:5000${currentRent.electricityBillUrl}`;
                    const finalUrl = token && !rawUrl.includes('token=')
                      ? `${rawUrl}${rawUrl.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`
                      : rawUrl;
                    return (
                      <a
                        href={finalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#93c5fd', textDecoration: 'underline', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                      >
                        <IonIcon icon={eyeOutline} /> View Bill Copy
                      </a>
                    );
                  })()}
                </div>
              </div>
            )}
            <div className="rent-due-date"><IonIcon icon={calendarOutline} /> {currentRent?.dueDate ? `Due ${new Date(currentRent.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : 'Current balance'}</div>
            <div className="rent-actions">
              {rentIsDue && <IonButton onClick={() => history.push('/resident/pay')}><IonIcon icon={cardOutline} slot="start" /> Pay rent</IonButton>}
              <IonButton fill="outline" onClick={() => history.push('/resident/history')}>Payment history</IonButton>
            </div>
          </section>

          <section className="resident-services">
            <div className="resident-section-title"><div><span className="section-kicker">AT YOUR FINGERTIPS</span><h2>Quick services</h2></div><span>Available anytime</span></div>
            <div className="resident-service-grid">
              <button className="resident-service" onClick={() => history.push('/resident/history')}><span className="service-icon service-teal"><IonIcon icon={documentTextOutline} /></span><strong>Receipts</strong><small>Payments & history</small></button>
              <button className="resident-service" onClick={() => history.push('/resident/complaints')}><span className="service-icon service-clay"><IonIcon icon={chatbubbleEllipsesOutline} /></span><strong>Get help</strong><small>Requests & complaints</small></button>
              <button className="resident-service" onClick={() => history.push('/resident/documents')}><span className="service-icon service-sage"><IonIcon icon={shieldCheckmarkOutline} /></span><strong>Documents</strong><small>Agreements & KYC</small></button>
              <button className="resident-service" onClick={() => history.push('/resident/profile')}><span className="service-icon service-sand"><IonIcon icon={homeOutline} /></span><strong>My room</strong><small>Stay & profile details</small></button>
            </div>
          </section>

          <section className="resident-life">
            <div className="resident-section-title"><div><span className="section-kicker">MAKE YOURSELF AT HOME</span><h2>Life around here</h2></div></div>
            <div className="resident-life-cards">
              <article className="resident-life-card" style={{ backgroundImage: "linear-gradient(180deg, transparent 15%, rgba(27,42,39,.78) 100%), url('/dining-area.jpg')" }}><span><IonIcon icon={restaurantOutline} /> SHARED DINING</span><strong>Good food, good company</strong></article>
              <article className="resident-life-card" style={{ backgroundImage: "linear-gradient(180deg, transparent 15%, rgba(27,42,39,.78) 100%), url('/gaming-lounge.jpg')" }}><span><IonIcon icon={wifiOutline} /> COMMUNITY SPACE</span><strong>Room to relax and connect</strong></article>
            </div>
          </section>

          {recentReceipt && <IonCard className="recent-receipt"><IonCardContent>
            <div className="receipt-icon"><IonIcon icon={cardOutline} /></div>
            <div className="receipt-copy"><span className="section-kicker">LATEST RECEIPT</span><strong>₹{recentReceipt.amount?.toLocaleString('en-IN')} paid</strong><small>{recentReceipt.rentMonth} · {recentReceipt.paymentMethod}</small></div>
            <IonButton fill="clear" onClick={() => history.push('/resident/history')} aria-label="View payment receipt"><IonIcon icon={arrowForwardOutline} /></IonButton>
          </IonCardContent></IonCard>}
        </main>
      </IonContent>
    </IonPage>
  );
};

export default ResidentDashboard;
