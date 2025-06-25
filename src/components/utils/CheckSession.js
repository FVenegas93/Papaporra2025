import React from 'react';

const checkSession = () => {
  const sessionStr = localStorage.getItem("userSession");
  if (!sessionStr) return null;
  
  try {
    const session = JSON.parse(sessionStr);
    const sessionDuration = 1000 * 60 * 60 * 24 * 7;
    const timeElapsed = Date.now() - session.loginTime;
    
    if (timeElapsed < sessionDuration) {
      return session;
    } else {
      localStorage.removeItem("userSession");
      return null;
    }
  } catch {
    localStorage.removeItem("userSession");
    return null;
  }
};

export default checkSession;