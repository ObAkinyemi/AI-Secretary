'use client';

import { useState, FC } from 'react';

// Define the structure for a single schedule event
interface ScheduleEvent {
  id: number;
  action: string;
  event: string;
  time: string;
}

// Helper function to generate SQL INSERT statements
const generateSQL = (events: ScheduleEvent[]): string => {
  if (events.length === 0) {
    return '-- No events to export.';
  }

  const tableName = 'schedule_events';
  const header = `
-- SQL Export for Schedule Events
-- Dropping and creating the table for a clean slate.
DROP TABLE IF EXISTS ${tableName};
CREATE TABLE ${tableName} (
  id INT PRIMARY KEY AUTO_INCREMENT,
  action VARCHAR(255) NOT NULL,
  event TEXT NOT NULL,
  time VARCHAR(255) NOT NULL
);

-- Inserting event data
`;

  const values = events
    .map(
      (e) =>
        `INSERT INTO ${tableName} (action, event, time) VALUES ('${e.action.replace(/'/g, "''")}', '${e.event.replace(/'/g, "''")}', '${e.time.replace(/'/g, "''")}');`
    )
    .join('\n');

  return header + values;
};


// Main Page Component
const SchedulePage: FC = () => {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [action, setAction] = useState('');
  const [event, setEvent] = useState('');
  const [time, setTime] = useState('');

  // Handle adding a new event to the list
  const handleAddEvent = () => {
    if (!action || !event || !time) {
      alert('Please fill out all fields.');
      return;
    }
    const newEvent: ScheduleEvent = {
      id: Date.now(), // Use timestamp for a unique ID
      action,
      event,
      time,
    };
    setEvents([...events, newEvent]);
    // Clear input fields
    setAction('');
    setEvent('');
    setTime('');
  };

  // Handle removing an event by its ID
  const handleRemoveEvent = (id: number) => {
    setEvents(events.filter((e) => e.id !== id));
  };
  
  // Generic download handler
  const handleDownload = (content: string, fileName: string, mimeType: string) => {
     if (events.length === 0) {
      alert('No events to download.');
      return;
    }
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Handle downloading events as a JSON file
  const handleDownloadJSON = () => {
    const jsonContent = JSON.stringify(events, null, 2);
    handleDownload(jsonContent, 'schedule-events.json', 'application/json');
  };

  // Handle downloading events as an SQL file
  const handleDownloadSQL = () => {
    const sqlContent = generateSQL(events);
    handleDownload(sqlContent, 'schedule-events.sql', 'application/sql');
  };


  return (
    <main className="bg-gray-900 min-h-screen text-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">AI Secretary: Event Creator</h1>
          <p className="text-gray-400">Add, remove, and adjust your schedule events efficiently.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Input Form Section */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <h2 className="text-2xl font-semibold mb-4">Create New Event</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Action (e.g., Add, Remove, Reschedule)"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder='Event (e.g., "Physics Study (1h)")'
                value={event}
                onChange={(e) => setEvent(e.target.value)}
                className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder='Time (e.g., "Tuesday at 20:00")'
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddEvent}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-lg"
              >
                Add Event
              </button>
            </div>
             {/* Download Buttons */}
            <div className="mt-6 border-t border-gray-700 pt-4">
                 <h3 className="text-lg font-semibold mb-3 text-center">Export Events</h3>
                <div className="flex space-x-4">
                     <button
                        onClick={handleDownloadJSON}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                    >
                        Download JSON
                    </button>
                    <button
                        onClick={handleDownloadSQL}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                    >
                        Download SQL
                    </button>
                </div>
            </div>
          </div>

          {/* Display Section */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <h2 className="text-2xl font-semibold mb-4">Current Event List</h2>
            <div className="space-y-3 h-[400px] overflow-y-auto pr-2">
              {events.length > 0 ? (
                events.map((e) => (
                  <div key={e.id} className="bg-gray-700 p-4 rounded-md flex justify-between items-center shadow-md">
                    <div>
                      <p className="font-bold text-blue-400">{e.action}</p>
                      <p className="text-gray-200">{e.event}</p>
                      <p className="text-sm text-gray-400">{e.time}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveEvent(e.id)}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-md transition duration-300"
                    >
                      &times;
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 pt-16">
                    <p>No events added yet.</p>
                    <p className="text-sm">Use the form to create your first event.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default SchedulePage;
