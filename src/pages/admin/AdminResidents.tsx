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
  IonSearchbar,
  IonButtons,
  IonLoading,
} from '@ionic/react';
import { addOutline, businessOutline, eyeOutline, eyeOffOutline, mailOutline, lockClosedOutline, documentAttachOutline, cloudUploadOutline, checkmarkCircleOutline, closeOutline, closeCircleOutline, copyOutline } from 'ionicons/icons';
import { residentService, propertyService, roomService } from '../../services';
import { useHistory } from 'react-router-dom';

const AdminResidents: React.FC = () => {
  const [residents, setResidents] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedResidentForCheckout, setSelectedResidentForCheckout] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    password: string;
    name: string;
    room: string;
    emailSent?: boolean;
  } | null>(null);
  const history = useHistory();

  // Registration Form
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    permanentAddress: '',
    occupation: 'Working Professional',
    companyOrCollege: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    joiningDate: new Date().toISOString().slice(0, 10),
    propertyId: '',
    roomId: '',
    occupancyType: 'Single',
    sharingTenantCount: 2,
    monthlyRent: 12000,
    securityDeposit: 20000,
    advancePayment: 0,
    noticePeriodDays: 30,
    aadhaarNumber: '',
    panNumber: '',
    aadhaarFrontFile: null as { name: string; type: string; size: number; base64: string } | null,
    aadhaarBackFile: null as { name: string; type: string; size: number; base64: string } | null,
    panCardFile: null as { name: string; type: string; size: number; base64: string } | null,
  });

  // Checkout Form
  const [checkoutData, setCheckoutData] = useState({
    vacatingDate: new Date().toISOString().slice(0, 10),
    damageDeductions: 0,
    otherDeductions: 0,
    refundMethod: 'UPI',
    refundReference: '',
    notes: '',
  });

  const loadResidents = async () => {
    try {
      const data = await residentService.getAll({ search: search || undefined });
      setResidents(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadPropertiesAndRooms = async () => {
    try {
      const [props, rList] = await Promise.all([
        propertyService.getAll(),
        roomService.getRooms(),
      ]);
      setProperties(props);
      setRooms(rList);

      if (props.length > 0) {
        setFormData((prev) => ({
          ...prev,
          propertyId: props[0]._id,
        }));
      }

      if (rList.length > 0) {
        const firstRoom = rList[0];
        const initialRent = firstRoom.defaultRent ? Number(firstRoom.defaultRent) : 12000;
        const initialRentalType = firstRoom.rentalType === 'Full Room (Single Tenant)' ? 'Single' : 'Sharing';
        setFormData((prev) => ({
          ...prev,
          roomId: firstRoom._id,
          monthlyRent: initialRent,
          securityDeposit: initialRent * 2,
          occupancyType: initialRentalType,
          sharingTenantCount: firstRoom.maxCapacity || 2,
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadResidents();
  }, [search]);

  useEffect(() => {
    loadPropertiesAndRooms();
  }, []);

  const openRegisterModal = async () => {
    // Refresh rooms and properties before opening modal
    await loadPropertiesAndRooms();
    setModalOpen(true);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.roomId) {
      setToastMessage('Please select a room. If no rooms are available, add rooms first.');
      return;
    }
    const chosenRoom = rooms.find((r) => r._id === formData.roomId);
    if (chosenRoom) {
      const isSingle = chosenRoom.rentalType === 'Full Room (Single Tenant)';
      const isFull = isSingle ? (chosenRoom.currentOccupants >= 1 || chosenRoom.status === 'Full') : (chosenRoom.currentOccupants >= chosenRoom.maxCapacity || chosenRoom.status === 'Full');
      if (isFull) {
        setToastMessage(`Room ${chosenRoom.roomNumber} is already occupied and cannot accept new tenants.`);
        return;
      }
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setToastMessage('Please enter a valid email address.');
      return;
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setToastMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    const cleanAadhaar = (formData.aadhaarNumber || '').replace(/\D/g, '');
    if (cleanAadhaar.length !== 12) {
      setToastMessage('Aadhaar number must be exactly 12 digits.');
      return;
    }

    const cleanPan = (formData.panNumber || '').trim().toUpperCase();
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(cleanPan)) {
      setToastMessage('Invalid PAN format. Must be 5 uppercase letters, 4 digits, 1 uppercase letter (e.g. ABCDE1234F).');
      return;
    }

    if (!formData.aadhaarFrontFile?.base64) {
      setToastMessage('Please upload Aadhaar Card (Front) image proof.');
      return;
    }

    if (!formData.aadhaarBackFile?.base64) {
      setToastMessage('Please upload Aadhaar Card (Back) image proof.');
      return;
    }

    if (!formData.panCardFile?.base64) {
      setToastMessage('Please upload PAN Card document proof.');
      return;
    }

    const roomLabel = chosenRoom ? chosenRoom.roomNumber : '';
    const assignedPassword = formData.password.trim() || 'Resident@123';
    const regName = formData.fullName;
    const regEmail = formData.email;

    setIsSubmitting(true);
    try {
      const res: any = await residentService.register({
        ...formData,
        advancePayment: Number(formData.advancePayment || 0),
        monthlyRent: Number(formData.monthlyRent || 0),
        securityDeposit: Number(formData.securityDeposit || 0),
        password: assignedPassword,
        occupancyType: formData.occupancyType === 'Single' ? 'Full Room' : 'Shared',
      });
      
      // Close registration modal first
      setModalOpen(false);
      
      // Open confirmation dialog immediately with full credentials
      setCreatedCredentials({
        name: regName,
        email: regEmail,
        password: assignedPassword,
        room: roomLabel,
        emailSent: res?.emailSent !== false,
      });

      setToastMessage('Resident registered successfully!');

      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        permanentAddress: '',
        occupation: 'Working Professional',
        companyOrCollege: '',
        emergencyContactName: '',
        emergencyContactNumber: '',
        joiningDate: new Date().toISOString().slice(0, 10),
        propertyId: properties[0]?._id || '',
        roomId: rooms[0]?._id || '',
        occupancyType: 'Single',
        sharingTenantCount: 2,
        monthlyRent: 12000,
        securityDeposit: 20000,
        advancePayment: 0,
        noticePeriodDays: 30,
        aadhaarNumber: '',
        panNumber: '',
        aadhaarFrontFile: null,
        aadhaarBackFile: null,
        panCardFile: null,
      });

      // Background reload so modal doesn't wait
      loadResidents();
      loadPropertiesAndRooms();
    } catch (err: any) {
      setToastMessage(err.response?.data?.error || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResidentForCheckout) return;
    try {
      await residentService.checkout(selectedResidentForCheckout._id, checkoutData);
      setToastMessage('Checkout completed successfully. Room slot vacated & deposit settled.');
      setCheckoutModalOpen(false);
      setSelectedResidentForCheckout(null);
      await loadResidents();
    } catch (err: any) {
      setToastMessage(err.response?.data?.error || 'Checkout failed');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Resident Management</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={openRegisterModal}>
              <IonIcon icon={addOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" style={{ '--background': '#f8fafc' }}>
        <IonSearchbar
          value={search}
          placeholder="Search by name, phone or email..."
          onIonInput={(e) => setSearch(e.detail.value!)}
          style={{ padding: 0, marginBottom: '12px' }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            Active Residents: <strong>{residents.length}</strong>
          </span>
          <IonButton size="small" color="primary" onClick={openRegisterModal}>
            <IonIcon icon={addOutline} slot="start" />
            New Resident
          </IonButton>
        </div>

        {/* Notice if no rooms created yet */}
        {rooms.length === 0 && (
          <IonCard style={{ margin: '0 0 16px 0', border: '1px solid #fed7aa', background: '#fff7ed' }}>
            <IonCardContent style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontWeight: '800', color: '#9a3412', fontSize: '14px' }}>
                    No Rooms Created Yet
                  </h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#c2410c' }}>
                    You wiped the database. Please add a PG property and rooms first to allocate residents.
                  </p>
                </div>
                <IonButton size="small" color="warning" onClick={() => history.push('/admin/rooms')}>
                  Add Rooms
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        )}

        <IonList lines="none" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          {residents.map((r) => (
            <IonItem
              key={r._id}
              button
              onClick={() => history.push(`/admin/residents/${r._id}`)}
              style={{
                '--padding-top': '12px',
                '--padding-bottom': '12px',
                '--padding-start': '14px',
                '--padding-end': '14px',
                background: '#ffffff',
                marginBottom: '8px',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              }}
            >
              <IonLabel>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontWeight: '800', fontSize: '16px', color: '#0f172a' }}>{r.fullName}</h3>
                  <IonBadge color={r.status === 'Active' ? 'success' : r.status === 'Notice Period' ? 'warning' : 'medium'}>
                    {r.status}
                  </IonBadge>
                </div>
                <p style={{ color: '#475569', fontSize: '13px', marginTop: '2px' }}>
                  {r.propertyId?.name || 'PG'} • Room: <strong>{r.roomId?.roomNumber || 'N/A'}</strong> ({r.occupancyType || 'Single'})
                </p>
                <p style={{ color: '#64748b', fontSize: '12px' }}>
                  Phone: {r.phone} • Custom Rent: <strong style={{ color: '#16a34a' }}>₹{r.monthlyRent?.toLocaleString('en-IN')}/mo</strong>
                </p>
                <span style={{ fontSize: '11px', color: '#4f46e5', fontWeight: 700, display: 'inline-block', marginTop: '4px' }}>
                  Click to view full profile & docs →
                </span>
              </IonLabel>

              <div slot="end" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {r.status !== 'Vacated' && (
                  <IonButton
                    size="small"
                    fill="outline"
                    color="danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedResidentForCheckout(r);
                      setCheckoutModalOpen(true);
                    }}
                  >
                    Checkout
                  </IonButton>
                )}
              </div>
            </IonItem>
          ))}
        </IonList>

        {residents.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
            <h3>No Residents Registered</h3>
            <p>Click "New Resident" above to onboard your first tenant.</p>
          </div>
        )}

        {/* Resident Registration Modal */}
        <IonModal isOpen={modalOpen} onDidDismiss={() => setModalOpen(false)}>
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>Register Resident</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setModalOpen(false)} style={{ color: '#ffffff', fontWeight: 800 }}>
                  <IonIcon icon={closeOutline} slot="start" style={{ fontSize: '20px' }} />
                  Cancel
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding" style={{ '--padding-bottom': 'calc(env(safe-area-inset-bottom, 24px) + 50px)' }}>
            <form onSubmit={handleRegisterSubmit} style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 24px) + 50px)' }}>
              <IonItem lines="inset" style={{ '--padding-start': '0' }}>
                <IonLabel position="stacked">Full Name *</IonLabel>
                <IonInput
                  required
                  value={formData.fullName}
                  placeholder="e.g. Rahul Sharma"
                  onIonChange={(e) => setFormData({ ...formData, fullName: e.detail.value! })}
                />
              </IonItem>

              <IonItem lines="inset" style={{ '--padding-start': '0' }}>
                <IonLabel position="stacked">Email Address *</IonLabel>
                <IonInput
                  type="email"
                  required
                  value={formData.email}
                  placeholder="rahul@example.com"
                  onIonChange={(e) => setFormData({ ...formData, email: e.detail.value! })}
                />
              </IonItem>

              <IonItem lines="inset" style={{ '--padding-start': '0' }}>
                <IonLabel position="stacked">Phone Number *</IonLabel>
                <IonInput
                  type="tel"
                  required
                  value={formData.phone}
                  placeholder="10-digit mobile number"
                  onIonChange={(e) => setFormData({ ...formData, phone: e.detail.value! })}
                />
              </IonItem>

              <IonItem lines="inset" style={{ '--padding-start': '0' }}>
                <IonLabel position="stacked">Permanent Address *</IonLabel>
                <IonInput
                  required
                  value={formData.permanentAddress}
                  placeholder="Home address"
                  onIonChange={(e) => setFormData({ ...formData, permanentAddress: e.detail.value! })}
                />
              </IonItem>

              <IonItem lines="inset" style={{ '--padding-start': '0' }}>
                <IonLabel position="stacked">Emergency Contact Name & Phone *</IonLabel>
                <IonInput
                  required
                  placeholder="e.g. Ramesh Sharma - 9988776655"
                  value={formData.emergencyContactName}
                  onIonChange={(e) =>
                    setFormData({
                      ...formData,
                      emergencyContactName: e.detail.value!,
                      emergencyContactNumber: e.detail.value!,
                    })
                  }
                />
              </IonItem>

              {/* Joining Date, Occupation & Company / College */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
                <IonItem lines="inset" style={{ '--padding-start': '0' }}>
                  <IonLabel position="stacked" style={{ fontWeight: '700' }}>Joining Date *</IonLabel>
                  <IonInput
                    type="date"
                    required
                    value={formData.joiningDate}
                    onIonChange={(e) => setFormData({ ...formData, joiningDate: e.detail.value! })}
                  />
                </IonItem>

                <IonItem lines="inset" style={{ '--padding-start': '0' }}>
                  <IonLabel position="stacked" style={{ fontWeight: '700' }}>Occupation *</IonLabel>
                  <IonSelect
                    value={formData.occupation}
                    onIonChange={(e) => setFormData({ ...formData, occupation: e.detail.value })}
                  >
                    <IonSelectOption value="Working Professional">Working Professional</IonSelectOption>
                    <IonSelectOption value="Student">Student</IonSelectOption>
                    <IonSelectOption value="Business / Self-Employed">Self-Employed</IonSelectOption>
                    <IonSelectOption value="Other">Other</IonSelectOption>
                  </IonSelect>
                </IonItem>
              </div>

              <IonItem lines="inset" style={{ '--padding-start': '0', marginTop: '6px' }}>
                <IonLabel position="stacked">Company or College / Institute</IonLabel>
                <IonInput
                  value={formData.companyOrCollege}
                  placeholder="e.g. Infosys, TCS, Symbiosis, Pune University"
                  onIonChange={(e) => setFormData({ ...formData, companyOrCollege: e.detail.value! })}
                />
              </IonItem>

              {/* Login Credentials Section */}
              <div style={{ background: '#eff6ff', padding: '14px', borderRadius: '12px', marginTop: '14px', border: '1px solid #bfdbfe' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <IonIcon icon={lockClosedOutline} style={{ color: '#2563eb', fontSize: '18px' }} />
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#1e40af' }}>
                    Customer Login Credentials
                  </span>
                </div>
                <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#3b82f6', lineHeight: '1.4' }}>
                  Admin can set the resident's login password. An automated onboarding email with login URL, registered email, and password will be sent to <strong>{formData.email || 'the resident'}</strong>.
                </p>

                <IonItem lines="none" style={{ '--padding-start': '0', '--background': 'transparent' }}>
                  <IonLabel position="stacked" style={{ fontWeight: '700', color: '#1e40af' }}>
                    Assign Password *
                  </IonLabel>
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%', position: 'relative' }}>
                    <IonInput
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      placeholder="e.g. Resident@123 (or leave blank for default)"
                      onIonChange={(e) => setFormData({ ...formData, password: e.detail.value! })}
                      style={{ paddingRight: '40px' }}
                    />
                    <IonButton
                      fill="clear"
                      slot="end"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: 0, zIndex: 10, margin: 0 }}
                    >
                      <IonIcon icon={showPassword ? eyeOffOutline : eyeOutline} slot="icon-only" color="primary" />
                    </IonButton>
                  </div>
                </IonItem>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <IonButton
                    size="small"
                    fill="outline"
                    color="primary"
                    onClick={() => {
                      const randomPass = 'Pass@' + Math.floor(1000 + Math.random() * 9000);
                      setFormData({ ...formData, password: randomPass });
                    }}
                  >
                    Generate Random
                  </IonButton>
                  <IonButton
                    size="small"
                    fill="clear"
                    color="medium"
                    onClick={() => setFormData({ ...formData, password: 'Resident@123' })}
                  >
                    Use Default (Resident@123)
                  </IonButton>
                </div>
              </div>

              {/* ID Proofs & Cloudinary Upload Section */}
              <div style={{ background: '#fdf4ff', padding: '14px', borderRadius: '12px', marginTop: '14px', border: '1px solid #f5d0fe' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <IonIcon icon={documentAttachOutline} style={{ color: '#9333ea', fontSize: '18px' }} />
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#6b21a8' }}>
                    Identity Proofs (Cloudinary Upload)
                  </span>
                </div>
                <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#a855f7', lineHeight: '1.4' }}>
                  Upload customer's Aadhaar (Front & Back) and PAN Card. Proofs are uploaded securely to Cloudinary storage and linked to this resident.
                </p>

                {/* Aadhaar Number */}
                <IonItem lines="inset" style={{ '--padding-start': '0', '--background': 'transparent' }}>
                  <IonLabel position="stacked" style={{ fontWeight: '700', color: '#6b21a8' }}>
                    Aadhaar Number *
                  </IonLabel>
                  <IonInput
                    placeholder="12-digit Aadhaar number"
                    maxlength={12}
                    value={formData.aadhaarNumber}
                    onIonChange={(e) => setFormData({ ...formData, aadhaarNumber: e.detail.value!.replace(/\D/g, '') })}
                  />
                </IonItem>

                {/* Aadhaar Front */}
                <div style={{ marginTop: '12px', padding: '10px', background: '#ffffff', borderRadius: '8px', border: '1px dashed #d8b4fe' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#581c87' }}>Aadhaar Card (Front) *</span>
                    {formData.aadhaarFrontFile && (
                      <span style={{ fontSize: '11px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <IonIcon icon={checkmarkCircleOutline} /> Selected ({formData.aadhaarFrontFile.name})
                      </span>
                    )}
                  </div>
                  <input
                    type="file"
                    required
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          setFormData({
                            ...formData,
                            aadhaarFrontFile: {
                              name: file.name,
                              type: file.type,
                              size: file.size,
                              base64: reader.result as string,
                            },
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{ fontSize: '12px', width: '100%' }}
                  />
                </div>

                {/* Aadhaar Back */}
                <div style={{ marginTop: '10px', padding: '10px', background: '#ffffff', borderRadius: '8px', border: '1px dashed #d8b4fe' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#581c87' }}>Aadhaar Card (Back) *</span>
                    {formData.aadhaarBackFile && (
                      <span style={{ fontSize: '11px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <IonIcon icon={checkmarkCircleOutline} /> Selected ({formData.aadhaarBackFile.name})
                      </span>
                    )}
                  </div>
                  <input
                    type="file"
                    required
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          setFormData({
                            ...formData,
                            aadhaarBackFile: {
                              name: file.name,
                              type: file.type,
                              size: file.size,
                              base64: reader.result as string,
                            },
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{ fontSize: '12px', width: '100%' }}
                  />
                </div>

                {/* PAN Card Number */}
                <IonItem lines="inset" style={{ '--padding-start': '0', '--background': 'transparent', marginTop: '10px' }}>
                  <IonLabel position="stacked" style={{ fontWeight: '700', color: '#6b21a8' }}>
                    PAN Card Number *
                  </IonLabel>
                  <IonInput
                    placeholder="10-digit PAN (e.g. ABCDE1234F)"
                    maxlength={10}
                    value={formData.panNumber}
                    onIonChange={(e) => setFormData({ ...formData, panNumber: e.detail.value!.toUpperCase() })}
                  />
                </IonItem>

                {/* PAN Card File */}
                <div style={{ marginTop: '10px', padding: '10px', background: '#ffffff', borderRadius: '8px', border: '1px dashed #d8b4fe' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#581c87' }}>PAN Card Document *</span>
                    {formData.panCardFile && (
                      <span style={{ fontSize: '11px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <IonIcon icon={checkmarkCircleOutline} /> Selected ({formData.panCardFile.name})
                      </span>
                    )}
                  </div>
                  <input
                    type="file"
                    required
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          setFormData({
                            ...formData,
                            panCardFile: {
                              name: file.name,
                              type: file.type,
                              size: file.size,
                              base64: reader.result as string,
                            },
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{ fontSize: '12px', width: '100%' }}
                  />
                </div>
              </div>

              {/* Room Selection */}
              {rooms.length > 0 ? (
                <IonItem lines="inset" style={{ '--padding-start': '0', marginTop: '10px' }}>
                  <IonLabel position="stacked" style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>
                    Select Room *
                  </IonLabel>
                  <IonSelect
                    value={formData.roomId}
                    placeholder="Choose Room"
                    onIonChange={(e) => {
                      const selectedId = e.detail.value;
                      const selectedRoom = rooms.find((r) => r._id === selectedId);
                      const roomRent = selectedRoom?.defaultRent ? Number(selectedRoom.defaultRent) : formData.monthlyRent;
                      const roomRentalType = selectedRoom?.rentalType === 'Full Room (Single Tenant)' ? 'Single' : 'Sharing';
                      const roomCapacity = selectedRoom?.maxCapacity || formData.sharingTenantCount;
                      
                      setFormData({
                        ...formData,
                        roomId: selectedId,
                        monthlyRent: roomRent,
                        securityDeposit: roomRent * 2,
                        occupancyType: roomRentalType,
                        sharingTenantCount: roomCapacity,
                      });
                    }}
                  >
                    {rooms.map((r) => {
                      const isSingle = r.rentalType === 'Full Room (Single Tenant)';
                      const max = isSingle ? 1 : (r.maxCapacity || 1);
                      const current = r.currentOccupants || 0;
                      const remaining = Math.max(0, max - current);
                      const isFull = current >= max || r.status === 'Full';

                      const planLabel = isSingle
                        ? (isFull ? 'Single Room (Occupied)' : 'Single Room (Available)')
                        : `Sharing: ${current} assigned, ${remaining} available (Total ${max})`;

                      return (
                        <IonSelectOption key={r._id} value={r._id} disabled={isFull}>
                          Room {r.roomNumber} - {planLabel} {isFull ? '(FULL)' : `(₹${r.defaultRent?.toLocaleString('en-IN')}/mo)`}
                        </IonSelectOption>
                      );
                    })}
                  </IonSelect>
                </IonItem>
              ) : (
                <div style={{ margin: '14px 0', padding: '12px', background: '#fee2e2', borderRadius: '10px', color: '#991b1b', fontSize: '13px' }}>
                  <strong>No rooms available.</strong> Please go to the <strong>Rooms</strong> tab to add a room first.
                </div>
              )}

              {/* Room Plan Summary Banner */}
              {formData.roomId && (() => {
                const currentRoom = rooms.find(r => r._id === formData.roomId);
                const isSingle = formData.occupancyType === 'Single';
                const max = isSingle ? 1 : (currentRoom?.maxCapacity || formData.sharingTenantCount || 1);
                const assigned = currentRoom?.currentOccupants || 0;
                const remaining = Math.max(0, max - assigned);

                return (
                  <div style={{ margin: '12px 0', padding: '12px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#64748b' }}>Room Plan Type:</span>
                      <strong style={{ color: '#0f172a' }}>
                        {isSingle ? 'Single Room (Entire)' : `Sharing Room (${max} Sharing)`}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#64748b' }}>Occupancy Status:</span>
                      <strong style={{ color: remaining > 0 ? '#16a34a' : '#dc2626' }}>
                        {isSingle
                          ? (assigned > 0 ? 'Occupied (1/1)' : 'Vacant (0/1)')
                          : `${assigned} Assigned, ${remaining} Remaining (${assigned}/${max})`}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Configured Room Rent:</span>
                      <strong style={{ color: '#16a34a' }}>₹{formData.monthlyRent?.toLocaleString('en-IN')}/mo</strong>
                    </div>
                  </div>
                );
              })()}

              {/* Admin Customizable Charges */}
              <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '12px', marginTop: '16px', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#166534', marginBottom: '8px' }}>
                  Custom Charges
                </div>

                <IonItem lines="inset" style={{ '--padding-start': '0', '--background': 'transparent' }}>
                  <IonLabel position="stacked" style={{ fontWeight: '700', color: '#166534' }}>
                    Monthly Rent (INR) *
                  </IonLabel>
                  <IonInput
                    type="number"
                    required
                    value={formData.monthlyRent}
                    placeholder="Enter rent for this resident"
                    onIonChange={(e) => setFormData({ ...formData, monthlyRent: Number(e.detail.value!) })}
                  />
                </IonItem>

                <IonItem lines="inset" style={{ '--padding-start': '0', '--background': 'transparent', marginTop: '8px' }}>
                  <IonLabel position="stacked" style={{ fontWeight: '700', color: '#166534' }}>
                    Security Deposit (INR) *
                  </IonLabel>
                  <IonInput
                    type="number"
                    required
                    value={formData.securityDeposit}
                    placeholder="Enter security deposit"
                    onIonChange={(e) => setFormData({ ...formData, securityDeposit: Number(e.detail.value!) })}
                  />
                </IonItem>
              </div>

              <IonItem lines="inset" style={{ '--padding-start': '0', marginTop: '12px' }}>
                <IonLabel position="stacked">Initial Advance Paid (INR)</IonLabel>
                <IonInput
                  type="number"
                  value={formData.advancePayment}
                  onIonChange={(e) => setFormData({ ...formData, advancePayment: Number(e.detail.value!) })}
                />
              </IonItem>

              <IonButton
                expand="block"
                type="submit"
                color="primary"
                style={{ marginTop: '24px', height: '48px' }}
                disabled={rooms.length === 0 || isSubmitting}
              >
                {isSubmitting ? 'Registering Resident...' : 'Confirm Registration'}
              </IonButton>
            </form>
          </IonContent>
        </IonModal>

        {/* Checkout Modal */}
        <IonModal isOpen={checkoutModalOpen} onDidDismiss={() => setCheckoutModalOpen(false)}>
          <IonHeader>
            <IonToolbar color="danger">
              <IonTitle>Checkout Resident</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setCheckoutModalOpen(false)} style={{ color: '#ffffff', fontWeight: 800 }}>
                  <IonIcon icon={closeOutline} slot="start" style={{ fontSize: '20px' }} />
                  Cancel
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding" style={{ '--padding-bottom': 'calc(env(safe-area-inset-bottom, 24px) + 50px)' }}>
            {selectedResidentForCheckout && (
              <form onSubmit={handleCheckoutSubmit} style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 24px) + 50px)' }}>
                <h3>{selectedResidentForCheckout.fullName}</h3>
                <p style={{ fontSize: '13px', color: '#64748b' }}>
                  Releasing room occupancy and settling security deposit.
                </p>

                <IonItem lines="inset" style={{ '--padding-start': '0' }}>
                  <IonLabel position="stacked">Vacating Date</IonLabel>
                  <IonInput
                    type="date"
                    value={checkoutData.vacatingDate}
                    onIonChange={(e) => setCheckoutData({ ...checkoutData, vacatingDate: e.detail.value! })}
                    required
                  />
                </IonItem>

                <IonItem lines="inset" style={{ '--padding-start': '0' }}>
                  <IonLabel position="stacked">Damage Deductions (INR)</IonLabel>
                  <IonInput
                    type="number"
                    value={checkoutData.damageDeductions}
                    onIonChange={(e) => setCheckoutData({ ...checkoutData, damageDeductions: Number(e.detail.value!) })}
                  />
                </IonItem>

                <IonItem lines="inset" style={{ '--padding-start': '0' }}>
                  <IonLabel position="stacked">Other Deductions (INR)</IonLabel>
                  <IonInput
                    type="number"
                    value={checkoutData.otherDeductions}
                    onIonChange={(e) => setCheckoutData({ ...checkoutData, otherDeductions: Number(e.detail.value!) })}
                  />
                </IonItem>

                <IonItem lines="inset" style={{ '--padding-start': '0' }}>
                  <IonLabel position="stacked">Refund Reference / UTR</IonLabel>
                  <IonInput
                    value={checkoutData.refundReference}
                    placeholder="e.g. UPI/39482938492"
                    onIonChange={(e) => setCheckoutData({ ...checkoutData, refundReference: e.detail.value! })}
                  />
                </IonItem>

                <IonButton expand="block" type="submit" color="danger" style={{ marginTop: '24px', height: '48px' }}>
                  Confirm Checkout & Release Room
                </IonButton>
              </form>
            )}
          </IonContent>
        </IonModal>

        {/* Credentials Created Confirmation Modal */}
        <IonModal isOpen={!!createdCredentials} onDidDismiss={() => setCreatedCredentials(null)}>
          <IonHeader>
            <IonToolbar color="success">
              <IonTitle>Credentials Created & Sent</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setCreatedCredentials(null)}>Done</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding" style={{ '--padding-bottom': 'calc(env(safe-area-inset-bottom, 24px) + 50px)' }}>
            {createdCredentials && (
              <div style={{ textAlign: 'center', padding: '16px 8px', paddingBottom: 'calc(env(safe-area-inset-bottom, 24px) + 50px)' }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎉</div>
                <h2 style={{ fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>
                  Resident Account Created!
                </h2>
                <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 20px 0' }}>
                  Login details have been registered and dispatched to the customer's email.
                </p>

                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '14px',
                    padding: '20px',
                    textAlign: 'left',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    marginBottom: '20px',
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '14px' }}>
                    Customer Credentials
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>NAME</div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>{createdCredentials.name}</div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>REGISTERED EMAIL</div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#2563eb' }}>{createdCredentials.email}</div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>LOGIN PASSWORD</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: '#16a34a', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                        {createdCredentials.password}
                      </div>
                      <IonButton
                        size="small"
                        fill="clear"
                        color="secondary"
                        onClick={() => {
                          navigator.clipboard.writeText(createdCredentials.password);
                          setToastMessage('Password copied to clipboard!');
                        }}
                      >
                        <IonIcon icon={copyOutline} slot="start" />
                        Copy
                      </IonButton>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>ALLOCATED ROOM</div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>Room {createdCredentials.room}</div>
                  </div>
                </div>

                <div
                  style={{
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    borderRadius: '10px',
                    padding: '12px',
                    fontSize: '13px',
                    color: '#065f46',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '24px',
                  }}
                >
                  <IonIcon icon={mailOutline} style={{ fontSize: '20px' }} />
                  <span>
                    Email status: <strong>Dispatched to {createdCredentials.email}</strong>
                  </span>
                </div>

                <IonButton expand="block" color="primary" onClick={() => setCreatedCredentials(null)}>
                  Close & View Residents
                </IonButton>
              </div>
            )}
          </IonContent>
        </IonModal>

        <IonLoading isOpen={isSubmitting} message="Registering resident & saving credentials..." />
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

export default AdminResidents;
