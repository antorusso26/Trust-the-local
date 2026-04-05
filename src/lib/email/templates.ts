// =====================================================
// Email Templates - Trust the Local
// HTML email templates for all transactional emails
// =====================================================

const BRAND = {
  navy: "#1B2A4A",
  gold: "#D4A843",
  cream: "#FBF8F1",
  gray: "#6B7280",
  white: "#FFFFFF",
  logo: "Trust the Local",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://trustthelocal.it",
};

function layout(content: string, lang = "it") {
  return `<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:${BRAND.cream};font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:${BRAND.white};">
    <!-- Header -->
    <div style="background:${BRAND.navy};padding:24px 32px;text-align:center;">
      <h1 style="margin:0;color:${BRAND.gold};font-size:24px;letter-spacing:2px;">
        ${BRAND.logo}
      </h1>
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.7);font-size:11px;letter-spacing:3px;text-transform:uppercase;">
        Costiera Amalfitana
      </p>
    </div>
    <!-- Maiolica Band -->
    <div style="height:4px;background:repeating-linear-gradient(90deg,${BRAND.gold} 0px,${BRAND.gold} 20px,${BRAND.navy} 20px,${BRAND.navy} 40px,#2E86AB 40px,#2E86AB 60px,#D4A843 60px,#D4A843 80px);"></div>
    <!-- Content -->
    <div style="padding:32px;">
      ${content}
    </div>
    <!-- Footer -->
    <div style="background:${BRAND.cream};padding:24px 32px;text-align:center;border-top:1px solid #e5e7eb;">
      <p style="margin:0;color:${BRAND.gray};font-size:12px;">
        &copy; ${new Date().getFullYear()} Trust the Local - Costiera Amalfitana
      </p>
      <p style="margin:8px 0 0;color:${BRAND.gray};font-size:11px;">
        <a href="${BRAND.url}" style="color:${BRAND.gold};text-decoration:none;">trustthelocal.it</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

function button(text: string, url: string) {
  return `<div style="text-align:center;margin:24px 0;">
    <a href="${url}" style="display:inline-block;background:${BRAND.gold};color:${BRAND.white};padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:600;font-size:15px;">
      ${text}
    </a>
  </div>`;
}

function infoRow(label: string, value: string) {
  return `<tr>
    <td style="padding:8px 0;color:${BRAND.gray};font-size:14px;width:140px;">${label}</td>
    <td style="padding:8px 0;color:${BRAND.navy};font-size:14px;font-weight:600;">${value}</td>
  </tr>`;
}

// =====================================================
// 1. BOOKING CONFIRMED (to Tourist)
// =====================================================
export function bookingConfirmedEmail(data: {
  customerName: string;
  tourTitle: string;
  bookingDate: string;
  timeSlot?: string;
  guests: number;
  totalAmount: string;
  operatorName: string;
  bookingId: string;
  cancelUrl: string;
  meetingPoint?: string;
}) {
  const content = `
    <h2 style="color:${BRAND.navy};margin:0 0 8px;font-size:22px;">Prenotazione Confermata!</h2>
    <p style="color:${BRAND.gray};margin:0 0 24px;font-size:15px;">
      Ciao ${data.customerName}, la tua esperienza è stata prenotata con successo.
    </p>
    <div style="background:${BRAND.cream};border-radius:12px;padding:20px;margin-bottom:24px;">
      <h3 style="color:${BRAND.navy};margin:0 0 16px;font-size:18px;">${data.tourTitle}</h3>
      <table style="width:100%;border-collapse:collapse;">
        ${infoRow("Data", data.bookingDate)}
        ${data.timeSlot ? infoRow("Orario", data.timeSlot) : ""}
        ${infoRow("Persone", String(data.guests))}
        ${infoRow("Totale", data.totalAmount)}
        ${infoRow("Operatore", data.operatorName)}
        ${data.meetingPoint ? infoRow("Punto ritrovo", data.meetingPoint) : ""}
        ${infoRow("Codice", data.bookingId.slice(0, 8).toUpperCase())}
      </table>
    </div>
    ${button("Vedi Prenotazione", `${BRAND.url}/prenotazione/${data.bookingId}`)}
    <p style="color:${BRAND.gray};font-size:13px;text-align:center;">
      Puoi cancellare gratuitamente fino a 48h prima.
      <a href="${data.cancelUrl}" style="color:${BRAND.gold};">Cancella prenotazione</a>
    </p>
  `;
  return {
    subject: `Prenotazione confermata: ${data.tourTitle}`,
    html: layout(content),
  };
}

// =====================================================
// 2. NEW BOOKING (to Operator)
// =====================================================
export function newBookingOperatorEmail(data: {
  operatorName: string;
  tourTitle: string;
  customerName: string;
  customerEmail: string;
  bookingDate: string;
  timeSlot?: string;
  guests: number;
  totalAmount: string;
  operatorNet: string;
  bookingId: string;
}) {
  const content = `
    <h2 style="color:${BRAND.navy};margin:0 0 8px;font-size:22px;">Nuova Prenotazione!</h2>
    <p style="color:${BRAND.gray};margin:0 0 24px;font-size:15px;">
      Ciao ${data.operatorName}, hai ricevuto una nuova prenotazione.
    </p>
    <div style="background:${BRAND.cream};border-radius:12px;padding:20px;margin-bottom:24px;">
      <h3 style="color:${BRAND.navy};margin:0 0 16px;font-size:18px;">${data.tourTitle}</h3>
      <table style="width:100%;border-collapse:collapse;">
        ${infoRow("Cliente", data.customerName)}
        ${infoRow("Email", data.customerEmail)}
        ${infoRow("Data", data.bookingDate)}
        ${data.timeSlot ? infoRow("Orario", data.timeSlot) : ""}
        ${infoRow("Persone", String(data.guests))}
        ${infoRow("Incasso lordo", data.totalAmount)}
        ${infoRow("Tuo netto", data.operatorNet)}
      </table>
    </div>
    ${button("Vedi Dashboard", `${BRAND.url}/dashboard/operator`)}
  `;
  return {
    subject: `Nuova prenotazione: ${data.tourTitle}`,
    html: layout(content),
  };
}

// =====================================================
// 3. BOOKING REMINDER 24h (to Tourist)
// =====================================================
export function bookingReminderEmail(data: {
  customerName: string;
  tourTitle: string;
  bookingDate: string;
  timeSlot?: string;
  operatorName: string;
  meetingPoint?: string;
  bookingId: string;
}) {
  const content = `
    <h2 style="color:${BRAND.navy};margin:0 0 8px;font-size:22px;">Promemoria: Domani!</h2>
    <p style="color:${BRAND.gray};margin:0 0 24px;font-size:15px;">
      Ciao ${data.customerName}, la tua esperienza è domani!
    </p>
    <div style="background:${BRAND.cream};border-radius:12px;padding:20px;margin-bottom:24px;">
      <h3 style="color:${BRAND.navy};margin:0 0 16px;font-size:18px;">${data.tourTitle}</h3>
      <table style="width:100%;border-collapse:collapse;">
        ${infoRow("Data", data.bookingDate)}
        ${data.timeSlot ? infoRow("Orario", data.timeSlot) : ""}
        ${infoRow("Operatore", data.operatorName)}
        ${data.meetingPoint ? infoRow("Punto ritrovo", data.meetingPoint) : ""}
      </table>
    </div>
    <p style="color:${BRAND.navy};font-size:15px;text-align:center;font-weight:600;">
      Ti aspettiamo! Buona esperienza!
    </p>
  `;
  return {
    subject: `Promemoria: ${data.tourTitle} - Domani!`,
    html: layout(content),
  };
}

// =====================================================
// 4. BOOKING CANCELLED (to Tourist)
// =====================================================
export function bookingCancelledTouristEmail(data: {
  customerName: string;
  tourTitle: string;
  bookingDate: string;
  refundAmount: string;
  refundPercentage: number;
}) {
  const content = `
    <h2 style="color:${BRAND.navy};margin:0 0 8px;font-size:22px;">Prenotazione Cancellata</h2>
    <p style="color:${BRAND.gray};margin:0 0 24px;font-size:15px;">
      Ciao ${data.customerName}, la tua prenotazione è stata cancellata.
    </p>
    <div style="background:${BRAND.cream};border-radius:12px;padding:20px;margin-bottom:24px;">
      <table style="width:100%;border-collapse:collapse;">
        ${infoRow("Tour", data.tourTitle)}
        ${infoRow("Data", data.bookingDate)}
        ${infoRow("Rimborso", `${data.refundAmount} (${data.refundPercentage}%)`)}
      </table>
    </div>
    <p style="color:${BRAND.gray};font-size:14px;text-align:center;">
      ${data.refundPercentage > 0
        ? "Il rimborso verrà accreditato entro 5-10 giorni lavorativi."
        : "In base alla nostra policy, non è previsto rimborso per cancellazioni entro 24h dal tour."}
    </p>
    ${button("Prenota di Nuovo", `${BRAND.url}/esperienze`)}
  `;
  return {
    subject: `Prenotazione cancellata: ${data.tourTitle}`,
    html: layout(content),
  };
}

// =====================================================
// 5. BOOKING CANCELLED (to Operator)
// =====================================================
export function bookingCancelledOperatorEmail(data: {
  operatorName: string;
  tourTitle: string;
  customerName: string;
  bookingDate: string;
  refundAmount: string;
}) {
  const content = `
    <h2 style="color:${BRAND.navy};margin:0 0 8px;font-size:22px;">Prenotazione Cancellata</h2>
    <p style="color:${BRAND.gray};margin:0 0 24px;font-size:15px;">
      Ciao ${data.operatorName}, una prenotazione è stata cancellata dal cliente.
    </p>
    <div style="background:${BRAND.cream};border-radius:12px;padding:20px;margin-bottom:24px;">
      <table style="width:100%;border-collapse:collapse;">
        ${infoRow("Tour", data.tourTitle)}
        ${infoRow("Cliente", data.customerName)}
        ${infoRow("Data", data.bookingDate)}
        ${infoRow("Rimborso", data.refundAmount)}
      </table>
    </div>
  `;
  return {
    subject: `Cancellazione: ${data.tourTitle} - ${data.customerName}`,
    html: layout(content),
  };
}

// =====================================================
// 6. REFUND PROCESSED (to Tourist)
// =====================================================
export function refundProcessedEmail(data: {
  customerName: string;
  tourTitle: string;
  refundAmount: string;
}) {
  const content = `
    <h2 style="color:${BRAND.navy};margin:0 0 8px;font-size:22px;">Rimborso Effettuato</h2>
    <p style="color:${BRAND.gray};margin:0 0 24px;font-size:15px;">
      Ciao ${data.customerName}, il tuo rimborso è stato processato.
    </p>
    <div style="background:${BRAND.cream};border-radius:12px;padding:20px;margin-bottom:24px;">
      <table style="width:100%;border-collapse:collapse;">
        ${infoRow("Tour", data.tourTitle)}
        ${infoRow("Importo rimborsato", data.refundAmount)}
      </table>
    </div>
    <p style="color:${BRAND.gray};font-size:14px;text-align:center;">
      L'importo verrà accreditato sulla tua carta entro 5-10 giorni lavorativi.
    </p>
  `;
  return {
    subject: `Rimborso effettuato: ${data.refundAmount}`,
    html: layout(content),
  };
}

// =====================================================
// 7. WELCOME OPERATOR
// =====================================================
export function welcomeOperatorEmail(data: {
  operatorName: string;
  companyName: string;
}) {
  const content = `
    <h2 style="color:${BRAND.navy};margin:0 0 8px;font-size:22px;">Benvenuto su Trust the Local!</h2>
    <p style="color:${BRAND.gray};margin:0 0 24px;font-size:15px;">
      Ciao ${data.operatorName}, ${data.companyName} è stata registrata con successo.
    </p>
    <p style="color:${BRAND.navy};font-size:15px;margin-bottom:16px;">
      Ecco i prossimi passi per iniziare:
    </p>
    <div style="margin-bottom:24px;">
      <div style="display:flex;align-items:start;margin-bottom:16px;">
        <span style="background:${BRAND.gold};color:white;border-radius:50%;width:28px;height:28px;display:inline-flex;align-items:center;justify-content:center;font-weight:600;font-size:14px;margin-right:12px;flex-shrink:0;">1</span>
        <p style="margin:0;color:${BRAND.navy};font-size:14px;"><strong>Completa la verifica KYC</strong> tramite Stripe per ricevere i pagamenti.</p>
      </div>
      <div style="display:flex;align-items:start;margin-bottom:16px;">
        <span style="background:${BRAND.gold};color:white;border-radius:50%;width:28px;height:28px;display:inline-flex;align-items:center;justify-content:center;font-weight:600;font-size:14px;margin-right:12px;flex-shrink:0;">2</span>
        <p style="margin:0;color:${BRAND.navy};font-size:14px;"><strong>Aggiungi i tuoi tour</strong> con foto, prezzi e disponibilità.</p>
      </div>
      <div style="display:flex;align-items:start;">
        <span style="background:${BRAND.gold};color:white;border-radius:50%;width:28px;height:28px;display:inline-flex;align-items:center;justify-content:center;font-weight:600;font-size:14px;margin-right:12px;flex-shrink:0;">3</span>
        <p style="margin:0;color:${BRAND.navy};font-size:14px;"><strong>Inizia a ricevere prenotazioni</strong> dai turisti in Costiera!</p>
      </div>
    </div>
    ${button("Vai alla Dashboard", `${BRAND.url}/dashboard/operator`)}
  `;
  return {
    subject: `Benvenuto su Trust the Local, ${data.companyName}!`,
    html: layout(content),
  };
}

// =====================================================
// 8. MONTHLY REPORT (to Operator)
// =====================================================
export function monthlyReportEmail(data: {
  operatorName: string;
  month: string;
  totalBookings: number;
  totalRevenue: string;
  totalNet: string;
  topTour: string;
  topTourBookings: number;
}) {
  const content = `
    <h2 style="color:${BRAND.navy};margin:0 0 8px;font-size:22px;">Report Mensile - ${data.month}</h2>
    <p style="color:${BRAND.gray};margin:0 0 24px;font-size:15px;">
      Ciao ${data.operatorName}, ecco il riepilogo del mese.
    </p>
    <div style="background:${BRAND.cream};border-radius:12px;padding:20px;margin-bottom:24px;">
      <table style="width:100%;border-collapse:collapse;">
        ${infoRow("Prenotazioni", String(data.totalBookings))}
        ${infoRow("Fatturato lordo", data.totalRevenue)}
        ${infoRow("Tuo netto", data.totalNet)}
        ${infoRow("Tour top", `${data.topTour} (${data.topTourBookings} prenotazioni)`)}
      </table>
    </div>
    ${button("Vedi Dettagli", `${BRAND.url}/dashboard/operator`)}
  `;
  return {
    subject: `Report ${data.month} - Trust the Local`,
    html: layout(content),
  };
}

// =====================================================
// 9. REVIEW REQUEST (to Tourist, 24h after tour)
// =====================================================
export function reviewRequestEmail(data: {
  customerName: string;
  tourTitle: string;
  reviewUrl: string;
}) {
  const content = `
    <h2 style="color:${BRAND.navy};margin:0 0 8px;font-size:22px;">Com'è andata?</h2>
    <p style="color:${BRAND.gray};margin:0 0 24px;font-size:15px;">
      Ciao ${data.customerName}, com'è andata la tua esperienza "${data.tourTitle}"?
    </p>
    <p style="color:${BRAND.navy};font-size:15px;margin-bottom:8px;">
      La tua opinione è importante per noi e per gli altri viaggiatori. Lascia una recensione!
    </p>
    ${button("Lascia una Recensione", data.reviewUrl)}
    <p style="color:${BRAND.gray};font-size:13px;text-align:center;">
      Bastano 30 secondi!
    </p>
  `;
  return {
    subject: `Com'è andata? Lascia una recensione per "${data.tourTitle}"`,
    html: layout(content),
  };
}
