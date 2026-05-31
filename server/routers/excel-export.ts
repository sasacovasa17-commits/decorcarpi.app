import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import ExcelJS from "exceljs";
import { Buffer } from "buffer";

export const excelExportRouter = router({
  /**
   * Export preventives to Excel file
   */
  exportPreventives: protectedProcedure
    .input(
      z.object({
        preventives: z.array(
          z.object({
            id: z.string(),
            projectName: z.string(),
            clientName: z.string(),
            clientEmail: z.string().optional(),
            clientPhone: z.string().optional(),
            clientAddress: z.string().optional(),
            sqm: z.number(),
            textureName: z.string(),
            colorName: z.string().optional(),
            subtotal: z.number(),
            iva: z.number(),
            altri: z.number(),
            totalPrice: z.number(),
            createdAt: z.string(),
            status: z.enum(["pending", "accepted", "rejected"]).optional(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Preventivi");

      // Set column widths
      worksheet.columns = [
        { header: "ID Preventivo", key: "id", width: 15 },
        { header: "Progetto", key: "projectName", width: 20 },
        { header: "Cliente", key: "clientName", width: 20 },
        { header: "Email", key: "clientEmail", width: 25 },
        { header: "Telefono", key: "clientPhone", width: 15 },
        { header: "Indirizzo", key: "clientAddress", width: 30 },
        { header: "m²", key: "sqm", width: 10 },
        { header: "Texture", key: "textureName", width: 20 },
        { header: "Colore", key: "colorName", width: 15 },
        { header: "Subtotale", key: "subtotal", width: 12 },
        { header: "IVA", key: "iva", width: 12 },
        { header: "Altri", key: "altri", width: 12 },
        { header: "Totalee", key: "totalPrice", width: 12 },
        { header: "Data", key: "createdAt", width: 15 },
        { header: "Stato", key: "status", width: 12 },
      ];

      // Style header row
      worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFC9A227" }, // Gold color
      };

      // Add data rows
      input.preventives.forEach((preventive) => {
        worksheet.addRow({
          id: preventive.id,
          projectName: preventive.projectName,
          clientName: preventive.clientName,
          clientEmail: preventive.clientEmail || "",
          clientPhone: preventive.clientPhone || "",
          clientAddress: preventive.clientAddress || "",
          sqm: preventive.sqm,
          textureName: preventive.textureName,
          colorName: preventive.colorName || "",
          subtotal: preventive.subtotal.toFixed(2),
          iva: preventive.iva.toFixed(2),
          altri: preventive.altri.toFixed(2),
          totalPrice: preventive.totalPrice.toFixed(2),
          createdAt: new Date(preventive.createdAt).toISOString().split("T")[0],
          status: preventive.status || "pending",
        });
      });

      // Format currency columns
      const currencyColumns = ["J", "K", "L", "M"]; // Subtotal, IVA, Altri, Totale
      currencyColumns.forEach((col) => {
        worksheet.getColumn(col).numFmt = '"€"#,##0.00';
      });

      // Add summary section
      const lastRow = input.preventives.length + 2;
      worksheet.addRow({});
      worksheet.addRow({
        projectName: "TOTALI",
        subtotal: `=SUM(J2:J${input.preventives.length + 1})`,
        iva: `=SUM(K2:K${input.preventives.length + 1})`,
        altri: `=SUM(L2:L${input.preventives.length + 1})`,
        totalPrice: `=SUM(M2:M${input.preventives.length + 1})`,
      });

      // Style summary row
      const summaryRow = worksheet.getRow(lastRow + 1);
      summaryRow.font = { bold: true };
      summaryRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE8E8E8" },
      };

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();

      return {
        success: true,
        fileName: `Preventivi_${new Date().toISOString().split("T")[0]}.xlsx`,
        buffer: (buffer as unknown as Buffer).toString("base64"),
      };
    }),

  /**
   * Export single preventive to Excel
   */
  exportSinglePreventive: protectedProcedure
    .input(
      z.object({
        projectName: z.string(),
        clientName: z.string(),
        clientEmail: z.string().optional(),
        clientPhone: z.string().optional(),
        clientAddress: z.string().optional(),
        sqm: z.number(),
        textureName: z.string(),
        colorName: z.string().optional(),
        subtotal: z.number(),
        iva: z.number(),
        altri: z.number(),
        totalPrice: z.number(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Preventivo");

      // Add title
      const titleCell = worksheet.getCell("A1");
      titleCell.value = "PREVENTIVO";
      titleCell.font = { bold: true, size: 16 };
      titleCell.alignment = { horizontal: "center", vertical: "middle" };

      // Add company info
      const companyCell = worksheet.getCell("A2");
      companyCell.value = "Decor Carpi - Stucchi Decorativi";
      companyCell.font = { bold: true, size: 12 };

      // Add client info
      worksheet.addRow({});
      worksheet.addRow(["Cliente:", input.clientName]);
      worksheet.addRow(["Email:", input.clientEmail || ""]);
      worksheet.addRow(["Telefono:", input.clientPhone || ""]);
      worksheet.addRow(["Indirizzo:", input.clientAddress || ""]);

      // Add project details
      worksheet.addRow({});
      worksheet.addRow(["Progetto:", input.projectName]);
      worksheet.addRow(["Descrizione:", input.description || ""]);

      // Add details table
      worksheet.addRow({});
      const headerRow = worksheet.addRow([
        "Descrizione",
        "Quantità (m²)",
        "Texture",
        "Colore",
      ]);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFC9A227" },
      };

      worksheet.addRow([
        input.textureName,
        input.sqm,
        input.textureName,
        input.colorName || "-",
      ]);

      // Add pricing section
      worksheet.addRow({});
      worksheet.addRow(["", "", "Subtotale", input.subtotal.toFixed(2)]);
      worksheet.addRow(["", "", "IVA (22%)", input.iva.toFixed(2)]);
      worksheet.addRow(["", "", "Altri", input.altri.toFixed(2)]);

      const totalRow = worksheet.addRow([
        "",
        "",
        "TOTALE",
        input.totalPrice.toFixed(2),
      ]);
      totalRow.font = { bold: true, size: 12 };
      totalRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE8E8E8" },
      };

      // Add footer
      worksheet.addRow({});
      worksheet.addRow(["Data:", new Date().toISOString().split("T")[0]]);

      // Format columns
      worksheet.columns = [
        { width: 20 },
        { width: 15 },
        { width: 20 },
        { width: 15 },
      ];

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();

      return {
        success: true,
        fileName: `Preventivo_${input.projectName}_${new Date().toISOString().split("T")[0]}.xlsx`,
        buffer: (buffer as unknown as Buffer).toString("base64"),
      };
    }),
});
