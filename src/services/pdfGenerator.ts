import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Booking, Car, Client, CompanySettings, Investor, InvestorPayout, MaintenanceRecord } from '../types';

export const PdfGenerator = {
  /**
   * Generates a professional Rent-a-Car Agreement / Booking Voucher
   */
  generateRentalContract(booking: Booking, car: Car, client: Client, settings: CompanySettings): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Brand Header Bar
    doc.setFillColor(15, 23, 42); // slateDark-900
    doc.rect(0, 0, 210, 32, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(settings.businessName.toUpperCase(), 14, 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(settings.tagline, 14, 20);
    doc.text(`Phone: ${settings.phone} | WhatsApp: ${settings.whatsapp} | ${settings.address}`, 14, 26);

    // Contract Title Badge
    doc.setFillColor(43, 151, 254); // brand blue
    doc.rect(140, 8, 56, 16, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('RENTAL CONTRACT', 143, 15);
    doc.setFontSize(8);
    doc.text(`NO: ${booking.bookingNumber}`, 143, 20);

    // Date & Status Header
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const dispatchDate = new Date(booking.startDate).toLocaleString();
    const returnDate = new Date(booking.expectedReturnDate).toLocaleString();
    
    doc.text(`Generated On: ${new Date().toLocaleDateString()}`, 14, 39);
    doc.text(`Booking Status: ${booking.status.toUpperCase()}`, 140, 39);

    // Client & Vehicle Information Grid
    autoTable(doc, {
      startY: 44,
      head: [['CUSTOMER / CLIENT DETAILS', 'VEHICLE SPECIFICATIONS']],
      body: [
        [
          `Full Name: ${client.name}\nCNIC: ${client.cnic}\nMobile: ${client.phone}${client.altPhone ? '\nAlt Phone: ' + client.altPhone : ''}\nLicense No: ${client.licenseNumber}\nAddress: ${client.address}\nGuarantor: ${client.guarantorName || 'N/A'} (${client.guarantorPhone || 'N/A'})`,
          `Registration Plate: ${car.plateNumber}\nVehicle: ${car.make} ${car.model} (${car.year})\nColor: ${car.color} | Category: ${car.category}\nEngine No: ${car.engineNumber}\nChassis No: ${car.chassisNumber}\nFuel Type: ${car.fuelType} | Transmission: ${car.transmission}`
        ]
      ],
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold', fontSize: 9 },
      styles: { fontSize: 8.5, cellPadding: 3.5, lineColor: [226, 232, 240] }
    });

    // Rental Period & Rate Details Table
    const lastY = (doc as any).lastAutoTable.finalY || 100;
    
    autoTable(doc, {
      startY: lastY + 5,
      head: [['DISPATCH & RATE BREAKDOWN', 'VALUE']],
      body: [
        ['Dispatch Date & Time', dispatchDate],
        ['Expected Return Date & Time', returnDate],
        ['Duration', `${booking.totalDays} Day(s)`],
        ['Rate Applied', `${settings.currency} ${booking.ratePerUnit.toLocaleString()} / ${booking.rateType.toLowerCase()}`],
        ['Starting Odometer Reading', `${booking.startOdometer.toLocaleString()} KM`],
        ['Starting Fuel Level', booking.startFuelLevel],
        ['Destination / Intended Usage Area', booking.destination || 'Within City limits'],
        ['Total Estimated Rental Amount', `${settings.currency} ${booking.totalEstimatedRent.toLocaleString()}`],
        ['Advance Payment Received', `${settings.currency} ${booking.advancePaid.toLocaleString()}`],
        ['Security Deposit (Refundable Held)', `${settings.currency} ${booking.securityDeposit.toLocaleString()}`],
        ['Estimated Balance Due at Return', `${settings.currency} ${Math.max(0, booking.totalEstimatedRent - booking.advancePaid).toLocaleString()}`]
      ],
      theme: 'striped',
      headStyles: { fillColor: [43, 151, 254], textColor: 255, fontStyle: 'bold', fontSize: 9 },
      styles: { fontSize: 8.5, cellPadding: 2.5 }
    });

    // Terms & Conditions
    const termsY = (doc as any).lastAutoTable.finalY + 6;
    doc.setFillColor(248, 250, 252);
    doc.rect(14, termsY, 182, 38, 'F');
    doc.rect(14, termsY, 182, 38, 'S');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('TERMS & CONDITIONS (IKRAARNAMA):', 17, termsY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    let linePos = termsY + 11;
    settings.termsAndConditions.slice(0, 4).forEach((term, idx) => {
      doc.text(`${idx + 1}. ${term}`, 17, linePos);
      linePos += 4.5;
    });

    // Signatures
    const sigY = termsY + 46;
    doc.line(20, sigY + 12, 80, sigY + 12);
    doc.text('Customer Signature & Thumb Print', 25, sigY + 17);

    doc.line(130, sigY + 12, 190, sigY + 12);
    doc.text('Authorized Business Manager', 135, sigY + 17);

    // Save/Download
    doc.save(`Rental_Contract_${booking.bookingNumber}_${car.plateNumber}.pdf`);
  },

  /**
   * Generates a Return & Final Settlement Receipt
   */
  generateReturnReceipt(booking: Booking, car: Car, client: Client, settings: CompanySettings): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Header
    doc.setFillColor(16, 185, 129); // emerald green
    doc.rect(0, 0, 210, 30, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(settings.businessName.toUpperCase(), 14, 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`VEHICLE RETURN & FINAL SETTLEMENT INVOICE - ${booking.bookingNumber}`, 14, 22);

    autoTable(doc, {
      startY: 38,
      head: [['RETURN SUMMARY', 'DETAILS']],
      body: [
        ['Customer Name & CNIC', `${client.name} (${client.cnic})`],
        ['Vehicle Plate & Model', `${car.plateNumber} - ${car.make} ${car.model}`],
        ['Dispatch Date', new Date(booking.startDate).toLocaleString()],
        ['Actual Return Date', booking.actualReturnDate ? new Date(booking.actualReturnDate).toLocaleString() : 'Returned Today'],
        ['Starting Odometer', `${booking.startOdometer.toLocaleString()} KM`],
        ['Ending Odometer', `${(booking.endOdometer || car.currentOdometer).toLocaleString()} KM`],
        ['Total Kilometers Driven', `${((booking.endOdometer || car.currentOdometer) - booking.startOdometer).toLocaleString()} KM`],
        ['Fuel Level at Return', booking.endFuelLevel || 'Checked OK'],
        ['Base Rental Rent', `${settings.currency} ${booking.totalEstimatedRent.toLocaleString()}`],
        ['Advance Paid', `${settings.currency} ${booking.advancePaid.toLocaleString()}`],
        ['Late / Extra Hours Fee', `${settings.currency} ${(booking.extraCharges?.lateFee || 0).toLocaleString()}`],
        ['Damages / Repair Charges', `${settings.currency} ${(booking.extraCharges?.damageFee || 0).toLocaleString()}`],
        ['Fuel Deficit Charge', `${settings.currency} ${(booking.extraCharges?.fuelFee || 0).toLocaleString()}`],
        ['Discount Given', `${settings.currency} ${(booking.discount || 0).toLocaleString()}`],
        ['Net Final Payable', `${settings.currency} ${(booking.finalTotalAmount || booking.totalEstimatedRent).toLocaleString()}`],
        ['Security Deposit Refund Status', 'Refunded in Full upon Clearance']
      ],
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' }
    });

    const sigY = (doc as any).lastAutoTable.finalY + 25;
    doc.line(20, sigY, 80, sigY);
    doc.text('Client Signature', 35, sigY + 5);

    doc.line(130, sigY, 190, sigY);
    doc.text('Receiver / Manager Stamp', 140, sigY + 5);

    doc.save(`Return_Settlement_${booking.bookingNumber}_${car.plateNumber}.pdf`);
  },

  /**
   * Generates Investor Monthly Payout Voucher
   */
  generateInvestorPayoutVoucher(payout: InvestorPayout, investor: Investor, cars: Car[], settings: CompanySettings): void {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a5'
    });

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 24, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(settings.businessName.toUpperCase(), 10, 11);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('INVESTOR RETURN & PAYOUT VOUCHER', 10, 18);

    doc.setTextColor(30, 41, 59);
    autoTable(doc, {
      startY: 28,
      head: [['INVESTOR DETAILS', 'PAYMENT INFORMATION']],
      body: [
        [
          `Investor: ${investor.name}\nCNIC: ${investor.cnic}\nMobile: ${investor.phone}\nBank: ${investor.bankDetails.bankName}\nAccount: ${investor.bankDetails.accountNumber}\nTitle: ${investor.bankDetails.accountTitle}`,
          `Payout Month: ${payout.periodMonth}\nPayout Date: ${payout.payoutDate}\nPayment Mode: ${payout.paymentMethod}\nRef / Txn No: ${payout.referenceNumber || 'N/A'}\nAssociated Cars: ${cars.map(c => c.plateNumber + ' (' + c.model + ')').join(', ')}\nAmount Paid: ${settings.currency} ${payout.amount.toLocaleString()}`
        ]
      ],
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold' }
    });

    const sigY = (doc as any).lastAutoTable.finalY + 15;
    doc.line(20, sigY, 70, sigY);
    doc.text('Investor Signature', 25, sigY + 5);

    doc.line(130, sigY, 180, sigY);
    doc.text('Authorized Signatory', 140, sigY + 5);

    doc.save(`Investor_Payout_${investor.name.replace(/\s+/g, '_')}_${payout.periodMonth}.pdf`);
  }
};
