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
  const margin = 16;
  const contentW = pageW - margin * 2;

  // 1. Luxury Obsidian-Emerald Top Banner
  doc.setFillColor(8, 16, 12);
  doc.rect(0, 0, pageW, 44, "F");

  // Subtle gold bottom accent border
  doc.setDrawColor(229, 168, 83);
  doc.setLineWidth(0.7);
  doc.line(0, 44, pageW, 44);

  // Kibo Mountain Geometric Brand Mark on top-left
  doc.setFillColor(229, 168, 83);
  doc.circle(margin + 7, 17, 4.2, "F");
  doc.setFillColor(46, 124, 82);
  doc.triangle(margin + 1, 27, margin + 7, 16.5, margin + 13, 27, "F");
  doc.setFillColor(246, 242, 232);
  doc.triangle(margin + 4.8, 20.5, margin + 7, 16.5, margin + 9.2, 20.5, "F");

  // Brand Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("times", "bold");
  doc.setFontSize(19);
  doc.text("KIBO & PLAINS", margin + 17, 19);

  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.setTextColor(229, 168, 83);
  doc.text("EXPEDITIONS LTD · ARUSHA & MOSHI, TANZANIA", margin + 17, 24.5);
  doc.setTextColor(175, 205, 188);
  doc.text("TANAPA · TALA LICENSED · KPAP PARTNER", margin + 17, 29.5);

  // Client / Partner Custom Logo Slot on top-right of banner (or crisp badge)
  const logoInfo = draft.clientLogoUrl
    ? await loadImageAsDataUrl(draft.clientLogoUrl)
    : null;
  if (logoInfo) {
    const maxW = 36;
    const maxH = 22;
    const ratio = Math.min(maxW / logoInfo.width, maxH / logoInfo.height);
    const drawW = logoInfo.width * ratio;
    const drawH = logoInfo.height * ratio;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(pageW - margin - 40, 10, 40, 26, 2.5, 2.5, "F");
    doc.addImage(
      logoInfo.dataUrl,
      logoInfo.format,
      pageW - margin - 20 - drawW / 2,
      23 - drawH / 2,
      drawW,
      drawH
    );
  } else {
    doc.setFont("courier", "bold");
    doc.setFontSize(11);
    doc.setTextColor(229, 168, 83);
    doc.text("OFFICIAL INVOICE", pageW - margin, 20, { align: "right" });
    doc.setFont("courier", "normal");
    doc.setFontSize(9);
    doc.setTextColor(226, 238, 231);
    doc.text(draft.invoiceNumber, pageW - margin, 26.5, { align: "right" });
  }

  // 2. Billed To & Invoice Metadata Card
  let y = 55;
  doc.setFillColor(244, 248, 245);
  doc.roundedRect(margin, y, contentW, 34, 3, 3, "F");
  doc.setDrawColor(210, 224, 215);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentW, 34, 3, 3, "S");

  doc.setFont("courier", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(20, 81, 49);
  doc.text("BILLED TO CLIENT / PARTNER", margin + 5, y + 7);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(20, 33, 26);
  doc.text(draft.clientName || "Valued Traveler", margin + 5, y + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(78, 96, 86);
  doc.text(
    draft.clientOrg ? `${draft.clientOrg} · ${draft.clientEmail}` : draft.clientEmail,
    margin + 5,
    y + 20
  );
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 81, 49);
  doc.text(`Expedition: ${draft.tripTitle}`, margin + 5, y + 27);

  // Right side invoice metadata
  const rightX = pageW - margin - 5;
  doc.setFont("courier", "bold");
  doc.setFontSize(8);
  doc.setTextColor(20, 33, 26);
  doc.text(`INVOICE #: ${draft.invoiceNumber}`, rightX, y + 8, { align: "right" });
  doc.setFont("courier", "normal");
  doc.setTextColor(78, 96, 86);
  doc.text(`ISSUE DATE: ${draft.issueDate}`, rightX, y + 14.5, { align: "right" });
  doc.text(`DUE DATE: ${draft.dueDate}`, rightX, y + 21, { align: "right" });
  doc.text(`CURRENCY: ${draft.currency}`, rightX, y + 27.5, { align: "right" });

  // 3. Itemized Cost Breakdown Table
  y = 97;
  doc.setFillColor(20, 81, 49);
  doc.roundedRect(margin, y, contentW, 9, 2, 2, "F");

  doc.setFont("courier", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("CATEGORY & ITEM BREAKDOWN", margin + 4, y + 6);
  doc.text("QTY", margin + 114, y + 6, { align: "right" });
  doc.text("UNIT", margin + 144, y + 6, { align: "right" });
  doc.text("LINE TOTAL", pageW - margin - 4, y + 6, { align: "right" });

  y += 12;
  let subtotalUsd = 0;

  draft.items.forEach((item, idx) => {
    const lineTotal = item.qty * item.unitPriceUsd;
    subtotalUsd += lineTotal;

    const descLines = doc.splitTextToSize(item.description, 88) as string[];
    const rowH = Math.max(12, 6 + descLines.length * 4.5);

    if (y + rowH > 245) {
      doc.addPage();
      y = 20;
    }

    if (idx % 2 === 0) {
      doc.setFillColor(249, 252, 250);
      doc.rect(margin, y - 2, contentW, rowH, "F");
    }

    doc.setFont("courier", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(184, 111, 45);
    doc.text(item.category.toUpperCase(), margin + 4, y + 2.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(20, 33, 26);
    doc.text(descLines, margin + 4, y + 7.2);

    doc.setFont("courier", "normal");
    doc.setFontSize(9);
    doc.text(String(item.qty), margin + 114, y + 5.5, { align: "right" });
    doc.text(formatMoney(item.unitPriceUsd, draft), margin + 144, y + 5.5, {
      align: "right",
    });

    doc.setFont("courier", "bold");
    doc.text(formatMoney(lineTotal, draft), pageW - margin - 4, y + 5.5, {
      align: "right",
    });

    doc.setDrawColor(225, 234, 228);
    doc.setLineWidth(0.2);
    doc.line(margin, y + rowH - 2, pageW - margin, y + rowH - 2);

    y += rowH + 1;
  });

  // 4. Financial Totals & Deposit Schedule
  const taxUsd = (subtotalUsd * (draft.taxPct || 0)) / 100;
  const grandTotalUsd = subtotalUsd + taxUsd;
  const depositUsd = (grandTotalUsd * (draft.depositPct || 30)) / 100;
  const balanceUsd = grandTotalUsd - depositUsd;

  y += 6;
  if (y > 225) {
    doc.addPage();
    y = 22;
  }

  // Notes Box Left
  doc.setFillColor(246, 249, 247);
  doc.roundedRect(margin, y, 92, 42, 3, 3, "F");
  doc.setFont("courier", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(20, 81, 49);
  doc.text("PAYMENT CHANNELS & TERMS", margin + 4, y + 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(72, 88, 79);
  const noteLines = doc.splitTextToSize(
    draft.notes ||
      "M-Pesa / Tigo Pesa / Visa / USD SWIFT Wire accepted. TANAPA & KPAP porter welfare fees paid directly prior to gate entry.",
    84
  ) as string[];
  doc.text(noteLines, margin + 4, y + 13);

  // Summary Totals Box Right
  const sumX = margin + 98;
  const sumW = contentW - 98;
  doc.setFillColor(8, 16, 12);
  doc.roundedRect(sumX, y, sumW, 42, 3, 3, "F");

  doc.setFont("courier", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(175, 200, 185);
  doc.text("Subtotal", sumX + 5, y + 8.5);
  doc.text(formatMoney(subtotalUsd, draft), sumX + sumW - 5, y + 8.5, {
    align: "right",
  });

  doc.text(`Park Levy / Tax (${draft.taxPct}%)`, sumX + 5, y + 15.5);
  doc.text(formatMoney(taxUsd, draft), sumX + sumW - 5, y + 15.5, {
    align: "right",
  });

  doc.setDrawColor(46, 124, 82);
  doc.line(sumX + 5, y + 19, sumX + sumW - 5, y + 19);

  doc.setFont("courier", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("TOTAL CONTRACT", sumX + 5, y + 25.5);
  doc.setTextColor(229, 168, 83);
  doc.text(formatMoney(grandTotalUsd, draft), sumX + sumW - 5, y + 25.5, {
    align: "right",
  });

  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.setTextColor(150, 210, 178);
  doc.text(`Deposit Due (${draft.depositPct}%)`, sumX + 5, y + 32.5);
  doc.text(formatMoney(depositUsd, draft), sumX + sumW - 5, y + 32.5, {
    align: "right",
  });

  doc.setTextColor(175, 200, 185);
  doc.text("Balance Prior to Arrival", sumX + 5, y + 38.5);
  doc.text(formatMoney(balanceUsd, draft), sumX + sumW - 5, y + 38.5, {
    align: "right",
  });

  // 5. Footer Strip
  doc.setFont("courier", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(120, 136, 126);
  doc.text(
    "Kibo & Plains Expeditions Ltd · Arusha & Moshi · WhatsApp +255 792 867 427 · System by Altraware Technology",
    pageW / 2,
    286,
    { align: "center" }
  );

  doc.save(`${draft.invoiceNumber || "Kibo-Plains-Invoice"}.pdf`);
}
