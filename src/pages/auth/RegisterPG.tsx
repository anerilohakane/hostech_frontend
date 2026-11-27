import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonIcon,
  IonLoading,
  IonToast,
  IonSelect,
  IonSelectOption,
  IonAlert,
} from '@ionic/react';
import {
  arrowForwardOutline,
  businessOutline,
  lockClosedOutline,
  mailOutline,
  personOutline,
  callOutline,
  shieldCheckmarkOutline,
  checkmarkCircleOutline,
  layersOutline,
  cashOutline,
  arrowBackOutline,
  flashOutline,
  peopleOutline,
  cardOutline,
  walletOutline,
} from 'ionicons/icons';
import { authService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { useHistory } from 'react-router-dom';

const RegisterPG: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const history = useHistory();

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Owner Details
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    // Step 2: PG Details
    pgName: '',
    pgType: 'Coliving',
    address: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
    // Step 3: Capacity, Sharing Rates & Utilities
    floorsCount: 2,
    roomsPerFloor: 7,
    rent2Sharing: 8000,
    rent3Sharing: 6500,
    rent4Sharing: 5000,
    chargeElectricity: false,
    electricityRate: 10,
    electricityBillingType: 'per_unit' as 'per_unit' | 'fixed_monthly',
    electricityFixedAmount: 500,
    // Step 4: Plan, Billing Cycle & Payment Info
    planId: 'starter',
    billingCycle: 'monthly' as 'monthly' | 'yearly',
    paymentMethod: 'upi' as 'upi' | 'card',
    upiId: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardName: '',
  });

  const handleChange = (field: string, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.ownerName?.trim() || !formData.email?.trim() || !formData.phone?.trim()) {
        setToastMessage('Please enter owner name, email, and phone number.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        setToastMessage('Please enter a valid email address.');
        return;
      }
    } else if (step === 2) {
      if (!formData.pgName?.trim() || !formData.address?.trim() || !formData.city?.trim() || !formData.state?.trim()) {
        setToastMessage('Please enter PG name, address, city, and state.');
        return;
      }
      const cleanPin = String(formData.pincode || '').trim();
      const pincodeRegex = /^[1-9][0-9]{5}$/;
      if (!cleanPin || !pincodeRegex.test(cleanPin)) {
        setToastMessage('Please enter a valid 6-digit Indian PIN code (e.g. 411041).');
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handleSubmit = async () => {
    if (formData.paymentMethod === 'upi') {
      const upiRegex = /^[\w.-]+@[\w.-]+$/;
      if (!formData.upiId || !upiRegex.test(formData.upiId.trim())) {
        setToastMessage('Please enter a valid UPI ID (e.g. yourname@okhdfcbank).');
        return;
      }
    } else if (formData.paymentMethod === 'card') {
      const cleanCard = formData.cardNumber.replace(/\s+/g, '');
      if (cleanCard.length < 15 || cleanCard.length > 19) {
        setToastMessage('Please enter a valid 16-digit card number.');
        return;
      }
      if (!formData.cardExpiry || !formData.cardCvv) {
        setToastMessage('Please enter card expiry (MM/YY) and CVV.');
        return;
      }
    }
    setLoading(true);
    try {
      const res = await authService.registerPG(formData);
      setRegisteredEmail(formData.email.trim());
      setShowSuccessAlert(true);
    } catch (err: any) {
      setToastMessage(err.response?.data?.error || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage className="register-pg-page">
      <IonContent fullscreen className="auth-content">
        <style>{`
          .register-layout {
            display: flex;
            min-height: 100vh;
            flex-direction: column;
            align-items: center;
            padding: 30px 14px 40px;
            background: linear-gradient(180deg, #326d75 0%, #25565d 240px, #f7f5f0 240px, #f7f5f0 100%);
            font-family: var(--ion-font-family);
          }
          .register-header {
            width: 100%;
            max-width: 480px;
            color: #fff;
            padding: 10px 6px 20px;
          }
          .register-header h1 {
            font: 800 24px/1.2 'Manrope', sans-serif;
            margin: 4px 0 2px;
          }
          .register-header p {
            font-size: 11px;
            color: rgba(255,255,255,.8);
            margin: 0;
          }
          .step-indicators {
            display: flex;
            gap: 6px;
            margin-top: 14px;
          }
          .step-dot {
            flex: 1;
            height: 4px;
            border-radius: 99px;
            background: rgba(255,255,255,.3);
            transition: all 0.3s;
          }
          .step-dot.active {
            background: #f2c982;
          }
          .register-card {
            width: 100%;
            max-width: 480px;
            background: #fff;
            border-radius: 20px;
            padding: 24px 20px;
            border: 1px solid #ece8df;
            box-shadow: 0 12px 30px rgba(37,86,93,.08);
          }
          .step-title {
            font: 800 17px/1.2 'Manrope', sans-serif;
            color: #303b3c;
            margin: 0 0 16px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .step-title ion-icon {
            color: #326d75;
          }
          .form-group {
            margin-bottom: 14px;
          }
          .form-group label {
            display: block;
            font-size: 11px;
            font-weight: 700;
            color: #4f5f5c;
            margin-bottom: 5px;
          }
          .custom-input {
            border: 1.5px solid #e2ddd4;
            border-radius: 12px;
            padding: 8px 12px;
            font-size: 13px;
            background: #fcfbf9;
            color: #303b3c;
          }
          .billing-toggle-wrap {
            display: flex;
            background: #eef3f2;
            padding: 4px;
            border-radius: 12px;
            margin-bottom: 16px;
            gap: 4px;
          }
          .billing-toggle-btn {
            flex: 1;
            padding: 9px 12px;
            border-radius: 9px;
            border: 0;
            background: transparent;
            font-size: 12px;
            font-weight: 700;
            color: #556c67;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
          }
          .billing-toggle-btn.active {
            background: #fff;
            color: #326d75;
            box-shadow: 0 2px 8px rgba(37,86,93,0.12);
          }
          .save-badge {
            background: #f2c982;
            color: #4a3810;
            font-size: 9px;
            font-weight: 800;
            padding: 2px 6px;
            border-radius: 99px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .plan-box {
            position: relative;
            border: 1.5px solid #e2ddd4;
            border-radius: 14px;
            padding: 14px;
            margin-bottom: 12px;
            cursor: pointer;
            transition: all 0.2s;
          }
          .plan-box.selected {
            border-color: #326d75;
            background: #f0f7f6;
            box-shadow: 0 4px 14px rgba(50,109,117,0.1);
          }
          .plan-box-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .plan-box strong {
            display: block;
            font-size: 14px;
            color: #303b3c;
          }
          .plan-box span.price {
            display: block;
            font-size: 15px;
            color: #326d75;
            font-weight: 800;
            margin-top: 2px;
          }
          .plan-box .billed-text {
            font-size: 10px;
            color: #7c8e8a;
          }
          .btn-actions {
            display: flex;
            gap: 10px;
            margin-top: 22px;
          }
        `}</style>

        <div className="register-layout">
          <div className="register-header">
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#f2c982', letterSpacing: '.12em' }}>
              HOSTTECH SAAS ONBOARDING
            </span>
            <h1>Register Your PG</h1>
            <p>Step {step} of 4: Setup your independent PG workspace.</p>
            <div className="step-indicators">
              <div className={`step-dot ${step >= 1 ? 'active' : ''}`} />
              <div className={`step-dot ${step >= 2 ? 'active' : ''}`} />
              <div className={`step-dot ${step >= 3 ? 'active' : ''}`} />
              <div className={`step-dot ${step >= 4 ? 'active' : ''}`} />
            </div>
          </div>

          <div className="register-card">
            {step === 1 && (
              <div>
                <h2 className="step-title"><IonIcon icon={personOutline} /> PG Owner Information</h2>
                <div className="form-group">
                  <label>Full Name</label>
                  <IonInput
                    className="custom-input"
                    placeholder="e.g. Ramesh Sharma"
                    value={formData.ownerName}
                    onIonInput={(e) => handleChange('ownerName', e.detail.value)}
                    onIonChange={(e) => handleChange('ownerName', e.detail.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <IonInput
                    className="custom-input"
                    type="email"
                    placeholder="owner@yourpg.com"
                    value={formData.email}
                    onIonInput={(e) => handleChange('email', e.detail.value)}
                    onIonChange={(e) => handleChange('email', e.detail.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Mobile Number</label>
                  <IonInput
                    className="custom-input"
                    type="tel"
                    placeholder="9876543210"
                    value={formData.phone}
                    onIonInput={(e) => handleChange('phone', e.detail.value)}
                    onIonChange={(e) => handleChange('phone', e.detail.value)}
                  />
                </div>
                <div style={{ background: '#f0f7f6', border: '1px solid #d0e4e0', borderRadius: '12px', padding: '12px 14px', marginTop: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#326d75', fontWeight: 800, fontSize: '12px' }}>
                    <IonIcon icon={mailOutline} style={{ fontSize: '16px' }} />
                    <span>Auto-Generated Secure Password</span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#526662', margin: '4px 0 0', lineHeight: 1.4 }}>
                    Your login password will be system-generated and emailed to <strong>{formData.email || 'your email'}</strong> immediately after onboarding.
                  </p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="step-title"><IonIcon icon={businessOutline} /> PG Business Profile</h2>
                <div className="form-group">
                  <label>PG / Hostel Name</label>
                  <IonInput
                    className="custom-input"
                    placeholder="e.g. Stanza Co-Living"
                    value={formData.pgName}
                    onIonInput={(e) => handleChange('pgName', e.detail.value)}
                    onIonChange={(e) => handleChange('pgName', e.detail.value)}
                  />
                </div>
                <div className="form-group">
                  <label>PG Type</label>
                  <IonSelect
                    className="custom-input"
                    value={formData.pgType}
                    onIonChange={(e) => handleChange('pgType', e.detail.value)}
                  >
                    <IonSelectOption value="Coliving">Co-Living (Unisex)</IonSelectOption>
                    <IonSelectOption value="Gents">Gents PG</IonSelectOption>
                    <IonSelectOption value="Ladies">Ladies PG</IonSelectOption>
                  </IonSelect>
                </div>
                <div className="form-group">
                  <label>Street Address</label>
                  <IonInput
                    className="custom-input"
                    placeholder="Plot 42, Green Glen Layout"
                    value={formData.address}
                    onIonInput={(e) => handleChange('address', e.detail.value)}
                    onIonChange={(e) => handleChange('address', e.detail.value)}
                  />
                </div>
                <div className="form-group">
                  <label>State & City</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <IonSelect
                      className="custom-input"
                      style={{ flex: 1.2 }}
                      value={formData.state}
                      placeholder="Select State"
                      onIonChange={(e) => handleChange('state', e.detail.value)}
                    >
                      <IonSelectOption value="Maharashtra">Maharashtra</IonSelectOption>
                      <IonSelectOption value="Karnataka">Karnataka</IonSelectOption>
                      <IonSelectOption value="Delhi">Delhi</IonSelectOption>
                      <IonSelectOption value="Uttar Pradesh">Uttar Pradesh</IonSelectOption>
                      <IonSelectOption value="Telangana">Telangana</IonSelectOption>
                      <IonSelectOption value="Tamil Nadu">Tamil Nadu</IonSelectOption>
                      <IonSelectOption value="Gujarat">Gujarat</IonSelectOption>
                      <IonSelectOption value="Rajasthan">Rajasthan</IonSelectOption>
                      <IonSelectOption value="West Bengal">West Bengal</IonSelectOption>
                      <IonSelectOption value="Madhya Pradesh">Madhya Pradesh</IonSelectOption>
                      <IonSelectOption value="Haryana">Haryana</IonSelectOption>
                      <IonSelectOption value="Punjab">Punjab</IonSelectOption>
                      <IonSelectOption value="Kerala">Kerala</IonSelectOption>
                      <IonSelectOption value="Andhra Pradesh">Andhra Pradesh</IonSelectOption>
                      <IonSelectOption value="Other">Other State</IonSelectOption>
                    </IonSelect>
                    <IonInput
                      className="custom-input"
                      style={{ flex: 1 }}
                      placeholder="e.g. Pune"
                      value={formData.city}
                      onIonInput={(e) => handleChange('city', e.detail.value)}
                      onIonChange={(e) => handleChange('city', e.detail.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Pincode (6 Digits)</label>
                  <IonInput
                    className="custom-input"
                    type="tel"
                    inputmode="numeric"
                    maxlength={6}
                    placeholder="e.g. 411041"
                    value={formData.pincode}
                    onIonInput={(e) => handleChange('pincode', (e.detail.value || '').replace(/\D/g, '').slice(0, 6))}
                    onIonChange={(e) => handleChange('pincode', (e.detail.value || '').replace(/\D/g, '').slice(0, 6))}
                  />
                  {formData.pincode && !/^[1-9][0-9]{5}$/.test(String(formData.pincode).trim()) && (
                    <span style={{ fontSize: '10px', color: '#e53935', marginTop: '4px', display: 'block' }}>
                      Please enter a valid 6-digit PIN code.
                    </span>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="step-title"><IonIcon icon={layersOutline} /> Initial Room Capacity</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Floors Count</label>
                    <IonInput
                      className="custom-input"
                      type="number"
                      value={formData.floorsCount}
                      onIonChange={(e) => handleChange('floorsCount', Number(e.detail.value))}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Rooms Per Floor</label>
                    <IonInput
                      className="custom-input"
                      type="number"
                      value={formData.roomsPerFloor}
                      onIonChange={(e) => handleChange('roomsPerFloor', Number(e.detail.value))}
                    />
                  </div>
                </div>

                {/* Sharing Wise Rent Inputs */}
                <div style={{ marginTop: '10px', marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#326d75', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                    <IonIcon icon={peopleOutline} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                    Sharing-Wise Monthly Rent (₹)
                  </label>
                  <p style={{ fontSize: '11px', color: '#7c8e8a', margin: '0 0 10px' }}>
                    Set rent amount according to sharing occupancy:
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '10px' }}>2-Sharing</label>
                      <IonInput
                        className="custom-input"
                        type="number"
                        placeholder="₹8,000"
                        value={formData.rent2Sharing}
                        onIonChange={(e) => handleChange('rent2Sharing', Number(e.detail.value))}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '10px' }}>3-Sharing</label>
                      <IonInput
                        className="custom-input"
                        type="number"
                        placeholder="₹6,500"
                        value={formData.rent3Sharing}
                        onIonChange={(e) => handleChange('rent3Sharing', Number(e.detail.value))}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '10px' }}>4-Sharing</label>
                      <IonInput
                        className="custom-input"
                        type="number"
                        placeholder="₹5,000"
                        value={formData.rent4Sharing}
                        onIonChange={(e) => handleChange('rent4Sharing', Number(e.detail.value))}
                      />
                    </div>
                  </div>
                </div>

                {/* Electricity / Light Bill Toggle */}
                <div
                  style={{
                    border: '1.5px solid #e2ddd4',
                    borderRadius: '14px',
                    padding: '12px 14px',
                    background: formData.chargeElectricity ? '#f0f7f6' : '#fcfbf9',
                    borderColor: formData.chargeElectricity ? '#326d75' : '#e2ddd4',
                    transition: 'all 0.2s',
                    marginTop: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: formData.chargeElectricity ? '#326d75' : '#eaf1ee',
                          color: formData.chargeElectricity ? '#fff' : '#326d75',
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: '16px',
                        }}
                      >
                        <IonIcon icon={flashOutline} />
                      </div>
                      <div>
                        <strong style={{ fontSize: '12px', color: '#303b3c', display: 'block' }}>
                          Charge Light Bill Separately?
                        </strong>
                        <span style={{ fontSize: '10px', color: '#7c8e8a' }}>
                          Collect electricity charges extra from tenants
                        </span>
                      </div>
                    </div>

                    <label style={{ position: 'relative', display: 'inline-block', width: '42px', height: '24px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.chargeElectricity}
                        onChange={(e) => handleChange('chargeElectricity', e.target.checked)}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          cursor: 'pointer',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: formData.chargeElectricity ? '#326d75' : '#ccc',
                          transition: '.3s',
                          borderRadius: '24px',
                        }}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            content: '""',
                            height: '18px',
                            width: '18px',
                            left: formData.chargeElectricity ? '20px' : '3px',
                            bottom: '3px',
                            backgroundColor: 'white',
                            transition: '.3s',
                            borderRadius: '50%',
                          }}
                        />
                      </span>
                    </label>
                  </div>

                  {formData.chargeElectricity && (
                    <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #ced8d5' }}>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#4f5f5c', marginBottom: '6px' }}>
                        How do you bill electricity?
                      </label>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                        <button
                          type="button"
                          onClick={() => handleChange('electricityBillingType', 'per_unit')}
                          style={{
                            flex: 1,
                            padding: '6px 8px',
                            fontSize: '11px',
                            fontWeight: 700,
                            borderRadius: '8px',
                            border: '1px solid',
                            borderColor: formData.electricityBillingType === 'per_unit' ? '#326d75' : '#d2dbd7',
                            background: formData.electricityBillingType === 'per_unit' ? '#326d75' : '#fff',
                            color: formData.electricityBillingType === 'per_unit' ? '#fff' : '#4f5f5c',
                          }}
                        >
                          Per Unit Meter
                        </button>
                        <button
                          type="button"
                          onClick={() => handleChange('electricityBillingType', 'fixed_monthly')}
                          style={{
                            flex: 1,
                            padding: '6px 8px',
                            fontSize: '11px',
                            fontWeight: 700,
                            borderRadius: '8px',
                            border: '1px solid',
                            borderColor: formData.electricityBillingType === 'fixed_monthly' ? '#326d75' : '#d2dbd7',
                            background: formData.electricityBillingType === 'fixed_monthly' ? '#326d75' : '#fff',
                            color: formData.electricityBillingType === 'fixed_monthly' ? '#fff' : '#4f5f5c',
                          }}
                        >
                          Fixed Monthly / Tenant
                        </button>
                      </div>

                      {formData.electricityBillingType === 'per_unit' ? (
                        <div className="form-group" style={{ margin: 0 }}>
                          <label style={{ fontSize: '10px' }}>Rate per Electricity Unit (₹/kWh)</label>
                          <IonInput
                            className="custom-input"
                            type="number"
                            placeholder="e.g. 10"
                            value={formData.electricityRate}
                            onIonChange={(e) => handleChange('electricityRate', Number(e.detail.value))}
                          />
                        </div>
                      ) : (
                        <div className="form-group" style={{ margin: 0 }}>
                          <label style={{ fontSize: '10px' }}>Fixed Monthly Electricity Charge (₹)</label>
                          <IonInput
                            className="custom-input"
                            type="number"
                            placeholder="e.g. 500"
                            value={formData.electricityFixedAmount}
                            onIonChange={(e) => handleChange('electricityFixedAmount', Number(e.detail.value))}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="step-title"><IonIcon icon={cashOutline} /> Choose Subscription Plan</h2>
                <p style={{ fontSize: '11px', color: '#6d7b78', margin: '0 0 14px' }}>
                  Enjoy a <strong>14-day free trial</strong> with all features unlocked. Choose your billing cycle below:
                </p>

                {/* Monthly / Yearly Toggle */}
                <div className="billing-toggle-wrap">
                  <button
                    type="button"
                    className={`billing-toggle-btn ${formData.billingCycle === 'monthly' ? 'active' : ''}`}
                    onClick={() => handleChange('billingCycle', 'monthly')}
                  >
                    Monthly Billing
                  </button>
                  <button
                    type="button"
                    className={`billing-toggle-btn ${formData.billingCycle === 'yearly' ? 'active' : ''}`}
                    onClick={() => handleChange('billingCycle', 'yearly')}
                  >
                    <span>Yearly Billing</span>
                    <span className="save-badge">Save ~17%</span>
                  </button>
                </div>

                {/* Plan Options */}
                <div
                  className={`plan-box ${formData.planId === 'starter' ? 'selected' : ''}`}
                  onClick={() => handleChange('planId', 'starter')}
                >
                  <div className="plan-box-header">
                    <div>
                      <strong>Starter Plan</strong>
                      <span className="price">
                        {formData.billingCycle === 'monthly' ? '₹999 / mo' : '₹9,999 / yr'}
                      </span>
                      <span className="billed-text">
                        {formData.billingCycle === 'monthly' ? 'Billed monthly' : 'Billed annually (Save ₹1,989)'}
                      </span>
                    </div>
                    {formData.planId === 'starter' && (
                      <IonIcon icon={checkmarkCircleOutline} style={{ color: '#326d75', fontSize: '20px' }} />
                    )}
                  </div>
                  <p style={{ fontSize: '11px', color: '#6d7b78', margin: '6px 0 0' }}>
                    Up to 15 rooms, mobile resident portal, digital rent receipts.
                  </p>
                </div>

                <div
                  className={`plan-box ${formData.planId === 'growth' ? 'selected' : ''}`}
                  onClick={() => handleChange('planId', 'growth')}
                >
                  <div className="plan-box-header">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <strong>Growth Plan</strong>
                        <span style={{ fontSize: '9px', fontWeight: 800, background: '#326d75', color: '#fff', padding: '1px 6px', borderRadius: '4px' }}>
                          POPULAR
                        </span>
                      </div>
                      <span className="price">
                        {formData.billingCycle === 'monthly' ? '₹1,999 / mo' : '₹19,999 / yr'}
                      </span>
                      <span className="billed-text">
                        {formData.billingCycle === 'monthly' ? 'Billed monthly' : 'Billed annually (Save ₹3,989)'}
                      </span>
                    </div>
                    {formData.planId === 'growth' && (
                      <IonIcon icon={checkmarkCircleOutline} style={{ color: '#326d75', fontSize: '20px' }} />
                    )}
                  </div>
                  <p style={{ fontSize: '11px', color: '#6d7b78', margin: '6px 0 0' }}>
                    Up to 50 rooms, auto rent reminders, resident KYC documents, complaint desk.
                  </p>
                </div>

                <div
                  className={`plan-box ${formData.planId === 'pro' ? 'selected' : ''}`}
                  onClick={() => handleChange('planId', 'pro')}
                >
                  <div className="plan-box-header">
                    <div>
                      <strong>Pro Enterprise</strong>
                      <span className="price">
                        {formData.billingCycle === 'monthly' ? '₹3,499 / mo' : '₹34,999 / yr'}
                      </span>
                      <span className="billed-text">
                        {formData.billingCycle === 'monthly' ? 'Billed monthly' : 'Billed annually (Save ₹6,989)'}
                      </span>
                    </div>
                    {formData.planId === 'pro' && (
                      <IonIcon icon={checkmarkCircleOutline} style={{ color: '#326d75', fontSize: '20px' }} />
                    )}
                  </div>
                  <p style={{ fontSize: '11px', color: '#6d7b78', margin: '6px 0 0' }}>
                    Up to 200 rooms, custom branding, multi-property management, priority vendor support.
                  </p>
                </div>

                {/* Payment Method Section */}
                <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1.5px solid #edf0ee' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#303b3c', marginBottom: '6px' }}>
                    Payment Details
                  </label>
                  <p style={{ fontSize: '11px', color: '#7c8e8a', margin: '0 0 12px' }}>
                    Setup your billing method for plan activation & renewal (starts after 14-day trial):
                  </p>

                  {/* Payment method selector */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                    <button
                      type="button"
                      onClick={() => handleChange('paymentMethod', 'upi')}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: '1.5px solid',
                        borderColor: formData.paymentMethod === 'upi' ? '#326d75' : '#dbe3e0',
                        background: formData.paymentMethod === 'upi' ? '#f0f7f6' : '#fff',
                        color: formData.paymentMethod === 'upi' ? '#326d75' : '#526662',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <IonIcon icon={walletOutline} />
                      <span>UPI / VPA</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange('paymentMethod', 'card')}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: '1.5px solid',
                        borderColor: formData.paymentMethod === 'card' ? '#326d75' : '#dbe3e0',
                        background: formData.paymentMethod === 'card' ? '#f0f7f6' : '#fff',
                        color: formData.paymentMethod === 'card' ? '#326d75' : '#526662',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <IonIcon icon={cardOutline} />
                      <span>Credit / Debit Card</span>
                    </button>
                  </div>

                  {formData.paymentMethod === 'upi' ? (
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '11px' }}>UPI ID (Google Pay / PhonePe / Paytm / BHIM)</label>
                      <IonInput
                        className="custom-input"
                        placeholder="e.g. yourname@okaxis or 9876543210@upi"
                        value={formData.upiId}
                        onIonChange={(e) => handleChange('upiId', e.detail.value)}
                      />
                      <span style={{ fontSize: '10px', color: '#7c8e8a', marginTop: '4px', display: 'block' }}>
                        Auto-debit mandate setup will be sent to your UPI app.
                      </span>
                    </div>
                  ) : (
                    <div>
                      <div className="form-group" style={{ marginBottom: '10px' }}>
                        <label style={{ fontSize: '11px' }}>Cardholder Name</label>
                        <IonInput
                          className="custom-input"
                          placeholder="Name as printed on card"
                          value={formData.cardName}
                          onIonChange={(e) => handleChange('cardName', e.detail.value)}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: '10px' }}>
                        <label style={{ fontSize: '11px' }}>Card Number</label>
                        <IonInput
                          className="custom-input"
                          type="text"
                          maxlength={19}
                          placeholder="XXXX XXXX XXXX XXXX"
                          value={formData.cardNumber}
                          onIonChange={(e) => handleChange('cardNumber', e.detail.value)}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <div className="form-group" style={{ flex: 1, margin: 0 }}>
                          <label style={{ fontSize: '11px' }}>Expiry (MM/YY)</label>
                          <IonInput
                            className="custom-input"
                            maxlength={5}
                            placeholder="MM/YY"
                            value={formData.cardExpiry}
                            onIonChange={(e) => handleChange('cardExpiry', e.detail.value)}
                          />
                        </div>
                        <div className="form-group" style={{ flex: 1, margin: 0 }}>
                          <label style={{ fontSize: '11px' }}>CVV</label>
                          <IonInput
                            className="custom-input"
                            type="password"
                            maxlength={4}
                            placeholder="•••"
                            value={formData.cardCvv}
                            onIonChange={(e) => handleChange('cardCvv', e.detail.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '14px', background: '#fbf9f4', padding: '8px 10px', borderRadius: '8px', border: '1px solid #faeecf' }}>
                    <IonIcon icon={shieldCheckmarkOutline} style={{ color: '#d99726', fontSize: '16px' }} />
                    <span style={{ fontSize: '10px', color: '#735f37' }}>
                      256-bit encrypted secure checkout. You won't be charged today during the 14-day trial.
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="btn-actions">
              {step > 1 && (
                <IonButton fill="outline" style={{ flex: 1, '--border-color': '#326d75', '--color': '#326d75' }} onClick={() => setStep((p) => p - 1)}>
                  <IonIcon icon={arrowBackOutline} slot="start" /> Back
                </IonButton>
              )}
              {step < 4 ? (
                <IonButton style={{ flex: 2, '--background': '#326d75' }} onClick={handleNext}>
                  Next <IonIcon icon={arrowForwardOutline} slot="end" />
                </IonButton>
              ) : (
                <IonButton style={{ flex: 2, '--background': '#326d75' }} onClick={handleSubmit}>
                  Complete & Launch <IonIcon icon={checkmarkCircleOutline} slot="end" />
                </IonButton>
              )}
            </div>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <span style={{ fontSize: '11px', color: '#7c8e8a' }}>Already have a PG account? </span>
              <a href="/login" style={{ fontSize: '11px', color: '#326d75', fontWeight: 700 }}>Log In</a>
            </div>
          </div>
        </div>

        <IonLoading isOpen={loading} message="Setting up your PG workspace..." />
        <IonToast
          isOpen={!!toastMessage}
          message={toastMessage || ''}
          duration={2500}
          onDidDismiss={() => setToastMessage(null)}
          color="danger"
        />

        <IonAlert
          isOpen={showSuccessAlert}
          header="Registration Successful! 🎉"
          subHeader="Login Credentials Sent to Email"
          message={`Your PG has been registered successfully! An email containing your login credentials (username & password) and a Change Password link has been sent to ${registeredEmail}. Please check your inbox and log in.`}
          buttons={[
            {
              text: 'Go to Login',
              role: 'confirm',
              handler: () => {
                setShowSuccessAlert(false);
                history.replace('/login');
              },
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default RegisterPG;
