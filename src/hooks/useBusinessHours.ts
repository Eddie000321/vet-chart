import { useState, useEffect } from 'react';

export interface BusinessHoursConfig {
  startHour: number;
  endHour: number;
  intervalMinutes: number;
}

const DEFAULT_BUSINESS_HOURS: BusinessHoursConfig = {
  startHour: 8,
  endHour: 18,
  intervalMinutes: 30
};

export const useBusinessHours = () => {
  const [businessHours, setBusinessHours] = useState<BusinessHoursConfig>(DEFAULT_BUSINESS_HOURS);

  useEffect(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('businessHours');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setBusinessHours(parsed);
      } catch (error) {
        console.error('Failed to parse business hours from localStorage:', error);
      }
    }
  }, []);

  const updateBusinessHours = (newSettings: BusinessHoursConfig) => {
    setBusinessHours(newSettings);
    localStorage.setItem('businessHours', JSON.stringify(newSettings));
  };

  const generateTimeSlots = () => {
    const slots = [];
    const totalMinutes = (businessHours.endHour - businessHours.startHour) * 60;
    const numberOfSlots = Math.floor(totalMinutes / businessHours.intervalMinutes);

    for (let i = 0; i < numberOfSlots; i++) {
      const totalMinutesFromStart = i * businessHours.intervalMinutes;
      const hour = businessHours.startHour + Math.floor(totalMinutesFromStart / 60);
      const minute = totalMinutesFromStart % 60;
      
      slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    }

    return slots;
  };

  const isWithinBusinessHours = (timeString: string) => {
    const [hour, minute] = timeString.split(':').map(Number);
    const timeInMinutes = hour * 60 + minute;
    const startInMinutes = businessHours.startHour * 60;
    const endInMinutes = businessHours.endHour * 60;

    return timeInMinutes >= startInMinutes && timeInMinutes < endInMinutes;
  };

  return {
    businessHours,
    updateBusinessHours,
    generateTimeSlots,
    isWithinBusinessHours
  };
};