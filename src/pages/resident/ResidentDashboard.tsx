import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonBadge,
  IonGrid,
  IonRow,
  IonCol,
  IonRefresher,
  IonRefresherContent,
  IonButtons,
} from '@ionic/react';
import {
  cashOutline,
  cardOutline,
  documentTextOutline,
  chatbubbleEllipsesOutline,
  notificationsOutline,
  logOutOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  homeOutline,
  arrowForwardOutline,
  shieldCheckmarkOutline,
  sparklesOutline,
} from 'ionicons/icons';
import { rentService, paymentService, authService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { useHistory } from 'react-router-dom';

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
        authService.getMe(),
        rentService.getRentRecords(),
        paymentService.getReceipts(),
      ]);
      setProfile(meRes.residentProfile);

      if (rentRes && rentRes.length > 0) {
        const pending = rentRes.find((r: any) => r.status !== 'Paid');
        setCurrentRent(pending || rentRes[0]);
      }
      if (receiptsRes && receiptsRes.length > 0) {
        setRecentReceipt(receiptsRes[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const doRefresh = async (event: CustomEvent) => {
    await loadData();
    event.detail.complete();
  };

  const isDue = currentRent && currentRent.outstandingAmount > 0;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Resident Hub</IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={() => history.push('/resident/notifications')}>
              <IonIcon icon={notificationsOutline} slot="icon-only" style={{ color: '#fff' }} />
            </IonButton>
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

        {/* Accommodation Header Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
            borderRadius: '20px',
            padding: '16px 20px',
            marginBottom: '16px',
            border: '1px solid #f1f5f9',
            boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 16px -2px rgba(79, 70, 229, 0.3)',
              }}
            >
              <IonIcon icon={homeOutline} style={{ color: '#fff', fontSize: '24px' }} />
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>MY RESIDENCY</div>
              <h2 style={{ fontSize: '17px', fontWeight: '800', margin: '2px 0 0 0', color: '#0f172a' }}>
                {profile?.fullName || user?.name || 'Resident'}
              </h2>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span
              style={{
                background: '#eff6ff',
                color: '#2563eb',
                fontWeight: 800,
                fontSize: '12px',
                padding: '4px 10px',
                borderRadius: '8px',
                border: '1px solid #dbeafe',
              }}
            >
              Room {profile?.roomId?.roomNumber || '101'}
            </span>
          </div>
        </div>

        {/* HERO CARD: "Rent Due" */}
        <div
          style={{
            background: isDue
              ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)'
              : 'linear-gradient(135deg, #064e3b 0%, #065f46 40%, #059669 100%)',
            borderRadius: '24px',
            padding: '24px',
            color: '#fff',
            boxShadow: isDue
              ? '0 16px 32px -4px rgba(49, 46, 129, 0.35)'
              : '0 16px 32px -4px rgba(5, 150, 105, 0.35)',
            marginBottom: '20px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#a5b4fc', fontWeight: '800' }}>
              MONTHLY RENT • {currentRent?.rentMonth || 'Current Month'}
            </span>
            <span
              className={
                currentRent?.status === 'Paid'
                  ? 'badge-tag badge-paid'
                  : currentRent?.status === 'Verification Pending'
                  ? 'badge-tag badge-pending'
                  : 'badge-tag badge-overdue'
              }
            >
              {currentRent?.status || 'Unpaid'}
            </span>
          </div>

          <div style={{ margin: '14px 0' }}>
            <div style={{ fontSize: '13px', color: '#c7d2fe', fontWeight: 600 }}>Total Balance Outstanding</div>
            <div style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-0.03em', margin: '4px 0' }}>
              ₹{currentRent?.outstandingAmount?.toLocaleString('en-IN') ?? 0}
            </div>
            <div style={{ fontSize: '12px', color: '#a5b4fc' }}>
              Due by: <strong>{currentRent?.dueDate ? new Date(currentRent.dueDate).toLocaleDateString() : '5th of month'}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <IonButton
              expand="block"
              onClick={() => history.push('/resident/pay')}
              style={{
                flex: 1,
                height: '48px',
                '--background': '#ffffff',
                '--color': '#312e81',
                fontWeight: 800,
                '--border-radius': '14px',
                boxShadow: '0 8px 18px rgba(0,0,0,0.15)',
              }}
            >
              <IonIcon icon={cardOutline} slot="start" />
              Pay Rent via UPI
            </IonButton>
            <IonButton
              fill="outline"
              onClick={() => history.push('/resident/payments')}
              style={{
                height: '48px',
                '--color': '#ffffff',
                '--border-color': 'rgba(255,255,255,0.4)',
                '--border-radius': '14px',
              }}
            >
              Ledger
            </IonButton>
          </div>
        </div>

        {/* 4 Interactive Quick Service Tiles */}
        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '24px 0 12px 4px' }}>
          Quick Services
        </h3>

        <IonGrid style={{ padding: 0 }}>
          <IonRow>
            {/* Payment Ledger */}
            <IonCol size="6">
              <div
                onClick={() => history.push('/resident/payments')}
                style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  padding: '18px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.03)',
                  cursor: 'pointer',
                  height: '100%',
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                  <IonIcon icon={documentTextOutline} style={{ color: '#10b981', fontSize: '20px' }} />
                </div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Payment Receipts</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Download official PDFs</div>
              </div>
            </IonCol>

            {/* Raise Ticket / Complaint */}
            <IonCol size="6">
              <div
                onClick={() => history.push('/resident/complaints')}
                style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  padding: '18px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.03)',
                  cursor: 'pointer',
                  height: '100%',
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                  <IonIcon icon={chatbubbleEllipsesOutline} style={{ color: '#ef4444', fontSize: '20px' }} />
                </div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Complaints & Support</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Wi-Fi, cleaning, fixes</div>
              </div>
            </IonCol>

            {/* Profile & Accommodation */}
            <IonCol size="6">
              <div
                onClick={() => history.push('/resident/profile')}
                style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  padding: '18px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.03)',
                  cursor: 'pointer',
                  height: '100%',
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                  <IonIcon icon={homeOutline} style={{ color: '#3b82f6', fontSize: '20px' }} />
                </div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>My Profile & ID Proofs</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Aadhaar, PAN & Rent</div>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Recent Payment Receipt Preview */}
        {recentReceipt && (
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px 4px' }}>
              Latest Verified Payment
            </h3>
            <IonCard style={{ margin: 0, borderRadius: '20px', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <IonCardContent style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#166534' }}>RECEIPT NO: {recentReceipt.receiptNumber}</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#15803d', margin: '2px 0' }}>
                      ₹{recentReceipt.amount?.toLocaleString('en-IN')} Paid
                    </div>
                    <div style={{ fontSize: '12px', color: '#4b5563' }}>For {recentReceipt.rentMonth} via {recentReceipt.paymentMethod}</div>
                  </div>
                  <IonButton
                    size="small"
                    color="success"
                    onClick={() => history.push('/resident/payments')}
                    style={{ '--border-radius': '10px' }}
                  >
                    View PDF
                  </IonButton>
                </div>
              </IonCardContent>
            </IonCard>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ResidentDashboard;
