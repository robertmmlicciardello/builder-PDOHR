import Papa from "papaparse";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  Personnel,
  PersonnelFormData,
  PersonnelReport,
  PersonnelFilters,
} from "@shared/personnel";
import { translations } from "@shared/translations";

// Extend jsPDF to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export class ExportService {
  /**
   * Export personnel data to CSV format
   */
  static exportPersonnelToCSV(personnel: Personnel[], filename?: string): void {
    try {
      const csvData = personnel.map((person) => ({
        [translations.personnel.id]: person.id,
        [translations.personnel.name]: person.name,
        [translations.personnel.rank]: person.rank,
        [translations.personnel.dateOfJoining]: this.formatDate(
          person.dateOfJoining,
        ),
        [translations.personnel.dateOfLeaving]: person.dateOfLeaving
          ? this.formatDate(person.dateOfLeaving)
          : "",
        [translations.personnel.status]: this.getStatusText(person.status),
        [translations.personnel.organization]: person.organization,
        [translations.personnel.assignedDuties]: person.assignedDuties,
        ဖန်တီးသည့်ရက်: this.formatDate(person.createdAt),
        နောက်ဆုံးပြင်ဆင်သည့်ရက်: this.formatDate(person.updatedAt),
      }));

      const csv = Papa.unparse(csvData, {
        delimiter: ",",
        header: true,
        skipEmptyLines: true,
      });

      this.downloadFile(
        csv,
        filename || `personnel-export-${this.getDateString()}.csv`,
        "text/csv",
      );
    } catch (error) {
      console.error("CSV export failed:", error);
      throw new Error("CSV ထုတ်ယူခြင်း မအောင်မြင်ပါ");
    }
  }

  /**
   * Export personnel data to PDF format
   */
  static exportPersonnelToPDF(personnel: Personnel[], filename?: string): void {
    try {
      const doc = new jsPDF();

      // Set Myanmar Unicode font (if available)
      // doc.addFont('NotoSansMyanmar-Regular.ttf', 'myanmar', 'normal');
      // doc.setFont('myanmar');

      // Header
      doc.setFontSize(16);
      doc.text(translations.appName, 20, 20);
      doc.setFontSize(12);
      doc.text(translations.subtitle, 20, 30);

      // Report info
      doc.setFontSize(10);
      doc.text(
        `${translations.reports.generatedOn}: ${this.formatDateTime(new Date().toISOString())}`,
        20,
        45,
      );
      doc.text(
        `${translations.personnel.totalPersonnel}: ${personnel.length}`,
        20,
        55,
      );

      // Table data
      const tableColumns = [
        translations.personnel.id,
        translations.personnel.name,
        translations.personnel.rank,
        translations.personnel.dateOfJoining,
        translations.personnel.status,
        translations.personnel.organization,
      ];

      const tableRows = personnel.map((person) => [
        person.id,
        person.name,
        person.rank,
        this.formatDate(person.dateOfJoining),
        this.getStatusText(person.status),
        person.organization,
      ]);

      // Generate table
      doc.autoTable({
        head: [tableColumns],
        body: tableRows,
        startY: 65,
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [178, 34, 34], // Myanmar red
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { top: 65, left: 20, right: 20 },
        tableWidth: "auto",
        columnStyles: {
          0: { cellWidth: 25 }, // ID
          1: { cellWidth: 30 }, // Name
          2: { cellWidth: 25 }, // Rank
          3: { cellWidth: 25 }, // Date
          4: { cellWidth: 20 }, // Status
          5: { cellWidth: 35 }, // Organization
        },
      });

      doc.save(filename || `personnel-report-${this.getDateString()}.pdf`);
    } catch (error) {
      console.error("PDF export failed:", error);
      throw new Error("PDF ထုတ်ယူခြင်း မအောင်မြင်ပါ");
    }
  }

  /**
   * Export personnel report to PDF
   */
  static exportReportToPDF(
    report: PersonnelReport,
    personnel: Personnel[],
    filters?: PersonnelFilters,
    filename?: string,
  ): void {
    try {
      const doc = new jsPDF();

      // Header
      doc.setFontSize(18);
      doc.text(translations.reports.summaryReport, 20, 20);

      doc.setFontSize(12);
      doc.text(translations.appName, 20, 30);
      doc.text(translations.subtitle, 20, 40);

      // Report metadata
      doc.setFontSize(10);
      doc.text(
        `${translations.reports.generatedOn}: ${this.formatDateTime(report.dateGenerated)}`,
        20,
        55,
      );

      // Summary statistics
      let yPos = 70;
      doc.setFontSize(14);
      doc.text("အနှစ်ချုပ်စာရင်းအင်းများ", 20, yPos);
      yPos += 15;

      doc.setFontSize(10);
      const stats = [
        `${translations.personnel.totalPersonnel}: ${report.totalMembers}`,
        `${translations.reports.activeMembers}: ${report.activeMembers}`,
        `${translations.reports.resignedMembers}: ${report.resignedMembers}`,
        `${translations.reports.deceasedMembers}: ${report.deceasedMembers}`,
        `${translations.reports.newEntries}: ${report.newEntries}`,
      ];

      stats.forEach((stat) => {
        doc.text(stat, 20, yPos);
        yPos += 8;
      });

      // Rank distribution
      yPos += 10;
      doc.setFontSize(14);
      doc.text(translations.reports.byRank, 20, yPos);
      yPos += 15;

      const rankColumns = ["ရာထူး", "အရေအတွက်", "ရာခိုင်နှုန်း"];
      const rankRows = Object.entries(report.byRank).map(([rank, count]) => {
        const percentage = ((count / report.activeMembers) * 100).toFixed(1);
        return [rank, count.toString(), `${percentage}%`];
      });

      doc.autoTable({
        head: [rankColumns],
        body: rankRows,
        startY: yPos,
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [178, 34, 34],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 30, halign: "center" },
          2: { cellWidth: 30, halign: "center" },
        },
        margin: { left: 20, right: 20 },
      });

      // Organization distribution (if space allows)
      const finalY = (doc as any).lastAutoTable.finalY + 20;
      if (finalY < 250) {
        doc.setFontSize(14);
        doc.text(translations.reports.byOrganization, 20, finalY);

        const orgColumns = ["အဖွဲ့အစည်း", "အရေအတွက်", "ရာခိုင်နှုန်း"];
        const orgRows = Object.entries(report.byOrganization).map(
          ([org, count]) => {
            const percentage = ((count / report.activeMembers) * 100).toFixed(
              1,
            );
            return [org, count.toString(), `${percentage}%`];
          },
        );

        doc.autoTable({
          head: [orgColumns],
          body: orgRows,
          startY: finalY + 10,
          styles: {
            fontSize: 9,
            cellPadding: 3,
          },
          headStyles: {
            fillColor: [178, 34, 34],
            textColor: [255, 255, 255],
            fontStyle: "bold",
          },
          columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 30, halign: "center" },
            2: { cellWidth: 30, halign: "center" },
          },
          margin: { left: 20, right: 20 },
        });
      }

      doc.save(filename || `personnel-summary-${this.getDateString()}.pdf`);
    } catch (error) {
      console.error("Report PDF export failed:", error);
      throw new Error("အစီရင်ခံစာ PDF ထုတ်ယူခြင်း မအောင်မြင်ပါ");
    }
  }

  /**
   * Export filtered data based on current filters
   */
  static exportFilteredData(
    personnel: Personnel[],
    filters: PersonnelFilters,
    format: "csv" | "pdf",
  ): void {
    const filteredPersonnel = this.applyFilters(personnel, filters);
    const filterSuffix = this.getFilterSuffix(filters);
    const baseFilename = `personnel-filtered${filterSuffix}-${this.getDateString()}`;

    if (format === "csv") {
      this.exportPersonnelToCSV(filteredPersonnel, `${baseFilename}.csv`);
    } else {
      this.exportPersonnelToPDF(filteredPersonnel, `${baseFilename}.pdf`);
    }
  }

  /**
   * Apply filters to personnel data
   */
  private static applyFilters(
    personnel: Personnel[],
    filters: PersonnelFilters,
  ): Personnel[] {
    let filtered = [...personnel];

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.id.toLowerCase().includes(searchTerm) ||
          p.name.toLowerCase().includes(searchTerm) ||
          p.rank.toLowerCase().includes(searchTerm),
      );
    }

    if (filters.status) {
      filtered = filtered.filter((p) => p.status === filters.status);
    }

    if (filters.rank) {
      filtered = filtered.filter((p) => p.rank === filters.rank);
    }

    if (filters.organization) {
      filtered = filtered.filter(
        (p) => p.organization === filters.organization,
      );
    }

    if (filters.dateRange) {
      const { from, to } = filters.dateRange;
      filtered = filtered.filter((p) => {
        const joinDate = new Date(p.dateOfJoining);
        const fromDate = new Date(from);
        const toDate = new Date(to);
        return joinDate >= fromDate && joinDate <= toDate;
      });
    }

    return filtered;
  }

  /**
   * Generate filter suffix for filename
   */
  private static getFilterSuffix(filters: PersonnelFilters): string {
    const parts: string[] = [];

    if (filters.status) {
      parts.push(filters.status);
    }

    if (filters.rank) {
      parts.push(filters.rank.replace(/\s+/g, "-"));
    }

    if (filters.organization) {
      parts.push(filters.organization.replace(/\s+/g, "-"));
    }

    return parts.length > 0 ? `-${parts.join("-")}` : "";
  }

  /**
   * Get status text in Burmese
   */
  private static getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      active: translations.status.active,
      resigned: translations.status.resigned,
      deceased: translations.status.deceased,
    };
    return statusMap[status] || status;
  }

  /**
   * Format date for display
   */
  private static formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString("my-MM", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return dateString;
    }
  }

  /**
   * Format date and time for display
   */
  private static formatDateTime(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString("my-MM", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  }

  /**
   * Get date string for filename
   */
  private static getDateString(): string {
    return new Date().toISOString().split("T")[0].replace(/-/g, "");
  }

  /**
   * Download file helper
   */
  private static downloadFile(
    content: string,
    filename: string,
    mimeType: string,
  ): void {
    const blob = new Blob([content], { type: mimeType + ";charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  }

  /**
   * Bulk export all data formats
   */
  static async exportAll(personnel: Personnel[], report: PersonnelReport) {
    try {
      // Export CSV
      this.exportPersonnelToCSV(personnel);

      // Export PDF
      this.exportPersonnelToPDF(personnel);

      // Export summary report
      this.exportReportToPDF(report, personnel);

      return true;
    } catch (error) {
      console.error("Bulk export failed:", error);
      throw new Error("အားလုံးထုတ်ယူခြင်း မအောင်မြင်ပါ");
    }
  }
}

// Export utility functions for import/export operations
export const ImportService = {
  /**
   * Parse CSV file for personnel import
   */
  async parsePersonnelCSV(file: File): Promise<PersonnelFormData[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const personnel: PersonnelFormData[] = results.data.map(
              (row: any) => ({
                id: row[translations.personnel.id] || "",
                name: row[translations.personnel.name] || "",
                rank: row[translations.personnel.rank] || "",
                dateOfJoining: row[translations.personnel.dateOfJoining] || "",
                dateOfLeaving:
                  row[translations.personnel.dateOfLeaving] || undefined,
                assignedDuties:
                  row[translations.personnel.assignedDuties] || "",
                status: this.parseStatus(
                  row[translations.personnel.status] || "active",
                ),
                organization: row[translations.personnel.organization] || "",
              }),
            );

            resolve(personnel);
          } catch (error) {
            reject(new Error("CSV ဖိုင် ဖတ်ရှုခြင်း မအောင်မြင်ပါ"));
          }
        },
        error: (error) => {
          reject(new Error(`CSV ဖိုင် ပြသနာ: ${error.message}`));
        },
      });
    });
  },

  /**
   * Parse status from text
   */
  parseStatus(statusText: string): "active" | "resigned" | "deceased" {
    const statusMap: Record<string, "active" | "resigned" | "deceased"> = {
      [translations.status.active]: "active",
      [translations.status.resigned]: "resigned",
      [translations.status.deceased]: "deceased",
      active: "active",
      resigned: "resigned",
      deceased: "deceased",
    };

    return statusMap[statusText] || "active";
  },
};
