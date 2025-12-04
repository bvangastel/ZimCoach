
import { PlanStep } from '../types';

const truncateTitle = (title: string, wordCount: number = 6) => {
  const words = title.split(' ');
  if (words.length <= wordCount) return title;
  return words.slice(0, wordCount).join(' ') + '...';
};

export const generateGoogleCalendarUrl = (step: PlanStep, goalTitle: string) => {
  const shortTitle = truncateTitle(step.description);
  const title = encodeURIComponent(`Studie: ${shortTitle}`);
  const details = encodeURIComponent(`Volledige actie: ${step.description}\nOnderdeel van doel: ${goalTitle}\nGeschatte tijdsduur: ${step.durationMinutes} minuten.`);
  
  let datesParam = '';
  if (step.targetDate) {
    const startStr = step.targetDate.replace(/-/g, '');
    const endStr = startStr; 
    datesParam = `&dates=${startStr}/${endStr}`;
  }

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}${datesParam}`;
};

export const generateOutlookWebUrl = (step: PlanStep, goalTitle: string) => {
  const shortTitle = truncateTitle(step.description);
  const title = encodeURIComponent(`Studie: ${shortTitle}`);
  const details = encodeURIComponent(`Volledige actie: ${step.description}\nOnderdeel van doel: ${goalTitle}\nGeschatte tijdsduur: ${step.durationMinutes} minuten.`);
  
  let startStr = '';
  let endStr = '';

  if (step.targetDate) {
    startStr = step.targetDate; // YYYY-MM-DD
    endStr = step.targetDate;
  } else {
    // Default to tomorrow if no date set, just to have a valid link
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    startStr = tomorrow.toISOString().split('T')[0];
    endStr = startStr;
  }

  return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&body=${details}&startdt=${startStr}&enddt=${endStr}&allday=true`;
};

export const downloadIcsFile = (step: PlanStep, goalTitle: string) => {
  const shortTitle = truncateTitle(step.description);
  const title = `Studie: ${shortTitle}`;
  const description = `Volledige actie: ${step.description}\nOnderdeel van doel: ${goalTitle}\nGeschatte tijdsduur: ${step.durationMinutes} minuten.`;
  
  const now = new Date();
  let start = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  let end = new Date(now.getTime() + step.durationMinutes * 60000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  if (step.targetDate) {
    const dateObj = new Date(step.targetDate);
    dateObj.setHours(9, 0, 0, 0);
    start = dateObj.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    end = new Date(dateObj.getTime() + step.durationMinutes * 60000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ZimCoach//NONSGML v1.0//EN
BEGIN:VEVENT
UID:${step.id}@zimcoach.app
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'}
DTSTART:${start}
DTEND:${end}
SUMMARY:${title}
DESCRIPTION:${description}
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Studie_Actie.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
