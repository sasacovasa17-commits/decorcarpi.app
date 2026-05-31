import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

export const calendarRouter = router({
  /**
   * Generate Google Calendar event link
   */
  generateGoogleCalendarLink: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        startTime: z.string(), // ISO format
        endTime: z.string(), // ISO format
        location: z.string().optional(),
        attendeeEmail: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      // Format dates for Google Calendar
      const startDate = new Date(input.startTime).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      const endDate = new Date(input.endTime).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

      // Build Google Calendar URL
      const params = new URLSearchParams({
        action: "TEMPLATE",
        text: input.title,
        details: input.description || "",
        location: input.location || "",
        dates: `${startDate}/${endDate}`,
        add: input.attendeeEmail || "",
      });

      const googleCalendarLink = `https://calendar.google.com/calendar/render?${params.toString()}`;

      return {
        link: googleCalendarLink,
        title: input.title,
        startTime: input.startTime,
        endTime: input.endTime,
      };
    }),

  /**
   * Generate Outlook calendar event link
   */
  generateOutlookCalendarLink: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        startTime: z.string(), // ISO format
        endTime: z.string(), // ISO format
        location: z.string().optional(),
        attendeeEmail: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      // Format for Outlook
      const startDate = new Date(input.startTime).toISOString().split(".")[0];
      const endDate = new Date(input.endTime).toISOString().split(".")[0];

      const params = new URLSearchParams({
        subject: input.title,
        body: input.description || "",
        location: input.location || "",
        startdt: startDate,
        enddt: endDate,
        attendees: input.attendeeEmail || "",
      });

      const outlookLink = `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`;

      return {
        link: outlookLink,
        title: input.title,
        startTime: input.startTime,
        endTime: input.endTime,
      };
    }),

  /**
   * Generate iCal format for calendar import
   */
  generateICalEvent: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        startTime: z.string(), // ISO format
        endTime: z.string(), // ISO format
        location: z.string().optional(),
        attendeeEmail: z.string().optional(),
        organizerEmail: z.string(),
      })
    )
    .mutation(({ input }) => {
      const uid = `${Date.now()}@decorcarpi.com`;
      const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      const startTime = new Date(input.startTime).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      const endTime = new Date(input.endTime).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

      const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Decor Carpi//Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${now}
DTSTART:${startTime}
DTEND:${endTime}
SUMMARY:${input.title}
DESCRIPTION:${input.description || ""}
LOCATION:${input.location || ""}
ORGANIZER:mailto:${input.organizerEmail}
${input.attendeeEmail ? `ATTENDEE:mailto:${input.attendeeEmail}` : ""}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

      return {
        icalContent,
        fileName: `${input.title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.ics`,
      };
    }),

  /**
   * Generate meeting scheduling link
   */
  generateMeetingLink: protectedProcedure
    .input(
      z.object({
        clientName: z.string(),
        projectName: z.string(),
        preferredDate: z.string().optional(),
        duration: z.number().default(60), // minutes
      })
    )
    .mutation(({ input }) => {
      // Generate Calendly-style link (you would integrate with actual Calendly API)
      const meetingLink = `https://calendly.com/decorcarpi/consultation?name=${encodeURIComponent(input.clientName)}&project=${encodeURIComponent(input.projectName)}`;

      // Alternative: Google Meet link
      const googleMeetLink = `https://meet.google.com/new`;

      // Alternative: Zoom link (would need actual Zoom integration)
      const zoomLink = `https://zoom.us/`;

      return {
        calendlyLink: meetingLink,
        googleMeetLink,
        zoomLink,
        duration: input.duration,
        clientName: input.clientName,
        projectName: input.projectName,
      };
    }),

  /**
   * Generate availability slots for scheduling
   */
  generateAvailabilitySlots: protectedProcedure
    .input(
      z.object({
        startDate: z.string(), // ISO format
        endDate: z.string(), // ISO format
        workingHours: z.object({
          start: z.number(), // 9 = 9:00 AM
          end: z.number(), // 17 = 5:00 PM
        }),
        slotDuration: z.number().default(60), // minutes
        excludeDays: z.array(z.number()).optional(), // 0-6 (Sunday-Saturday)
      })
    )
    .mutation(({ input }) => {
      const slots: Array<{ start: string; end: string }> = [];
      const currentDate = new Date(input.startDate);
      const endDate = new Date(input.endDate);
      const excludeDays = input.excludeDays || [0, 6]; // Exclude Sunday and Saturday by default

      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();

        // Skip excluded days
        if (!excludeDays.includes(dayOfWeek)) {
          // Generate slots for this day
          for (let hour = input.workingHours.start; hour < input.workingHours.end; hour++) {
            for (let minute = 0; minute < 60; minute += input.slotDuration) {
              const slotStart = new Date(currentDate);
              slotStart.setHours(hour, minute, 0);

              const slotEnd = new Date(slotStart);
              slotEnd.setMinutes(slotEnd.getMinutes() + input.slotDuration);

              slots.push({
                start: slotStart.toISOString(),
                end: slotEnd.toISOString(),
              });
            }
          }
        }

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return {
        totalSlots: slots.length,
        slots: slots.slice(0, 20), // Return first 20 slots
        workingHours: input.workingHours,
        slotDuration: input.slotDuration,
      };
    }),
});
