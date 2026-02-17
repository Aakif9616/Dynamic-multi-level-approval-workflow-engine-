const API_BASE = '/api';
let currentTaskId = null;
let currentRequestId = null;
let currentProcessInstanceId = null;

// Load workflow levels dynamically on page load
async function loadWorkflowLevels() {
    try {
        const response = await fetch(`${API_BASE}/admin/levels`);
        const levels = await response.json();
        
        // Filter only enabled levels and sort by level_order
        const enabledLevels = levels
            .filter(level => level.enabled)
            .sort((a, b) => a.levelOrder - b.levelOrder);
        
        // Populate the role select dropdown
        const roleSelect = document.getElementById('roleSelect');
        roleSelect.innerHTML = ''; // Clear existing options
        
        enabledLevels.forEach(level => {
            const option = document.createElement('option');
            option.value = level.role;
            option.textContent = level.levelName;
            roleSelect.appendChild(option);
        });
        
        // Update active levels count
        const activeLevelsElement = document.getElementById('activeLevels');
        if (activeLevelsElement) {
            activeLevelsElement.textContent = enabledLevels.length;
        }
        
        console.log(`Loaded ${enabledLevels.length} workflow levels from database`);
    } catch (error) {
        console.error('Error loading workflow levels:', error);
        // Fallback to default levels if API fails
        const roleSelect = document.getElementById('roleSelect');
        roleSelect.innerHTML = `
            <option value="ROLE_LEVEL1">Level 1 Approver</option>
            <option value="ROLE_LEVEL2">Level 2 Approver</option>
            <option value="ROLE_LEVEL3">Level 3 Approver</option>
        `;
    }
}

document.getElementById('createRequestForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const data = {
        requester: document.getElementById('requester').value,
        productName: document.getElementById('productName').value,
        description: document.getElementById('description').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/workflow/requests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        document.getElementById('createResult').innerHTML = 
            `<div class="alert alert-success">Request created! ID: ${result.requestId}, Process: ${result.processInstanceId}</div>`;
        document.getElementById('createRequestForm').reset();
    } catch (error) {
        document.getElementById('createResult').innerHTML = 
            `<div class="alert alert-danger">Error: ${error.message}</div>`;
    }
});

