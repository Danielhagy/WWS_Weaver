Project Prompt for AI Assistant: Low-Code Workday Integration Platform
Project Title: Stitch ERP

Overall Goal: Build a secure, multi-tenant web application that allows non-technical users (like HR personnel) to create, manage, and execute inbound integrations for Workday. The platform will provide a user-friendly, low-code/no-code interface to map data from an uploaded file (e.g., CSV) to a selected Workday SOAP web service, apply data transformations, and generate the necessary requests.

Core User Persona
User: An HR analyst or Workday administrator.

Technical Skill: Comfortable with data in spreadsheets but has little to no experience with coding, APIs, or XML.

Goal: To quickly and reliably get data from a source file (like a new hire report) into Workday without relying on IT or technical developers.

Recommended UI/UX Approach: The Integration Builder Dashboard
For the low-code/no-code experience, a guided, multi-step wizard or a tabbed dashboard interface is the most effective approach. This guides the user through a logical sequence, preventing them from feeling overwhelmed.

Workflow within the "Create New Integration" wizard:

Configuration: Name the integration and select the target Workday Web Service from a pre-populated dropdown (e.g., Submit_Employee_Personal_Info, Add_Job_Family).

Source & Mapping: Upload a sample file. The UI will auto-detect headers and display them. The user will then drag-and-drop or use dropdowns to map their file's columns to the required Workday fields displayed by the application.

Transformations: For each mapped field, the user can optionally add functions from a predefined list (e.g., format-date, text-to-uppercase).

Validation (Optional): The user can specify a Get_Workers request to validate data against existing tenant information before sending the final request.

Review & Save: Display a summary of the integration's configuration before saving.

This structured approach is superior to a single, complex form because it breaks the process into manageable steps, reducing cognitive load and errors.

Key Features & Requirements
Secure Credential Management: The dashboard must have a secure section where a user can input and store their Workday ISU (Integration System User) credentials (username, password). These credentials must be encrypted at rest.

Dynamic Web Service Support: The system should be pre-configured with a list of common Workday SOAP web services. The UI must dynamically display the required fields for whichever service the user selects.

Visual Field Mapper: An intuitive drag-and-drop or dropdown interface to map source file columns to destination Workday fields.

Data Transformation Engine: A library of simple, chainable functions that can be applied to mapped fields. The initial function will be format-date(YYYY-MM-DD).

Ad-Hoc Testing Utility: A "Test Run" feature that allows the user to upload a file and execute the integration directly from the UI, showing the generated SOAP request and the Workday response in real-time.

Webhook Endpoint: Once an integration is built and saved, the system must generate a unique, secure webhook URL. Sending a file to this URL will trigger the integration automatically.

Comprehensive Logging: The system must maintain a history of all integration runs, whether triggered via webhook or a test run. Logs should be easily searchable and clearly display the status (Success/Failure), timestamps, and any error messages from Workday.

Data Validation Logic: Allow users to configure a "pre-flight" check using a Workday Get operation (e.g., Get_Workers) to validate data before executing the main request.

Suggested Tech Stack
Frontend: React or Vue.js (for a dynamic, component-based UI). Use a component library like Material-UI or Ant Design for a professional and intuitive look.

Backend: Node.js with Express.js (excellent for handling APIs and webhooks).

Database: PostgreSQL or MongoDB (to store user data, credentials, integration configurations, and run logs).

Key Libraries:

axios or node-fetch for making HTTP requests to Workday.

xmlbuilder-js or a similar library to dynamically construct SOAP XML payloads.

papaparse or csv-parser for handling CSV file uploads.

jsonwebtoken and bcrypt for user authentication and security.

Development Milestones
Here is a logical breakdown of the project into actionable milestones.

Milestone 1: Project Setup & Core Integration Builder UI
Objective: Create the foundational structure of the application and the main user-facing tool for building an integration.

Tasks:

Initialize a React frontend and a Node.js/Express backend project.

Set up basic routing for the application (e.g., /dashboard, /integrations/new).

Build the static UI for the multi-step "Create New Integration" wizard.

Step 1 - Configuration: Create a form to name the integration and select a web service from a hardcoded list for now.

Step 2 - Source & Mapping:

Implement file upload functionality (client-side only for now).

Use a library like papaparse to parse the CSV in the browser and display the header columns.

Statically display a list of target Workday fields next to the parsed headers.

Create the UI for mapping (e.g., a dropdown next to each Workday field that lists the CSV headers).

Step 3 - Transformations: Add a small icon next to each mapping that, when clicked, allows the user to select the format-date function.

Implement a client-side state management solution (like Redux Toolkit or Zustand) to hold the integration configuration as the user moves through the wizard.

Milestone 2: Backend Foundation & SOAP Generation
Objective: Build the backend logic to receive an integration configuration and generate a valid Workday SOAP request.

Tasks:

Create database schemas for Users, Credentials, and Integrations.

Implement basic user registration and login functionality with JWT authentication.

Create a secure API endpoint for storing encrypted Workday ISU credentials.

Create an API endpoint /api/integrations/generate-soap that accepts a JSON object representing the integration configuration (mappings, transformations) and a sample data row.

On the backend, write the core logic that uses this configuration to dynamically build a Workday SOAP XML string using a library like xmlbuilder-js.

Connect the frontend's "Test Run" button to this new endpoint and display the generated XML in the UI.

Milestone 3: Live Workday Communication & Testing
Objective: Enable the application to communicate directly with Workday for testing and data validation.

Tasks:

Create a secure backend service that can retrieve a user's credentials and make a POST request to a Workday SOAP endpoint.

Enhance the "Test Run" feature:

The backend now takes the generated SOAP request and sends it to the actual Workday tenant URL specified in the user's settings.

It should capture the full SOAP response from Workday.

The response (success or error) is then sent back to the frontend and displayed in a formatted, easy-to-read way.

Implement the Get_Workers validation logic as part of the test run.

Milestone 4: Full Integration Lifecycle - Saving, Webhooks, and Logging
Objective: Finalize the integration creation process and enable automated execution via webhooks.

Tasks:

Implement the "Save Integration" functionality, storing the complete configuration in the database.

Create a main dashboard page that lists all of the user's saved integrations.

For each saved integration, generate a unique and secure webhook URL (e.g., /api/webhooks/execute/{unique_integration_id}).

Create the backend logic for this webhook endpoint:

It must be able to receive a file (multipart/form-data).

It parses the file, applies the saved mappings and transformations for each row, generates SOAP requests, and sends them to Workday.

Create a Logs table in the database.

Implement the logging service. Every run (test or webhook) creates a log entry with status, a timestamp, and any error messages.

Create a "History" or "Logs" view in the UI where users can see the run history for each of their integrations.