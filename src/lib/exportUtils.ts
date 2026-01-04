/**
 * Utility functions for exporting itineraries and chat data
 */

import { COLORS } from '@/config/theme';

export interface ExportableMessage {
  role: 'user' | 'Companion';
  content: string;
  timestamp: Date;
}

export interface ItineraryLeg {
  type?: string;
  duration?: string | number;
  serviceJourney?: {
    serviceProducts?: Array<{
      name?: string;
      number?: string;
    }>;
  };
  departure?: {
    time: string | Date;
    place?: {
      name?: string;
    };
  };
  arrival?: {
    time: string | Date;
    place?: {
      name?: string;
    };
  };
}

export interface Itinerary {
  origin?: string;
  destination?: string;
  legs?: ItineraryLeg[];
  price?: number;
  co2Emissions?: number;
  [key: string]: unknown; // Allow additional properties
}

/**
 * Export chat messages as a formatted text file
 */
export function exportChatAsText(messages: ExportableMessage[]): void {
  const content = messages
    .map((msg) => {
      const time = msg.timestamp.toLocaleString();
      const sender = msg.role === 'user' ? 'You' : 'Swiss Travel Companion';
      return `[${time}] ${sender}:\n${msg.content}\n`;
    })
    .join('\n');

  const blob = new Blob([content], { type: 'text/plain' });
  downloadFile(blob, `sbb-chat-${Date.now()}.txt`);
}

/**
 * Export chat messages as JSON
 */
export function exportChatAsJSON(messages: ExportableMessage[]): void {
  const content = JSON.stringify(messages, null, 2);
  const blob = new Blob([content], { type: 'application/json' });
  downloadFile(blob, `sbb-chat-${Date.now()}.json`);
}

/**
 * Export itinerary as a formatted text file
 */
export function exportItineraryAsText(itinerary: Itinerary): void {
  let content = `SBB Travel Itinerary\n`;
  content += `Generated: ${new Date().toLocaleString()}\n`;
  content += `${'='.repeat(50)}\n\n`;

  if (itinerary.origin && itinerary.destination) {
    content += `From: ${itinerary.origin}\n`;
    content += `To: ${itinerary.destination}\n\n`;
  }

  if (itinerary.legs && Array.isArray(itinerary.legs)) {
    content += `Journey Details:\n`;
    content += `${'-'.repeat(50)}\n`;

    itinerary.legs.forEach((leg: ItineraryLeg, index: number) => {
      content += `\nLeg ${index + 1}:\n`;

      if (leg.type === 'WalkLeg') {
        content += `  Type: Walking\n`;
        if (leg.duration) content += `  Duration: ${leg.duration}\n`;
      } else {
        const service = leg.serviceJourney?.serviceProducts?.[0];
        if (service) {
          content += `  Service: ${service.name || 'Train'}\n`;
          if (service.number) content += `  Number: ${service.number}\n`;
        }

        if (leg.departure) {
          content += `  Departure: ${
            leg.departure.place?.name || ''
          } at ${new Date(leg.departure.time).toLocaleTimeString()}\n`;
        }

        if (leg.arrival) {
          content += `  Arrival: ${leg.arrival.place?.name || ''} at ${new Date(
            leg.arrival.time
          ).toLocaleTimeString()}\n`;
        }

        if (leg.duration) content += `  Duration: ${leg.duration}\n`;
      }
    });
  }

  if (itinerary.price) {
    content += `\n${'='.repeat(50)}\n`;
    content += `Price: CHF ${itinerary.price}\n`;
  }

  if (itinerary.co2Emissions) {
    content += `CO₂ Emissions: ${itinerary.co2Emissions.toFixed(1)} kg\n`;
  }

  const blob = new Blob([content], { type: 'text/plain' });
  downloadFile(blob, `sbb-itinerary-${Date.now()}.txt`);
}

/**
 * Export itinerary as PDF (using browser print)
 */
export function exportItineraryAsPDF(itinerary: Itinerary): void {
  // Create a new window with formatted content
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export as PDF');
    return;
  }

  let html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>SBB Travel Itinerary</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            line-height: 1.6;
          }
          h1 {
            color: ${COLORS.brand.primary};
            border-bottom: 3px solid ${COLORS.brand.primary};
            padding-bottom: 10px;
          }
          h2 {
            color: #333;
            margin-top: 30px;
          }
          .header {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .leg {
            background: #fff;
            border-left: 4px solid ${COLORS.brand.primary};
            padding: 15px;
            margin: 10px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .leg-title {
            font-weight: bold;
            color: ${COLORS.brand.primary};
            margin-bottom: 10px;
          }
          .detail {
            margin: 5px 0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #ddd;
            text-align: center;
            color: #666;
          }
          @media print {
            body {
              margin: 0;
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <h1>🇨🇭 SBB Travel Itinerary</h1>
        <div class="header">
          <div class="detail">Generated: ${new Date().toLocaleString()}</div>
          ${
            itinerary.origin
              ? `<div class="detail"><strong>From:</strong> ${itinerary.origin}</div>`
              : ''
          }
          ${
            itinerary.destination
              ? `<div class="detail"><strong>To:</strong> ${itinerary.destination}</div>`
              : ''
          }
        </div>
  `;

  if (itinerary.legs && Array.isArray(itinerary.legs)) {
    html += `<h2>Journey Details</h2>`;

    itinerary.legs.forEach((leg: ItineraryLeg, index: number) => {
      html += `<div class="leg">`;
      html += `<div class="leg-title">Leg ${index + 1}</div>`;

      if (leg.type === 'WalkLeg') {
        html += `<div class="detail">Type: Walking</div>`;
        if (leg.duration)
          html += `<div class="detail">Duration: ${leg.duration}</div>`;
      } else {
        const service = leg.serviceJourney?.serviceProducts?.[0];
        if (service) {
          html += `<div class="detail"><strong>Service:</strong> ${
            service.name || 'Train'
          }</div>`;
          if (service.number)
            html += `<div class="detail"><strong>Number:</strong> ${service.number}</div>`;
        }

        if (leg.departure) {
          html += `<div class="detail"><strong>Departure:</strong> ${
            leg.departure.place?.name || ''
          } at ${new Date(leg.departure.time).toLocaleTimeString()}</div>`;
        }

        if (leg.arrival) {
          html += `<div class="detail"><strong>Arrival:</strong> ${
            leg.arrival.place?.name || ''
          } at ${new Date(leg.arrival.time).toLocaleTimeString()}</div>`;
        }

        if (leg.duration)
          html += `<div class="detail"><strong>Duration:</strong> ${leg.duration}</div>`;
      }

      html += `</div>`;
    });
  }

  if (itinerary.price || itinerary.co2Emissions) {
    html += `<div class="header" style="margin-top: 30px;">`;
    if (itinerary.price) {
      html += `<div class="detail"><strong>Price:</strong> CHF ${itinerary.price}</div>`;
    }
    if (itinerary.co2Emissions) {
      html += `<div class="detail"><strong>CO₂ Emissions:</strong> ${itinerary.co2Emissions.toFixed(
        1
      )} kg</div>`;
    }
    html += `</div>`;
  }

  html += `
        <div class="footer">
          <p>Generated by Swiss Travel Companion - Your Swiss Travel Companion</p>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();

  // Wait for content to load, then print
  printWindow.onload = () => {
    printWindow.print();
  };
}

/**
 * Helper function to trigger file download
 */
function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
