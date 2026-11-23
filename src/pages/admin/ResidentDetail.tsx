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
  IonBackButton,
  IonButtons,
  IonLoading,
  IonGrid,
  IonRow,
  IonCol,
  IonSegment,
  IonSegmentButton,
  IonModal,
  IonInput,
  IonToast,
} from '@ionic/react';
import {
  callOutline,
  mailOutline,
  homeOutline,
  documentTextOutline,
  shieldCheckmarkOutline,
  cardOutline,
  calendarOutline,
  personOutline,
  businessOutline,
  cashOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  openOutline,
  keyOutline,
  lockClosedOutline,
  copyOutline,
  eyeOutline,
  eyeOffOutline,
  closeOutline,
} from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { residentService, documentService, depositService } from '../../services';

const ResidentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [resident, setResident] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'financials' | 'documents'>('profile');
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number | string>('');
  const [depositMethod, setDepositMethod] = useState<'Cash' | 'UPI' | 'Bank Transfer'>('Cash');
  const [depositRef, setDepositRef] = useState('');
  const [recordingDeposit, setRecordingDeposit] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const history = useHistory();

  useEffect(() => {
    loadResident();
  }, [id]);

  const loadResident = async () => {
    try {
      const data = await residentService.getById(id);
      setResident(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      setToastMessage('Please enter a new password');
      return;
    }
    setResetting(true);
    try {
      await residentService.update(id, { password: newPassword.trim() });
      setToastMessage(`Password updated successfully to: ${newPassword.trim()}`);
      setResetModalOpen(false);
      setNewPassword('');
    } catch (err: any) {
      setToastMessage(err.response?.data?.error || 'Failed to update password');
    } finally {
      setResetting(false);
    }
  };

  const handleRecordDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(depositAmount);
    if (!amt || amt <= 0) {
      setToastMessage('Please enter a valid deposit payment amount');
      return;
    }
    if (depositMethod !== 'Cash' && (!depositRef || depositRef.trim().length < 6)) {
      setToastMessage('Transaction UTR / Reference ID (min 6 characters) is required for online deposit payments');
      return;
    }
    const depRecordId = resident.securityDepositRecord?._id;
    if (!depRecordId) {
      setToastMessage('Security deposit record not found for this resident');
      return;
    }
    setRecordingDeposit(true);
    try {
      await depositService.recordPayment({
        depositId: depRecordId,
        amount: amt,
        paymentMethod: depositMethod,
        transactionReference: depositRef,
        notes: `Deposit payment received via ${depositMethod}`,
      });
      setToastMessage(`Successfully recorded deposit payment of ₹${amt.toLocaleString('en-IN')}!`);
      setDepositModalOpen(false);
      setDepositAmount('');
      setDepositRef('');
      await loadResident();
    } catch (err: any) {
      setToastMessage(err.response?.data?.error || 'Failed to record deposit payment');
    } finally {
      setRecordingDeposit(false);
    }
  };

  if (loading) {
    return <IonLoading isOpen={true} message="Loading resident profile..." />;
  }

  if (!resident) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="primary">
            <IonButtons slot="start">
              <IonBackButton defaultHref="/admin/residents" />
            </IonButtons>
            <IonTitle>Resident Details</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding" style={{ textAlign: 'center', paddingTop: '60px' }}>
          <h3>Resident not found</h3>
          <IonButton fill="outline" onClick={() => history.push('/admin/residents')}>
            Back to Residents
          </IonButton>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/admin/residents" />
          </IonButtons>
          <IonTitle>{resident.fullName}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding" style={{ '--background': '#f8fafc' }}>
        {/* Resident Header Profile Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)',
            borderRadius: '24px',
            padding: '24px',
            color: '#fff',
            marginBottom: '16px',
            boxShadow: '0 12px 30px -4px rgba(49, 46, 129, 0.35)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span
                style={{
                  background: resident.status === 'Active' ? '#22c55e' : '#f59e0b',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  textTransform: 'uppercase',
                }}
              >
                {resident.status}
              </span>
              <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '8px 0 2px 0', letterSpacing: '-0.02em' }}>
                {resident.fullName}
              </h1>
              <p style={{ margin: 0, fontSize: '13px', color: '#c7d2fe' }}>
                {resident.propertyId?.name} • Room <strong>{resident.roomId?.roomNumber}</strong> ({resident.occupancyType})
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '16px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#a5b4fc', fontWeight: 600 }}>MONTHLY RENT</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#86efac' }}>
                ₹{resident.monthlyRent?.toLocaleString('en-IN')}/mo
              </div>
            </div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.15)' }} />
            <div>
              <div style={{ fontSize: '11px', color: '#a5b4fc', fontWeight: 600 }}>SECURITY DEPOSIT</div>
              <div style={{ fontSize: '18px', fontWeight: 800 }}>
                ₹{resident.securityDeposit?.toLocaleString('en-IN')}
              </div>
            </div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.15)' }} />
            <div>
              <div style={{ fontSize: '11px', color: '#a5b4fc', fontWeight: 600 }}>JOINED DATE</div>
              <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '2px' }}>
                {new Date(resident.joiningDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Segments */}
        <IonSegment
          value={activeTab}
          onIonChange={(e) => setActiveTab(e.detail.value as any)}
          style={{ background: '#ffffff', borderRadius: '14px', padding: '4px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
        >
          <IonSegmentButton value="profile">
            <IonLabel style={{ fontWeight: 700, fontSize: '13px' }}>Profile</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="financials">
            <IonLabel style={{ fontWeight: 700, fontSize: '13px' }}>Financials</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="documents">
            <IonLabel style={{ fontWeight: 700, fontSize: '13px' }}>ID Proofs ({resident.documents?.length || 0})</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {/* TAB 1: Profile & Contact Details */}
        {activeTab === 'profile' && (
          <div>
            <IonCard style={{ margin: 0, borderRadius: '20px', marginBottom: '16px' }}>
              <IonCardContent style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
                  Contact Information
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <IonIcon icon={callOutline} style={{ color: '#4f46e5', fontSize: '18px' }} />
                    <div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>PHONE NUMBER</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{resident.phone}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <IonIcon icon={mailOutline} style={{ color: '#4f46e5', fontSize: '18px' }} />
                    <div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>EMAIL ADDRESS</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#2563eb' }}>{resident.email}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <IonIcon icon={homeOutline} style={{ color: '#4f46e5', fontSize: '18px' }} />
                    <div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>PERMANENT ADDRESS</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{resident.permanentAddress}</div>
                    </div>
                  </div>
                </div>
              </IonCardContent>
            </IonCard>

            <IonCard style={{ margin: 0, borderRadius: '20px' }}>
              <IonCardContent style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
                  Emergency Contact & Employment
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>EMERGENCY CONTACT PERSON</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{resident.emergencyContactName}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>EMERGENCY PHONE NUMBER</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{resident.emergencyContactNumber}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>OCCUPATION / COMPANY</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                      {resident.occupation} {resident.companyOrCollege ? `• ${resident.companyOrCollege}` : ''}
                    </div>
                  </div>
                </div>
              </IonCardContent>
            </IonCard>
            {/* Account Credentials & Password Management Card */}
            <IonCard style={{ margin: '16px 0 0 0', borderRadius: '20px', border: '1px solid #e0e7ff', background: '#faf5ff' }}>
              <IonCardContent style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IonIcon icon={keyOutline} style={{ color: '#7c3aed', fontSize: '20px' }} />
                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#581c87', margin: 0 }}>
                      Portal Login Credentials
                    </h3>
                  </div>
                  <IonButton
                    size="small"
                    fill="outline"
                    color="secondary"
                    onClick={() => {
                      setNewPassword('Resident@123');
                      setResetModalOpen(true);
                    }}
                  >
                    Reset Password
                  </IonButton>
                </div>
                <div style={{ background: '#ffffff', borderRadius: '12px', padding: '14px', border: '1px solid #f3e8ff' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Login Email</span>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#2563eb' }}>{resident.email}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Account Status</span>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: resident.status !== 'Vacated' ? '#16a34a' : '#ef4444' }}>
                      {resident.status !== 'Vacated' ? 'Active Resident Login' : 'Inactive (Vacated)'}
                    </div>
                  </div>
                </div>
              </IonCardContent>
            </IonCard>
          </div>
        )}

        {/* TAB 2: Financials & Rent Ledger */}
        {activeTab === 'financials' && (
          <div>
            <IonCard style={{ margin: '0 0 16px 0', borderRadius: '20px' }}>
              <IonCardContent style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Security Deposit Status
                  </h3>
                  <IonButton
                    size="small"
                    color="primary"
                    onClick={() => {
                      setDepositAmount(resident.securityDepositRecord?.depositOutstanding || '');
                      setDepositModalOpen(true);
                    }}
                  >
                    <IonIcon icon={cashOutline} slot="start" />
                    Record Deposit Payment
                  </IonButton>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>REQUIRED</div>
                    <div style={{ fontSize: '16px', fontWeight: 800 }}>₹{resident.securityDepositRecord?.depositRequired?.toLocaleString('en-IN') ?? resident.securityDeposit}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>RECEIVED</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#16a34a' }}>₹{resident.securityDepositRecord?.depositReceived?.toLocaleString('en-IN') ?? resident.securityDepositPaid}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>OUTSTANDING</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: resident.securityDepositRecord?.depositOutstanding > 0 ? '#ef4444' : '#16a34a' }}>
                      ₹{resident.securityDepositRecord?.depositOutstanding?.toLocaleString('en-IN') ?? 0}
                    </div>
                  </div>
                </div>
              </IonCardContent>
            </IonCard>

            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '16px 0 10px 4px' }}>
              Monthly Rent Invoices ({resident.rentRecords?.length || 0})
            </h3>
            {resident.rentRecords?.length > 0 ? (
              <IonList lines="none">
                {resident.rentRecords.map((r: any) => (
                  <IonItem key={r._id} style={{ background: '#ffffff', borderRadius: '14px', marginBottom: '8px', border: '1px solid #f1f5f9' }}>
                    <IonLabel>
                      <h4 style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>{r.rentMonth}</h4>
                      <p style={{ fontSize: '12px', color: '#64748b' }}>
                        Due Date: {new Date(r.dueDate).toLocaleDateString()} • Paid: ₹{r.amountPaid?.toLocaleString('en-IN')}
                      </p>
                    </IonLabel>
                    <div slot="end" style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: '15px' }}>₹{r.rentAmount?.toLocaleString('en-IN')}</div>
                      <span className={r.status === 'Paid' ? 'badge-tag badge-paid' : 'badge-tag badge-overdue'}>
                        {r.status}
                      </span>
                    </div>
                  </IonItem>
                ))}
              </IonList>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>No monthly invoices generated yet.</div>
            )}
          </div>
        )}

        {/* TAB 3: Identity Proofs & Cloudinary Docs */}
        {activeTab === 'documents' && (
          <div>
            {resident.documents?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {resident.documents.map((doc: any) => (
                  <IonCard key={doc._id} style={{ margin: 0, borderRadius: '20px' }}>
                    <IonCardContent style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <IonIcon icon={shieldCheckmarkOutline} style={{ color: '#4f46e5', fontSize: '18px' }} />
                            <strong style={{ fontSize: '15px', color: '#0f172a' }}>{doc.category}</strong>
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                            {doc.documentNumberMasked ? `ID: ${doc.documentNumberMasked} • ` : ''}
                            Uploaded: {new Date(doc.createdAt).toLocaleDateString()}
                          </div>
                          {/* {doc.cloudinaryUrl && (
                            <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600, marginTop: '2px' }}>
                              ☁️ Verified on Cloudinary Storage
                            </div>
                          )} */}
                        </div>
                        <span
                          className={
                            doc.verificationStatus === 'Verified'
                              ? 'badge-tag badge-paid'
                              : doc.verificationStatus === 'Pending'
                                ? 'badge-tag badge-pending'
                                : 'badge-tag badge-overdue'
                          }
                        >
                          {doc.verificationStatus}
                        </span>
                      </div>

                      {doc.cloudinaryUrl && (
                        <div style={{ marginTop: '12px' }}>
                          <IonButton
                            size="small"
                            fill="outline"
                            color="primary"
                            href={doc.cloudinaryUrl}
                            target="_blank"
                            style={{ '--border-radius': '10px' }}
                          >
                            <IonIcon icon={openOutline} slot="start" />
                            View Document
                          </IonButton>
                        </div>
                      )}

                      {/* Admin Verification Actions */}
                      {doc.verificationStatus === 'Pending' && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                          <IonButton
                            size="small"
                            color="success"
                            onClick={async () => {
                              try {
                                await documentService.verify(doc._id);
                                loadResident();
                              } catch (e: any) {
                                alert(e.response?.data?.error || 'Failed to verify');
                              }
                            }}
                          >
                            <IonIcon icon={checkmarkCircleOutline} slot="start" />
                            Approve & Verify
                          </IonButton>
                          <IonButton
                            size="small"
                            fill="outline"
                            color="danger"
                            onClick={async () => {
                              const reason = prompt('Enter rejection reason:');
                              if (!reason) return;
                              try {
                                await documentService.reject(doc._id, reason);
                                loadResident();
                              } catch (e: any) {
                                alert(e.response?.data?.error || 'Failed to reject');
                              }
                            }}
                          >
                            Reject
                          </IonButton>
                        </div>
                      )}
                    </IonCardContent>
                  </IonCard>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                <IonIcon icon={shieldCheckmarkOutline} style={{ fontSize: '40px', color: '#cbd5e1' }} />
                <p style={{ marginTop: '8px' }}>No identity documents uploaded for this resident.</p>
              </div>
            )}
          </div>
        )}

        {/* Admin Reset Password Modal */}
        <IonModal isOpen={resetModalOpen} onDidDismiss={() => setResetModalOpen(false)}>
          <IonHeader>
            <IonToolbar color="secondary">
              <IonTitle>Reset Resident Password</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setResetModalOpen(false)} style={{ color: '#ffffff', fontWeight: 700 }}>
                  Cancel
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding" style={{ '--padding-bottom': 'calc(env(safe-area-inset-bottom, 24px) + 50px)' }}>
            <form onSubmit={handleResetPassword} style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 24px) + 50px)' }}>
              <div style={{ padding: '14px', background: '#f5f3ff', borderRadius: '12px', marginBottom: '16px', border: '1px solid #ddd6fe' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#5b21b6', marginBottom: '4px' }}>
                  Resetting credentials for {resident.fullName}
                </div>
                <div style={{ fontSize: '12px', color: '#6d28d9' }}>
                  Login Email: <strong>{resident.email}</strong>
                </div>
              </div>

              <IonItem lines="inset" style={{ '--padding-start': '0', position: 'relative' }}>
                <IonLabel position="stacked" style={{ fontWeight: 700, color: '#581c87' }}>New Password *</IonLabel>
                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <IonInput
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    placeholder="Enter new password"
                    onIonChange={(e) => setNewPassword(e.detail.value!)}
                  />
                  <IonButton
                    fill="clear"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{ margin: 0 }}
                  >
                    <IonIcon icon={showNewPassword ? eyeOffOutline : eyeOutline} slot="icon-only" color="secondary" />
                  </IonButton>
                </div>
              </IonItem>

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px', marginBottom: '24px' }}>
                <IonButton
                  size="small"
                  fill="outline"
                  color="secondary"
                  onClick={() => setNewPassword('Resident@123')}
                >
                  Set to Resident@123
                </IonButton>
                <IonButton
                  size="small"
                  fill="outline"
                  color="primary"
                  onClick={() => setNewPassword('Pass@' + Math.floor(1000 + Math.random() * 9000))}
                >
                  Generate Random
                </IonButton>
              </div>

              <IonButton
                expand="block"
                type="submit"
                color="secondary"
                disabled={resetting || !newPassword.trim()}
                style={{ height: '48px', fontWeight: 700 }}
              >
                {resetting ? 'Updating...' : 'Save New Password'}
              </IonButton>
            </form>
          </IonContent>
        </IonModal>

        {/* Record Deposit Payment Modal */}
        <IonModal isOpen={depositModalOpen} onDidDismiss={() => setDepositModalOpen(false)}>
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>Record Deposit Payment</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setDepositModalOpen(false)} style={{ color: '#ffffff', fontWeight: 800 }}>
                  <IonIcon icon={closeOutline} slot="start" style={{ fontSize: '20px' }} />
                  Close
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <form onSubmit={handleRecordDeposit}>
              <div style={{ background: '#f0fdf4', padding: '14px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#166534', marginBottom: '4px' }}>
                  Resident: {resident.fullName}
                </div>
                <div style={{ fontSize: '12px', color: '#15803d' }}>
                  Required: ₹{resident.securityDepositRecord?.depositRequired?.toLocaleString('en-IN') ?? resident.securityDeposit} • Currently Paid: ₹{resident.securityDepositRecord?.depositReceived?.toLocaleString('en-IN') ?? resident.securityDepositPaid} • Outstanding: ₹{resident.securityDepositRecord?.depositOutstanding?.toLocaleString('en-IN') ?? 0}
                </div>
              </div>

              <IonItem lines="inset" style={{ '--padding-start': '0' }}>
                <IonLabel position="stacked" style={{ fontWeight: 700 }}>Payment Amount (INR) *</IonLabel>
                <IonInput
                  type="number"
                  required
                  value={depositAmount}
                  placeholder="Enter amount paid"
                  onIonChange={(e) => setDepositAmount(e.detail.value!)}
                />
              </IonItem>

              <IonItem lines="inset" style={{ '--padding-start': '0', marginTop: '12px' }}>
                <IonLabel position="stacked" style={{ fontWeight: 700 }}>Payment Method *</IonLabel>
                <IonInput
                  value={depositMethod}
                  placeholder="Cash / UPI / Bank Transfer"
                  onIonChange={(e) => setDepositMethod(e.detail.value as any)}
                />
              </IonItem>

              <IonItem lines="inset" style={{ '--padding-start': '0', marginTop: '12px' }}>
                <IonLabel position="stacked" style={{ fontWeight: 700 }}>Transaction / Reference ID</IonLabel>
                <IonInput
                  value={depositRef}
                  placeholder="e.g. UPI Ref / Cash receipt number"
                  onIonChange={(e) => setDepositRef(e.detail.value!)}
                />
              </IonItem>

              <IonButton
                expand="block"
                type="submit"
                color="primary"
                disabled={recordingDeposit || !depositAmount}
                style={{ marginTop: '24px', height: '48px', fontWeight: 700 }}
              >
                {recordingDeposit ? 'Recording Payment...' : 'Confirm Deposit Payment'}
              </IonButton>
            </form>
          </IonContent>
        </IonModal>

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

export default ResidentDetail;

