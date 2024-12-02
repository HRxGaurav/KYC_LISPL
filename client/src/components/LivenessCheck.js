// src/components/LivenessCheck.js
import React, { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';

const LivenessCheck = () => {
  const [number, setNumber] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
//   const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    const randomNumber = Math.floor(Math.random() * 10000);
    setNumber(randomNumber);
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
      await faceapi.nets.tinyYolov2.loadFromUri('/models'); // Load Tiny YOLOv2 model
    //   setModelsLoaded(true);
      console.log('Models loaded successfully');
    } catch (error) {
      console.error('Error loading models:', error);
    }
  };

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      videoRef.current.srcObject = stream;
      return stream;
    } catch (err) {
      console.error('Error accessing media devices.', err);
      return null;
    }
  };

  const startRecording = async () => {
    const stream = await startVideo();
    if (!stream) {
      alert('Failed to start video stream. Please check your camera permissions.');
      return;
    }

    setIsRecording(true);
    mediaRecorderRef.current = new MediaRecorder(stream);

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setRecordedChunks((prev) => [...prev, event.data]);
      }
    };

    mediaRecorderRef.current.onstop = async () => {
      const blob = new Blob(recordedChunks, { type: 'video/mp4' });
      const formData = new FormData();
      formData.append('video', blob, 'liveness-check.mp4');
      formData.append('spokenNumber', number);

      // Send video to server
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/liveness-check`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      alert(data.message);
    };

    mediaRecorderRef.current.start();
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

//   const checkLiveness = async () => {
//     if (!modelsLoaded) {
//       console.error('Models are not loaded yet.');
//       return false;
//     }
//     const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions());
//     if (detections.length > 0) {
//       return true;
//     }
//     return false;
//   };

//   const verifyLiveness = async (spokenNumber) => {
//     const response = await fetch(`${process.env.REACT_APP_API_URL}/api/liveness-check`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ spokenNumber, number }),
//     });
//     const data = await response.json();
//     alert(data.message);
//   };

  return (
    <div>
      <h1>Say the number: {number}</h1>
      <video ref={videoRef} autoPlay muted style={{ width: '20%', height: 'auto' }} />
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
    </div>
  );
};

export default LivenessCheck;