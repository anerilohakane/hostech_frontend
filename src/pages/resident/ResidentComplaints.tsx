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
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonToast,
  IonLoading,
  IonButtons,
} from '@ionic/react';
import { addOutline, chatbubbleEllipsesOutline, checkmarkCircleOutline, closeOutline } from 'ionicons/icons';
import { complaintService } from '../../services';

const ResidentComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<any>('Wi-Fi');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<any>('Medium');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadComplaints = async () => {
    try {
      const data = await complaintService.getAll();
      setComplaints(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      setToastMessage('Please fill all required complaint fields');
      return;
    }

    setLoading(true);
    try {
      await complaintService.create({
        title,
        category,
        description,
        priority,
      });
      setToastMessage('Complaint raised successfully! Property manager will attend to it.');
      setModalOpen(false);
      setTitle('');
      setDescription('');
      await loadComplaints();
    } catch (err: any) {
      setToastMessage(err.response?.data?.error || 'Failed to raise complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>My Complaints</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" style={{ '--background': '#f8fafc' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
              Maintenance Tickets
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
              Wi-Fi, Water, Food, Housekeeping
            </p>
          </div>

          <IonButton size="small" color="primary" onClick={() => setModalOpen(true)}>
            <IonIcon icon={addOutline} slot="start" />
            Raise Issue
          </IonButton>
        </div>

        {complaints.map((c) => (
          <IonCard key={c._id} style={{ margin: '0 0 14px 0', border: '1px solid #e2e8f0' }}>
            <IonCardContent style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: '0 0 2px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                    {c.title}
                  </h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#2563eb', fontWeight: 600 }}>
                    Category: {c.category} • Priority: {c.priority}
                  </p>
                </div>

                <IonBadge
                  color={
                    c.status === 'Resolved'
                      ? 'success'
                      : c.status === 'In Progress'
                      ? 'secondary'
                      : c.status === 'Open'
                      ? 'warning'
                      : 'medium'
                  }
                >
                  {c.status}
                </IonBadge>
              </div>

              <p style={{ fontSize: '13px', color: '#334155', margin: '10px 0' }}>
                {c.description}
              </p>

              {c.adminRemarks && (
                <div style={{ background: '#f1f5f9', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', color: '#475569' }}>
                  <strong>Admin Response:</strong> {c.adminRemarks}
                </div>
              )}

              <div style={{ marginTop: '8px', fontSize: '11px', color: '#94a3b8' }}>
                Raised on: {new Date(c.createdAt).toLocaleDateString()}
              </div>
            </IonCardContent>
          </IonCard>
        ))}

        {complaints.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
            <IonIcon icon={chatbubbleEllipsesOutline} style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '8px' }} />
            <h3>No Active Complaints</h3>
            <p>Everything in your PG accommodation looks good!</p>
          </div>
        )}

        {/* Raise Issue Modal */}
        <IonModal isOpen={modalOpen} onDidDismiss={() => setModalOpen(false)}>
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>Raise Complaint</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setModalOpen(false)} style={{ color: '#ffffff', fontWeight: 800 }}>
                  <IonIcon icon={closeOutline} slot="start" style={{ fontSize: '20px' }} />
                  Cancel
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <form onSubmit={handleSubmit}>
              <IonItem lines="inset" style={{ '--padding-start': '0', marginBottom: '16px' }}>
                <IonLabel position="stacked" style={{ fontWeight: '600' }}>Category *</IonLabel>
                <IonSelect
                  value={category}
                  onIonChange={(e) => setCategory(e.detail.value)}
                >
                  <IonSelectOption value="Water">Water Supply / Geyser</IonSelectOption>
                  <IonSelectOption value="Electricity">Electricity / AC / Fan</IonSelectOption>
                  <IonSelectOption value="Wi-Fi">Wi-Fi / Internet</IonSelectOption>
                  <IonSelectOption value="Cleaning">Cleaning / Housekeeping</IonSelectOption>
                  <IonSelectOption value="Food">Food / Mess</IonSelectOption>
                  <IonSelectOption value="Maintenance">Carpentry / Plumbing</IonSelectOption>
                  <IonSelectOption value="Room issues">Room / Bed issue</IonSelectOption>
                  <IonSelectOption value="Other">Other</IonSelectOption>
                </IonSelect>
              </IonItem>

              <IonItem lines="inset" style={{ '--padding-start': '0', marginBottom: '16px' }}>
                <IonLabel position="stacked" style={{ fontWeight: '600' }}>Issue Title *</IonLabel>
                <IonInput
                  value={title}
                  placeholder="e.g. Wi-Fi router on 1st floor not working"
                  onIonChange={(e) => setTitle(e.detail.value!)}
                  required
                />
              </IonItem>

              <IonItem lines="inset" style={{ '--padding-start': '0', marginBottom: '16px' }}>
                <IonLabel position="stacked" style={{ fontWeight: '600' }}>Priority</IonLabel>
                <IonSelect
                  value={priority}
                  onIonChange={(e) => setPriority(e.detail.value)}
                >
                  <IonSelectOption value="Low">Low</IonSelectOption>
                  <IonSelectOption value="Medium">Medium</IonSelectOption>
                  <IonSelectOption value="High">High</IonSelectOption>
                  <IonSelectOption value="Urgent">Urgent</IonSelectOption>
                </IonSelect>
              </IonItem>

              <IonItem lines="inset" style={{ '--padding-start': '0', marginBottom: '24px' }}>
                <IonLabel position="stacked" style={{ fontWeight: '600' }}>Detailed Description *</IonLabel>
                <IonTextarea
                  rows={4}
                  value={description}
                  placeholder="Describe the issue in detail..."
                  onIonChange={(e) => setDescription(e.detail.value!)}
                  required
                />
              </IonItem>

              <div style={{ display: 'flex', gap: '8px' }}>
                <IonButton expand="block" color="medium" fill="outline" style={{ flex: 1 }} onClick={() => setModalOpen(false)}>
                  Cancel
                </IonButton>
                <IonButton expand="block" color="primary" type="submit" style={{ flex: 1 }}>
                  Submit Complaint
                </IonButton>
              </div>
            </form>
          </IonContent>
        </IonModal>

        <IonLoading isOpen={loading} message="Submitting..." />
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

export default ResidentComplaints;

