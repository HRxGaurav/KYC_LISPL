import React, { useEffect, useState } from 'react';
import logo from '../assets/icons/logo.png'
import fullLogo from '../assets/icons/fullLogo.png'
import styles from './Homepage.module.css'
import light from '../assets/icons/light-striking.svg'
import mobileprefix from '../assets/icons/mobileprefix.svg'
import Footer from './Footer';


const Homepage = () => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const Trade = ["Stocks", "IPO", "ETFs", "Futures", "Options", "Commodity", "Currency"]
  const [currentTrade, setCurrentTrade] = useState(Trade[0]);
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [mobileNumber, setMobileNumber] = useState('');
  const [mobileOTP, setMobileOTP] = useState('');
  const [error, setError] = useState('');
  const[page, setPage] = useState(0);
  const [email, setEmail] = useState('');
  const [timer, setTimer] = useState(30);
  const [isResendEnabled, setIsResendEnabled] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setIndex((prevIndex) => (prevIndex + 1) % Trade.length);
        setCurrentTrade(Trade[(index + 1) % Trade.length]);
        setIsVisible(true);
      }, 500);
    }, 3000);

    return () => clearInterval(interval);
  }, [Trade, index]);

  useEffect(() => {
    if (timer > 0) {
        const countdown = setInterval(() => {
            setTimer((prevTimer) => prevTimer - 1);
        }, 1000);

        return () => clearInterval(countdown);
    } else {
        setIsResendEnabled(true);
    }
  }, [timer]);

  const handleMobileChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,10}$/.test(value)) {
      setMobileNumber(value);
      setError('');
    }
  };

  const handleBlur = () => {
    if (mobileNumber.length < 10) {
      setError('Enter Mobile Number');
    }
  };

  const handleMobileProceed = async () => {
    if (mobileNumber.length < 10) {
      setError('Enter Mobile Number');
      return
    }
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/send_mobile_otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mobileNumber }),
        });

        const data = await response.json();

        if (response.ok) {
            // Handle successful OTP send (e.g., navigate to the next page or show a success message)
            console.log(data.message); // You can show this message to the user
            setPage(1); // Move to the next page
        } else {
            // Handle error response
            setError(data.message);
        }
    } catch (error) {
        console.error('Error sending OTP:', error);
        setError('Failed to send OTP. Please try again.');
    }
  };

  const validateMobileOTP = () =>{
    setPage(1)
  }

  const handleOTPChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,6}$/.test(value)) {  // Only allow up to 6 digits
        setMobileOTP(value);
        setError('');
    }
  };

  const resendOTP = () => {
    if (isResendEnabled) {
        // Logic to resend OTP
        console.log('Resending OTP...');
        
        // Reset timer
        setTimer(30);
        setIsResendEnabled(false);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setError(''); // Clear any existing error
  };

  const handleEmailBlur = () => {
    if (!email) {
        setError('Email is required');
    } else if (!validateEmail(email)) {
        setError('Please enter a valid email address');
    } else {
        setError('');
    }
  };

  return (
    <>
      <div className={styles.parentContainer}>
        <div class={styles.backgroundBlur}>
          <div ></div>
          <div ></div>
          <div ></div>
        </div>


        <div className={styles.leftContainer}>
          <div><img src={fullLogo} alt='logo' /></div>

          <div>
            <h1>ALL-IN-1 Investment Account</h1>
            <h2>Gateway To Your Financial Goals</h2>
            <p>Advanced Trading Features & Fast Execution. Trade like a Super Trader!</p>
          </div>

          <div className={styles.d_flex}>
            <div><img src={light} alt='lighting-strike' className={styles.lighting_strike} /></div>
            <div>
              <h3 className={styles.LightningText}>Made for</h3>
              <h4 className={styles.TradingNInvesting}> Trading & Investing in <span className={`${styles.StocksText} ${isVisible ? styles.fadeIn : styles.fadeOut}`}>{currentTrade}</span> </h4>
            </div>
          </div>

          <div></div>

        </div>

        <div className={styles.rightContainer}>

          {page===0 && <div className={styles.registerContent}>
            <div className={styles.registerLog}>
              <img src={logo} alt='logo' className={styles.rightLogo} />
              <h2 className={styles.createAccountText}>Create Your Account</h2>
            </div>



            <div className={styles.form__input_group}>
              <input
                className={styles.form__input}
                type="text"
                placeholder="Enter mobile number"
                value={mobileNumber}
                onChange={handleMobileChange}
                onBlur={handleBlur}
              />
              <label className={styles.form__input_label}>Mobile Number </label>
              <img src={mobileprefix} alt='mobile' className={styles.mobileprefix} />
            </div>
            {error && <p className={styles.errorText}>{error}</p>}

            <div className={styles.checkBoxContainer}>
              <p>By proceeding you agree to all Terms & Conditions</p>
            </div>

            <button className={styles.Button} onClick={handleMobileProceed}> Proceed</button>




          </div>}

          {page===1 && <div className={styles.registerContent}>
            <div className={styles.registerLog}>
              <img src={logo} alt='logo' className={styles.rightLogo} />
              <h2 className={styles.createAccountText}>Mobile OTP</h2>
            </div>



              <div>
                <h4>{mobileNumber}</h4>
                
              </div>
            <div className={styles.form__input_group}>
              <input
                className={styles.form__input}
                type="text"
                placeholder="Enter mobile OTP"
                value={mobileOTP}
                onChange={handleOTPChange}
                maxLength={6}
              />
              <label className={styles.form__input_label}>Mobile OTP </label>
              <img src={mobileprefix} alt='mobile' className={styles.mobileprefix} />
            </div>
            {error && <p className={styles.errorText}>{error}</p>}
            <p
                onClick={resendOTP}
                style={{ color: isResendEnabled ? 'black' : 'gray', cursor: isResendEnabled ? 'pointer' : 'default' }}
            >
                Resend OTP {timer > 0 && `in ${timer}s`}
            </p>

            

            <button className={styles.Button} onClick={validateMobileOTP}>Verify OTP</button>



          </div>}
          {page===3 && <div className={styles.registerContent}>
            <div className={styles.registerLog}>
              <img src={logo} alt='logo' className={styles.rightLogo} />
              <h2 className={styles.createAccountText}>Mobile OTP</h2>
            </div>



              <div>
                <h4>{mobileNumber}</h4>
                
              </div>
            <div className={styles.form__input_group}>
              <input
                className={styles.form__input}
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
              />
              <label className={styles.form__input_label}>Email </label>
              <img src={mobileprefix} alt='mobile' className={styles.mobileprefix} />
            </div>
            {error && <p className={styles.errorText}>{error}</p>}
            

            

            <button className={styles.Button} onClick={validateMobileOTP}>Verify OTP</button>



          </div>}

        </div>
      </div>

      <Footer/>
    </>
  )
}

export default Homepage