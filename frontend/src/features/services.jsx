// services/interviewService.js
import axios from 'axios';

const BASE_URL = 'http://localhost:5000'; // change to your backend URL if deployed

export const sendInterviewAnswer = async ({ sessionId, jobTitle, jobDescription, userAnswer }) => {
  try {
    const response = await axios.post(`${BASE_URL}/ask`, {
      sessionId,
      jobTitle,
      jobDescription,
      userAnswer,
    });

    return response.data.reply;
  } catch (error) {
    console.error('Interview API error:', error);
    throw new Error('Could not get interview response');
  }
};
