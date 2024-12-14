import React, { useState, useEffect } from "react";
import styles from "./DigiLockerLanding.module.css";
import digilockerSmall from "../../assets/icons/digilockerSmall.svg";
import clock from "../../assets/icons/ClockTimer.svg";
import PAN_1 from "../../assets/images/PAN_1.svg";
import shield from "../../assets/icons/warn.svg";
import fastAndSecure from "../../assets/icons/Fast&Secure.svg";

const DigiLockerLanding = () => {
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 0) {
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleGetStarted = async () => {
    setLoading(true);
    const token = localStorage.getItem("authToken");

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/create_digilocker_url`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        console.log("DigiLocker URL created:", data);
        window.open(data.url, "_self"); // Open the URL in the same page
      } else {
        console.error("Error creating DigiLocker URL:", data.message);
        // Handle error (e.g., show an error message)
      }
    } catch (error) {
      console.error("Network error:", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  };

  return (
    <>
      <div className={styles.MainContainer}>
        <div className={styles.MainWrapper}>
          <div className={styles.topPANDiv}>
            <img src={digilockerSmall} alt="Digilocker Icon" className={styles.topPanIcon} />
            <div className={styles.topPanText}>Fast KYC with Digilocker</div>

            <div className={styles.topClockDiv}>
              <img src={clock} alt="Clock Icon" className={styles.clockIcon} />
              <div className={styles.clockText}>
                this takes less than {countdown} seconds.{" "}
              </div>
            </div>
          </div>

          <div className={styles.panDemoDiv}>
            <div className={styles.EnterYourPan}>Complete your KYC via Digilocker</div>

            <div>
              <img src={fastAndSecure} alt="Fast and Secure" className={styles.panImage} />
            </div>

            
          </div>

          <div className={styles.ListDiv}>
            <ul>
              <li className={styles.ListItem}>Instantly pull documents through Digilocker (Aadhaar, PAN etc)</li>
              <li className={styles.ListItem}>Skip manual video verification</li>
              <li className={styles.ListItem}>Your Aadhaar number/copy will not be stored</li>
            </ul>
          </div>


          <div className={styles.consentDiv}>I provide my consent to share my Aadhaar Number, Date of Birth and Name from my Aadhaar eKYC information with the Income Tax Department for the purpose of fetching my PAN into DigiLocker.</div>

          <div className={styles.shieldDiv}>
            <img src={shield} alt="shield Icon" className={styles.shieldIcon} />
            <div className={styles.shieldText}>
              Your account details are safe & secure with us.
            </div>
          </div>

          <div className={styles.Line}></div>

          <button className={styles.verifyButton} onClick={handleGetStarted} disabled={loading}>
          {loading ? 'Taking you to Digilocker...' : 'Proceed via Digilocker (Fast KYC)'}
            
          </button>
        </div>
      </div>
    </>
  );
};

export default DigiLockerLanding;


