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
  IonSelect,
  IonSelectOption,
  IonToast,
  IonModal,
  IonTextarea,
  IonSegment,
  IonSegmentButton,
  IonButtons,
} from '@ionic/react';
import { checkmarkDoneOutline, timeOutline, alertCircleOutline, closeOutline } from 'ionicons/icons';
import { complaintService } from '../../services';

const AdminComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'In Progress' | 'Resolved'>('All');
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string>('In Progress');
  const [adminRemarks, setAdminRemarks] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadComplaints = async () => {
    try {
      const filter = statusFilter === 'All' ? {} : { status: statusFilter };
      const data = await complaintService.getAll(filter);
      setComplaints(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [statusFilter]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    try {
      await complaintService.updateStatus(selectedComplaint._id, {
        status: updateStatus,
        adminRemarks,
      });
      setToastMessage('Complaint status updated and resident notified.');
      setModalOpen(false);
      await loadComplaints();
    } catch (err: any) {
      setToastMessage(err.response?.data?.error || 'Failed to update complaint');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Complaints Management</IonTitle>
        </IonToolbar>
        <IonSegment value={statusFilter} onIonChange={(e) => setStatusFilter(e.detail.value as any)}>
          <IonSegmentButton value="All">
            <IonLabel>All</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="Open">
            <IonLabel>Open</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="In Progress">
            <IonLabel>In Progress</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="Resolved">
            <IonLabel>Resolved</IonLabel>
          </IonSegmentButton>
        </IonSegment>
      </IonHeader>

      <IonContent className="ion-padding" style={{ '--background': '#f8fafc' }}>
        {complaints.map((c) => (
          <IonCard key={c._id} style={{ margin: '0 0 16px 0', border: '1px solid #e2e8f0' }}>
            <IonCardContent style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 4px 0', color: '#0f172a' }}>
                    {c.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                    {c.residentId?.fullName} • Room {c.roomId?.roomNumber || 'N/A'} • {c.category}
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

              <p style={{ fontSize: '14px', color: '#334155', margin: '12px 0' }}>
                {c.description}
              </p>

              {c.adminRemarks && (
                <div style={{ background: '#f1f5f9', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', color: '#475569' }}>
                  <strong>Admin Note:</strong> {c.adminRemarks}
                </div>
              )}

              <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Priority: <strong style={{ color: '#0f172a' }}>{c.priority}</strong> • {new Date(c.createdAt).toLocaleDateString()}
                </span>
                <IonButton
                  size="small"
                  fill="outline"
                  onClick={() => {
                    setSelectedComplaint(c);
                    setUpdateStatus(c.status);
                    setAdminRemarks(c.adminRemarks || '');
                    setModalOpen(true);
                  }}
                >
                  Update Status
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        ))}

        {complaints.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
            <IonIcon icon={checkmarkDoneOutline} style={{ fontSize: '48px', color: '#22c55e', marginBottom: '8px' }} />
            <h3>No complaints found</h3>
            <p>No complaints match the selected filter.</p>
          </div>
        )}

        {/* Update Complaint Modal */}
        <IonModal isOpen={modalOpen} onDidDismiss={() => setModalOpen(false)}>
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>Update Complaint</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setModalOpen(false)} style={{ color: '#ffffff', fontWeight: 800 }}>
                  <IonIcon icon={closeOutline} slot="start" style={{ fontSize: '20px' }} />
                  Cancel
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {selectedComplaint && (
              <form onSubmit={handleUpdate}>
                <h3>{selectedComplaint.title}</h3>
                <p style={{ fontSize: '13px', color: '#64748b' }}>
                  Resident: {selectedComplaint.residentId?.fullName} ({selectedComplaint.category})
                </p>

                <IonItem lines="inset" style={{ '--padding-start': '0' }}>
                  <IonLabel position="stacked">Status</IonLabel>
                  <IonSelect
                    value={updateStatus}
                    onIonChange={(e) => setUpdateStatus(e.detail.value)}
                  >
                    <IonSelectOption value="Open">Open</IonSelectOption>
                    <IonSelectOption value="In Progress">In Progress</IonSelectOption>
                    <IonSelectOption value="Resolved">Resolved</IonSelectOption>
                    <IonSelectOption value="Closed">Closed</IonSelectOption>
                  </IonSelect>
                </IonItem>

                <IonItem lines="inset" style={{ '--padding-start': '0', marginTop: '16px' }}>
                  <IonLabel position="stacked">Remarks / Work Resolution Note</IonLabel>
                  <IonTextarea
                    rows={4}
                    value={adminRemarks}
                    placeholder="e.g. Plumber visited and repaired the water tap"
                    onIonChange={(e) => setAdminRemarks(e.detail.value!)}
                  />
                </IonItem>

                <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
                  <IonButton expand="block" color="medium" fill="outline" style={{ flex: 1 }} onClick={() => setModalOpen(false)}>
                    Cancel
                  </IonButton>
                  <IonButton expand="block" color="primary" type="submit" style={{ flex: 1 }}>
                    Save & Notify
                  </IonButton>
                </div>
              </form>
            )}
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

export default AdminComplaints;

