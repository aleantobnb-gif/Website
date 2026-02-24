export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const ICAL_URL = 'https://www.airbnb.com/calendar/ical/33516234.ics?t=c3e9ed4f693f40d68cfb6907e1091493';

  try {
    const response = await fetch(ICAL_URL);
    if (!response.ok) throw new Error('Failed to fetch calendar');
    const icalText = await response.text();

    // Parse iCal
    const events = [];
    const lines = icalText.replace(/\r\n /g, '').split(/\r\n|\n|\r/);
    let currentEvent = null;

    for (const line of lines) {
      if (line === 'BEGIN:VEVENT') {
        currentEvent = {};
      } else if (line === 'END:VEVENT' && currentEvent) {
        if (currentEvent.start && currentEvent.end) {
          events.push(currentEvent);
        }
        currentEvent = null;
      } else if (currentEvent) {
        if (line.startsWith('DTSTART')) {
          currentEvent.start = line.split(':')[1]?.substring(0, 8);
        } else if (line.startsWith('DTEND')) {
          currentEvent.end = line.split(':')[1]?.substring(0, 8);
        } else if (line.startsWith('SUMMARY')) {
          currentEvent.summary = line.split(':').slice(1).join(':');
        }
      }
    }

    res.status(200).json({ events });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
