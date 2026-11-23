import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonRefresher,
  IonRefresherContent,
  IonButton,
  IonIcon,
  IonBadge,
  IonList,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonButtons,
} from '@ionic/react';
import {
  businessOutline,
  bedOutline,
  peopleOutline,
  cashOutline,
  alertCircleOutline,
  documentTextOutline,
  logOutOutline,
  checkmarkCircleOutline,
  arrowForwardOutline,
  shieldCheckmarkOutline,
  walletOutline,
  trendingUpOutline,
} from 'ionicons/icons';
import { reportService, propertyService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { useHistory } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
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

  useEffect(() => {
    loadData();
  }, [selectedProperty]);

  const doRefresh = async (event: CustomEvent) => {
    await loadData();
    event.detail.complete();
  };

  const cards = stats?.summaryCards || {};

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Operations Center</IonTitle>
          <IonButtons slot="end">
            <IonButton
              fill="clear"
              onClick={() => {
                logout();
                history.replace('/login');
              }}
            >
              <IonIcon icon={logOutOutline} slot="icon-only" style={{ color: '#fff' }} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding" style={{ '--background': '#f8fafc' }}>
        <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {/* Hero Banner Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)',
            borderRadius: '24px',
            padding: '24px',
            color: '#fff',
            marginBottom: '20px',
            boxShadow: '0 12px 30px -4px rgba(49, 46, 129, 0.35)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Property Portfolio Overview
                </span>
                <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '4px 0 0 0', letterSpacing: '-0.02em' }}>
                  Welcome back, {user?.name || 'Administrator'}
                </h1>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#c7d2fe' }}>
                  {stats?.currentMonth || 'Current Month'} Performance Metrics
                </p>
              </div>

              {/* Property Selector */}
              <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)' }}>
                <IonSelect
                  interface="popover"
                  value={selectedProperty}
                  placeholder="All Properties"
                  onIonChange={(e) => setSelectedProperty(e.detail.value)}
                  style={{ color: '#fff', fontSize: '13px', fontWeight: 600, padding: '4px 12px' }}
                >
                  <IonSelectOption value="">All Properties</IonSelectOption>
                  {properties.map((p) => (
                    <IonSelectOption key={p._id} value={p._id}>
                      {p.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </div>
            </div>

            {/* Top Quick Stats Strip */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#a5b4fc', fontWeight: 600 }}>TOTAL CAPACITY</div>
                <div style={{ fontSize: '18px', fontWeight: 800 }}>{cards.totalBeds ?? 0} Beds</div>
              </div>
              <div style={{ width: '1px', background: 'rgba(255,255,255,0.15)' }} />
              <div>
                <div style={{ fontSize: '11px', color: '#a5b4fc', fontWeight: 600 }}>ACTIVE RESIDENTS</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#86efac' }}>{cards.activeResidents ?? 0} Tenants</div>
              </div>
              <div style={{ width: '1px', background: 'rgba(255,255,255,0.15)' }} />
              <div>
                <div style={{ fontSize: '11px', color: '#a5b4fc', fontWeight: 600 }}>OCCUPANCY RATE</div>
                <div style={{ fontSize: '18px', fontWeight: 800 }}>
                  {cards.totalBeds ? Math.round(((cards.occupiedBeds || 0) / cards.totalBeds) * 100) : 0}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Primary Metric Cards */}
        <IonGrid style={{ padding: 0 }}>
          <IonRow>
            {/* Rent Collected */}
            <IonCol size="6" sizeMd="3">
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  padding: '18px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>RENT COLLECTED</span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IonIcon icon={cashOutline} style={{ color: '#10b981', fontSize: '18px' }} />
                  </div>
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '10px 0 2px 0' }}>
                  ₹{(cards.rentCollected ?? 0).toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>
                  Target: ₹{(cards.totalRentForMonth ?? 0).toLocaleString('en-IN')}
                </div>
              </div>
            </IonCol>

            {/* Overdue Rent */}
            <IonCol size="6" sizeMd="3">
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  padding: '18px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>OVERDUE RENT</span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IonIcon icon={alertCircleOutline} style={{ color: '#ef4444', fontSize: '18px' }} />
                  </div>
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#ef4444', margin: '10px 0 2px 0' }}>
                  ₹{(cards.overdueRent ?? 0).toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600 }}>
                  Follow-up required
                </div>
              </div>
            </IonCol>

            {/* Available Vacancies */}
            <IonCol size="6" sizeMd="3">
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  padding: '18px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>AVAILABLE SLOTS</span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IonIcon icon={bedOutline} style={{ color: '#3b82f6', fontSize: '18px' }} />
                  </div>
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '10px 0 2px 0' }}>
                  {cards.vacantBeds ?? 0}
                  <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}> / {cards.totalBeds ?? 0}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600 }}>
                  Ready to rent
                </div>
              </div>
            </IonCol>

            {/* Pending Verifications */}
            <IonCol size="6" sizeMd="3">
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  padding: '18px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>PENDING PROOFS</span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IonIcon icon={checkmarkCircleOutline} style={{ color: '#f59e0b', fontSize: '18px' }} />
                  </div>
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#f59e0b', margin: '10px 0 2px 0' }}>
                  {cards.pendingPaymentVerification ?? 0}
                </div>
                <div style={{ fontSize: '11px', color: '#d97706', fontWeight: 600 }}>
                  Awaiting review
                </div>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Action Shortcuts */}
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <IonButton
            color="primary"
            onClick={() => history.push('/admin/residents')}
            style={{ flex: 1, minWidth: '150px', height: '46px', '--border-radius': '14px' }}
          >
            + Onboard Resident
          </IonButton>
          <IonButton
            fill="outline"
            color="primary"
            onClick={() => history.push('/admin/payments')}
            style={{ flex: 1, minWidth: '150px', height: '46px', '--border-radius': '14px' }}
          >
            Verify Payments ({cards.pendingPaymentVerification ?? 0})
          </IonButton>
          <IonButton
            fill="clear"
            color="medium"
            onClick={() => history.push('/admin/reports')}
            style={{ height: '46px' }}
          >
            Reports
          </IonButton>
        </div>

        {/* Recent Payment Submissions */}
        <div style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
              Recent Payment Proofs
            </h3>
            <IonButton fill="clear" size="small" onClick={() => history.push('/admin/payments')} style={{ fontWeight: 700 }}>
              See All <IonIcon icon={arrowForwardOutline} slot="end" />
            </IonButton>
          </div>

          <IonCard style={{ margin: 0, borderRadius: '20px' }}>
            <IonCardContent style={{ padding: '8px' }}>
              <IonList lines="none">
                {stats?.recentPayments?.length > 0 ? (
                  stats.recentPayments.map((p: any) => (
                    <IonItem key={p._id} style={{ '--padding-start': '10px', '--padding-end': '10px' }}>
                      <IonLabel>
                        <h4 style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>
                          {p.residentId?.fullName || 'Resident'}
                        </h4>
                        <p style={{ fontSize: '12px', color: '#64748b' }}>
                          {p.paymentMethod} • Ref: {p.transactionId || 'UTR'} • {new Date(p.paymentDate).toLocaleDateString()}
                        </p>
                      </IonLabel>
                      <div slot="end" style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>
                          ₹{p.amount.toLocaleString('en-IN')}
                        </div>
                        <span
                          className={
                            p.status === 'Approved'
                              ? 'badge-tag badge-paid'
                              : p.status === 'Pending'
                              ? 'badge-tag badge-pending'
                              : 'badge-tag badge-overdue'
                          }
                        >
                          {p.status}
                        </span>
                      </div>
                    </IonItem>
                  ))
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                    No payment submissions yet for this cycle.
                  </div>
                )}
              </IonList>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AdminDashboard;
