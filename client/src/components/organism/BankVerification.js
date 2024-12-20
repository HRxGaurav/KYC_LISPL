import React, { useState, useEffect } from "react";
import styles from "./BankVerification.module.css";
import KYCiconBank from "../../assets/icons/KYCiconBank.svg";
import clock from "../../assets/icons/ClockTimer.svg";
import shield from "../../assets/icons/warn.svg";
import UPIimg from "../../assets/icons/UPIimg.svg";
import bankifsc from "../../assets/icons/bankifsc.svg";
import UPI_Layer from "../../assets/icons/UPI_Layer.svg";
import phonepeIcon from "../../assets/icons/phonePeIcon.svg";
import gPayIcon from "../../assets/icons/gPayIcon.svg";
import paytmIcon from "../../assets/icons/paytmIcon.svg";
import bhimIcon from "../../assets/icons/bhimIcon.svg";
import whatsappPay from "../../assets/icons/whatsappPay.svg";
import { useNavigate } from 'react-router-dom';

const BankVerification = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(30);
  const [isCheckedUPI, setIsCheckedUPI] = useState(true);
  const [isCheckedBank, setIsCheckedBank] = useState(false);
  const [ifscError, setIfscError] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showUPIPopup, setShowUPIPopup] = useState(false);
  const [apiError, setApiError] = useState('');
  const [accountNumberError, setAccountNumberError] = useState('');
  const [accountNumberInfo, setAccountNumberInfo] = useState();
  const [upiCreatedLink, setUpiCreatedLink] = useState(null);
  const [statusCheckCount, setStatusCheckCount] = useState(0);
  const [verificationData, setVerificationData] = useState(null);
  const [showVerificationSuccessPopup, setShowVerificationSuccessPopup] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 0) {
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (showUPIPopup) {
        const intervalId = setInterval(async () => {
            if (statusCheckCount < 150) {
                try {
                    const token = localStorage.getItem('authToken');
                    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/verify_reverse_penny_drop`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ verificationId: upiCreatedLink.result.id })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setVerificationData(data.data); // Store the verification data

                        // Check the status
                        const status = data.data.result.status;
                        if (status === 'SUCCESS' || status === 'FAILURE' || status === 'EXPIRED') {
                            clearInterval(intervalId); // Stop checking
                            setShowUPIPopup(false); // Close the UPI popup
                            if (status === 'SUCCESS') {
                                setShowVerificationSuccessPopup(true); // Show success popup if status is SUCCESS
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error checking status:', error);
                }
                setStatusCheckCount((prev) => prev + 1); // Increment the count
            } else {
                clearInterval(intervalId); // Clear the interval after 150 attempts
            }
        }, 3000); // Check every 3 seconds

        return () => clearInterval(intervalId); // Cleanup on unmount
    }
}, [showUPIPopup]);

  const handleUPICheck = () => {
    setIsCheckedUPI(true);
    setIsCheckedBank(false);
  };

  const handleBankCheck = () => {
    setIsCheckedUPI(false);
    setIsCheckedBank(true);
  };

  const validateIFSC = (value) => {
    const ifscPattern = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscPattern.test(value)) {
        setIfscError('Invalid IFSC code.');
    } else {
        setIfscError('');
    }
};

const validateAccountNumber = (value) => {
  if (value.trim() === '') {
      setAccountNumberError('Account Number cannot be empty.');
  } else {
      setAccountNumberError('');
  }
};

  const handleBankVerification = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/hybrid_bank_account_verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          beneficiaryAccount: accountNumber,
          beneficiaryIFSC: ifscCode
        })
      });

      if (!response.ok) {
        throw new Error('Verification failed');
      }

      const data = await response.json();
      setAccountNumberInfo(data.data.result);
      console.log(data);
      
      setShowSuccessPopup(true);
      setApiError('');
    } catch (error) {
      setApiError('Verification failed. Please try again.');
      console.error('Error:', error);
    }
  };

  const handleUPICreateLink = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/reverse_penny_drop_create_link`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        throw new Error('UPI verification link creation failed');
      }
  
      const data = await response.json();
      setUpiCreatedLink(data.data);
      setShowUPIPopup(true); 
    } catch (error) {
      setApiError('UPI verification failed. Please try again.');
      console.error('Error:', error);
    }
  };

  return (
    <>
      <div className={styles.MainContainer}>
        <div className={styles.MainWrapper}>
          <div className={styles.topPANDiv}>
            <img
              src={KYCiconBank}
              alt="PAN Icon"
              className={styles.topPanIcon}
            />
            <div className={styles.topPanText}>Add Your Bank Account</div>

            <div className={styles.topClockDiv}>
              <img src={clock} alt="Clock Icon" className={styles.clockIcon} />
              <div className={styles.clockText}>
                this takes less than {countdown} seconds.
              </div>
            </div>
          </div>

          <div className={styles.panDemoDiv}>
            <div className={styles.EnterYourPan}>
              Select the way to connect your Bank Account
            </div>
          </div>

          <div className={styles.PaymentDiv}>
            <div>
              <label className={styles.customCheckbox}>
                <input
                  type="checkbox"
                  checked={isCheckedUPI}
                  onChange={handleUPICheck}
                />
                <span className={styles.checkmark}></span>
                <div className={styles.PaymentMode}>
                  <div className={styles.PaymentHeading}>
                    Verify Bank Account Instantly via{" "}
                    <span className={styles.UPI_Layer}>
                      <img
                        src={UPI_Layer}
                        alt="UPI_Layer"
                        className={styles.UPI_Layer}
                      />
                    </span>
                  </div>
                  {isCheckedUPI && (
                    <div className={styles.PaymentDes}>
                      Scan a QR code and verify your bank account via UPI. We
                      will deduct ₹1, which will be refunded within 2-3 business
                      days.
                    </div>
                  )}
                </div>
              </label>
            </div>

            <div>
              {isCheckedUPI && (
                <img src={UPIimg} alt="UPIimg" className={styles.UPIimg} />
              )}
            </div>
          </div>

          <div className={styles.PaymentDiv}>
            <div>
              <label className={styles.customCheckbox}>
                <input
                  type="checkbox"
                  checked={isCheckedBank}
                  onChange={handleBankCheck}
                />
                <span className={styles.checkmark}></span>
                <div className={styles.PaymentMode}>
                  <div className={styles.PaymentHeading}>
                    Verify Bank Account Instantly via{" "}
                    <span className={styles.UPI_Layer}>
                      <img
                        src={UPI_Layer}
                        alt="UPI_Layer"
                        className={styles.UPI_Layer}
                      />
                    </span>
                  </div>
                  
                </div>
              </label>

              {isCheckedBank && (
                    <div className={styles.PaymentDesBank}>
                      <div>
                        <div className={styles.BankLabel1}>Enter Account Number</div>
                        <input type="text" placeholder="Enter Account Number" className={styles.bankInput1} onChange={(e) => {setAccountNumber(e.target.value); validateAccountNumber(e.target.value)}} />
                        
                        <br />
                        <div className={styles.BankLabel2}>Enter IFSC Code</div>
                        <input
                          type="text"
                          placeholder="Enter IFSC code"
                          className={styles.bankInput2}
                          onChange={(e) => {
                            const upperCaseValue = e.target.value.toUpperCase();
                            setIfscCode(upperCaseValue);
                          }}
                          onBlur={() => validateIFSC(ifscCode)}
                          value={ifscCode}
                        />
                        {accountNumberError && <div className={styles.errorText}>{accountNumberError}</div>}
                        {ifscError && <div className={styles.errorText}>{ifscError}</div>}
                        {apiError && <div className={styles.errorText}>{apiError}</div>}
                      </div>
                    </div>
                  )}


            </div>

            <div>
              {isCheckedBank && (
                <img src={bankifsc} alt="UPIimg" className={styles.Bankifsc} />
              )}
            </div>
          </div>

          

          <div className={styles.shieldDiv}>
            <img src={shield} alt="shield Icon" className={styles.shieldIcon} />
            <div className={styles.shieldText}>
              Your account details are safe & secure with us.
            </div>
          </div>

          <div className={styles.Line}></div>

          {isCheckedUPI && (
            <button 
              className={styles.verifyButton}
              onClick={handleUPICreateLink}
            >
              Proceed to Next
            </button>
          )}
          {isCheckedBank && (
            <button 
              className={styles.verifyButton} 
              onClick={handleBankVerification}
              disabled={!accountNumber || !ifscCode || ifscError || accountNumberError}
            >
              Proceed to Next
            </button>
          )}
          {showSuccessPopup && (
            <div className={styles.popupOverlay}>
              <div className={styles.popup}>
                <div className={styles.popupContent}>
                  <h3>Success!</h3>
                  <div>
                    <p>Name : {accountNumberInfo?.bankTransfer?.beneName}</p>
                    <p>Account Number : {accountNumber}</p>
                    <p>IFSC : {accountNumberInfo?.bankTransfer?.beneIFSC}</p>
                  </div>
                  <button onClick={() => {
                    setShowSuccessPopup(false); 
                    navigate('/person-verification'); 
                  }}>Confirm</button>
                </div>
              </div>
            </div>
          )}
          {showUPIPopup && (
            <div className={styles.popupOverlay}>
              <div className={styles.popup}>


                <div className={styles.popupContentDesktop}>
                  <h3>UPI Verification</h3>
                  <div>
                    <h4>Pay ₹1.00</h4>
                    <p>Scan QR code with any UPI app</p>
                    <div className={styles.upiImgPopupWrapper}>
                      <img src={phonepeIcon} alt="UPI" className={styles.upiImgPopup} />
                      <img src={gPayIcon} alt="UPI" className={styles.upiImgPopup} />
                      <img src={paytmIcon} alt="UPI" className={styles.upiImgPopup} />
                      <img src={bhimIcon} alt="UPI" className={styles.upiImgPopup} />
                      <img src={whatsappPay} alt="UPI" className={styles.upiImgPopup} />
                    </div>
                    <img src={`data:image/png;base64,${upiCreatedLink.result.qrCodeUrl}`} alt="UPI_QR" />
                  </div>
                  
                </div>

                <div className={styles.popupContentMobile}>
                  <h3>UPI Verification</h3>
                  <div>
                    <h4>Pay ₹1.00</h4>
                    <p>Scan QR code with any UPI app</p>
                    <img src={`data:image/png;base64,${upiCreatedLink.result.qrCodeUrl}`} alt="UPI_QR" />
                  </div>
                  
                </div>




              </div>
            </div>
          )}
          {showVerificationSuccessPopup && (
            <div className={styles.popupOverlay}>
              <div className={styles.popup}>
                <div className={styles.popupContent}>
                  <h3>Verification Successful!</h3>
                  {/* <p>Your UPI verification was successful.</p> */}
                  <p>Name : {verificationData.result.nameAtBank}</p>
                  <p>Bank Account Number : {verificationData.result.bankAccountNumber}</p>
                  <p>IFSC : {verificationData.result.ifsc}</p>
                  <button onClick={() => {
                    setShowVerificationSuccessPopup(false); 
                    navigate('/person-verification'); 
                  }}>Confirm</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BankVerification;
