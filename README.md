# Dynamic Approval Workflow Engine with Camunda BPM

A comprehensive Spring Boot application featuring a dynamic multi-level approval workflow system with Camunda BPM integration, RBAC (Role-Based Access Control), and customizable dynamic forms.

## Features

### 1. Dynamic Multi-Level Workflow
- **Database-Driven Configuration**: Workflow levels stored in database, no code changes needed
- **Flexible Level Management**: Add, edit, or remove approval levels through Admin Panel
- **Automatic Material ID Generation**: Integrated subprocess for generating unique material IDs
- **Query & Rejection Handling**: 
  - Any level can raise queries → routed to Level 1 → response returns to originating level
  - Any level can reject → routed to Level 1 → Level 1 can resubmit or cancel
- **Process Tracking**: Full visibility of request status and history

### 2. Role-Based Access Control (RBAC)
- **Auto-Sync with Workflow Levels**: RBAC roles automatically created/updated when workflow levels change
- **Granular Permissions**:
  - **Level 1**: CREATE_REQUEST, VIEW_REQUEST (cannot approve own requests)
  - **Levels 2+**: APPROVE_TASK, QUERY_TASK, EDIT_REQUEST, VIEW_REQUEST
  - **Final Level**: All approver permissions + DELETE_REQUEST, VIEW_ALL_REQUESTS, MANAGE_LEVELS
- **Single Final Level**: System ensures only one level is marked as final
- **Permission Validation**: All operations validated against user roles

### 3. Dynamic Forms System
- **Form Builder UI**: Create and manage custom forms through Admin Panel
- **8 Field Types Supported**:
  - TEXT, EMAIL, TEXTAREA
  - NUMBER, DATE
  - DROPDOWN, RADIO, CHECKBOX
- **Level-Based Configuration**:
  - **Visible at Levels**: Control which levels can see each field
  - **Editable at Levels**: Control which levels can edit each field
- **Progressive Data Collection**: Same form flows through all levels, each level adds their data
- **Field Validation**: Required fields, placeholder text, help text
- **Data Persistence**: All form data stored in database linked to process instance

### 4. Admin Panel
- **Workflow Levels Management**: Create, edit, delete, and reorder approval levels
- **Form Builder**: Complete UI for creating and managing dynamic forms
- **Field Management**: Add, edit, delete, and reorder form fields
- **Real-time Configuration**: Changes take effect immediately

### 5. User Interface
- **Request Creation**: Select form and fill fields at Level 1
- **Task Management**: View and process pending tasks by role
- **Task Details Modal**: View form data, previous level inputs, and add current level data
- **Query/Rejection Handling**: Dedicated UI for raising queries and handling rejections
- **Responsive Design**: Bootstrap 5 based UI

## Technology Stack

- **Backend**: Spring Boot 3.2.0, Java 17
- **Workflow Engine**: Camunda BPM 7.20.0
- **Database**: H2 (in-memory, can be switched to PostgreSQL/MySQL)
- **Frontend**: HTML5, JavaScript (ES6+), Bootstrap 5
- **Build Tool**: Maven
- **ORM**: Spring Data JPA with Hibernate

## Quick Start

### Prerequisites
- Java 17 or higher
- Maven 3.6+

### Running the Application

```bash
# Clone the repository
git clone <repository-url>
cd camunda-generic-workflow-engine

# Run the application
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

### Default Access Points

- **Main Application**: http://localhost:8080/
- **Admin Panel**: http://localhost:8080/admin.html
- **Camunda Cockpit**: http://localhost:8080/camunda (admin/admin)
- **H2 Console**: http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:mem:workflowdb`
  - Username: `sa`
  - Password: (empty)

## Usage Guide

### 1. Configure Workflow Levels

1. Go to Admin Panel → Workflow Levels tab
2. Add levels (e.g., Level 1, Level 2, Level 3, Final Approver)
3. Configure each level:
   - Level Name
   - Role (auto-generated)
   - Next Level
   - Query Return Level
   - Mark final level
4. RBAC roles are automatically created/synced

### 2. Create Dynamic Forms

1. Go to Admin Panel → Form Builder tab
2. Click "Create New Form"
3. Add fields to the form:
   - Configure field type
   - Set visibility (which levels can see)
   - Set editability (which levels can edit)
   - Add validation rules
4. Activate the form

### 3. Create Requests

1. Go to Main Application
2. Select a form (or use basic form)
3. Fill in fields editable at Level 1
4. Submit request

### 4. Process Approvals

1. Select your role from dropdown
2. Click "Load Tasks"
3. Open a task to view:
   - Previous level data (read-only)
   - Current level editable fields
4. Fill your level's fields
5. Choose action: Approve, Reject, or Query
6. Submit decision

### 5. Handle Queries

- **Raise Query**: Any level can ask Level 1 a question
- **Respond**: Level 1 responds to the query
- **Return**: Response goes back to the level that raised the query
- **Continue**: Original level can then proceed with approval

### 6. Handle Rejections

- **Reject**: Any level can reject and send to Level 1
- **Review**: Level 1 reviews the rejection
- **Resubmit**: Level 1 fixes issues and resubmits to rejected level
- **Cancel**: Level 1 can permanently cancel the request

## Project Structure

