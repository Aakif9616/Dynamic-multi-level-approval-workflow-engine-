# Dynamic Approval Workflow Engine with Camunda BPM

A comprehensive Spring Boot application featuring a dynamic multi-level approval workflow system with Camunda BPM integration, RBAC (Role-Based Access Control), dynamic forms, and PostgreSQL database for persistent data storage.

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
- **Form Instance Tracking**: Unique Form Instance ID (FI-YYYYMMDD-NNNN) stays constant throughout workflow

### 4. Form Instance Architecture
- **Persistent Form Instance ID**: Each form submission gets a unique ID that never changes
- **Format**: FI-YYYYMMDD-NNNN (e.g., FI-20240303-0001)
- **Material ID Generation**: Generated at workflow completion as MAT-FI-YYYYMMDD-NNNN
- **Data Linking**: All form data linked to Form Instance ID, not process instance
- **Status Tracking**: DRAFT, IN_PROGRESS, COMPLETED, REJECTED

### 5. Admin Panel
- **Workflow Levels Management**: Create, edit, delete, and reorder approval levels
- **Form Builder**: Complete UI for creating and managing dynamic forms
- **Field Management**: Add, edit, delete, and reorder form fields
- **Real-time Configuration**: Changes take effect immediately

### 6. User Interface
- **Request Creation**: Select form and fill fields at Level 1
- **Task Management**: View and process pending tasks by role
- **Task Details Modal**: View form data, previous level inputs, and add current level data
- **Query/Rejection Handling**: Dedicated UI for raising queries and handling rejections
- **Responsive Design**: Bootstrap 5 based UI

## Technology Stack

- **Backend**: Spring Boot 3.2.0, Java 17
- **Workflow Engine**: Camunda BPM 7.20.0
- **Database**: PostgreSQL (persistent storage)
- **Frontend**: HTML5, JavaScript (ES6+), Bootstrap 5
- **Build Tool**: Maven
- **ORM**: Spring Data JPA with Hibernate

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- PostgreSQL 12+ installed
- pgAdmin 4 (recommended for database management)

## Database Setup

### Step 1: Install PostgreSQL

Download and install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/)

During installation:
- Set password for postgres user (e.g., admin123)
- Default port: 5432
- Install pgAdmin 4 (included with PostgreSQL installer)

### Step 2: Create Database

1. Open **pgAdmin 4**
2. Connect to PostgreSQL server (password: admin123)
3. Right-click on **Databases** → **Create** → **Database**
4. Enter database name: `workflow_db`
5. Owner: `postgres`
6. Click **Save**

### Step 3: Configure Application

The application is pre-configured for PostgreSQL in `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/workflow_db
    username: postgres
    password: admin123
```

**Important**: If your PostgreSQL password is different, update it in `application.yml`

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/Aakif9616/Dynamic-multi-level-approval-workflow-engine-.git
cd Dynamic-multi-level-approval-workflow-engine-
```

### 2. Build Project

```bash
mvn clean install
```

### 3. Run Application

```bash
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

### 4. Verify Database Tables

After starting the application, verify tables were created:

1. Open **pgAdmin 4**
2. Navigate to: `Servers → PostgreSQL → Databases → workflow_db → Schemas → public → Tables`
3. Right-click **Tables** → **Refresh**
4. You should see these tables:
   - `form` - Form templates
   - `form_field` - Form field definitions
   - `form_data` - Form submission data
   - `form_instance` - Form instance tracking (unique IDs)
   - `workflow_level` - Workflow configuration
   - `workflow_request` - Workflow requests
   - `role` - RBAC roles
   - `query_history` - Query tracking
   - `material_master` - Material IDs
   - Plus Camunda tables (act_*)

## Accessing Tables in pgAdmin 4

### Visual Navigation Path

