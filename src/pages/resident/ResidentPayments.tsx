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
  IonSegment,
  IonSegmentButton,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/react';
import { downloadOutline, checkmarkCircleOutline, timeOutline, alertCircleOutline } from 'ionicons/icons';
import { rentService, paymentService } from '../../services';

const ResidentPayments: React.FC = () => {
  const [tab, setTab] = useState<'rent' | 'receipts' | 'submissions'>('rent');
  const [rentRecords, setRentRecords] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const [rents, recs, subs] = await Promise.all([
        rentService.getRentRecords(),
        paymentService.getReceipts(),
        paymentService.getSubmissions(),
      ]);
      setRentRecords(rents);
      setReceipts(recs);
      setSubmissions(subs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const doRefresh = async (event: CustomEvent) => {
    await loadData();
    event.detail.complete();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Payment Records</IonTitle>
        </IonToolbar>
        <IonSegment value={tab} onIonChange={(e) => setTab(e.detail.value as any)}>
          <IonSegmentButton value="rent">
            <IonLabel>Monthly Rent</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="receipts">
            <IonLabel>Receipts ({receipts.length})</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="submissions">
            <IonLabel>Submissions</IonLabel>
          </IonSegmentButton>
        </IonSegment>
      </IonHeader>

      <IonContent className="ion-padding" style={{ '--background': '#f8fafc' }}>
        <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {tab === 'rent' && (
          <div>
            {rentRecords.map((r) => (
              <IonCard key={r._id} style={{ margin: '0 0 14px 0', border: '1px solid #e2e8f0' }}>
                <IonCardContent style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
                        {r.rentMonth}
                      </h3>
                      <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                        Due on: {new Date(r.dueDate).toLocaleDateString('en-IN')}
                      </p>
                    </div>

                    <IonBadge color={r.status === 'Paid' ? 'success' : r.status === 'Verification Pending' ? 'warning' : 'danger'}>
                      {r.status}
                    </IonBadge>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', fontSize: '13px' }}>
                    <div>
                      Total Payable: <strong>₹{r.totalPayable?.toLocaleString('en-IN')}</strong>
                    </div>
                    <div>
                      Paid: <strong style={{ color: '#16a34a' }}>₹{r.amountPaid?.toLocaleString('en-IN')}</strong>
                    </div>
                    <div>
                      Outstanding: <strong style={{ color: '#dc2626' }}>₹{r.outstandingAmount?.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                </IonCardContent>
              </IonCard>
            ))}
          </div>
        )}

        {tab === 'receipts' && (
          <div>
            {receipts.map((rec) => (
              <IonCard key={rec._id} style={{ margin: '0 0 14px 0', border: '1px solid #e2e8f0' }}>
                <IonCardContent style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 2px 0', fontWeight: '800', fontSize: '15px', color: '#0f172a' }}>
                        {rec.receiptNumber}
                      </h4>
                      <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                        Month: {rec.rentMonth} • Method: {rec.paymentMethod}
                      </p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#475569' }}>
                        Date: {new Date(rec.paymentDate).toLocaleDateString('en-IN')}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: '#16a34a' }}>
                        ₹{rec.amount.toLocaleString('en-IN')}
                      </div>
                      <IonButton
                        size="small"
                        fill="outline"
                        color="primary"
                        style={{ marginTop: '6px' }}
                        onClick={async () => {
                          try {
                            await paymentService.downloadReceiptPdf(rec._id, rec.receiptNumber);
                          } catch (e) {
                            // Fallback to opening authenticated URL directly in browser tab
                            window.open(paymentService.getReceiptPdfUrl(rec._id), '_blank');
                          }
                        }}
                      >
                        <IonIcon icon={downloadOutline} slot="start" />
                        PDF
                      </IonButton>
                    </div>
                  </div>
                </IonCardContent>
              </IonCard>
            ))}

            {receipts.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '8px' }} />
                <h3>No Receipts Yet</h3>
                <p>Verified payments will generate official downloadable PDF receipts here.</p>
              </div>
            )}
          </div>
        )}

        {tab === 'submissions' && (
          <div>
            {submissions.map((sub) => (
              <IonCard key={sub._id} style={{ margin: '0 0 14px 0', border: '1px solid #e2e8f0' }}>
                <IonCardContent style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 2px 0', fontWeight: '800', fontSize: '15px', color: '#0f172a' }}>
                        ₹{sub.amount.toLocaleString('en-IN')} ({sub.rentMonth})
                      </h4>
                      <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                        Method: {sub.paymentMethod} • Txn: {sub.transactionId || 'None'}
                      </p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#475569' }}>
                        Submitted: {new Date(sub.paymentDate).toLocaleDateString()}
                      </p>
                    </div>

                    <IonBadge color={sub.status === 'Approved' ? 'success' : sub.status === 'Pending' ? 'warning' : 'danger'}>
                      {sub.status}
                    </IonBadge>
                  </div>

                  {sub.rejectionReason && (
                    <div style={{ marginTop: '10px', background: '#fee2e2', color: '#991b1b', padding: '8px 12px', borderRadius: '8px', fontSize: '12px' }}>
                      <strong>Rejection Note:</strong> {sub.rejectionReason}
                    </div>
                  )}
                </IonCardContent>
              </IonCard>
            ))}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ResidentPayments;

