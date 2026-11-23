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
  IonModal,
  IonInput,
  IonTextarea,
  IonToast,
  IonAlert,
  IonSelect,
  IonSelectOption,
  IonButtons,
} from '@ionic/react';
import { checkmarkCircleOutline, closeCircleOutline, eyeOutline, cashOutline, alertCircleOutline, closeOutline } from 'ionicons/icons';
import { paymentService, residentService, rentService } from '../../services';

const AdminPayments: React.FC = () => {
  const [tab, setTab] = useState<'pending' | 'all' | 'cash'>('pending');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [residents, setResidents] = useState<any[]>([]);
  const [rentRecords, setRentRecords] = useState<any[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionSubmissionId, setActionSubmissionId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Cash payment form state
  const [cashResidentId, setCashResidentId] = useState('');
  const [cashRentRecordId, setCashRentRecordId] = useState('');
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [cashRemarks, setCashRemarks] = useState('');

  const loadData = async () => {
    try {
      const statusFilter = tab === 'pending' ? 'Pending' : undefined;
      const [subs, resList] = await Promise.all([
        paymentService.getSubmissions(statusFilter ? { status: statusFilter } : {}),
        residentService.getAll(),
      ]);
      setSubmissions(subs);
      setResidents(resList);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [tab]);

  const handleApprove = async (id: string) => {
    try {
      await paymentService.approvePayment(id);
      setToastMessage('Payment approved successfully! Receipt generated & resident notified.');
      await loadData();
    } catch (err: any) {
      setToastMessage(err.response?.data?.error || 'Failed to approve payment');
    }
  };

  const handleReject = async () => {
    if (!actionSubmissionId || !rejectionReason.trim()) {
      setToastMessage('Please enter a rejection reason.');
      return;
    }
    try {
      await paymentService.rejectPayment(actionSubmissionId, rejectionReason);
      setToastMessage('Payment proof rejected. Resident notified with reason.');
      setRejectionModalOpen(false);
      setRejectionReason('');
      setActionSubmissionId(null);
      await loadData();
    } catch (err: any) {
      setToastMessage(err.response?.data?.error || 'Failed to reject payment');
    }
  };

  const handleResidentChangeForCash = async (resId: string) => {
    setCashResidentId(resId);
    if (!resId) return;
    try {
      const records = await rentService.getRentRecords({ residentId: resId, status: 'Unpaid' });
      setRentRecords(records);
      if (records.length > 0) {
        setCashRentRecordId(records[0]._id);
        setCashAmount(records[0].outstandingAmount);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecordCash = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cashResidentId || !cashRentRecordId || !cashAmount) {
      setToastMessage('Please complete all cash recording fields');
      return;
    }
    try {
      await paymentService.recordCash({
        residentId: cashResidentId,
        rentRecordId: cashRentRecordId,
        amount: Number(cashAmount),
        remarks: cashRemarks,
      });
      setToastMessage('Cash payment recorded and official receipt generated!');
      setCashRemarks('');
      setCashResidentId('');
      setCashRentRecordId('');
      setCashAmount(0);
      setTab('all');
    } catch (err: any) {
      setToastMessage(err.response?.data?.error || 'Failed to record cash');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Payment Verification</IonTitle>
        </IonToolbar>
        <IonSegment value={tab} onIonChange={(e) => setTab(e.detail.value as any)}>
          <IonSegmentButton value="pending">
            <IonLabel>Pending Verification</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="all">
            <IonLabel>All Submissions</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="cash">
            <IonLabel>Record Cash</IonLabel>
          </IonSegmentButton>
        </IonSegment>
      </IonHeader>

      <IonContent className="ion-padding" style={{ '--background': '#f8fafc' }}>
        {tab !== 'cash' ? (
          <div>
            <div style={{ marginBottom: '12px', fontSize: '13px', color: '#64748b' }}>
              Showing {submissions.length} submission(s)
            </div>

            {submissions.map((sub) => (
              <IonCard key={sub._id} style={{ margin: '0 0 16px 0', border: '1px solid #e2e8f0' }}>
                <IonCardContent style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
                        {sub.residentId?.fullName || 'Resident'}
                      </h3>
                      <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748b' }}>
                        Rent Month: <strong>{sub.rentMonth}</strong> • Method: <strong>{sub.paymentMethod}</strong>
                      </p>
                      <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#475569' }}>
                        UTR / Txn ID: <code style={{ color: '#2563eb' }}>{sub.transactionId || 'None'}</code>
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: '#16a34a' }}>
                        ₹{sub.amount.toLocaleString('en-IN')}
                      </div>
                      <IonBadge color={sub.status === 'Approved' ? 'success' : sub.status === 'Pending' ? 'warning' : 'danger'}>
                        {sub.status}
                      </IonBadge>
                    </div>
                  </div>

                  {sub.remarks && (
                    <div style={{ background: '#f1f5f9', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', marginTop: '8px', color: '#334155' }}>
                      <strong>Remarks:</strong> {sub.remarks}
                    </div>
                  )}

                  {sub.rejectionReason && (
                    <div style={{ background: '#fee2e2', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', marginTop: '8px', color: '#991b1b' }}>
                      <strong>Rejection Reason:</strong> {sub.rejectionReason}
                    </div>
                  )}

                  {sub.status === 'Pending' && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                      <IonButton
                        expand="block"
                        color="success"
                        style={{ flex: 1 }}
                        onClick={() => handleApprove(sub._id)}
                      >
                        <IonIcon icon={checkmarkCircleOutline} slot="start" />
                        Approve
                      </IonButton>
                      <IonButton
                        expand="block"
                        color="danger"
                        fill="outline"
                        style={{ flex: 1 }}
                        onClick={() => {
                          setActionSubmissionId(sub._id);
                          setRejectionModalOpen(true);
                        }}
                      >
                        <IonIcon icon={closeCircleOutline} slot="start" />
                        Reject
                      </IonButton>
                    </div>
                  )}
                </IonCardContent>
              </IonCard>
            ))}

            {submissions.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: '48px', color: '#22c55e', marginBottom: '8px' }} />
                <h3>No pending payment submissions</h3>
                <p>All resident payment submissions have been reviewed and verified.</p>
              </div>
            )}
          </div>
        ) : (
          <IonCard style={{ margin: 0 }}>
            <IonCardContent style={{ padding: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', color: '#0f172a' }}>
                Record Cash Rent Payment
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
                Recording cash will instantly mark rent ledger updated, generate an official receipt, and notify the resident.
              </p>

              <form onSubmit={handleRecordCash}>
                <IonItem lines="inset" style={{ '--padding-start': '0px', marginBottom: '16px' }}>
                  <IonLabel position="stacked" style={{ fontWeight: '600' }}>Select Resident *</IonLabel>
                  <IonSelect
                    value={cashResidentId}
                    placeholder="Choose Resident"
                    onIonChange={(e) => handleResidentChangeForCash(e.detail.value)}
                  >
                    {residents.map((r) => (
                      <IonSelectOption key={r._id} value={r._id}>
                        {r.fullName} ({r.phone})
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>

                <IonItem lines="inset" style={{ '--padding-start': '0px', marginBottom: '16px' }}>
                  <IonLabel position="stacked" style={{ fontWeight: '600' }}>Select Rent Month Record *</IonLabel>
                  <IonSelect
                    value={cashRentRecordId}
                    placeholder="Choose Month"
                    onIonChange={(e) => setCashRentRecordId(e.detail.value)}
                  >
                    {rentRecords.map((rec) => (
                      <IonSelectOption key={rec._id} value={rec._id}>
                        {rec.rentMonth} (Outstanding: ₹{rec.outstandingAmount})
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>

                <IonItem lines="inset" style={{ '--padding-start': '0px', marginBottom: '16px' }}>
                  <IonLabel position="stacked" style={{ fontWeight: '600' }}>Amount Received (INR) *</IonLabel>
                  <IonInput
                    type="number"
                    value={cashAmount}
                    onIonChange={(e) => setCashAmount(Number(e.detail.value!))}
                    required
                  />
                </IonItem>

                <IonItem lines="inset" style={{ '--padding-start': '0px', marginBottom: '24px' }}>
                  <IonLabel position="stacked" style={{ fontWeight: '600' }}>Remarks / Handover Note</IonLabel>
                  <IonInput
                    value={cashRemarks}
                    placeholder="e.g. Handed directly at reception"
                    onIonChange={(e) => setCashRemarks(e.detail.value!)}
                  />
                </IonItem>

                <IonButton expand="block" type="submit" color="primary" style={{ height: '48px' }}>
                  Confirm Cash Received & Issue Receipt
                </IonButton>
              </form>
            </IonCardContent>
          </IonCard>
        )}

        {/* Rejection Dialog Modal */}
        <IonModal isOpen={rejectionModalOpen} onDidDismiss={() => setRejectionModalOpen(false)}>
          <IonHeader>
            <IonToolbar color="danger">
              <IonTitle>Reject Payment Proof</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setRejectionModalOpen(false)} style={{ color: '#ffffff', fontWeight: 800 }}>
                  <IonIcon icon={closeOutline} slot="start" style={{ fontSize: '20px' }} />
                  Cancel
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <h3>Provide Rejection Reason</h3>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              The resident will receive a notification with this explanation and will be prompted to re-upload proof.
            </p>
            <IonItem lines="inset" style={{ '--padding-start': '0px', marginBottom: '20px' }}>
              <IonLabel position="stacked">Rejection Reason *</IonLabel>
              <IonTextarea
                rows={4}
                value={rejectionReason}
                placeholder="e.g. Invalid UTR number or screenshot blurry/unverified"
                onIonChange={(e) => setRejectionReason(e.detail.value!)}
              />
            </IonItem>
            <div style={{ display: 'flex', gap: '8px' }}>
              <IonButton expand="block" color="medium" fill="outline" style={{ flex: 1 }} onClick={() => setRejectionModalOpen(false)}>
                Cancel
              </IonButton>
              <IonButton expand="block" color="danger" style={{ flex: 1 }} onClick={handleReject}>
                Confirm Rejection
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

        <IonToast
          isOpen={!!toastMessage}
          message={toastMessage || ''}
          duration={3000}
          onDidDismiss={() => setToastMessage(null)}
          color="dark"
        />
      </IonContent>
    </IonPage>
  );
};

export default AdminPayments;
