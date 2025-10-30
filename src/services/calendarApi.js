import axios from "axios";



const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || `https://devapi.dequity.technology`


export const createDoctorCalendar = async (payload) => {
  try {
    const response = await axios.post(`${BASE_URL}/createDoctorCalendar`, payload, {
      headers: {
        'Content-Type': 'application/json',
        // Add authorization if needed
        // 'Authorization': `Bearer ${token}`
      }
    });
    return {
      success: true,
      data: response.data,
      message: 'Calendar created successfully!'
    };
  } catch (error) {
    console.error('❌ Create Calendar Error:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to create calendar',
      data: null
    };
  }
};




export const updateDoctorCalendar = async (calendarId, payload) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/updateDoctorCalendar/${calendarId}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          // Add authorization if needed
          // 'Authorization': `Bearer ${token}`
        }
      }
    );
    return {
      success: true,
      data: response.data,
      message: 'Calendar updated successfully!'
    };
  } catch (error) {
    console.error('❌ Update Calendar Error:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to update calendar',
      data: null
    };
  }
};
