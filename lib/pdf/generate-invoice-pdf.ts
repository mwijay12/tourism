import { jsPDF } from "jspdf";
import type { InvoiceDraft } from "@/lib/firebase/admin-types";

async function loadImageAsDataUrl(url: string): Promise<{
  dataUrl: string;
  format: "PNG" | "JPEG";
  width: number;
  height: number;
} | null> {
  if (!url) return null;
  try {
    if (url.startsWith("data:image/")) {
      const img = new Image();
      await new Promise<void>((res, rej) => {
        img.onload = () => res();
        img.onerror = () => rej(new Error("Invalid image"));
        img.src = url;
      });
      const format = url.startsWith("data:image/png") ? "PNG" : "JPEG";
      return {
        dataUrl: url,
        format,
        width: img.naturalWidth || 200,
        height: img.naturalHeight || 80,
      };
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error("CORS or load fail"));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || 240;
    canvas.height = img.naturalHeight || 120;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0);
    return {
      dataUrl: canvas.toDataURL("image/png"),
      format: "PNG",
      width: canvas.width,
      height: canvas.height,
    };
  } catch {
    return null;
  }
}

export function formatMoney(usdAmount: number, draft: InvoiceDraft): string {
  if (draft.currency === "TZS") {
    const tzs = Math.round(usdAmount * (draft.tzsRate || 2680));
    return `TZS ${tzs.toLocaleString()}`;
  }
  return `$${usdAmount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export async function generateInvoicePdf(draft: InvoiceDraft): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageW = 210;
  const pageH = 297;
  const margin = 15;
  const contentW = pageW - margin * 2;
  const brandName = (draft.companyName || "KIBO & PLAINS").toUpperCase();
  const brandEmail = draft.companyEmail || "concierge@kiboplains.tz";
  const brandPhone = draft.companyPhone
    ? `+${draft.companyPhone.replace(/[^0-9]/g, "")}`
    : "+255 792 867 427";
  const statusLabel = (draft.statusLabel || "PROFORMA · DEPOSIT DUE").toUpperCase();

  const [companyLogo, clientLogo] = await Promise.all([
    draft.companyLogoUrl ? loadImageAsDataUrl(draft.companyLogoUrl) : null,
    draft.clientLogoUrl ? loadImageAsDataUrl(draft.clientLogoUrl) : null,
  ]);

  // 1. Luxury Obsidian-Emerald Masthead
  doc.setFillColor(8, 16, 12);
  doc.rect(0, 0, pageW, 48, "F");

  // Subtle decorative architectural top bar + lower gold hairline
  doc.setFillColor(20, 81, 49);
  doc.rect(0, 0, pageW, 3.5, "F");
  doc.setDrawColor(229, 168, 83);
  doc.setLineWidth(0.75);
  doc.line(0, 48, pageW, 48);

  // Company Logo (Uploaded Logo or Kibo Mountain Crest)
  if (companyLogo) {
    const maxW = 20;
    const maxH = 20;
    const ratio = Math.min(maxW / companyLogo.width, maxH / companyLogo.height);
    const drawW = companyLogo.width * ratio;
    const drawH = companyLogo.height * ratio;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, 12, 22, 22, 2.5, 2.5, "F");
    doc.addImage(
      companyLogo.dataUrl,
      companyLogo.format,
      margin + 11 - drawW / 2,
      23 - drawH / 2,
      drawW,
      drawH
    );
  } else {
    doc.setFillColor(229, 168, 83);
    doc.circle(margin + 8, 18.5, 4.5, "F");
    doc.setFillColor(46, 124, 82);
    doc.triangle(margin + 1, 30, margin + 8, 17, margin + 15, 30, "F");
    doc.setFillColor(246, 242, 232);
    doc.triangle(margin + 5.2, 22.2, margin + 8, 17, margin + 10.8, 22.2, "F");
  }

  const brandTextX = margin + (companyLogo ? 27 : 20);
  doc.setTextColor(255, 255, 255);
  doc.setFont("times", "bold");
  doc.setFontSize(20);
  doc.text(brandName, brandTextX, 20);

  doc.setFont("courier", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(229, 168, 83);
  doc.text("EXPEDITIONS LTD · ARUSHA & MOSHI, TANZANIA", brandTextX, 25.8);

  doc.setFont("courier", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(180, 208, 192);
  doc.text("TANAPA · TALA LICENSED · KPAP ETHICAL CLIMBS", brandTextX, 30.8);

  // Top-right Client Logo Container + Invoice Status Pill
  if (clientLogo) {
    const maxW = 36;
    const maxH = 21;
    const ratio = Math.min(maxW / clientLogo.width, maxH / clientLogo.height);
    const drawW = clientLogo.width * ratio;
    const drawH = clientLogo.height * ratio;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(pageW - margin - 42, 9.5, 42, 25, 2.5, 2.5, "F");
    doc.setDrawColor(229, 168, 83);
    doc.setLineWidth(0.3);
    doc.roundedRect(pageW - margin - 42, 9.5, 42, 25, 2.5, 2.5, "S");
    doc.addImage(
      clientLogo.dataUrl,
      clientLogo.format,
      pageW - margin - 21 - drawW / 2,
      22 - drawH / 2,
      drawW,
      drawH
    );

    doc.setFont("courier", "bold");
    doc.setFontSize(7);
    doc.setTextColor(229, 168, 83);
    doc.text(statusLabel, pageW - margin, 41.5, { align: "right" });
  } else {
    doc.setFont("courier", "bold");
    doc.setFontSize(13);
    doc.setTextColor(229, 168, 83);
    doc.text("EXPEDITION INVOICE", pageW - margin, 19, { align: "right" });

    doc.setFont("courier", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(255, 255, 255);
    doc.text(draft.invoiceNumber, pageW - margin, 25.5, { align: "right" });

    doc.setFillColor(20, 81, 49);
    doc.roundedRect(pageW - margin - 46, 30, 46, 6.5, 2, 2, "F");
    doc.setFontSize(6.8);
    doc.setTextColor(226, 245, 232);
    doc.text(statusLabel, pageW - margin - 23, 34.4, { align: "center" });
  }

  // 2. Two-Column Executive Info Cards (ISSUED BY vs BILLED TO)
  let y = 56;
  const colW = (contentW - 6) / 2;

  // Left: Issued By
  doc.setFillColor(248, 250, 249);
  doc.roundedRect(margin, y, colW, 34, 2.5, 2.5, "F");
  doc.setDrawColor(218, 229, 222);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, colW, 34, 2.5, 2.5, "S");
  doc.setFillColor(20, 81, 49);
  doc.rect(margin, y + 3, 1.4, 28, "F");

  doc.setFont("courier", "bold");
  doc.setFontSize(7.2);
  doc.setTextColor(20, 81, 49);
  doc.text("ISSUED BY", margin + 5, y + 7);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(20, 33, 26);
  doc.text(`${draft.companyName || "Kibo & Plains"} Expeditions Ltd`, margin + 5, y + 13.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.2);
  doc.setTextColor(78, 96, 86);
  doc.text("Clock Tower & Old Moshi Road, Arusha, Tanzania", margin + 5, y + 19);
  doc.text(`Email: ${brandEmail}`, margin + 5, y + 24);
  doc.text(`Concierge: ${brandPhone}`, margin + 5, y + 29);

  // Right: Billed To
  const rightCardX = margin + colW + 6;
  doc.setFillColor(244, 248, 245);
  doc.roundedRect(rightCardX, y, colW, 34, 2.5, 2.5, "F");
  doc.setDrawColor(206, 222, 212);
  doc.roundedRect(rightCardX, y, colW, 34, 2.5, 2.5, "S");
  doc.setFillColor(229, 168, 83);
  doc.rect(rightCardX, y + 3, 1.4, 28, "F");

  doc.setFont("courier", "bold");
  doc.setFontSize(7.2);
  doc.setTextColor(184, 111, 45);
  doc.text("BILLED TO CLIENT / PARTNER", rightCardX + 5, y + 7);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(20, 33, 26);
  doc.text(draft.clientName || "Valued Traveler", rightCardX + 5, y + 13.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.2);
  doc.setTextColor(78, 96, 86);
  doc.text(draft.clientOrg || "Private Expedition Guest", rightCardX + 5, y + 19);
  doc.text(draft.clientEmail || "client@kiboplains.tz", rightCardX + 5, y + 24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 81, 49);
  const tripCut =
    draft.tripTitle.length > 42
      ? `${draft.tripTitle.slice(0, 41)}…`
      : draft.tripTitle;
  doc.text(tripCut, rightCardX + 5, y + 29.5);

  // 3. Horizontal Dossier Reference Bar
  y = 95;
  doc.setFillColor(236, 243, 239);
  doc.roundedRect(margin, y, contentW, 13, 2, 2, "F");
  const metaCols = [
    { label: "INVOICE NO.", value: draft.invoiceNumber },
    { label: "ISSUE DATE", value: draft.issueDate },
    { label: "PAYMENT DUE", value: draft.dueDate },
    { label: "SETTLEMENT", value: draft.currency === "TZS" ? "TZS (Shillings)" : "USD ($)" },
  ];
  const cellW = contentW / 4;
  metaCols.forEach((m, idx) => {
    const cx = margin + idx * cellW + 4;
    doc.setFont("courier", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(84, 102, 92);
    doc.text(m.label, cx, y + 4.8);
    doc.setFont("courier", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(20, 33, 26);
    doc.text(m.value, cx, y + 10);
  });

  // 4. Itemized Cost Breakdown Table
  const drawTableHeader = (topY: number) => {
    doc.setFillColor(20, 81, 49);
    doc.roundedRect(margin, topY, contentW, 9.5, 2, 2, "F");
    doc.setFont("courier", "bold");
    doc.setFontSize(7.6);
    doc.setTextColor(255, 255, 255);
    doc.text("DESCRIPTION & EXPEDITION COST ITEM", margin + 4, topY + 6.2);
    doc.text("QTY", margin + 114, topY + 6.2, { align: "right" });
    doc.text("UNIT RATE", margin + 145, topY + 6.2, { align: "right" });
    doc.text("AMOUNT", pageW - margin - 4, topY + 6.2, { align: "right" });
  };

  y = 114;
  drawTableHeader(y);
  y += 12;

  let subtotalUsd = 0;

  draft.items.forEach((item, idx) => {
    const lineTotal = item.qty * item.unitPriceUsd;
    subtotalUsd += lineTotal;

    const descLines = doc.splitTextToSize(item.description, 88) as string[];
    const rowH = Math.max(13, 7 + descLines.length * 4.4);

    if (y + rowH > 236) {
      doc.addPage();
      y = 18;
      drawTableHeader(y);
      y += 12;
    }

    if (idx % 2 === 0) {
      doc.setFillColor(248, 251, 249);
      doc.rect(margin, y - 2, contentW, rowH, "F");
    }

    // Subtle Category Badge Pill
    const catLabel = item.category.toUpperCase();
    const badgeW = Math.min(54, catLabel.length * 1.9 + 5);
    doc.setFillColor(252, 243, 230);
    doc.roundedRect(margin + 4, y - 0.3, badgeW, 4.4, 1, 1, "F");
    doc.setFont("courier", "bold");
    doc.setFontSize(6.6);
    doc.setTextColor(168, 92, 28);
    doc.text(catLabel, margin + 6.2, y + 2.8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.8);
    doc.setTextColor(20, 33, 26);
    doc.text(descLines, margin + 4, y + 7.6);

    doc.setFont("courier", "normal");
    doc.setFontSize(8.8);
    doc.setTextColor(58, 72, 64);
    doc.text(String(item.qty), margin + 114, y + 6, { align: "right" });
    doc.text(formatMoney(item.unitPriceUsd, draft), margin + 145, y + 6, {
      align: "right",
    });

    doc.setFont("courier", "bold");
    doc.setTextColor(20, 33, 26);
    doc.text(formatMoney(lineTotal, draft), pageW - margin - 4, y + 6, {
      align: "right",
    });

    doc.setDrawColor(225, 235, 229);
    doc.setLineWidth(0.22);
    doc.line(margin, y + rowH - 2, pageW - margin, y + rowH - 2);

    y += rowH + 1;
  });

  // 5. Settlement Totals & Authorized Signatory Block
  const taxUsd = (subtotalUsd * (draft.taxPct || 0)) / 100;
  const grandTotalUsd = subtotalUsd + taxUsd;
  const depositUsd = (grandTotalUsd * (draft.depositPct || 30)) / 100;
  const balanceUsd = grandTotalUsd - depositUsd;

  y += 6;
  if (y > 218) {
    doc.addPage();
    y = 22;
  }

  // Left: Payment Channels & Official Stamp
  doc.setFillColor(246, 249, 247);
  doc.roundedRect(margin, y, 92, 48, 3, 3, "F");
  doc.setDrawColor(212, 225, 217);
  doc.roundedRect(margin, y, 92, 48, 3, 3, "S");

  doc.setFont("courier", "bold");
  doc.setFontSize(7.4);
  doc.setTextColor(20, 81, 49);
  doc.text("PAYMENT CHANNELS & AUTHORIZATION", margin + 4.5, y + 6.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.8);
  doc.setTextColor(72, 88, 79);
  const noteLines = doc.splitTextToSize(
    draft.notes ||
      "M-Pesa Lipa Namba, Visa/Mastercard & USD SWIFT Wire accepted. TANAPA & KPAP porter welfare fees are ring-fenced.",
    83
  ) as string[];
  doc.text(noteLines, margin + 4.5, y + 12);

  // Authorized Stamp Seal bottom-left inside notes box
  doc.setDrawColor(46, 124, 82);
  doc.setLineWidth(0.35);
  doc.line(margin + 4.5, y + 39, margin + 48, y + 39);
  doc.setFont("courier", "bold");
  doc.setFontSize(6.8);
  doc.setTextColor(20, 81, 49);
  doc.text("AUTHORIZED · ARUSHA DESK", margin + 4.5, y + 43.5);

  doc.setDrawColor(229, 168, 83);
  doc.circle(margin + 76, y + 38, 6.2, "S");
  doc.setFontSize(5.5);
  doc.setTextColor(184, 111, 45);
  doc.text("KPAP", margin + 76, y + 37.5, { align: "center" });
  doc.text("VERIFIED", margin + 76, y + 40, { align: "center" });

  // Right: Executive Totals Dark Card
  const sumX = margin + 97;
  const sumW = contentW - 97;
  doc.setFillColor(8, 16, 12);
  doc.roundedRect(sumX, y, sumW, 48, 3, 3, "F");
  doc.setDrawColor(229, 168, 83);
  doc.setLineWidth(0.45);
  doc.line(sumX, y + 0.5, sumX + sumW, y + 0.5);

  doc.setFont("courier", "normal");
  doc.setFontSize(8.4);
  doc.setTextColor(180, 205, 190);
  doc.text("Subtotal", sumX + 5.5, y + 9);
  doc.text(formatMoney(subtotalUsd, draft), sumX + sumW - 5.5, y + 9, {
    align: "right",
  });

  doc.text(`Park Levy / Tax (${draft.taxPct}%)`, sumX + 5.5, y + 16);
  doc.text(formatMoney(taxUsd, draft), sumX + sumW - 5.5, y + 16, {
    align: "right",
  });

  doc.setDrawColor(46, 124, 82);
  doc.setLineWidth(0.3);
  doc.line(sumX + 5.5, y + 20, sumX + sumW - 5.5, y + 20);

  doc.setFont("courier", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(255, 255, 255);
  doc.text("TOTAL CONTRACT", sumX + 5.5, y + 27);
  doc.setTextColor(229, 168, 83);
  doc.text(formatMoney(grandTotalUsd, draft), sumX + sumW - 5.5, y + 27, {
    align: "right",
  });

  doc.setFillColor(18, 36, 27);
  doc.roundedRect(sumX + 4, y + 30.5, sumW - 8, 8, 1.5, 1.5, "F");
  doc.setFont("courier", "bold");
  doc.setFontSize(8.2);
  doc.setTextColor(134, 224, 174);
  doc.text(`Deposit Due (${draft.depositPct}%)`, sumX + 6.5, y + 35.8);
  doc.text(formatMoney(depositUsd, draft), sumX + sumW - 6.5, y + 35.8, {
    align: "right",
  });

  doc.setFont("courier", "normal");
  doc.setFontSize(7.8);
  doc.setTextColor(175, 200, 185);
  doc.text("Balance Prior to Arrival", sumX + 5.5, y + 44);
  doc.text(formatMoney(balanceUsd, draft), sumX + sumW - 5.5, y + 44, {
    align: "right",
  });

  // 6. Paginated Footer Across All Pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(218, 229, 222);
    doc.setLineWidth(0.25);
    doc.line(margin, pageH - 16, pageW - margin, pageH - 16);

    doc.setFont("courier", "normal");
    doc.setFontSize(7.2);
    doc.setTextColor(108, 124, 114);
    doc.text(
      `${draft.companyName || "Kibo & Plains"} Expeditions · Arusha & Moshi · ${brandPhone} · ${brandEmail}`,
      margin,
      pageH - 10.5
    );
    doc.text(`Page ${p} of ${totalPages}`, pageW - margin, pageH - 10.5, {
      align: "right",
    });
  }

  doc.save(`${draft.invoiceNumber || "Kibo-Plains-Invoice"}.pdf`);
}
