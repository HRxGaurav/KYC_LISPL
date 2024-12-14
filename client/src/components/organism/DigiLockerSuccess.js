import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './DigiLockerSuccess.module.css';
import successImage from '../../assets/icons/success.gif';

const DigiLockerSuccess = () => {
  const [digilockerDetails, setDigilockerDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDigilockerDetails = async () => {
      const token = localStorage.getItem('authToken');

      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/get_digilocker_details`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setDigilockerDetails(data); // Store the response data
          setCountdown(5); // Start countdown after successful API call
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Failed to fetch details');
        }
      } catch (error) {
        console.error('Error fetching Digilocker details:', error);
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchDigilockerDetails();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      navigate('/bank-verification'); // Use useNavigate for navigation
    }
  }, [countdown]);

  if (loading) {
    return <h1>Loading...</h1>;
  }

  if (error) {
    return <h1>Error: {error}</h1>;
  }

  return (
    <div className={styles.successContainer}>
      <img src={successImage} alt="Success" className={styles.successImage} />
      <h1>Success</h1>
      <p>Your DigiLocker request was successful!</p>
      {countdown > 0 && <p>Redirecting in {countdown} seconds...</p>}
    </div>
  );
};

export default DigiLockerSuccess;