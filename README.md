# Dynamic Multi-Level Approval Workflow Engine

A flexible, database-driven approval workflow system built with **Camunda BPM** and **Spring Boot**. This engine supports dynamic approval levels, query/response mechanisms, and rejection handling - all configurable through an admin panel without code changes.

## 🚀 Features

- **Dynamic Approval Levels**: Configure 1-N approval levels via admin panel
- **Database-Driven Configuration**: Workflow structure stored in database, not hardcoded
- **Query Mechanism**: Any level can raise queries to Level 1 and receive responses
- **Rejection Handling**: Rejected requests route to Level 1 for review and resubmission
- **Material ID Generation**: Automatic ID generation upon final approval
- **Admin Panel**: Manage workflow levels without restarting the application
- **Camunda Integration**: Full access to Camunda Cockpit, Tasklist, and Admin
- **REST APIs**: Complete API for workflow operations

## 📋 Prerequisites

- **Java 17** or higher
- **Maven 3.6+**
- **Git** (for cloning)

## 🛠️ Technology Stack

- **Backend**: Spring Boot 3.2.0
- **Workflow Engine**: Camunda BPM 7.20.0
- **Database**: H2 (in-memory, can be replaced with PostgreSQL/MySQL)
- **Frontend**: HTML, CSS, JavaScript (Bootstrap 5)
- **Build Tool**: Maven

## 📦 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/camunda-dynamic-workflow-engine.git
cd camunda-dynamic-workflow-engine
```

### 2. Run the Application

```bash
mvn spring-boot:run
```

The application will start on **http://localhost:8080**

### 3. Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| **Main UI** | http://localhost:8080 | N/A |
| **Admin Panel** | http://localhost:8080/admin.html | N/A |
| **Camunda Cockpit** | http://localhost:8080/camunda | admin/admin |
| **H2 Console** | http://localhost:8080/h2-console | jdbc:h2:mem:workflowdb, user: sa, password: (empty) |

## 🎯 How It Works

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface (HTML/JS)                 │
├─────────────────────────────────────────────────────────────┤
│                     REST Controllers                         │
│  ┌──────────────────┐        ┌──────────────────┐          │
│  │ WorkflowController│        │  AdminController │          │
│  └──────────────────┘        └──────────────────┘          │
├─────────────────────────────────────────────────────────────┤
│                     Workflow Service                         │
│  • Process Management  • Query Handling  • Approvals        │
├─────────────────────────────────────────────────────────────┤
│                     Camunda BPM Engine                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Dynamic Approval Process (BPMN)                     │  │
│  │  • Gateway Decisions  • User Tasks  • Subprocesses   │  │
│  └──────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                     Data Layer (JPA)                         │
│  • WorkflowRequest  • WorkflowLevel  • QueryHistory         │
│  • MaterialMaster                                            │
└─────────────────────────────────────────────────────────────┘
```

### Workflow Process Flow

1. **Request Creation**
   - User submits a workflow request (product name, description)
   - System creates a Camunda process instance
   - Task assigned to Level 1

2. **Approval Flow**
   - Each level can: **Approve**, **Reject**, or **Raise Query**
   - On **Approve**: Task moves to next level (or completes if final level)
   - On **Reject**: Task routes to Level 1 for review
   - On **Query**: Task routes to Level 1 for response, then returns to original level

3. **Dynamic Level Routing**
   - Workflow levels loaded from database at runtime
   - BPMN uses expressions: `${workflowLevels[currentLevel]['role']}`
   - No code changes needed when adding/removing levels

4. **Material ID Generation**
   - Upon final approval, subprocess generates unique Material ID
   - Format: `MAT-{timestamp}-{random}`
   - Stored in `material_master` table

### Database Schema

#### workflow_requests
| Column | Type | Description |
|--------|------|-------------|
| request_id | BIGINT | Primary key |
| requester | VARCHAR | Name of requester |
| product_name | VARCHAR | Product name |
| description | VARCHAR | Request description |
| status | VARCHAR | PENDING/APPROVED/REJECTED |
| current_level | INTEGER | Current approval level |
| process_instance_id | VARCHAR | Camunda process ID |

#### workflow_levels
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| level_name | VARCHAR | Display name (e.g., "Level 1 Approver") |
| level_order | INTEGER | Sequence number (1, 2, 3...) |
| role | VARCHAR | Camunda role (e.g., "ROLE_LEVEL1") |
| next_level | INTEGER | Next level in sequence |
| enabled | BOOLEAN | Active/inactive flag |

#### query_history
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| request_id | BIGINT | Foreign key to workflow_requests |
| from_level | INTEGER | Level that raised query |
| to_level | INTEGER | Level that responds (usually 1) |
| query_text | VARCHAR | Question text |
| response_text | VARCHAR | Answer text |
| status | VARCHAR | PENDING/RESOLVED |