async function loadTasks() {
    const role = document.getElementById('roleSelect').value;
    
    try {
        const response = await fetch(`${API_BASE}/workflow/tasks?role=${role}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const tasks = await response.json();
        
        // Check if tasks is an array
        if (!Array.isArray(tasks)) {
            console.error('Tasks is not an array:', tasks);
            document.getElementById('tasksList').innerHTML = 
                '<div class="alert alert-warning">Invalid response from server. Please check console.</div>';
            return;
        }
        
        document.getElementById('pendingTasks').textContent = tasks.length;
        
        if (tasks.length === 0) {
            document.getElementById('tasksList').innerHTML = 
                '<div class="alert alert-info">No pending tasks</div>';
            return;
        }
        
        let html = '';
        tasks.forEach(task => {
            html += `
                <div class="task-item">
                    <strong>${task.name}</strong><br>
                    <small>Task ID: ${task.id}</small><br>
                    <small>Created: ${new Date(task.createTime).toLocaleString()}</small><br>
                    <button class="btn btn-sm btn-primary mt-2" onclick="openTask('${task.id}', '${task.processInstanceId}')">
                        Open Task
                    </button>
                </div>
            `;
        });
        
        document.getElementById('tasksList').innerHTML = html;
    } catch (error) {
        console.error('Error loading tasks:', error);
        document.getElementById('tasksList').innerHTML = 
            `<div class="alert alert-danger">Error loading tasks: ${error.message}</div>`;
    }
}

function openTask(taskId, processInstanceId) {
    currentTaskId = taskId;
    currentProcessInstanceId = processInstanceId;
    
    // Get the current role to fetch tasks
    const currentRole = document.getElementById('roleSelect').value;
    
    // Get task details to check task type and fetch process variables
    fetch(`${API_BASE}/workflow/tasks?role=${currentRole}`)
        .then(response => response.json())
        .then(async tasks => {
            const task = tasks.find(t => t.id === taskId);
            
            if (!task) {
                console.error('Task not found:', taskId);
                document.getElementById('taskDetails').innerHTML = `<p>Task ID: ${taskId}</p><p class="alert alert-warning">Task details not available</p>`;
                const modal = new bootstrap.Modal(document.getElementById('taskModal'));
                modal.show();
                return;
            }
            
            const isRejectionTask = task.name === 'Handle Rejection';
            const isQueryTask = task.name === 'Handle Query';
            
            console.log('Task name:', task.name, 'isQueryTask:', isQueryTask, 'isRejectionTask:', isRejectionTask);
            
            let taskDetailsHtml = `<p><strong>Task ID:</strong> ${taskId}</p>`;
            taskDetailsHtml += `<p><strong>Task Name:</strong> ${task.name}</p>`;
            
            // Check if there's a resolved query response to show
            if (processInstanceId && !isQueryTask && !isRejectionTask) {
                try {
                    const queryResponse = await fetch(`${API_BASE}/workflow/process/${processInstanceId}/variables`);
                    if (queryResponse.ok) {
                        const variables = await queryResponse.json();
                        if (variables.requestId) {
                            const queryHistoryResponse = await fetch(`${API_BASE}/workflow/query/history/${variables.requestId}`);
                            if (queryHistoryResponse.ok) {
                                const queryHistory = await queryHistoryResponse.json();
                                // Find the most recent resolved query
                                const resolvedQuery = queryHistory.find(q => q.status === 'RESOLVED');
                                if (resolvedQuery && resolvedQuery.responseText) {
                                    taskDetailsHtml += `
                                        <hr>
                                        <div class="alert alert-success">
                                            <p><strong>Query Response from Level ${resolvedQuery.toLevel}:</strong></p>
                                            <p><em>Your question:</em> ${resolvedQuery.queryText}</p>
                                            <p><em>Response:</em> ${resolvedQuery.responseText}</p>
                                        </div>
                                    `;
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error fetching query response:', error);
                }
            }
            
            // If it's a query task, fetch the query details
            if (isQueryTask && processInstanceId) {
                try {
                    // Fetch query history to get the query text
                    const queryResponse = await fetch(`${API_BASE}/workflow/process/${processInstanceId}/variables`);
                    if (queryResponse.ok) {
                        const variables = await queryResponse.json();
                        console.log('Process variables:', variables);
                        if (variables.requestId) {
                            const queryHistoryResponse = await fetch(`${API_BASE}/workflow/query/history/${variables.requestId}`);
                            if (queryHistoryResponse.ok) {
                                const queryHistory = await queryHistoryResponse.json();
                                const pendingQuery = queryHistory.find(q => q.status === 'PENDING');
                                if (pendingQuery) {
                                    taskDetailsHtml += `
                                        <hr>
                                        <p><strong>Query from Level ${pendingQuery.fromLevel}:</strong></p>
                                        <p class="alert alert-info">${pendingQuery.queryText}</p>
                                    `;
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error fetching query details:', error);
                }
            }
            
            // If it's a rejection task, fetch rejection details
            if (isRejectionTask && processInstanceId) {
                try {
                    const rejectionResponse = await fetch(`${API_BASE}/workflow/process/${processInstanceId}/variables`);
                    if (rejectionResponse.ok) {
                        const variables = await rejectionResponse.json();
                        console.log('Rejection variables:', variables);
                        if (variables.rejectedAtLevel) {
                            taskDetailsHtml += `
                                <hr>
                                <p><strong>Rejected at Level ${variables.rejectedAtLevel}</strong></p>
                                <p class="alert alert-warning">This request was rejected and needs your review.</p>
                            `;
                        }
                    }
                } catch (error) {
                    console.error('Error fetching rejection details:', error);
                }
            }
            
            document.getElementById('taskDetails').innerHTML = taskDetailsHtml;
            
            // Update decision options based on task type
            const decisionSelect = document.getElementById('taskDecision');
            const querySection = document.getElementById('querySection');
            
            if (isRejectionTask) {
                console.log('Setting rejection options');
                decisionSelect.innerHTML = `
                    <option value="RESUBMIT">Resubmit (Fix and send back to rejected level)</option>
                    <option value="CANCEL">Cancel Request (Permanently reject)</option>
                `;
                querySection.style.display = 'none';
            } else if (isQueryTask) {
                console.log('Setting query response options');
                decisionSelect.innerHTML = `
                    <option value="RESPOND">Respond to Query</option>
                `;
                querySection.style.display = 'block';
                document.querySelector('#querySection label').textContent = 'Response Text';
                document.getElementById('queryText').placeholder = 'Enter your response...';
                document.getElementById('queryText').value = ''; // Clear previous value
            } else {
                console.log('Setting normal approval options');
                decisionSelect.innerHTML = `
                    <option value="APPROVE">Approve</option>
                    <option value="REJECT">Reject (Send to Level 1 for review)</option>
                    <option value="QUERY">Raise Query (Ask Level 1 a question)</option>
                `;
                querySection.style.display = 'none';
                
                // Show/hide query section based on selection
                decisionSelect.addEventListener('change', function() {
                    if (this.value === 'QUERY') {
                        querySection.style.display = 'block';
                        document.querySelector('#querySection label').textContent = 'Query Text';
                        document.getElementById('queryText').placeholder = 'Enter your question...';
                        document.getElementById('queryText').value = ''; // Clear previous value
                    } else {
                        querySection.style.display = 'none';
                    }
                });
            }
            
            const modal = new bootstrap.Modal(document.getElementById('taskModal'));
            modal.show();
        })
        .catch(error => {
            console.error('Error loading task details:', error);
            document.getElementById('taskDetails').innerHTML = `<p>Task ID: ${taskId}</p><p class="alert alert-danger">Error: ${error.message}</p>`;
            const modal = new bootstrap.Modal(document.getElementById('taskModal'));
            modal.show();
        });
}

async function submitDecision() {
    const decision = document.getElementById('taskDecision').value;
    const comments = document.getElementById('taskComments').value;
    const queryText = document.getElementById('queryText').value;
    
    try {
        if (decision === 'QUERY') {
            // Raise a query - need to get requestId from process variables
            const response = await fetch(`${API_BASE}/workflow/query/raise`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    taskId: currentTaskId,
                    targetLevel: 1, // Always send queries to Level 1
                    queryText: queryText || comments,
                    requestId: null // Will be extracted from process in backend
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to raise query');
            }
            
            alert('Query raised successfully! Level 1 will respond.');
        } else if (decision === 'RESPOND') {
            // Responding to a query - use the query text field or comments
            const responseText = queryText || comments;
            if (!responseText) {
                alert('Please enter a response to the query');
                return;
            }
            
            await fetch(`${API_BASE}/workflow/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    taskId: currentTaskId,
                    decision: 'RESPOND',
                    comments: responseText
                })
            });
            
            alert('Query response submitted successfully!');
        } else {
            // Regular approval/rejection/resubmit/cancel
            await fetch(`${API_BASE}/workflow/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    taskId: currentTaskId,
                    decision: decision,
                    comments: comments
                })
            });
            
            alert('Decision submitted successfully!');
        }
        
        bootstrap.Modal.getInstance(document.getElementById('taskModal')).hide();
        loadTasks();
    } catch (error) {
        console.error('Submit error:', error);
        alert('Error: ' + error.message);
    }
}

window.onload = async () => {
    await loadWorkflowLevels(); // Load levels first
    loadTasks(); // Then load tasks for the first level
};