```
pgAdmin 4
└── Servers
    └── PostgreSQL 16
        └── Databases
            └── workflow_db
                └── Schemas
                    └── public
                        └── Tables ← YOUR TABLES ARE HERE
                            ├── form
                            ├── form_data
                            ├── form_field
                            ├── form_instance
                            ├── workflow_level
                            └── ... (more tables)
```

### View Table Data

**Method 1: Right-Click Menu**
1. Right-click on any table (e.g., `form_instance`)
2. Select **View/Edit Data** → **All Rows**

**Method 2: SQL Query**
1. Right-click on `workflow_db`
2. Select **Query Tool**
3. Run queries:

```sql
-- View all form instances
SELECT * FROM form_instance ORDER BY created_at DESC;

-- View form data with instance ID
SELECT fd.*, fi.form_instance_id 
FROM form_data fd
JOIN form_instance fi ON fd.form_instance_id = fi.form_instance_id
ORDER BY fd.entered_at DESC;

-- View completed workflows with Material IDs
SELECT form_instance_id, material_id, status, completed_at
FROM form_instance 
WHERE status = 'COMPLETED';

-- View workflow levels
SELECT * FROM workflow_level ORDER BY level_order;

-- View all forms
SELECT * FROM form WHERE is_active = true;
```

## Default Access Points

- **Main Application**: http://localhost:8080/
- **Admin Panel**: http://localhost:8080/admin.html
- **Camunda Cockpit**: http://localhost:8080/camunda
  - Username: `admin`
  - Password: `admin`

## Usage Guide

### 1. Configure Workflow Levels

1. Go to **Admin Panel** → **Workflow Levels** tab
2. Add levels (e.g., Level 1, Level 2, Level 3, Final Approver)
3. Configure each level:
   - Level Name
   - Role (auto-generated as ROLE_LEVEL1, ROLE_LEVEL2, etc.)
   - Next Level
   - Query Return Level
   - Mark final level checkbox
4. RBAC roles are automatically created/synced

### 2. Create Dynamic Forms

1. Go to **Admin Panel** → **Form Builder** tab
2. Click **Create New Form**
3. Enter form name (e.g., "Material Request Form")
4. Add fields to the form:
   - Select field type (TEXT, NUMBER, DROPDOWN, etc.)
   - Set field label and properties
   - Configure visibility (which levels can see this field)
   - Configure editability (which levels can edit this field)
   - Add validation rules
5. Click **Save Form**
6. Click **Activate** to make form available

### 3. Create Requests

