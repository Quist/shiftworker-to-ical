# Shiftworker to Google Calendar Exporter

Export shift schedules from the Shiftworker mobile app to iCal format for Google Calendar import.

This monorepo provides tools to seamlessly export calendar events from the Shiftworker app to Google Calendar. The repository is organized into three main modules:

1. **Core Module**: This module contains the logic and an npm package for exporting events. It serves as the foundation of the entire project, handling the core functionality required for the export process. It also provides a command-line tool.

2. **shiftworker-web**: Source code of the web page [https://shiftworkerexport.com/](https://shiftworkerexport.com/), hosted on Netlify

3. **shiftworker-backend**: Backend service (Google Cloud Function) that processes file uploads and generates iCal files.

## Getting Started

To get started with the Shiftworker to Google Calendar Exporter project, follow these steps:

1. If you wish to use the command-line tool, please refer to the readme in the core project for instructions.

2. Alternatively, you can visit [https://shiftworkerexport.com/](https://shiftworkerexport.com/) to use the user-friendly web interface.

## Support

If you encounter any issues, have questions, or need assistance, please [open an issue](https://github.com/Quist/shiftworker-to-ical/issues) in this repository. Our team will be happy to assist you.

---
Happy exporting!