#### material_master
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| request_id | BIGINT | Foreign key to workflow_requests |
| material_id | VARCHAR | Generated unique ID |
| product_name | VARCHAR | Product name |

## 📖 Usage Guide

### Creating a Workflow Request

1. Go to http://localhost:8080
2. Fill in the form:
   - **Requester**: Your name
   - **Product Name**: Product to be approved
   - **Description**: Details about the request
3. Click **Create Request**
4. Note the Request ID and Process Instance ID

### Approving Tasks

1. Select your role from the dropdown (e.g., "Level 1 Approver")
2. Click **Load Tasks** to see pending tasks
3. Click **Open Task** on a task
4. Choose an action:
   - **Approve**: Move to next level
   - **Reject**: Send to Level 1 for review
   - **Raise Query**: Ask Level 1 a question
5. Add comments (optional)
6. Click **Submit Decision**

### Handling Queries

**Raising a Query (Any Level):**
1. Open a task
2. Select "Raise Query"
3. Enter your question
4. Submit

**Responding to Query (Level 1):**
1. Switch to "Level 1 Approver"
2. Open the "Handle Query" task
3. You'll see the question from the other level
4. Select "Respond to Query"
5. Enter your response
6. Submit
7. Task automatically returns to the level that asked

**Viewing Query Response:**
- When the task returns, open it
- You'll see a green box with the question and response

### Handling Rejections

**Rejecting a Request (Any Level):**
1. Open a task
2. Select "Reject (Send to Level 1 for review)"
3. Add reason for rejection
4. Submit

**Handling Rejection (Level 1):**
1. Switch to "Level 1 Approver"
2. Open the "Handle Rejection" task
3. You'll see which level rejected and why
4. Choose:
   - **Resubmit**: Fix issues and send back to rejected level
   - **Cancel**: Permanently reject the request
5. Submit

### Managing Workflow Levels (Admin Panel)

1. Go to http://localhost:8080/admin.html
2. View current levels in the table
3. **Add New Level**:
   - Click "Add New Level"
   - Fill in: Level Name, Level Order, Role, Next Level
   - Click "Save Level"
4. **Edit Level**:
   - Click "Edit" on a level
   - Modify fields
   - Click "Update Level"
5. **Enable/Disable Level**:
   - Click "Disable" to deactivate (or "Enable" to reactivate)
6. **Delete Level**:
   - Click "Delete" (use with caution)

**Note**: Changes take effect immediately for new requests. Existing requests continue with their original configuration.

## 🔧 Configuration

### Database Configuration

Edit `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:workflowdb
    driver-class-name: org.h2.Driver
    username: sa
    password:
  jpa:
    database-platform: org.hibernate.dialect.H2Dialect
    hibernate:
      ddl-auto: create-drop  # Change to 'update' for production
```

**For Production (PostgreSQL)**:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/workflow_db
    driver-class-name: org.postgresql.Driver
    username: your_username
    password: your_password
  jpa:
    database-platform: org.hibernate.dialect.PostgreSQLDialect
    hibernate:
      ddl-auto: update
```

### Camunda Configuration

```yaml
camunda:
  bpm:
    admin-user:
      id: admin
      password: admin
      firstName: Admin
      lastName: Admin
    database:
      schema-update: create-drop  # Change to 'true' for production
    job-execution:
      enabled: true
```

## 🧪 Testing

### Manual Testing Steps

1. **Test Normal Approval Flow**:
   - Create request → Approve at Level 1 → Approve at Level 2 → Approve at Level 3
   - Verify Material ID is generated

2. **Test Query Feature**:
   - Create request → Approve Level 1 → At Level 2, raise query
   - Switch to Level 1 → Respond to query
   - Switch back to Level 2 → Verify response is visible → Approve

3. **Test Rejection with Resubmit**:
   - Create request → Approve Level 1 → Reject at Level 2
   - Switch to Level 1 → Select Resubmit
   - Switch to Level 2 → Verify task returned → Approve

4. **Test Rejection with Cancel**:
   - Create request → Approve Level 1 → Reject at Level 2
   - Switch to Level 1 → Select Cancel
   - Verify process ends (no more tasks)

5. **Test Dynamic Levels**:
   - Add Level 4 via admin panel
   - Create new request
   - Verify it goes through all 4 levels

### Using Camunda Cockpit

1. Go to http://localhost:8080/camunda
2. Login: admin/admin
3. Click **Cockpit**
4. View running process instances
5. Click on a process to see:
   - Current task position in diagram
   - Process variables
   - Execution history
   - Incident reports (if any errors)

## 📡 API Endpoints

### Workflow APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/workflow/requests` | Create new workflow request |
| GET | `/api/workflow/tasks?role={role}` | Get pending tasks for a role |
| POST | `/api/workflow/approve` | Approve/reject/query a task |
| POST | `/api/workflow/query/raise` | Raise a query |
| GET | `/api/workflow/query/history/{requestId}` | Get query history |
| GET | `/api/workflow/process/{processInstanceId}/variables` | Get process variables |

