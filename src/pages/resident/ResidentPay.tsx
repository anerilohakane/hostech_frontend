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
import { cloudUploadOutline, checkmarkCircleOutline, cardOutline, qrCodeOutline } from 'ionicons/icons';
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
        history.replace('/resident/payments');
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
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/resident/dashboard" />
          </IonButtons>
          <IonTitle>Submit Rent Payment</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" style={{ '--background': '#f8fafc' }}>
        {/* Payment Account Details */}
        <IonCard style={{ margin: '0 0 16px 0', border: '1px solid #bfdbfe', background: '#eff6ff' }}>
          <IonCardContent style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <IonIcon icon={qrCodeOutline} style={{ color: '#2563eb', fontSize: '20px' }} />
              <strong style={{ color: '#1e40af', fontSize: '14px' }}>PG Official Payment UPI ID</strong>
            </div>
            <div style={{ background: '#fff', padding: '8px 12px', borderRadius: '8px', border: '1px dashed #93c5fd', fontSize: '15px', fontWeight: '800', color: '#1d4ed8' }}>
              {settings?.upiId || 'pgmanagement@okhdfcbank'}
            </div>
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#475569' }}>
              Bank: <strong>{settings?.bankDetails?.bankName || 'HDFC Bank'}</strong> • A/C: <strong>{settings?.bankDetails?.accountNumber || '50200012345678'}</strong> (IFSC: {settings?.bankDetails?.ifscCode || 'HDFC0001234'})
            </div>
          </IonCardContent>
        </IonCard>

        {/* Submission Form */}
        <IonCard style={{ margin: 0, border: '1px solid #e2e8f0' }}>
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

              {currentRec && (
                <div style={{ background: '#f1f5f9', padding: '10px 14px', borderRadius: '10px', marginBottom: '16px', fontSize: '13px' }}>
                  <div>Total Rent: <strong>₹{currentRec.rentAmount}</strong></div>
                  <div>Outstanding Balance: <strong style={{ color: '#dc2626' }}>₹{currentRec.outstandingAmount}</strong></div>
                </div>
              )}

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
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
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
                      style={{ maxHeight: '180px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
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