```
src/main/java/com/workflow/
├── controller/          # REST API endpoints
│   ├── AdminController.java
│   ├── FormController.java
│   ├── RBACController.java
│   └── WorkflowController.java
├── service/            # Business logic
│   ├── DynamicFormService.java
│   ├── RBACService.java
│   └── WorkflowService.java
├── entity/             # JPA entities
│   ├── Form.java
│   ├── FormField.java
│   ├── FormData.java
│   ├── WorkflowLevel.java
│   ├── WorkflowRequest.java
│   ├── Role.java
│   └── ...
├── repository/         # Data access layer
├── dto/               # Data transfer objects
└── delegate/          # Camunda delegates

src/main/resources/
├── processes/         # BPMN workflow definitions
│   ├── dynamic-approval-process.bpmn
│   └── material-id-generation-process.bpmn
├── static/           # Frontend files
│   ├── index.html
│   ├── admin.html
│   ├── app.js
│   ├── admin.js
│   └── styles.css
├── application.yml   # Application configuration
└── data.sql         # Initial data

docs/                # Documentation
├── ADMIN_PANEL_GUIDE.md
├── AUTO_SYNC_GUIDE.md
├── FORM_BUILDER_GUIDE.md
├── WORKFLOW_FORMS_GUIDE.md
└── ...
```

## API Endpoints

### Workflow Management
- `POST /api/workflow/requests` - Create new request
- `GET /api/workflow/tasks?role={role}` - Get pending tasks
- `POST /api/workflow/approve` - Approve/reject task
- `POST /api/workflow/query/raise` - Raise query
- `GET /api/workflow/query/history/{requestId}` - Get query history

### Admin Operations
- `GET /api/admin/levels` - Get all workflow levels
- `POST /api/admin/levels` - Create workflow level
- `PUT /api/admin/levels/{id}` - Update workflow level
- `DELETE /api/admin/levels/{id}` - Delete workflow level

### Form Management
- `GET /api/forms/active` - Get active forms
- `POST /api/forms` - Create form
- `POST /api/forms/{formId}/fields` - Add field to form
- `GET /api/forms/{id}/render?level={level}` - Render form for level
- `POST /api/forms/submit` - Submit form data

### RBAC
- `GET /api/rbac/roles` - Get all roles
- `GET /api/rbac/permissions` - Get all permissions

## Configuration

### Database Configuration (application.yml)

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:workflowdb
    driver-class-name: org.h2.Driver
    username: sa
    password:
  jpa:
    hibernate:
      ddl-auto: create-drop  # Change to 'update' for production
```

### Camunda Configuration

```yaml
camunda:
  bpm:
    admin-user:
      id: admin
      password: admin
    filter:
      create: All tasks
```

## Key Features Explained

### Progressive Form Data Collection

Forms flow through all approval levels with each level contributing data:

1. **Level 1** creates request → fills fields editable at Level 1
2. **Level 2** approves → sees Level 1 data (read-only) + fills Level 2 fields
3. **Level 3** approves → sees Level 1 & 2 data (read-only) + fills Level 3 fields
4. **Final Level** approves → sees all data + adds final comments

### Auto-Sync RBAC

When you add/edit/delete workflow levels:
- RBAC roles are automatically created/updated/deleted
- Permissions are assigned based on level order
- Final level gets admin permissions
- No manual RBAC management needed

### Query Routing

```
Level 3 raises query → Level 1 receives → Level 1 responds → Level 3 receives response → Level 3 continues
```

### Rejection Routing

```
Level 3 rejects → Level 1 receives → Level 1 fixes → Resubmits to Level 3 → Level 3 reviews again
```

## Development

### Building the Project

```bash
mvn clean install
```

### Running Tests

```bash
mvn test
```

### Packaging

```bash
mvn clean package
```

The JAR file will be created in `target/` directory.

## Production Deployment

### Database Configuration

For production, switch to a persistent database:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/workflowdb
    username: your_username
    password: your_password
  jpa:
    hibernate:
      ddl-auto: update
```

### Security Considerations

1. Change default Camunda admin credentials
2. Implement proper authentication/authorization
3. Use HTTPS in production
4. Secure H2 console or disable it
5. Configure CORS properly
6. Use environment variables for sensitive data

## Troubleshooting

### Port Already in Use

```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8080
kill -9 <PID>
```

### Browser Cache Issues

Always hard refresh after code changes:
- Windows: `Ctrl + Shift + R` or `Ctrl + F5`
- Mac: `Cmd + Shift + R`

### Database Reset

The H2 database resets on application restart (create-drop mode). For persistent data, switch to update mode or use external database.

## Documentation

Detailed guides available in the `docs/` directory:

- **ADMIN_PANEL_GUIDE.md** - Complete admin panel usage
- **FORM_BUILDER_GUIDE.md** - Creating and managing forms
- **WORKFLOW_FORMS_GUIDE.md** - Understanding form flow
- **AUTO_SYNC_GUIDE.md** - RBAC auto-sync explained
- **TESTING_GUIDE.md** - Step-by-step testing guide
- **QUICK_START.md** - Quick start guide

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Check the documentation in `docs/` folder
- Review the troubleshooting section
- Check browser console and backend logs for errors

## Acknowledgments

- Camunda BPM for the workflow engine
- Spring Boot for the application framework
- Bootstrap for the UI components