### Admin APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/levels` | Get all workflow levels |
| POST | `/api/admin/levels` | Create new level |
| PUT | `/api/admin/levels/{id}` | Update level |
| DELETE | `/api/admin/levels/{id}` | Delete level |

### Example API Calls

**Create Request:**
```bash
curl -X POST http://localhost:8080/api/workflow/requests \
  -H "Content-Type: application/json" \
  -d '{
    "requester": "John Doe",
    "productName": "New Product",
    "description": "Product description"
  }'
```

**Get Tasks:**
```bash
curl http://localhost:8080/api/workflow/tasks?role=ROLE_LEVEL1
```

**Approve Task:**
```bash
curl -X POST http://localhost:8080/api/workflow/approve \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "task-id-here",
    "decision": "APPROVE",
    "comments": "Looks good"
  }'
```

## 🐛 Troubleshooting

### Application Won't Start

**Error**: Port 8080 already in use
```bash
# Windows
netstat -ano | findstr :8080
taskkill /F /PID <PID>

# Linux/Mac
lsof -i :8080
kill -9 <PID>
```

### Tasks Not Showing

1. **Hard refresh browser**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Clear browser cache** or use Incognito mode
3. **Check role**: Ensure you selected the correct role in dropdown
4. **Check database**: Verify levels exist in `workflow_levels` table

### Rejection Not Working

1. **Check logs**: Look for "Processing task" and "Set decision variable" messages
2. **Check Camunda Cockpit**: Verify `decision` variable is set to 'REJECT'
3. **Check Level 1 role**: Ensure Level 1 has role `ROLE_LEVEL1` in database

### Query Response Not Showing

1. **Hard refresh**: Ctrl+Shift+R
2. **Check database**: Verify query status is 'RESOLVED' in `query_history` table
3. **Check response_text**: Ensure it's not null

## 🏗️ Project Structure

```
camunda-generic-workflow-engine/
├── src/
│   └── main/
│       ├── java/com/workflow/
│       │   ├── WorkflowApplication.java          # Main application
│       │   ├── controller/
│       │   │   ├── WorkflowController.java       # Workflow REST APIs
│       │   │   └── AdminController.java          # Admin REST APIs
│       │   ├── service/
│       │   │   └── WorkflowService.java          # Business logic
│       │   ├── entity/
│       │   │   ├── WorkflowRequest.java          # Request entity
│       │   │   ├── WorkflowLevel.java            # Level configuration
│       │   │   ├── QueryHistory.java             # Query tracking
│       │   │   └── MaterialMaster.java           # Generated materials
│       │   ├── repository/
│       │   │   ├── WorkflowRequestRepository.java
│       │   │   ├── WorkflowLevelRepository.java
│       │   │   ├── QueryHistoryRepository.java
│       │   │   └── MaterialMasterRepository.java
│       │   ├── dto/
│       │   │   ├── WorkflowRequestDTO.java
│       │   │   ├── ApprovalDecisionDTO.java
│       │   │   ├── QueryRequestDTO.java
│       │   │   └── QueryResponseDTO.java
│       │   └── delegate/
│       │       └── MaterialIdGeneratorDelegate.java  # Material ID generation
│       └── resources/
│           ├── application.yml                   # Application config
│           ├── data.sql                          # Initial data
│           ├── processes/
│           │   ├── dynamic-approval-process.bpmn # Main workflow
│           │   └── material-id-generation-process.bpmn
│           └── static/
│               ├── index.html                    # Main UI
│               ├── admin.html                    # Admin panel
│               ├── app.js                        # Main UI logic
│               ├── admin.js                      # Admin panel logic
│               └── styles.css                    # Styling
├── pom.xml                                       # Maven dependencies
├── .gitignore                                    # Git ignore rules
└── README.md                                     # This file
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Camunda BPM](https://camunda.com/) - Workflow and decision automation platform
- [Spring Boot](https://spring.io/projects/spring-boot) - Application framework
- [Bootstrap](https://getbootstrap.com/) - Frontend framework

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review Camunda documentation: https://docs.camunda.org/

## 🔄 Version History

- **v1.0.0** - Initial release
  - Dynamic approval levels
  - Query/response mechanism
  - Rejection handling
  - Admin panel
  - Material ID generation

---

**Built with ❤️ using Camunda BPM and Spring Boot**
