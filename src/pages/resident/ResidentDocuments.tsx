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
  IonModal,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonToast,
  IonLoading,
  IonButtons,
} from '@ionic/react';
import { cloudUploadOutline, checkmarkCircleOutline, closeCircleOutline, timeOutline, eyeOutline, closeOutline } from 'ionicons/icons';
import { documentService } from '../../services';

const ResidentDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [category, setCategory] = useState<any>('Aadhaar Front');
  const [documentName, setDocumentName] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadDocs = async () => {
    try {
      const data = await documentService.getByResident();
      setDocuments(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setToastMessage('Please select a document file');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      formData.append('documentName', documentName || file.name);
      formData.append('documentNumber', documentNumber);

      await documentService.upload(formData);
      setToastMessage('Document uploaded securely! Verification pending.');
      setModalOpen(false);
      setFile(null);
      setDocumentName('');
      setDocumentNumber('');
      await loadDocs();
    } catch (err: any) {
      setToastMessage(err.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>My Identity Documents</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" style={{ '--background': '#f8fafc' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
              Verification Documents
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
              Aadhaar, PAN & Rental Agreement
            </p>
          </div>

          <IonButton size="small" color="primary" onClick={() => setModalOpen(true)}>
            <IonIcon icon={cloudUploadOutline} slot="start" />
            Upload Document
          </IonButton>
        </div>

        {documents.map((d) => (
          <IonCard key={d._id} style={{ margin: '0 0 14px 0', border: '1px solid #e2e8f0' }}>
            <IonCardContent style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: '0 0 2px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                    {d.documentName}
                  </h4>
                  <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#2563eb', fontWeight: 600 }}>
                    {d.category}
                  </p>
                  {d.documentNumberMasked && (
                    <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>
                      ID Number: <code>{d.documentNumberMasked}</code>
                    </p>
                  )}
                  <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#94a3b8' }}>
                    Uploaded on: {new Date(d.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <IonBadge
                    color={
                      d.verificationStatus === 'Verified'
                        ? 'success'
                        : d.verificationStatus === 'Rejected'
                        ? 'danger'
                        : 'warning'
                    }
                  >
                    {d.verificationStatus}
                  </IonBadge>
                  <div style={{ marginTop: '8px' }}>
                    <IonButton
                      size="small"
                      fill="outline"
                      onClick={() => {
                        const targetUrl = (d as any).cloudinaryUrl || documentService.getFileUrl(d._id);
                        window.open(targetUrl, '_blank');
                      }}
                    >
                      <IonIcon icon={eyeOutline} slot="start" />
                      View
                    </IonButton>
                  </div>
                </div>
              </div>

              {d.rejectionReason && (
                <div style={{ marginTop: '10px', background: '#fee2e2', color: '#991b1b', padding: '8px 12px', borderRadius: '8px', fontSize: '12px' }}>
                  <strong>Rejection Reason:</strong> {d.rejectionReason}
                </div>
              )}
            </IonCardContent>
          </IonCard>
        ))}

        {documents.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
            <IonIcon icon={cloudUploadOutline} style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '8px' }} />
            <h3>No Documents Uploaded</h3>
            <p>Please upload Aadhaar or PAN identity documents for PG verification.</p>
          </div>
        )}

        {/* Upload Modal */}
        <IonModal isOpen={modalOpen} onDidDismiss={() => setModalOpen(false)}>
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>Upload Identity Document</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setModalOpen(false)} style={{ color: '#ffffff', fontWeight: 800 }}>
                  <IonIcon icon={closeOutline} slot="start" style={{ fontSize: '20px' }} />
                  Cancel
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <form onSubmit={handleUpload}>
              <IonItem lines="inset" style={{ '--padding-start': '0', marginBottom: '16px' }}>
                <IonLabel position="stacked" style={{ fontWeight: '600' }}>Document Category *</IonLabel>
                <IonSelect
                  value={category}
                  onIonChange={(e) => setCategory(e.detail.value)}
                >
                  <IonSelectOption value="Aadhaar Front">Aadhaar Front</IonSelectOption>
                  <IonSelectOption value="Aadhaar Back">Aadhaar Back</IonSelectOption>
                  <IonSelectOption value="PAN Card">PAN Card</IonSelectOption>
                  <IonSelectOption value="Passport">Passport</IonSelectOption>
                  <IonSelectOption value="Rental Agreement">Rental Agreement</IonSelectOption>
                  <IonSelectOption value="Other">Other</IonSelectOption>
                </IonSelect>
              </IonItem>

              <IonItem lines="inset" style={{ '--padding-start': '0', marginBottom: '16px' }}>
                <IonLabel position="stacked" style={{ fontWeight: '600' }}>Document Name / Label</IonLabel>
                <IonInput
                  value={documentName}
                  placeholder="e.g. My Aadhaar Card"
                  onIonChange={(e) => setDocumentName(e.detail.value!)}
                />
              </IonItem>

              <IonItem lines="inset" style={{ '--padding-start': '0', marginBottom: '16px' }}>
                <IonLabel position="stacked" style={{ fontWeight: '600' }}>Document Number (Optional)</IonLabel>
                <IonInput
                  value={documentNumber}
                  placeholder="e.g. Aadhaar 12-digit number"
                  onIonChange={(e) => setDocumentNumber(e.detail.value!)}
                />
              </IonItem>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                  Select File (PDF or Image, max 10MB) *
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFile(e.target.files[0]);
                    }
                  }}
                  required
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <IonButton expand="block" color="medium" fill="outline" style={{ flex: 1 }} onClick={() => setModalOpen(false)}>
                  Cancel
                </IonButton>
                <IonButton expand="block" color="primary" type="submit" style={{ flex: 1 }}>
                  Upload
                </IonButton>
              </div>
            </form>
          </IonContent>
        </IonModal>

        <IonLoading isOpen={loading} message="Uploading document securely..." />
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

export default ResidentDocuments;

