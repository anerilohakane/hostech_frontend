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
  IonModal,
  IonInput,
  IonToast,
} from '@ionic/react';
import {
  businessOutline,
  bedOutline,
  cashOutline,
  peopleOutline,
  thermometerOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  arrowForwardOutline,
  callOutline,
  flashOutline,
  documentAttachOutline,
  closeOutline,
  cloudUploadOutline,
} from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { roomService, electricityService } from '../../services';

const RoomDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [billModalOpen, setBillModalOpen] = useState(false);
  const [billSubmitting, setBillSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [billForm, setBillForm] = useState({
    rentMonth: new Date().toISOString().substring(0, 7), // YYYY-MM
    totalAmount: '',
    unitsConsumed: '',
    ratePerUnit: '10',
    notes: '',
  });
  const [billFile, setBillFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const history = useHistory();

  const loadRoom = async () => {
    try {
      const data = await roomService.getRoomById(id);
      setRoom(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoom();
  }, [id]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBillFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const handleBillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billForm.rentMonth) {
      setToastMessage('Please select a billing month.');
      return;
    }
    const amt = parseFloat(billForm.totalAmount) || 0;
    const units = parseFloat(billForm.unitsConsumed) || 0;
    const rate = parseFloat(billForm.ratePerUnit) || 0;

    if (amt <= 0 && (units <= 0 || rate <= 0)) {
      setToastMessage('Please enter either a total bill amount or valid units & rate.');
      return;
    }

    try {
      setBillSubmitting(true);
      const fd = new FormData();
      fd.append('roomId', id);
      fd.append('rentMonth', billForm.rentMonth);
      if (amt > 0) fd.append('totalAmount', amt.toString());
      if (units > 0) fd.append('unitsConsumed', units.toString());
      if (rate > 0) fd.append('ratePerUnit', rate.toString());
      if (billForm.notes) fd.append('notes', billForm.notes);
      if (billFile) fd.append('billCopy', billFile);

      const res = await electricityService.billRoom(fd);
      setToastMessage(res.message || 'Room light bill uploaded and shared successfully!');
      setBillModalOpen(false);
      setBillFile(null);
      setFilePreview(null);
      setBillForm({
        rentMonth: new Date().toISOString().substring(0, 7),
        totalAmount: '',
        unitsConsumed: '',
        ratePerUnit: '10',
        notes: '',
      });
      loadRoom();
    } catch (err: any) {
      console.error(err);
      setToastMessage(err.response?.data?.error || err.message || 'Failed to submit room bill');
    } finally {
      setBillSubmitting(false);
    }
  };

  if (loading) {
    return <IonLoading isOpen={true} message="Loading room details..." />;
  }

  if (!room) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/admin/rooms" />
            </IonButtons>
            <IonTitle>Room Details</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding" style={{ textAlign: 'center', paddingTop: '60px' }}>
          <h3>Room not found</h3>
          <IonButton fill="outline" onClick={() => history.push('/admin/rooms')}>
            Back to Rooms
          </IonButton>
        </IonContent>
      </IonPage>
    );
  }

  const isFull = room.availableSlots === 0;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/admin/rooms" />
          </IonButtons>
          <IonTitle>Room {room.roomNumber}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding" style={{ '--background': '#f8fafc' }}>
        {/* Room Header Hero Card */}
        <div
          style={{
            background: '#326d75',
            borderRadius: '24px',
            padding: '24px',
            color: '#ffffff !important',
            marginBottom: '20px',
            boxShadow: '0 8px 24px rgba(50, 109, 117, 0.25)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span
                style={{
                  background: isFull ? '#ef4444' : '#10b981',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  display: 'inline-block',
                }}
              >
                {isFull ? 'Fully Occupied' : `${room.availableSlots} Slot(s) Available`}
              </span>
              <h1 style={{ fontSize: '32px', fontWeight: '900', margin: '12px 0 4px 0', letterSpacing: '-0.02em', color: '#ffffff', WebkitTextFillColor: '#ffffff' }}>
                Room {room.roomNumber}
              </h1>
              <p style={{ margin: 0, fontSize: '14px', color: '#ffffff', opacity: 0.95, WebkitTextFillColor: '#ffffff' }}>
                {room.propertyId?.name} • Floor {room.floor} • {room.roomType}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '16px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#ffffff', opacity: 0.9, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                RENTAL PLAN
              </div>
              <div style={{ fontSize: '17px', fontWeight: 800, marginTop: '3px', color: '#ffffff', WebkitTextFillColor: '#ffffff' }}>
                {room.rentalType === 'Full Room (Single Tenant)' ? 'Single (1 Tenant)' : `Sharing (${room.maxCapacity} Capacity)`}
              </div>
            </div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.3)' }} />
            <div>
              <div style={{ fontSize: '11px', color: '#ffffff', opacity: 0.9, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                REFERENCE RENT
              </div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#fef08a', WebkitTextFillColor: '#fef08a' }}>
                ₹{room.defaultRent?.toLocaleString('en-IN')}/mo
              </div>
            </div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.3)' }} />
            <div>
              <div style={{ fontSize: '11px', color: '#ffffff', opacity: 0.9, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                OCCUPANTS
              </div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#ffffff', WebkitTextFillColor: '#ffffff' }}>
                {room.occupants?.length || 0} / {room.rentalType === 'Full Room (Single Tenant)' ? 1 : room.maxCapacity}
              </div>
            </div>
          </div>

          {/* Light Bill Action Header */}
          <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 900, color: '#fef08a', display: 'flex', alignItems: 'center', gap: '5px', letterSpacing: '0.04em' }}>
                <IonIcon icon={flashOutline} /> ROOM ELECTRICITY BILL
              </div>
              <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.95, marginTop: '2px' }}>
                Bill copy / amount will be divided among room tenants
              </div>
            </div>
            <IonButton
              size="small"
              style={{
                '--background': '#ffffff',
                '--color': '#326d75',
                fontWeight: 900,
                '--border-radius': '10px',
                '--box-shadow': '0 2px 8px rgba(0,0,0,0.2)',
              }}
              onClick={() => setBillModalOpen(true)}
            >
              <IonIcon icon={cloudUploadOutline} slot="start" />
              Upload Light Bill
            </IonButton>
          </div>
        </div>

        {/* Current Occupants Section */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: '#1e293b' }}>
              Current Occupants ({room.occupants?.length || 0})
            </h3>
            {room.availableSlots > 0 && (
              <IonButton
                size="small"
                color="primary"
                onClick={() => history.push('/admin/residents')}
                style={{ fontWeight: 700 }}
              >
                + Allocate Tenant
              </IonButton>
            )}
          </div>

          {room.occupants?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {room.occupants.map((occ: any) => (
                <IonCard
                  key={occ._id}
                  button
                  onClick={() => history.push(`/admin/residents/${occ._id}`)}
                  style={{ margin: 0, borderRadius: '18px', border: '1px solid #e2e8f0', background: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                >
                  <IonCardContent style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <strong style={{ fontSize: '16px', color: '#1e293b' }}>{occ.fullName}</strong>
                          <IonBadge color="success">{occ.occupancyType}</IonBadge>
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                          Phone: <strong>{occ.phone}</strong> • Joined: {new Date(occ.joiningDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: '16px', color: '#326d75' }}>
                          ₹{occ.monthlyRent?.toLocaleString('en-IN')}/mo
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px' }}>
                          View Profile <IonIcon icon={arrowForwardOutline} />
                        </div>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              ))}
            </div>
          ) : (
            <IonCard style={{ margin: 0, borderRadius: '18px', border: '1px dashed #cbd5e1', background: '#ffffff' }}>
              <IonCardContent style={{ textAlign: 'center', padding: '30px' }}>
                <IonIcon icon={bedOutline} style={{ fontSize: '42px', color: '#94a3b8' }} />
                <h4 style={{ fontWeight: 700, margin: '8px 0 4px 0', color: '#1e293b' }}>No Tenants Allocated</h4>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>
                  This room currently has {room.availableSlots} available slot(s).
                </p>
                <IonButton size="small" color="primary" onClick={() => history.push('/admin/residents')}>
                  Onboard Resident to this Room
                </IonButton>
              </IonCardContent>
            </IonCard>
          )}
        </div>

        {/* Room Specifications Card */}
        <IonCard style={{ margin: 0, borderRadius: '20px', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <IonCardContent style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', marginBottom: '14px' }}>
              Room Specifications & Amenities
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#64748b' }}>Property Name</span>
                <strong style={{ color: '#1e293b' }}>{room.propertyId?.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#64748b' }}>Floor Number</span>
                <strong style={{ color: '#1e293b' }}>Floor {room.floor}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#64748b' }}>Air Conditioning</span>
                <strong style={{ color: '#1e293b' }}>{room.roomType}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#64748b' }}>Maximum Capacity</span>
                <strong style={{ color: '#1e293b' }}>{room.rentalType === 'Full Room (Single Tenant)' ? 1 : room.maxCapacity} Tenant(s)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#64748b' }}>Agreed Standard Rent</span>
                <strong style={{ color: '#326d75' }}>₹{room.defaultRent?.toLocaleString('en-IN')}/month</strong>
              </div>
            </div>
          </IonCardContent>
        </IonCard>

        {/* Room Electricity Bill Modal */}
        <IonModal isOpen={billModalOpen} onDidDismiss={() => setBillModalOpen(false)}>
          <IonHeader>
            <IonToolbar style={{ '--background': '#326d75', '--color': '#ffffff' }}>
              <IonTitle style={{ fontWeight: 700, color: '#ffffff' }}>Upload Room {room.roomNumber} Light Bill</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setBillModalOpen(false)} style={{ color: '#ffffff' }}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding" style={{ '--background': '#f8fafc' }}>
            <form onSubmit={handleBillSubmit}>
              <div
                style={{
                  background: 'rgba(242, 201, 130, 0.2)',
                  border: '1px solid #f2c982',
                  borderRadius: '16px',
                  padding: '16px',
                  marginBottom: '20px',
                  color: '#7c5310',
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '4px', color: '#b45309', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <IonIcon icon={flashOutline} /> Equal Split Distribution
                </div>
                <div style={{ fontSize: '13px', lineHeight: '1.5', color: '#854d0e' }}>
                  The total room electricity bill will be automatically divided among the <strong>{room.occupants?.length || 0} active tenant(s)</strong> of Room {room.roomNumber} and added to their monthly dues with the bill copy attachment.
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: '#ffffff', borderRadius: '14px', padding: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    Billing Month (YYYY-MM) *
                  </label>
                  <IonInput
                    type="month"
                    value={billForm.rentMonth}
                    onIonChange={(e) => setBillForm({ ...billForm, rentMonth: e.detail.value! })}
                    required
                    style={{ background: '#f8fafc', borderRadius: '8px', padding: '8px 12px', border: '1px solid #cbd5e1', color: '#0f172a', fontWeight: 600 }}
                  />
                </div>

                <div style={{ background: '#ffffff', borderRadius: '14px', padding: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    Total Room Bill Amount (₹) *
                  </label>
                  <IonInput
                    type="number"
                    placeholder="e.g. 1200"
                    value={billForm.totalAmount}
                    onIonChange={(e) => setBillForm({ ...billForm, totalAmount: e.detail.value! })}
                    style={{ background: '#f8fafc', borderRadius: '8px', padding: '8px 12px', border: '1px solid #cbd5e1', color: '#0f172a', fontWeight: 600 }}
                  />
                </div>

                <div style={{ textAlign: 'center', color: '#64748b', fontSize: '12px', fontWeight: 700 }}>
                  — OR ENTER METER UNITS & RATE —
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ background: '#ffffff', borderRadius: '14px', padding: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      Units Consumed
                    </label>
                    <IonInput
                      type="number"
                      placeholder="e.g. 120"
                      value={billForm.unitsConsumed}
                      onIonChange={(e) => setBillForm({ ...billForm, unitsConsumed: e.detail.value! })}
                      style={{ background: '#f8fafc', borderRadius: '8px', padding: '8px 12px', border: '1px solid #cbd5e1', color: '#0f172a', fontWeight: 600 }}
                    />
                  </div>

                  <div style={{ background: '#ffffff', borderRadius: '14px', padding: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      Rate / Unit (₹)
                    </label>
                    <IonInput
                      type="number"
                      placeholder="10"
                      value={billForm.ratePerUnit}
                      onIonChange={(e) => setBillForm({ ...billForm, ratePerUnit: e.detail.value! })}
                      style={{ background: '#f8fafc', borderRadius: '8px', padding: '8px 12px', border: '1px solid #cbd5e1', color: '#0f172a', fontWeight: 600 }}
                    />
                  </div>
                </div>

                {/* Upload Bill Copy / Document */}
                <div style={{ background: '#ffffff', borderRadius: '14px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                    Upload Electricity Bill Copy / Meter Photo
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileSelect}
                    style={{ color: '#334155', fontSize: '13px', width: '100%', padding: '6px 0' }}
                  />
                  {filePreview && (
                    <div style={{ marginTop: '12px', textAlign: 'center' }}>
                      <img
                        src={filePreview}
                        alt="Bill Preview"
                        style={{ maxHeight: '150px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      />
                    </div>
                  )}
                </div>

                <div style={{ background: '#ffffff', borderRadius: '14px', padding: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    Notes / Remarks (Optional)
                  </label>
                  <IonInput
                    placeholder="e.g. MSEB Bill No: 12345"
                    value={billForm.notes}
                    onIonChange={(e) => setBillForm({ ...billForm, notes: e.detail.value! })}
                    style={{ background: '#f8fafc', borderRadius: '8px', padding: '8px 12px', border: '1px solid #cbd5e1', color: '#0f172a', fontWeight: 600 }}
                  />
                </div>

                {/* Dynamic Calculation Preview */}
                {((parseFloat(billForm.totalAmount) || 0) > 0 || ((parseFloat(billForm.unitsConsumed) || 0) > 0 && (parseFloat(billForm.ratePerUnit) || 0) > 0)) && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '14px', padding: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#15803d', fontWeight: 800, letterSpacing: '0.04em' }}>PER TENANT DUE SHARE</div>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: '#16a34a', margin: '4px 0' }}>
                      ₹{Math.round(((parseFloat(billForm.totalAmount) || ((parseFloat(billForm.unitsConsumed) || 0) * (parseFloat(billForm.ratePerUnit) || 10))) / Math.max(1, room.occupants?.length || 1))).toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      Total Room Bill: ₹{(parseFloat(billForm.totalAmount) || ((parseFloat(billForm.unitsConsumed) || 0) * (parseFloat(billForm.ratePerUnit) || 10))).toLocaleString('en-IN')} ÷ {Math.max(1, room.occupants?.length || 1)} tenant(s)
                    </div>
                  </div>
                )}

                <IonButton
                  expand="block"
                  type="submit"
                  disabled={billSubmitting}
                  style={{
                    '--background': '#326d75',
                    '--color': '#ffffff',
                    color: '#ffffff',
                    WebkitTextFillColor: '#ffffff',
                    fontWeight: 800,
                    height: '48px',
                    marginTop: '10px',
                  }}
                >
                  <span style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff', fontWeight: 800 }}>
                    {billSubmitting ? 'Uploading & Distributing...' : 'Send Light Bill to Tenants'}
                  </span>
                </IonButton>
              </div>
            </form>
          </IonContent>
        </IonModal>

        <IonToast
          isOpen={!!toastMessage}
          message={toastMessage || ''}
          duration={3500}
          onDidDismiss={() => setToastMessage(null)}
        />
      </IonContent>
    </IonPage>
  );
};

export default RoomDetail;


