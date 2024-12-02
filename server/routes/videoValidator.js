import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import * as faceApi from 'face-api.js'; // Example face detection library
import speech from '@google-cloud/speech'; // Google Cloud Speech-to-Text library

const client = new speech.SpeechClient();

// Function to convert video to audio
const convertVideoToAudio = async (videoPath) => {
  const audioPath = path.join(path.dirname(videoPath), 'audio.wav');
  
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .toFormat('wav')
      .on('end', () => {
        resolve(audioPath);
      })
      .on('error', (err) => {
        reject(err);
      })
      .save(audioPath);
  });
};

// Function to check for a single person
const checkForSinglePerson = async (videoPath) => {
  const port = process.env.PORT || 9000; // Default to 9000 if PORT is not set
  await faceApi.nets.ssdMobilenetv1.loadFromUri(`http://localhost:${port}/models`); // Use process.env.PORT
  
  const video = await faceApi.fetchVideo(videoPath);
  const detections = await faceApi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();

  return detections.length === 1; // Check if exactly one person is detected
};

// Function to check for liveness
const checkForLiveness = async (videoPath) => {
  const port = process.env.PORT || 9000; // Default to 9000 if PORT is not set
  await faceApi.nets.ssdMobilenetv1.loadFromUri(`http://localhost:${port}/models`); // Use process.env.PORT
  
  const video = await faceApi.fetchVideo(videoPath);
  const detections = await faceApi.detectAllFaces(video).withFaceLandmarks();

  // Check for liveness by looking for blinking or head movement
  let isLively = false;
  for (let i = 0; i < detections.length; i++) {
    const landmarks = detections[i].landmarks;
    // Example logic: Check if the eyes are closed (indicating a blink)
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    
    // Simple check: If the distance between eye landmarks changes significantly, assume liveness
    const eyeDistance = Math.abs(leftEye[1].y - rightEye[1].y);
    if (eyeDistance < 5) { // Threshold for detecting a blink
      isLively = true;
      break;
    }
  }

  return isLively; // Return true if liveness is detected
};

// Function to transcribe audio
const transcribeAudio = async (videoPath) => {
  const audioPath = await convertVideoToAudio(videoPath);

  const [response] = await client.recognize({
    audio: {
      uri: audioPath,
    },
    config: {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'en-US',
    },
  });

  const transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join('\n');

  return transcription;
};

// Function to check for spoken number
const checkForSpokenNumber = async (videoPath, expectedNumber) => {
  const audioTranscript = await transcribeAudio(videoPath);
  return audioTranscript.includes(expectedNumber.toString()); // Check if the expected number is spoken
};

// Main validation function
export const validateVideo = async (videoPath, expectedNumber) => {
  if (!fs.existsSync(videoPath)) {
    return false;
  }

  const isSinglePerson = await checkForSinglePerson(videoPath);
  const isLiveness = await checkForLiveness(videoPath);
  const isNumberSpoken = await checkForSpokenNumber(videoPath, expectedNumber);

  return isSinglePerson && isLiveness && isNumberSpoken;
};