import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../atom/Header";
import styles from "./PANCard.module.css";
import TopPanIcon from "../../assets/icons/KYCiconsPAN.svg";
import clock from "../../assets/icons/ClockTimer.svg";
import shield from "../../assets/icons/warn.svg";
import Lion from "../../assets/icons/Lion.png";
import PAN_1 from "../../assets/images/PAN_1.svg";

const PANCard = () => {
  const navigate = useNavigate();
  const [panNumber, setPanNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [countdown, setCountdown] = useState(10);
  const [PANData, setPANData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenConfirmationModal, setIsOpenConfirmationModal] = useState(false);

  const validatePAN = (pan) => {
    const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panPattern.test(pan);
  };

  const handleSubmit = async (e) => {
    const token = localStorage.getItem("authToken");
    e.preventDefault();
    if (!validatePAN(panNumber)) {
      setErrorMessage("Enter a valid PAN number");
      return;
    }
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/check_pan`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ panNumber: panNumber }),
        }
      );
      const data = await response.json();
      setIsOpenConfirmationModal(true);
      setPANData(data.panDetails.result);
      setIsLoading(false);
      console.info(data);
    } catch (error) {
      setIsLoading(false);
      console.error("Error verifying PAN:", error);
    }
  };

  const handlePanConfirmation = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/confirm_pan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ panData: PANData })
      });
      
      const data = await response.json();
      if (data.success) {
        console.log('PAN confirmed successfully');
        setIsOpenConfirmationModal(false);
        navigate('/digilocker');
      } else {
        console.error('Failed to confirm PAN:', data.message);
      }
    } catch (error) {
      console.error('Error confirming PAN:', error);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 0) {
          return 10;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* <Header/> */}
      <div className={styles.MainContainer}>
        <div className={styles.MainWrapper}>
          <div className={styles.topPANDiv}>
            <img
              src={TopPanIcon}
              alt="PAN Icon"
              className={styles.topPanIcon}
            />
            <div className={styles.topPanText}>Verify Your PAN</div>

            <div className={styles.topClockDiv}>
              <img src={clock} alt="Clock Icon" className={styles.clockIcon} />
              <div className={styles.clockText}>
                this takes less than {countdown} seconds.{" "}
              </div>
            </div>
          </div>

          <div className={styles.panDemoDiv}>
            <div className={styles.EnterYourPan}>Enter Your Pan</div>

            <div>
              <img src={PAN_1} alt="PAN Icon" className={styles.panImage} />
            </div>

            <div className={styles.SamplePANText}>Showing sample PAN</div>
          </div>

          <div className={styles.panInputDiv}>
            <div className={styles.panLabel}>Enter PAN Number*</div>

            <input
              type="text"
              value={panNumber}
              onChange={(e) => setPanNumber(e.target.value)}
              placeholder="Enter your PAN to proceed"
              onInput={(e) => (e.target.value = e.target.value.toUpperCase())}
              maxLength={10}
              className={styles.panInput}
            />

            {errorMessage && (
              <div className={styles.errorMessage}>{errorMessage}</div>
            )}
          </div>

          <div className={styles.shieldDiv}>
            <img src={shield} alt="shield Icon" className={styles.shieldIcon} />
            <div className={styles.shieldText}>
              Your account details are safe & secure with us.
            </div>
          </div>

          <div className={styles.Line}></div>

          <button className={styles.verifyButton} onClick={handleSubmit}>
            Verify PAN
          </button>
        </div>
      </div>

      {isLoading && (
        <div className={styles.loader}>
          <div className={styles.loaderDiv}>
            <div className={styles.fetchingText}>Fetching PAN Information</div>
            <div>
              <div className={styles.loadingText}>
                Please wait, this may take a while!
              </div>
              <div className={styles.loadingText}>
                Do not press back key or refresh this page
              </div>
            </div>

            <div className={styles.shieldDiv}>
              <img
                src={shield}
                alt="shield Icon"
                className={styles.shieldIcon}
              />
              <div className={styles.shieldText}>
                Your account details are safe & secure with us.
              </div>
            </div>
          </div>
        </div>
      )}

      {isOpenConfirmationModal && (
        <div className={styles.confirmationDiv}>
          <div className={styles.confirmationWrapper}>
            <div>Fetched details from Income Tax Department</div>

            <div className={styles.confirmationItemDiv}>



              <div className={styles.PanDesign}>


              <div className={styles.PanInner}>

                <div className={styles.PanAuthority}>
                  <div>
                    
                  {/* <div className={styles.PanAuthorityText}>आयकर विभाग</div> */}
                  <div className={styles.PanAuthorityText}>INCOME TAX DEPARTMENT</div>
                  </div>
                  <img src={Lion} alt="Lion Icon" className={styles.LionImage} />
                  <div className={styles.PanAuthorityText}>GOVT. OF INDIA</div>
                </div>

                <div className={styles.PanNumberContainer}>
                  <div className={styles.PanNumberHeading}>Permanent Account Number</div>
                  <div className={styles.PanNumberText}>{PANData.number}</div>

                </div>


                <div className={styles.PanDetailContainerTop}>

                  <div className={styles.PanNameContainer}> 
                    <div className={styles.PanName}>Name</div>
                    <div className={styles.PanNameValue}>{PANData.name}</div>
                  </div>

                </div>

                <div className={styles.PanDetailContainer}>

                  <div className={styles.PanNameContainer}> 
                    <div className={styles.PanName}>Father's Name</div>
                    <div className={styles.PanNameValue}>{PANData.fatherName}</div>
                  </div>

                </div>

                <div className={styles.PanDetailContainer}>

                  <div className={styles.PanNameContainer}> 
                    <div className={styles.PanName}>Date of Birth</div>
                    <div className={styles.PanNameValue}>{PANData.dateOfBirth}</div>
                  </div>

                </div>
              </div>

              </div>




              {/* <div>Name</div>
              <div>{"PANData.name"}</div>
              <div>PAN Number</div>
              <div>{"PANData.number"}</div>
              <div>Fathers Name</div>
              <div>{"PANData.fatherName"}</div>
              <div>DOB</div>
              <div></div> */}





            </div>

            <button
              className={styles.confirmButton}
              onClick={handlePanConfirmation}
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PANCard;