1. Go to **Main Application** (http://localhost:8080)
2. Select a form from dropdown
3. Fill in fields that are editable at Level 1
4. Click **Submit Request**
5. Note the **Form Instance ID** displayed (e.g., FI-20240303-0001)

### 4. Process Approvals

1. Select your role from dropdown (e.g., ROLE_LEVEL2)
2. Click **Load Tasks**
3. Click on a task to open details modal
4. View:
   - Previous level data (read-only)
   - Current level editable fields
5. Fill your level's fields
6. Choose action:
   - **Approve** - Move to next level
   - **Reject** - Send back to Level 1
   - **Query** - Ask Level 1 a question
7. Click **Submit Decision**

### 5. Handle Queries

- **Raise Query**: Any level can ask Level 1 a question
- **Respond**: Level 1 responds to the query
- **Return**: Response goes back to the level that raised the query
- **Continue**: Original level can then proceed with approval

### 6. Handle Rejections

- **Reject**: Any level can reject and send to Level 1
- **Review**: Level 1 reviews the rejection reason
- **Resubmit**: Level 1 fixes issues and resubmits to rejected level
- **Cancel**: Level 1 can permanently cancel the request

### 7. Material ID Generation

When the final level approves:
- Material ID is automatically generated
- Format: MAT-FI-YYYYMMDD-NNNN (e.g., MAT-FI-20240303-0001)
- Based on the Form Instance ID
- Stored in `material_master` table

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
│   ├── FormInstanceService.java
│   ├── RBACService.java
│   └── WorkflowService.java
├── entity/             # JPA entities
│   ├── Form.java
│   ├── FormField.java
│   ├── FormData.java
│   ├── FormInstance.java
│   ├── WorkflowLevel.java
│   ├── WorkflowRequest.java
│   ├── Role.java
│   └── ...
├── repository/         # Data access layer
├── dto/               # Data transfer objects
├── delegate/          # Camunda delegates
│   └── MaterialIdGeneratorDelegate.java
└── WorkflowApplication.java

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
├── application.yml   # PostgreSQL configuration
└── data.sql         # Initial data
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

## Key Architecture Concepts

### Form Instance ID - The "Aakif" Concept

Think of Form Instance ID like a person named "Aakif":
- Aakif goes to college, home, and vacation
- In all these places, it's the **same Aakif** (same person)
- Similarly, Form Instance ID **stays constant** throughout the entire workflow

**Example Flow**:
```
1. User submits form → Form Instance ID created: FI-20240303-0001
2. Level 1 approves → Form Instance ID: FI-20240303-0001 (same)
3. Level 2 approves → Form Instance ID: FI-20240303-0001 (same)
4. Level 3 approves → Form Instance ID: FI-20240303-0001 (same)
5. Material ID generated → MAT-FI-20240303-0001 (based on Form Instance ID)
```

### Data Persistence

Unlike in-memory databases, PostgreSQL provides:
- **Permanent Storage**: Data survives application restarts
- **Query Capability**: Use pgAdmin to query and analyze data
- **Production Ready**: Suitable for real-world deployments
- **Backup & Recovery**: Standard PostgreSQL backup tools work

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

## Troubleshooting

### Application Won't Start

**Error**: "database workflow_db does not exist"
**Solution**: Create database in pgAdmin (see Database Setup section)

**Error**: "password authentication failed"
**Solution**: Update password in `application.yml` to match your PostgreSQL password

### Can't See Tables in pgAdmin

**Solution**: 
1. Make sure application has started successfully
2. Right-click **Tables** → **Refresh**
3. Check you're looking in: workflow_db → Schemas → public → Tables

### Port Already in Use

```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Browser Cache Issues

Always hard refresh after code changes:
- Windows: `Ctrl + Shift + R` or `Ctrl + F5`
- Mac: `Cmd + Shift + R`

### PostgreSQL Service Not Running

**Windows**:
1. Open Services (Win + R → services.msc)
2. Find "postgresql-x64-16" service
3. Right-click → Start

**Linux**:
```bash
sudo systemctl start postgresql
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

### Security Considerations

1. **Change Default Credentials**:
   - Update Camunda admin password in `application.yml`
   - Use strong PostgreSQL password

2. **Environment Variables**:
   ```yaml
   spring:
     datasource:
       url: ${DB_URL:jdbc:postgresql://localhost:5432/workflow_db}
       username: ${DB_USERNAME:postgres}
       password: ${DB_PASSWORD}
   ```

3. **Enable HTTPS**: Configure SSL/TLS certificates

4. **Implement Authentication**: Add Spring Security for user authentication

5. **Configure CORS**: Restrict allowed origins

6. **Database Backup**: Set up regular PostgreSQL backups

### Running as Service

**Windows**:
```bash
# Create Windows Service using NSSM or similar
nssm install WorkflowApp "java" "-jar target/dynamic-approval-workflow-1.0.0.jar"
```

**Linux (systemd)**:
```bash
# Create /etc/systemd/system/workflow.service
[Unit]
Description=Dynamic Approval Workflow
After=postgresql.service

[Service]
User=workflow
ExecStart=/usr/bin/java -jar /opt/workflow/app.jar
Restart=always

[Install]
WantedBy=multi-user.target
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Check the troubleshooting section
- Review pgAdmin tables for data verification
- Check browser console and backend logs for errors
- Open an issue on GitHub

## Acknowledgments

- Camunda BPM for the workflow engine
- Spring Boot for the application framework
- PostgreSQL for reliable data storage
- Bootstrap for the UI components
