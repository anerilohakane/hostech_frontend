import React, { useState, useEffect } from 'react';
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
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonToast,
  IonLoading,
} from '@ionic/react';
import {
  downloadOutline,
  documentTextOutline,
  calendarOutline,
  sendOutline,
  notificationsOutline,
  megaphoneOutline,
} from 'ionicons/icons';
import { reportService, rentService, notificationService, residentService } from '../../services';

const AdminReports: React.FC = () => {
  // Dynamically default to current year-month (e.g. 2026-11)
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const nextMonthDate = new Date();
  nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
  const nextMonthStr = nextMonthDate.toISOString().slice(0, 7);

  const [billingMonth, setBillingMonth] = useState(currentMonthStr);
  const [genMonth, setGenMonth] = useState(nextMonthStr);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick broadcast announcement state
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState('Announcement');
  const [targetResident, setTargetResident] = useState('');
  const [residents, setResidents] = useState<any[]>([]);

  useEffect(() => {
    residentService.getAll().then((data: any) => {
      setResidents(data || []);
    }).catch(console.error);
  }, []);

  const handleDownloadRentExcel = async () => {
    setLoading(true);
    try {
      await reportService.downloadRentExcel(billingMonth);
      setToastMessage(`Downloaded Monthly Rent Report for ${billingMonth}`);
    } catch (err: any) {
      setToastMessage(err.response?.data?.error || 'Failed to download Rent Report');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCollectionExcel = async () => {
    setLoading(true);
    try {
      await reportService.downloadCollectionExcel();
      setToastMessage('Downloaded Payment Receipts Ledger (.xlsx)');
    } catch (err: any) {
      setToastMessage(err.response?.data?.error || 'Failed to download Collection Ledger');
    } finally {
      setLoading(false);
    }
  };

  const triggerGenerateRent = async () => {
    if (!genMonth) {
      setToastMessage('Please select a valid billing cycle month.');
      return;
    }
    setLoading(true);
    try {
      const res = await rentService.generateRent(genMonth);
      const count = res.generatedRecords?.length ?? 0;
      const skipped = res.skippedRecords?.length ?? 0;
      setToastMessage(
        `Rent batch completed! Created: ${count} record(s). Already generated/skipped: ${skipped}. Notifications dispatched to residents!`
      );
    } catch (err: any) {
      setToastMessage(err.response?.data?.error || 'Failed to generate rent');
    } finally {
      setLoading(false);
    }
  };

  const handleSendBroadcastNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifMessage) {
      setToastMessage('Please provide both notification title and message.');
      return;
    }
    setLoading(true);
    try {
      await notificationService.sendNotification({
        title: notifTitle,
        message: notifMessage,
        type: notifType,
        targetResidentId: targetResident || undefined,
      });
      setToastMessage('Notification successfully broadcast to residents!');
      setNotifTitle('');
      setNotifMessage('');
      setTargetResident('');
    } catch (err: any) {
      setToastMessage(err.response?.data?.error || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Reports & Operations</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" style={{ '--background': '#f8fafc' }}>
        <IonLoading isOpen={loading} message="Processing..." />

        {/* Export Reports Card */}
        <IonCard style={{ margin: '0 0 16px 0', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <IonCardContent style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IonIcon icon={downloadOutline} style={{ color: '#4f46e5', fontSize: '20px' }} />
              </div>
              <h2 style={{ fontSize: '17px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                Export Financial Reports
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px', lineHeight: '1.4' }}>
              Download complete structured Excel spreadsheets (.xlsx) for accounting, compliance, and audits.
            </p>

            <IonItem lines="inset" style={{ '--padding-start': '0', marginBottom: '16px' }}>
              <IonLabel position="stacked" style={{ fontWeight: '700', color: '#334155' }}>
                Filter Month for Rent Report
              </IonLabel>
              <IonInput
                type="month"
                value={billingMonth}
                onIonChange={(e) => setBillingMonth(e.detail.value!)}
              />
            </IonItem>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <IonButton expand="block" color="primary" onClick={handleDownloadRentExcel} style={{ fontWeight: 700 }}>
                <IonIcon icon={downloadOutline} slot="start" />
                Download Monthly Rent Report (.xlsx)
              </IonButton>

              <IonButton expand="block" color="secondary" onClick={handleDownloadCollectionExcel} style={{ fontWeight: 700 }}>
                <IonIcon icon={downloadOutline} slot="start" />
                Download Payment Receipts Ledger (.xlsx)
              </IonButton>
            </div>
          </IonCardContent>
        </IonCard>

        {/* Batch Rent Generation */}
        <IonCard style={{ margin: '0 0 16px 0', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <IonCardContent style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IonIcon icon={calendarOutline} style={{ color: '#d97706', fontSize: '20px' }} />
              </div>
              <h2 style={{ fontSize: '17px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                Generate Monthly Rent Records
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px', lineHeight: '1.4' }}>
              Creates billing records for all active residents. Carries forward previous unpaid balances and dispatches rent due notifications instantly.
            </p>

            <IonItem lines="inset" style={{ '--padding-start': '0', marginBottom: '16px' }}>
              <IonLabel position="stacked" style={{ fontWeight: '700', color: '#334155' }}>
                Billing Cycle Month
              </IonLabel>
              <IonInput
                type="month"
                value={genMonth}
                onIonChange={(e) => setGenMonth(e.detail.value!)}
              />
            </IonItem>

            <IonButton expand="block" color="warning" onClick={triggerGenerateRent} style={{ fontWeight: 700 }}>
              <IonIcon icon={sendOutline} slot="start" />
              Generate Rent for {genMonth}
            </IonButton>
          </IonCardContent>
        </IonCard>

        {/* Send Broadcast Notification */}
        <IonCard style={{ margin: '0 0 16px 0', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <IonCardContent style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IonIcon icon={megaphoneOutline} style={{ color: '#059669', fontSize: '20px' }} />
              </div>
              <h2 style={{ fontSize: '17px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                Send Broadcast Notification
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px', lineHeight: '1.4' }}>
              Broadcast instant announcements, maintenance notices, or rent alerts directly to all tenants or a specific resident.
            </p>

            <form onSubmit={handleSendBroadcastNotification}>
              <IonItem lines="inset" style={{ '--padding-start': '0', marginBottom: '10px' }}>
                <IonLabel position="stacked" style={{ fontWeight: '700', color: '#334155' }}>Target Audience</IonLabel>
                <IonSelect value={targetResident} onIonChange={(e) => setTargetResident(e.detail.value)}>
                  <IonSelectOption value="">All Active Residents (Broadcast)</IonSelectOption>
                  {residents.map((r) => (
                    <IonSelectOption key={r._id} value={r._id}>
                      {r.fullName} (Room {r.roomId?.roomNumber || 'Assigned'})
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>

              <IonItem lines="inset" style={{ '--padding-start': '0', marginBottom: '10px' }}>
                <IonLabel position="stacked" style={{ fontWeight: '700', color: '#334155' }}>Notice Title *</IonLabel>
                <IonInput
                  required
                  placeholder="e.g. Water Tank Maintenance, Rent Due Alert"
                  value={notifTitle}
                  onIonChange={(e) => setNotifTitle(e.detail.value!)}
                />
              </IonItem>

              <IonItem lines="inset" style={{ '--padding-start': '0', marginBottom: '16px' }}>
                <IonLabel position="stacked" style={{ fontWeight: '700', color: '#334155' }}>Message *</IonLabel>
                <IonInput
                  required
                  placeholder="Write message content for residents..."
                  value={notifMessage}
                  onIonChange={(e) => setNotifMessage(e.detail.value!)}
                />
              </IonItem>

              <IonButton expand="block" color="success" type="submit" style={{ fontWeight: 700 }}>
                <IonIcon icon={notificationsOutline} slot="start" />
                Dispatch Notification
              </IonButton>
            </form>
          </IonCardContent>
        </IonCard>

        <IonToast
          isOpen={!!toastMessage}
          message={toastMessage || ''}
          duration={3500}
          onDidDismiss={() => setToastMessage(null)}
          color="dark"
        />
      </IonContent>
    </IonPage>
  );
};

export default AdminReports;

