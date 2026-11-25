import React, { useEffect, useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonRefresher,
  IonRefresherContent, IonButton, IonIcon, IonCard, IonCardContent,
  IonSelect, IonSelectOption, IonButtons,
} from '@ionic/react';
import {
  bedOutline, peopleOutline, cashOutline, alertCircleOutline,
  logOutOutline, checkmarkCircleOutline, arrowForwardOutline, walletOutline,
} from 'ionicons/icons';
import { reportService, propertyService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { useHistory } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const history = useHistory();

  const loadData = async () => {
    try {
      const [statsRes, propsRes] = await Promise.all([
        reportService.getDashboardStats(selectedProperty || undefined),
        propertyService.getAll(),
      ]);
      setStats(statsRes);
      setProperties(propsRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [selectedProperty]);
  const doRefresh = async (event: CustomEvent) => { await loadData(); event.detail.complete(); };
  const cards = stats?.summaryCards || {};
  const occupancy = cards.totalBeds ? Math.round(((cards.occupiedBeds || 0) / cards.totalBeds) * 100) : 0;
  const money = (amount: number | undefined) => `₹${(amount ?? 0).toLocaleString('en-IN')}`;

  return (
    <IonPage className="admin-dashboard">
      <IonHeader>
        <IonToolbar className="dashboard-toolbar">
          <div className="dashboard-brand">
            <div className="brand-wordmark"><strong>Host<span>Tech</span></strong></div>
          </div>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={() => history.push('/admin/profile')} aria-label="My profile">
              <IonIcon icon={peopleOutline} slot="icon-only" />
            </IonButton>
            <IonButton fill="clear" onClick={() => { logout(); history.replace('/login'); }} aria-label="Log out">
              <IonIcon icon={logOutOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="dashboard-content">
        <IonRefresher slot="fixed" onIonRefresh={doRefresh}><IonRefresherContent /></IonRefresher>
        <main className="dashboard-main">
          <section className="dashboard-hero">
            <div className="hero-topline">
              <div>
                <span className="eyebrow">YOUR PORTFOLIO</span>
                <h1>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0] || 'there'}</h1>
                <p>{stats?.currentMonth || 'This month'} at a glance</p>
              </div>
              <div className="property-picker">
                <IonSelect interface="popover" value={selectedProperty} placeholder="All properties" onIonChange={(e) => setSelectedProperty(e.detail.value)} aria-label="Select property">
                  <IonSelectOption value="">All properties</IonSelectOption>
                  {properties.map((property) => <IonSelectOption key={property._id} value={property._id}>{property.name}</IonSelectOption>)}
                </IonSelect>
              </div>
            </div>
            <div className="hero-stats">
              <div><span>Total beds</span><strong>{cards.totalBeds ?? 0}</strong></div>
              <div><span>Residents</span><strong>{cards.activeResidents ?? 0}</strong></div>
              <div><span>Occupancy</span><strong>{occupancy}%</strong></div>
            </div>
            <div className="occupancy-track"><span style={{ width: `${occupancy}%` }} /></div>
          </section>

          <div className="section-heading"><div><span className="eyebrow">AT A GLANCE</span><h2>Monthly overview</h2></div><span className="period-label">{stats?.currentMonth || 'This month'}</span></div>
          <section className="metric-grid" aria-label="Monthly overview">
            <IonCard className="metric-card"><IonCardContent>
              <div className="metric-top"><span>Rent collected</span><span className="metric-icon mint"><IonIcon icon={cashOutline} /></span></div>
              <strong>{money(cards.rentCollected)}</strong><small>of {money(cards.totalRentForMonth)} expected</small>
            </IonCardContent></IonCard>
            <IonCard className="metric-card"><IonCardContent>
              <div className="metric-top"><span>Overdue rent</span><span className="metric-icon coral"><IonIcon icon={alertCircleOutline} /></span></div>
              <strong className="coral-text">{money(cards.overdueRent)}</strong><small>Needs follow-up</small>
            </IonCardContent></IonCard>
            <IonCard className="metric-card"><IonCardContent>
              <div className="metric-top"><span>Available beds</span><span className="metric-icon blue"><IonIcon icon={bedOutline} /></span></div>
              <strong>{cards.vacantBeds ?? 0}<em> / {cards.totalBeds ?? 0}</em></strong><small>Ready to fill</small>
            </IonCardContent></IonCard>
            <IonCard className="metric-card"><IonCardContent>
              <div className="metric-top"><span>Pending payments</span><span className="metric-icon amber"><IonIcon icon={checkmarkCircleOutline} /></span></div>
              <strong>{cards.pendingPaymentVerification ?? 0}</strong><small>Awaiting review</small>
            </IonCardContent></IonCard>
          </section>

          <section className="quick-actions">
            <IonButton expand="block" onClick={() => history.push('/admin/residents')}>+ Add a resident</IonButton>
            <IonButton expand="block" fill="outline" onClick={() => history.push('/admin/payments')}>Review payments <span className="action-count">{cards.pendingPaymentVerification ?? 0}</span></IonButton>
          </section>

          <section className="dashboard-section">
            <div className="section-heading"><div><span className="eyebrow">YOUR SPACE</span><h2>Spaces & amenities</h2></div><span className="swipe-hint">Swipe to explore</span></div>
            <div className="space-carousel">
              <article className="space-card" style={{ backgroundImage: "linear-gradient(180deg, transparent 20%, rgba(14,42,32,.78) 100%), url('/gaming-lounge.jpg')" }}><span>COMMUNITY</span><div><h3>Recreation lounge</h3><p>A place to unwind together</p></div></article>
              <article className="space-card" style={{ backgroundImage: "linear-gradient(180deg, transparent 20%, rgba(14,42,32,.78) 100%), url('/dining-area.jpg')" }}><span>DINING</span><div><h3>Dining area</h3><p>Shared meals, every day</p></div></article>
              <article className="space-card" style={{ backgroundImage: "linear-gradient(180deg, transparent 20%, rgba(14,42,32,.78) 100%), url('/bunk-lounge.jpg')" }}><span>RESIDENCE</span><div><h3>Resident spaces</h3><p>Comfortable places to recharge</p></div></article>
            </div>
          </section>

          <section className="dashboard-section payment-section">
            <div className="section-heading"><div><span className="eyebrow">LATEST ACTIVITY</span><h2>Payment proofs</h2></div><IonButton fill="clear" size="small" onClick={() => history.push('/admin/payments')}>See all <IonIcon icon={arrowForwardOutline} slot="end" /></IonButton></div>
            <IonCard className="payments-card"><IonCardContent>
              {stats?.recentPayments?.length ? stats.recentPayments.map((payment: any) => (
                <div className="payment-row" key={payment._id}>
                  <span className="payment-avatar"><IonIcon icon={walletOutline} /></span>
                  <div className="payment-person"><strong>{payment.residentId?.fullName || 'Resident'}</strong><span>{payment.paymentMethod} · {new Date(payment.paymentDate).toLocaleDateString()}</span></div>
                  <div className="payment-amount"><strong>{money(payment.amount)}</strong><span className={`payment-status ${payment.status === 'Approved' ? 'is-approved' : payment.status === 'Pending' ? 'is-pending' : 'is-rejected'}`}>{payment.status}</span></div>
                </div>
              )) : <div className="empty-payments">{loading ? 'Loading recent payments…' : 'No payment submissions yet.'}</div>}
            </IonCardContent></IonCard>
          </section>
        </main>
      </IonContent>
    </IonPage>
  );
};

export default AdminDashboard;
