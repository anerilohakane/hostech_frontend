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
  IonButton,
  IonIcon,
  IonList,
  IonBadge,
  IonAlert,
  IonModal,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonToast,
  IonButtons,
} from '@ionic/react';
import {
  personCircleOutline,
  mailOutline,
  callOutline,
  homeOutline,
  bedOutline,
  cashOutline,
  shieldCheckmarkOutline,
  logOutOutline,
  documentTextOutline,
  createOutline,
  briefcaseOutline,
  closeOutline,
} from 'ionicons/icons';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services';
import { useHistory } from 'react-router-dom';

const ResidentProfilePage: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    permanentAddress: '',
    occupation: 'Working Professional',
    companyOrCollege: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    password: '',
  });

  const history = useHistory();

  const fetchProfile = async () => {
    try {
      const res = await authService.getMe();
      if (res && res.residentProfile) {
        setProfile(res.residentProfile);
        setEditForm({
          name: res.residentProfile.fullName || '',
          phone: res.residentProfile.phone || '',
          permanentAddress: res.residentProfile.permanentAddress || '',
          occupation: res.residentProfile.occupation || 'Working Professional',
          companyOrCollege: res.residentProfile.companyOrCollege || '',
          emergencyContactName: res.residentProfile.emergencyContactName || '',
          emergencyContactNumber: res.residentProfile.emergencyContactNumber || '',
          password: '',
        });
      }
    } catch (err) {
      console.error('Error fetching resident profile', err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = () => {
    logout();
    history.replace('/login');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authService.updateProfile({
        name: editForm.name,
        phone: editForm.phone,
        permanentAddress: editForm.permanentAddress,
        occupation: editForm.occupation,
        companyOrCollege: editForm.companyOrCollege,
        emergencyContactName: editForm.emergencyContactName,
        emergencyContactNumber: editForm.emergencyContactNumber,
        password: editForm.password ? editForm.password : undefined,
      });
      setToastMessage('Profile details updated successfully!');
      setEditModalOpen(false);
      await refreshUser();
      await fetchProfile();
    } catch (err: any) {
      setToastMessage(err.response?.data?.error || 'Failed to update profile');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>My Profile</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setEditModalOpen(true)}>
              <IonIcon icon={createOutline} slot="start" />
              Edit
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" style={{ '--background': '#f8fafc' }}>
        {/* Profile Header Card */}
        <IonCard style={{ margin: '0 0 16px 0', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <IonCardContent style={{ padding: '24px 16px' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: '#e0e7ff',
                color: '#2563eb',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '44px',
                marginBottom: '12px',
              }}
            >
              <IonIcon icon={personCircleOutline} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
              {profile?.fullName || user?.name || 'Resident'}
            </h2>
            <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#64748b' }}>
              {profile?.occupation || 'Resident'} • {profile?.companyOrCollege || 'PG Member'}
            </p>
            <IonBadge color={profile?.status === 'Active' ? 'success' : 'warning'}>
              {profile?.status || 'Active'}
            </IonBadge>

            <div style={{ marginTop: '16px' }}>
              <IonButton size="small" fill="outline" onClick={() => setEditModalOpen(true)}>
                <IonIcon icon={createOutline} slot="start" />
                Edit Profile Info
              </IonButton>
            </div>
          </IonCardContent>
        </IonCard>

        {/* Room & PG Details */}
        <IonCard style={{ margin: '0 0 16px 0', border: '1px solid #e2e8f0' }}>
          <IonCardContent style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 12px 0' }}>
              Accommodation Details
            </h3>
            <IonList lines="full">
              <IonItem>
                <IonIcon icon={homeOutline} slot="start" color="primary" />
                <IonLabel>
                  <p style={{ fontSize: '11px', color: '#64748b' }}>PG Property</p>
                  <h4 style={{ fontWeight: '700' }}>{profile?.propertyId?.name || 'Stanza Living'}</h4>
                  <small style={{ color: '#64748b' }}>{profile?.propertyId?.address || 'Bellandur, Bengaluru'}</small>
                </IonLabel>
              </IonItem>

              <IonItem>
                <IonIcon icon={bedOutline} slot="start" color="primary" />
                <IonLabel>
                  <p style={{ fontSize: '11px', color: '#64748b' }}>Room & Plan</p>
                  <h4 style={{ fontWeight: '700' }}>
                    Room {profile?.roomId?.roomNumber || '101'} ({profile?.occupancyType || 'Full Room'})
                  </h4>
                  <small style={{ color: '#64748b' }}>
                    Floor {profile?.roomId?.floor || '1'} • {profile?.roomId?.roomType || 'AC'}
                  </small>
                </IonLabel>
              </IonItem>

              <IonItem>
                <IonIcon icon={cashOutline} slot="start" color="primary" />
                <IonLabel>
                  <p style={{ fontSize: '11px', color: '#64748b' }}>Monthly Rent & Due Day</p>
                  <h4 style={{ fontWeight: '700', color: '#16a34a' }}>
                    ₹{(profile?.monthlyRent ?? 0).toLocaleString('en-IN')} / month
                  </h4>
                  <small style={{ color: '#64748b' }}>Due on 5th of every month</small>
                </IonLabel>
              </IonItem>

              <IonItem>
                <IonIcon icon={shieldCheckmarkOutline} slot="start" color="primary" />
                <IonLabel>
                  <p style={{ fontSize: '11px', color: '#64748b' }}>Security Deposit</p>
                  <h4 style={{ fontWeight: '700' }}>
                    ₹{(profile?.securityDepositPaid ?? 0).toLocaleString('en-IN')} Paid
                  </h4>
                  <small style={{ color: '#64748b' }}>Total Required: ₹{(profile?.securityDeposit ?? 0).toLocaleString('en-IN')}</small>
                </IonLabel>
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>

        {/* Contact & Personal Info */}
        <IonCard style={{ margin: '0 0 16px 0', border: '1px solid #e2e8f0' }}>
          <IonCardContent style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 12px 0' }}>
              Contact & Emergency Information
            </h3>
            <IonList lines="full">
              <IonItem>
                <IonIcon icon={mailOutline} slot="start" color="medium" />
                <IonLabel>
                  <p style={{ fontSize: '11px', color: '#64748b' }}>Email</p>
                  <h4 style={{ fontWeight: '600' }}>{profile?.email || user?.email}</h4>
                </IonLabel>
              </IonItem>

              <IonItem>
                <IonIcon icon={callOutline} slot="start" color="medium" />
                <IonLabel>
                  <p style={{ fontSize: '11px', color: '#64748b' }}>Phone Number</p>
                  <h4 style={{ fontWeight: '600' }}>{profile?.phone || 'N/A'}</h4>
                </IonLabel>
              </IonItem>

              <IonItem>
                <IonIcon icon={documentTextOutline} slot="start" color="medium" />
                <IonLabel>
                  <p style={{ fontSize: '11px', color: '#64748b' }}>Permanent Address</p>
                  <h4 style={{ fontWeight: '600' }}>{profile?.permanentAddress || 'N/A'}</h4>
                </IonLabel>
              </IonItem>

              <IonItem>
                <IonIcon icon={callOutline} slot="start" color="warning" />
                <IonLabel>
                  <p style={{ fontSize: '11px', color: '#64748b' }}>Emergency Contact</p>
                  <h4 style={{ fontWeight: '600' }}>{profile?.emergencyContactName || 'N/A'}</h4>
                  <small style={{ color: '#64748b' }}>{profile?.emergencyContactNumber || 'N/A'}</small>
                </IonLabel>
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>

        {/* Uploaded Documents & ID Proofs */}
        <IonCard style={{ margin: '0 0 16px 0', border: '1px solid #e2e8f0' }}>
          <IonCardContent style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                My Identity Proofs & Documents
              </h3>
              <span style={{ fontSize: '12px', background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                {profile?.documents?.length || 0} Attached
              </span>
            </div>

            {profile?.documents && profile.documents.length > 0 ? (
              <IonList lines="full">
                {profile.documents.map((doc: any) => (
                  <IonItem key={doc._id} style={{ '--padding-start': '0' }}>
                    <IonIcon icon={shieldCheckmarkOutline} slot="start" color="primary" />
                    <IonLabel>
                      <h4 style={{ fontWeight: 700, fontSize: '14px' }}>{doc.category || doc.documentName}</h4>
                      <p style={{ fontSize: '12px', color: '#64748b' }}>
                        {doc.documentNumberMasked ? `ID: ${doc.documentNumberMasked} • ` : ''}
                        {doc.verificationStatus === 'Verified' ? '✓ Verified Proof' : 'Pending Verification'}
                      </p>
                    </IonLabel>
                    {doc.cloudinaryUrl && (
                      <IonButton
                        fill="outline"
                        size="small"
                        slot="end"
                        href={doc.cloudinaryUrl}
                        target="_blank"
                      >
                        View
                      </IonButton>
                    )}
                  </IonItem>
                ))}
              </IonList>
            ) : (
              <div style={{ padding: '12px 0', color: '#94a3b8', fontSize: '13px', textAlign: 'center' }}>
                No identity documents attached yet.
              </div>
            )}
          </IonCardContent>
        </IonCard>

        {/* Prominent Logout Button */}
        <div style={{ margin: '24px 0 32px 0' }}>
          <IonButton
            expand="block"
            color="danger"
            style={{ height: '48px', fontSize: '16px', fontWeight: '700' }}
            onClick={() => setShowLogoutAlert(true)}
          >
            <IonIcon icon={logOutOutline} slot="start" />
            Log Out from Resident Portal
          </IonButton>
        </div>

        {/* Edit Resident Profile Modal */}
        <IonModal isOpen={editModalOpen} onDidDismiss={() => setEditModalOpen(false)}>
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>Edit Profile Info</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setEditModalOpen(false)} style={{ color: '#ffffff', fontWeight: 800 }}>
                  <IonIcon icon={closeOutline} slot="start" style={{ fontSize: '20px' }} />
                  Cancel
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <form onSubmit={handleSaveProfile}>
              <IonItem lines="inset" style={{ '--padding-start': '0', marginBottom: '16px' }}>
                <IonLabel position="stacked" style={{ fontWeight: '600' }}>Full Name *</IonLabel>
                <IonInput
                  required
                  value={editForm.name}
                  onIonChange={(e) => setEditForm({ ...editForm, name: e.detail.value! })}
                />
              </IonItem>

              <IonItem lines="inset" style={{ '--padding-start': '0', marginBottom: '16px' }}>
                <IonLabel position="stacked" style={{ fontWeight: '600' }}>Phone Number *</IonLabel>
                <IonInput
                  type="tel"
                  required
                  value={editForm.phone}
                  onIonChange={(e) => setEditForm({ ...editForm, phone: e.detail.value! })}
                />
              </IonItem>

              <IonItem lines="inset" style={{ '--padding-start': '0', marginBottom: '16px' }}>
                <IonLabel position="stacked" style={{ fontWeight: '600' }}>Occupation</IonLabel>
                <IonSelect
                  value={editForm.occupation}
                  onIonChange={(e) => setEditForm({ ...editForm, occupation: e.detail.value })}
                >
                  <IonSelectOption value="Working Professional">Working Professional</IonSelectOption>
                  <IonSelectOption value="Student">Student</IonSelectOption>
                  <IonSelectOption value="Other">Other</IonSelectOption>
                </IonSelect>
              </IonItem>

              <IonItem lines="inset" style={{ '--padding-start': '0', marginBottom: '16px' }}>
                <IonLabel position="stacked" style={{ fontWeight: '600' }}>Company or College</IonLabel>
                <IonInput
                  value={editForm.companyOrCollege}
                  placeholder="e.g. Google Bengaluru"
                  onIonChange={(e) => setEditForm({ ...editForm, companyOrCollege: e.detail.value! })}
                />
              </IonItem>

              <IonItem lines="inset" style={{ '--padding-start': '0', marginBottom: '16px' }}>
                <IonLabel position="stacked" style={{ fontWeight: '600' }}>Permanent Address</IonLabel>
                <IonInput
                  value={editForm.permanentAddress}
                  onIonChange={(e) => setEditForm({ ...editForm, permanentAddress: e.detail.value! })}
                />
              </IonItem>

              <IonItem lines="inset" style={{ '--padding-start': '0', marginBottom: '16px' }}>
                <IonLabel position="stacked" style={{ fontWeight: '600' }}>Emergency Contact Name</IonLabel>
                <IonInput
                  value={editForm.emergencyContactName}
                  onIonChange={(e) => setEditForm({ ...editForm, emergencyContactName: e.detail.value! })}
                />
              </IonItem>

              <IonItem lines="inset" style={{ '--padding-start': '0', marginBottom: '16px' }}>
                <IonLabel position="stacked" style={{ fontWeight: '600' }}>Emergency Contact Number</IonLabel>
                <IonInput
                  value={editForm.emergencyContactNumber}
                  onIonChange={(e) => setEditForm({ ...editForm, emergencyContactNumber: e.detail.value! })}
                />
              </IonItem>

              <IonItem lines="inset" style={{ '--padding-start': '0', marginBottom: '24px' }}>
                <IonLabel position="stacked" style={{ fontWeight: '600' }}>
                  New Password (leave blank to keep current)
                </IonLabel>
                <IonInput
                  type="password"
                  placeholder="••••••••"
                  value={editForm.password}
                  onIonChange={(e) => setEditForm({ ...editForm, password: e.detail.value! })}
                />
              </IonItem>

              <IonButton expand="block" type="submit" color="primary" style={{ height: '48px' }}>
                Save Profile Details
              </IonButton>
            </form>
          </IonContent>
        </IonModal>

        {/* Confirmation Alert */}
        <IonAlert
          isOpen={showLogoutAlert}
          onDidDismiss={() => setShowLogoutAlert(false)}
          header="Confirm Log Out"
          message="Are you sure you want to log out of your PG Resident account?"
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
            },
            {
              text: 'Log Out',
              role: 'destructive',
              handler: handleLogout,
            },
          ]}
        />

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

export default ResidentProfilePage;
