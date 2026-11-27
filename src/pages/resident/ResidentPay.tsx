import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonToast,
  IonLoading,
  IonButtons,
  IonBackButton,
} from '@ionic/react';
import { cloudUploadOutline, checkmarkCircleOutline, cardOutline, qrCodeOutline, flashOutline, eyeOutline } from 'ionicons/icons';
import { rentService, paymentService, settingsService } from '../../services';
import { useHistory, useLocation } from 'react-router-dom';

const ResidentPay: React.FC = () => {
  const [rentRecords, setRentRecords] = useState<any[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Bank Transfer'>('UPI');
  const [transactionId, setTransactionId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    const init = async () => {
      try {
        const [records, sets] = await Promise.all([
          rentService.getRentRecords(),
          settingsService.getSettings(),
        ]);
        setRentRecords(records);
        setSettings(sets);

        // Preselect from URL param or first unpaid
        const params = new URLSearchParams(location.search);
        const rentIdFromUrl = params.get('rentId');

        if (rentIdFromUrl && records.some((r: any) => r._id === rentIdFromUrl)) {
          setSelectedRecordId(rentIdFromUrl);
          const found = records.find((r: any) => r._id === rentIdFromUrl);
          setAmount(found?.outstandingAmount || 0);
        } else if (records.length > 0) {
          const unpaid = records.find((r: any) => r.status !== 'Paid');
          const target = unpaid || records[0];
          setSelectedRecordId(target._id);
          setAmount(target.outstandingAmount || 0);
        }
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, [location.search]);

  const handleRecordChange = (recId: string) => {
    setSelectedRecordId(recId);
    const rec = rentRecords.find((r) => r._id === recId);
    if (rec) {
      setAmount(rec.outstandingAmount);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setScreenshotFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecordId) {
      setToastMessage('Please select a rent record.');
      return;
    }
    if (amount <= 0) {
      setToastMessage('Payment amount must be greater than zero.');
      return;
    }
    const cleanTxn = transactionId.trim();
    if (!cleanTxn || cleanTxn.length < 6) {
      setToastMessage('Transaction ID / UTR must be at least 6 characters.');
      return;
    }
    if (!screenshotFile) {
      setToastMessage('Payment screenshot proof is mandatory. Please attach your payment screenshot.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('rentRecordId', selectedRecordId);
      formData.append('amount', String(amount));
      formData.append('paymentMethod', paymentMethod);
      formData.append('transactionId', transactionId.trim());
      formData.append('remarks', remarks);
      if (screenshotFile) {
        formData.append('screenshot', screenshotFile);
      }

      await paymentService.submitPayment(formData);
      setToastMessage('Payment proof submitted successfully! Verification pending by PG Admin.');
      setTimeout(() => {
        history.replace('/resident/history');
      }, 1500);
    } catch (err: any) {
      setToastMessage(err.response?.data?.error || 'Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  const currentRec = rentRecords.find((r) => r._id === selectedRecordId);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/resident/dashboard" />
          </IonButtons>
          <IonTitle>Submit Rent Payment</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* Payment Account Details with Dynamic UPI QR & Mobile App Launch */}
        <IonCard style={{ margin: '0 0 16px 0', background: '#ffffff', border: '1px solid #ece8df' }}>
          <IonCardContent style={{ padding: '18px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
              <IonIcon icon={qrCodeOutline} style={{ color: 'var(--ht-primary, #326d75)', fontSize: '22px' }} />
              <strong style={{ color: 'var(--ht-text, #303b3c)', fontSize: '15px' }}>Instant UPI Payment</strong>
            </div>

            {/* Room Light Bill Breakdown Notice if applicable */}
            {currentRec?.electricityAmount > 0 && (
              <div
                style={{
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                  borderRadius: '12px',
                  padding: '12px',
                  margin: '10px 0',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#92400e', fontWeight: 800, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <IonIcon icon={flashOutline} /> Room Light Bill Included
                  </span>
                  <span style={{ color: '#b45309', fontWeight: 800, fontSize: '13px' }}>
                    +₹{currentRec.electricityAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#78350f', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>
                    Monthly Rent: ₹{currentRec.rentAmount?.toLocaleString('en-IN')} | Room Share: ₹{currentRec.electricityAmount?.toLocaleString('en-IN')}
                  </span>
                  {currentRec.electricityBillUrl && (
                    <a
                      href={currentRec.electricityBillUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                    >
                      <IonIcon icon={eyeOutline} /> View Copy
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Dynamic Generated UPI QR Code */}
            {amount > 0 && (
              <div style={{ margin: '14px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ background: '#ffffff', padding: '12px', borderRadius: '16px', display: 'inline-block', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                      `upi://pay?pa=${settings?.upiId || 'hosttech@okhdfcbank'}&pn=HostTech%20PG&am=${amount}&cu=INR&tn=Rent_${currentRec?.rentMonth || 'Payment'}`
                    )}`}
                    alt="Scan UPI QR"
                    style={{ width: '150px', height: '150px', display: 'block' }}
                  />
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                  Scan with GPay, PhonePe, Paytm, or BHIM
                </div>

                {/* Direct Mobile UPI Intent Button */}
                <a
                  href={`upi://pay?pa=${settings?.upiId || 'hosttech@okhdfcbank'}&pn=HostTech%20PG&am=${amount}&cu=INR&tn=Rent_${currentRec?.rentMonth || 'Payment'}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '12px',
                    padding: '12px 20px',
                    background: 'var(--ht-primary, #326d75)',
                    color: '#ffffff',
                    WebkitTextFillColor: '#ffffff',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '13px',
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(50, 109, 117, 0.25)',
                  }}
                >
                  <IonIcon icon={cardOutline} style={{ color: '#ffffff' }} />
                  <span style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}>Open in UPI App (Pay ₹{amount.toLocaleString('en-IN')})</span>
                </a>
              </div>
            )}

            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px dashed #cbd5e1', fontSize: '14px', fontWeight: '800', color: 'var(--ht-primary, #326d75)', marginTop: '10px' }}>
              UPI ID: {settings?.upiId || 'hosttech@okhdfcbank'}
            </div>
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#64748b' }}>
              Bank: <strong>{settings?.bankDetails?.bankName || 'HDFC Bank'}</strong> • A/C: <strong>{settings?.bankDetails?.accountNumber || '50200012345678'}</strong> (IFSC: {settings?.bankDetails?.ifscCode || 'HDFC0001234'})
            </div>
          </IonCardContent>
        </IonCard>

        {/* Submission Form */}
        <IonCard style={{ margin: 0, background: '#ffffff', border: '1px solid #ece8df' }}>
          <IonCardContent style={{ padding: '20px' }}>
            <form onSubmit={handleSubmit}>
              <IonItem lines="inset" style={{ '--padding-start': '0', marginBottom: '16px' }}>
                <IonLabel position="stacked" style={{ fontWeight: '600' }}>Select Rent Month *</IonLabel>
                <IonSelect
                  value={selectedRecordId}
                  onIonChange={(e) => handleRecordChange(e.detail.value)}
                  placeholder={rentRecords.length === 0 ? "Loading pending rent..." : "Select month"}
                >
                  {rentRecords.length === 0 && (
                    <IonSelectOption value="" disabled>
                      No pending rent record found
                    </IonSelectOption>
                  )}
                  {rentRecords.map((r) => (
                    <IonSelectOption key={r._id} value={r._id}>
                      {r.rentMonth} (Due: ₹{r.outstandingAmount?.toLocaleString('en-IN')}) {r.status === 'Paid' ? '• [PAID]' : ''}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>

              {currentRec && (() => {
                const calculatedElectricity = Number(currentRec.electricityAmount || 0) > 0
                  ? Number(currentRec.electricityAmount)
                  : Math.max(0, (Number(currentRec.totalPayable || currentRec.outstandingAmount || 0) - Number(currentRec.rentAmount || 0)));

                return (
                  <div
                    style={{
                      background: '#f8fafc',
                      padding: '16px',
                      borderRadius: '16px',
                      marginBottom: '16px',
                      fontSize: '13px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Monthly Room Rent:</span>
                      <strong style={{ color: '#0f172a', fontSize: '14px' }}>₹{currentRec.rentAmount?.toLocaleString('en-IN')}</strong>
                    </div>

                    {calculatedElectricity > 0 && (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: '#fffbeb',
                          border: '1px solid #fde68a',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          margin: '8px 0',
                        }}
                      >
                        <div>
                          <span style={{ color: '#b45309', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}>
                            <IonIcon icon={flashOutline} style={{ color: '#d97706', fontSize: '16px' }} /> Room Light Bill:
                          </span>
                          {currentRec.electricityBillUrl && (() => {
                            const token = localStorage.getItem('token');
                            const rawUrl = currentRec.electricityBillUrl.startsWith('http')
                              ? currentRec.electricityBillUrl
                              : `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') : 'http://localhost:5000'}${currentRec.electricityBillUrl}`;
                            const finalUrl = token && !rawUrl.includes('token=')
                              ? `${rawUrl}${rawUrl.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`
                              : rawUrl;
                            return (
                              <a
                                href={finalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#2563eb', fontSize: '11px', textDecoration: 'underline', fontWeight: 700, display: 'inline-block', marginTop: '3px' }}
                              >
                                View Bill Copy Attached →
                              </a>
                            );
                          })()}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <strong style={{ color: '#b45309', fontSize: '15px' }}>
                            +₹{calculatedElectricity.toLocaleString('en-IN')}
                          </strong>
                        </div>
                      </div>
                    )}

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTop: '2px solid #e2e8f0',
                        paddingTop: '10px',
                        marginTop: '10px',
                      }}
                    >
                      <div>
                        <span style={{ color: '#0f172a', fontWeight: 800, fontSize: '14px' }}>Total Have to Pay:</span>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          (Rent ₹{currentRec.rentAmount?.toLocaleString('en-IN')}{calculatedElectricity > 0 ? ` + Light Bill ₹${calculatedElectricity.toLocaleString('en-IN')}` : ''})
                        </div>
                      </div>
                      <strong style={{ color: '#dc2626', fontSize: '18px', fontWeight: 900 }}>
                        ₹{(currentRec.outstandingAmount ?? currentRec.totalPayable)?.toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>
                );
              })()}

              <IonItem lines="inset" style={{ '--padding-start': '0', marginBottom: '16px' }}>
                <IonLabel position="stacked" style={{ fontWeight: '600' }}>Amount to Pay (INR) *</IonLabel>
                <IonInput
                  type="number"
                  required
                  value={amount}
                  onIonChange={(e) => setAmount(Number(e.detail.value!))}
                />
              </IonItem>

              <IonItem lines="inset" style={{ '--padding-start': '0', marginBottom: '16px' }}>
                <IonLabel position="stacked" style={{ fontWeight: '600' }}>Payment Mode *</IonLabel>
                <IonSelect
                  value={paymentMethod}
                  onIonChange={(e) => setPaymentMethod(e.detail.value)}
                >
                  <IonSelectOption value="UPI">UPI (Google Pay / PhonePe / Paytm)</IonSelectOption>
                  <IonSelectOption value="Bank Transfer">Bank NEFT / IMPS</IonSelectOption>
                </IonSelect>
              </IonItem>

              <IonItem lines="inset" style={{ '--padding-start': '0', marginBottom: '16px' }}>
                <IonLabel position="stacked" style={{ fontWeight: '600' }}>
                  Transaction UTR / Reference ID *
                </IonLabel>
                <IonInput
                  required
                  placeholder="12-digit UPI reference number"
                  value={transactionId}
                  onIonChange={(e) => setTransactionId(e.detail.value!)}
                />
              </IonItem>

              {/* Screenshot Upload */}
              <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>
                  Payment Screenshot Proof *
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                  }}
                  required
                />

                {previewUrl && (
                  <div style={{ marginTop: '10px', textAlign: 'center' }}>
                    <img
                      src={previewUrl}
                      alt="Payment Proof Preview"
                      style={{ maxHeight: '180px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}
                    />
                  </div>
                )}
              </div>

              <IonItem lines="inset" style={{ '--padding-start': '0', marginBottom: '24px' }}>
                <IonLabel position="stacked" style={{ fontWeight: '600' }}>Remarks (Optional)</IonLabel>
                <IonInput
                  placeholder="e.g. Paid via GPay"
                  value={remarks}
                  onIonChange={(e) => setRemarks(e.detail.value!)}
                />
              </IonItem>

              <IonButton expand="block" type="submit" color="primary" style={{ height: '48px', fontSize: '16px' }}>
                <IonIcon icon={cloudUploadOutline} slot="start" />
                Submit Verification Proof
              </IonButton>
            </form>
          </IonCardContent>
        </IonCard>

        <IonLoading isOpen={loading} message="Submitting payment proof..." />
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

export default ResidentPay;


