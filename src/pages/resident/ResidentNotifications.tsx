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
  IonList,
  IonItem,
  IonLabel,
  IonToast,
  IonButtons,
  IonBackButton,
} from '@ionic/react';
import { checkmarkDoneOutline, notificationsOutline, alertCircleOutline } from 'ionicons/icons';
import { notificationService } from '../../services';

const ResidentNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getAll();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setToastMessage('All notifications marked as read.');
      await loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/resident/dashboard" />
          </IonButtons>
          <IonTitle>Notification Center</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={markAllRead}>
              <IonIcon icon={checkmarkDoneOutline} slot="start" />
              Mark Read
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" style={{ '--background': '#f8fafc' }}>
        <IonList lines="full" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          {notifications.map((n) => (
            <IonItem
              key={n._id}
              style={{
                '--background': n.isRead ? '#ffffff' : '#f0fdf4',
                '--padding-top': '10px',
                '--padding-bottom': '10px',
              }}
            >
              <IonIcon
                icon={notificationsOutline}
                slot="start"
                style={{ color: n.isRead ? '#94a3b8' : '#16a34a', fontSize: '24px' }}
              />
              <IonLabel>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontWeight: n.isRead ? '600' : '800', color: '#0f172a', fontSize: '15px' }}>
                    {n.title}
                  </h3>
                  <small style={{ color: '#94a3b8', fontSize: '11px' }}>
                    {new Date(n.createdAt).toLocaleDateString()}
                  </small>
                </div>
                <p style={{ color: '#475569', fontSize: '13px', marginTop: '4px' }}>{n.message}</p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>

        {notifications.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
            <IonIcon icon={notificationsOutline} style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '8px' }} />
            <h3>No Notifications</h3>
            <p>You have caught up with all PG updates, rent receipts and reminders!</p>
          </div>
        )}

        <IonToast
          isOpen={!!toastMessage}
          message={toastMessage || ''}
          duration={2500}
          onDidDismiss={() => setToastMessage(null)}
          color="dark"
        />
      </IonContent>
    </IonPage>
  );
};

export default ResidentNotifications;

