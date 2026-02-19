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
            
            // Fetch process variables to get formId, currentLevel, and formInstanceId
            let formId = null;
            let currentLevel = null;
            let formInstanceId = null;
            
            try {
                const variablesResponse = await fetch(`${API_BASE}/workflow/process/${processInstanceId}/variables`);
                if (variablesResponse.ok) {
                    const variables = await variablesResponse.json();
                    formId = variables.formId;
                    currentLevel = variables.currentLevel;
                    formInstanceId = variables.formInstanceId;
                    
                    // NEW: Display Form Instance ID if available
                    if (formInstanceId) {
                        taskDetailsHtml += `<p><strong>Form Instance ID:</strong> <span class="badge bg-primary">${formInstanceId}</span></p>`;
                    }
                    
                    // Check if there's a resolved query response to show
                    if (!isQueryTask && !isRejectionTask && variables.requestId) {
                        const queryHistoryResponse = await fetch(`${API_BASE}/workflow/query/history/${variables.requestId}`);
                        if (queryHistoryResponse.ok) {
                            const queryHistory = await queryHistoryResponse.json();
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
                console.error('Error fetching process variables:', error);
            }
            
            // If it's a query task, fetch the query details
            if (isQueryTask && processInstanceId) {
                try {
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
            
            // Load and render form if formId exists and not a query/rejection task
            if (formId && currentLevel && !isQueryTask && !isRejectionTask) {
                await loadDynamicFormInTask(formId, currentLevel, formInstanceId);
            }
            
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
            
            // If there are form fields and user is approving, save form data
            if (taskFormFields.length > 0 && decision === 'APPROVE') {
                const formData = collectTaskFormData();
                
                // Get formId, currentLevel, and formInstanceId from process variables
                const variablesResponse = await fetch(`${API_BASE}/workflow/process/${currentProcessInstanceId}/variables`);
                if (variablesResponse.ok) {
                    const variables = await variablesResponse.json();
                    const formId = variables.formId;
                    const currentLevel = variables.currentLevel;
                    const formInstanceId = variables.formInstanceId;
                    const currentRole = document.getElementById('roleSelect').value;
                    
                    // Submit form data - ONLY Form Instance ID needed
                    const formSubmission = {
                        formInstanceId: formInstanceId,
                        formId: formId,
                        currentLevel: currentLevel,
                        userRole: currentRole,
                        fieldValues: formData
                    };
                    
                    const formResponse = await fetch(`${API_BASE}/forms/submit`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(formSubmission)
                    });
                    
                    if (!formResponse.ok) {
                        throw new Error('Failed to save form data');
                    }
                    
                    console.log('Form data saved successfully');
                }
            }
            
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
        
        // Clear task form fields
        taskFormFields = [];
        const taskFormContainer = document.getElementById('taskFormFields');
        if (taskFormContainer) {
            taskFormContainer.innerHTML = '';
        }
        
        loadTasks();
    } catch (error) {
        console.error('Submit error:', error);
        alert('Error: ' + error.message);
    }
}

window.onload = async () => {
    await loadWorkflowLevels(); // Load levels first
    await loadAvailableForms(); // Load available forms
    loadTasks(); // Then load tasks for the first level
};


// ==================== DYNAMIC FORMS INTEGRATION ====================

let selectedFormId = null;
let currentFormFields = [];
let taskFormFields = []; // For task modal forms

// Load available forms on page load
async function loadAvailableForms() {
    try {
        const response = await fetch(`${API_BASE}/forms/active`);
        const forms = await response.json();
        
        const formSelect = document.getElementById('formSelect');
        formSelect.innerHTML = '<option value="">Use Basic Form</option>';
        
        forms.forEach(form => {
            const option = document.createElement('option');
            option.value = form.id;
            option.textContent = form.formName;
            formSelect.appendChild(option);
        });
        
        console.log(`Loaded ${forms.length} active forms`);
    } catch (error) {
        console.error('Error loading forms:', error);
    }
}

// Handle form selection change
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded fired');
    
    // Setup form selection handler
    const formSelect = document.getElementById('formSelect');
    console.log('formSelect element:', formSelect);
    
    if (formSelect) {
        formSelect.addEventListener('change', async function() {
            console.log('Form selection changed to:', this.value);
            const formId = this.value;
            
            if (!formId) {
                // Show basic form
                document.getElementById('basicFormFields').style.display = 'block';
                document.getElementById('dynamicFormFields').innerHTML = '';
                selectedFormId = null;
                return;
            }
            
            // Hide basic form, load dynamic form
            document.getElementById('basicFormFields').style.display = 'none';
            await loadDynamicForm(formId, 1); // Level 1 for creation
        });
    }
    
    // Setup create request form submission handler
    const createForm = document.getElementById('createRequestForm');
    console.log('createRequestForm element:', createForm);
    
    if (createForm) {
        console.log('Adding submit event listener to form');
        createForm.addEventListener('submit', async (e) => {
            console.log('Form submit event fired');
            e.preventDefault();
            
            let data;
            
            if (selectedFormId) {
                console.log('Using dynamic form, selectedFormId:', selectedFormId);
                // Using dynamic form
                const formData = collectFormData();
                console.log('Collected form data:', formData);
                
                // Validate that at least one field has data
                if (Object.keys(formData).length === 0) {
                    alert('Please fill in at least one field');
                    return;
                }
                
                data = {
                    requester: 'Dynamic Form User',
                    productName: 'From Dynamic Form',
                    description: 'Request created using dynamic form',
                    formId: selectedFormId,
                    formData: formData
                };
            } else {
                console.log('Using basic form');
                // Using basic form
                const requester = document.getElementById('requester').value;
                const productName = document.getElementById('productName').value;
                
                // Validate required fields for basic form
                if (!requester || !productName) {
                    alert('Please fill in Requester Name and Product Name');
                    return;
                }
                
                data = {
                    requester: requester,
                    productName: productName,
                    description: document.getElementById('description').value
                };
            }
            
            console.log('Submitting data:', data);
            
            try {
                const response = await fetch(`${API_BASE}/workflow/requests`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                console.log('Response status:', response.status);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Response error:', errorText);
                    
                    // Try to parse as JSON to get more details
                    try {
                        const errorJson = JSON.parse(errorText);
                        console.error('Error details:', errorJson);
                        if (errorJson.message) {
                            throw new Error(errorJson.message);
                        }
                    } catch (e) {
                        // Not JSON, use the text
                    }
                    
                    throw new Error(`HTTP error! status: ${response.status}. Check backend logs for details.`);
                }
                
                const result = await response.json();
                console.log('Success result:', result);
                
                // NEW: Fetch Form Instance ID if form was used
                let formInstanceIdDisplay = '';
                if (selectedFormId && result.processInstanceId) {
                    try {
                        const fiResponse = await fetch(`${API_BASE}/workflow/form-instance/by-process/${result.processInstanceId}`);
                        if (fiResponse.ok) {
                            const formInstance = await fiResponse.json();
                            formInstanceIdDisplay = `<br>Form Instance ID: <strong>${formInstance.formInstanceId}</strong>`;
                        }
                    } catch (e) {
                        console.log('Could not fetch form instance ID:', e);
                    }
                }
                
                document.getElementById('createResult').innerHTML = 
                    `<div class="alert alert-success">Request created! ID: ${result.requestId}, Process: ${result.processInstanceId}${formInstanceIdDisplay}</div>`;
                createForm.reset();
                document.getElementById('dynamicFormFields').innerHTML = '';
                document.getElementById('basicFormFields').style.display = 'block';
                selectedFormId = null;
            } catch (error) {
                console.error('Error creating request:', error);
                document.getElementById('createResult').innerHTML = 
                    `<div class="alert alert-danger">Error: ${error.message}</div>`;
            }
        });
    } else {
        console.error('createRequestForm element not found!');
    }
});

// Load and render dynamic form
async function loadDynamicForm(formId, level, formInstanceId = null) {
    try {
        let url = `${API_BASE}/forms/${formId}/render?level=${level}`;
        if (formInstanceId) {
            url += `&formInstanceId=${formInstanceId}`;
        }
        
        const response = await fetch(url);
        const form = await response.json();
        
        selectedFormId = formId;
        currentFormFields = form.fields;
        
        renderDynamicFormFields(form.fields);
        
    } catch (error) {
        console.error('Error loading dynamic form:', error);
        document.getElementById('dynamicFormFields').innerHTML = 
            '<div class="alert alert-danger">Error loading form</div>';
    }
}

// Load and render dynamic form in task modal
async function loadDynamicFormInTask(formId, level, formInstanceId) {
    try {
        let url = `${API_BASE}/forms/${formId}/render?level=${level}`;
        if (formInstanceId) {
            url += `&formInstanceId=${formInstanceId}`;
        }
        
        const response = await fetch(url);
        const form = await response.json();
        
        taskFormFields = form.fields;
        
        renderTaskFormFields(form.fields);
        
    } catch (error) {
        console.error('Error loading task form:', error);
        const container = document.getElementById('taskFormFields');
        if (container) {
            container.innerHTML = '<div class="alert alert-danger">Error loading form</div>';
        }
    }
}

// Render dynamic form fields
function renderDynamicFormFields(fields) {
    const container = document.getElementById('dynamicFormFields');
    let html = '';
    
    fields.forEach(field => {
        html += '<div class="mb-3">';
        html += `<label class="form-label">${field.fieldLabel}`;
        if (field.required) {
            html += ' <span class="text-danger">*</span>';
        }
        html += '</label>';
        
        // Render field based on type
        if (field.isEditable) {
            html += renderEditableField(field);
        } else {
            html += renderReadOnlyField(field);
        }
        
        if (field.helpText) {
            html += `<small class="text-muted d-block">${field.helpText}</small>`;
        }
        
        html += '</div>';
    });
    
    container.innerHTML = html;
}

// Render task form fields (for task modal)
function renderTaskFormFields(fields) {
    const container = document.getElementById('taskFormFields');
    if (!container) {
        console.error('taskFormFields container not found');
        return;
    }
    
    let html = '<hr><h6>Form Data</h6>';
    
    fields.forEach(field => {
        html += '<div class="mb-3">';
        html += `<label class="form-label">${field.fieldLabel}`;
        if (field.required) {
            html += ' <span class="text-danger">*</span>';
        }
        html += '</label>';
        
        // Render field based on type (use task_ prefix for IDs)
        if (field.isEditable) {
            html += renderEditableTaskField(field);
        } else {
            html += renderReadOnlyField(field);
        }
        
        if (field.helpText) {
            html += `<small class="text-muted d-block">${field.helpText}</small>`;
        }
        
        html += '</div>';
    });
    
    container.innerHTML = html;
}

// Render editable field
function renderEditableField(field) {
    const value = field.currentValue || '';
    const placeholder = field.placeholder || '';
    const required = field.required ? 'required' : '';
    
    switch (field.fieldType) {
        case 'TEXT':
        case 'EMAIL':
            return `<input type="${field.fieldType.toLowerCase()}" class="form-control" 
                    id="field_${field.id}" name="field_${field.id}" 
                    value="${value}" placeholder="${placeholder}" ${required}>`;
        
        case 'TEXTAREA':
            return `<textarea class="form-control" id="field_${field.id}" 
                    name="field_${field.id}" rows="3" placeholder="${placeholder}" 
                    ${required}>${value}</textarea>`;
        
        case 'NUMBER':
            return `<input type="number" class="form-control" id="field_${field.id}" 
                    name="field_${field.id}" value="${value}" placeholder="${placeholder}" ${required}>`;
        
        case 'DATE':
            return `<input type="date" class="form-control" id="field_${field.id}" 
                    name="field_${field.id}" value="${value}" ${required}>`;
        
        case 'DROPDOWN':
            const options = field.fieldOptions ? field.fieldOptions.split('\n') : [];
            let selectHtml = `<select class="form-select" id="field_${field.id}" name="field_${field.id}" ${required}>`;
            selectHtml += '<option value="">Select...</option>';
            options.forEach(opt => {
                const selected = opt.trim() === value ? 'selected' : '';
                selectHtml += `<option value="${opt.trim()}" ${selected}>${opt.trim()}</option>`;
            });
            selectHtml += '</select>';
            return selectHtml;
        
        case 'RADIO':
            const radioOptions = field.fieldOptions ? field.fieldOptions.split('\n') : [];
            let radioHtml = '';
            radioOptions.forEach((opt, idx) => {
                const checked = opt.trim() === value ? 'checked' : '';
                radioHtml += `
                    <div class="form-check">
                        <input class="form-check-input" type="radio" 
                               name="field_${field.id}" id="field_${field.id}_${idx}" 
                               value="${opt.trim()}" ${checked} ${required}>
                        <label class="form-check-label" for="field_${field.id}_${idx}">
                            ${opt.trim()}
                        </label>
                    </div>
                `;
            });
            return radioHtml;
        
        case 'CHECKBOX':
            const checkOptions = field.fieldOptions ? field.fieldOptions.split('\n') : [];
            const selectedValues = value ? value.split(',') : [];
            let checkHtml = '';
            checkOptions.forEach((opt, idx) => {
                const checked = selectedValues.includes(opt.trim()) ? 'checked' : '';
                checkHtml += `
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" 
                               name="field_${field.id}" id="field_${field.id}_${idx}" 
                               value="${opt.trim()}" ${checked}>
                        <label class="form-check-label" for="field_${field.id}_${idx}">
                            ${opt.trim()}
                        </label>
                    </div>
                `;
            });
            return checkHtml;
        
        default:
            return `<input type="text" class="form-control" id="field_${field.id}" 
                    name="field_${field.id}" value="${value}" placeholder="${placeholder}" ${required}>`;
    }
}

// Render editable task field (with task_ prefix)
function renderEditableTaskField(field) {
    const value = field.currentValue || '';
    const placeholder = field.placeholder || '';
    const required = field.required ? 'required' : '';
    
    switch (field.fieldType) {
        case 'TEXT':
        case 'EMAIL':
            return `<input type="${field.fieldType.toLowerCase()}" class="form-control" 
                    id="task_field_${field.id}" name="task_field_${field.id}" 
                    value="${value}" placeholder="${placeholder}" ${required}>`;
        
        case 'TEXTAREA':
            return `<textarea class="form-control" id="task_field_${field.id}" 
                    name="task_field_${field.id}" rows="3" placeholder="${placeholder}" 
                    ${required}>${value}</textarea>`;
        
        case 'NUMBER':
            return `<input type="number" class="form-control" id="task_field_${field.id}" 
                    name="task_field_${field.id}" value="${value}" placeholder="${placeholder}" ${required}>`;
        
        case 'DATE':
            return `<input type="date" class="form-control" id="task_field_${field.id}" 
                    name="task_field_${field.id}" value="${value}" ${required}>`;
        
        case 'DROPDOWN':
            const options = field.fieldOptions ? field.fieldOptions.split('\n') : [];
            let selectHtml = `<select class="form-select" id="task_field_${field.id}" name="task_field_${field.id}" ${required}>`;
            selectHtml += '<option value="">Select...</option>';
            options.forEach(opt => {
                const selected = opt.trim() === value ? 'selected' : '';
                selectHtml += `<option value="${opt.trim()}" ${selected}>${opt.trim()}</option>`;
            });
            selectHtml += '</select>';
            return selectHtml;
        
        case 'RADIO':
            const radioOptions = field.fieldOptions ? field.fieldOptions.split('\n') : [];
            let radioHtml = '';
            radioOptions.forEach((opt, idx) => {
                const checked = opt.trim() === value ? 'checked' : '';
                radioHtml += `
                    <div class="form-check">
                        <input class="form-check-input" type="radio" 
                               name="task_field_${field.id}" id="task_field_${field.id}_${idx}" 
                               value="${opt.trim()}" ${checked} ${required}>
                        <label class="form-check-label" for="task_field_${field.id}_${idx}">
                            ${opt.trim()}
                        </label>
                    </div>
                `;
            });
            return radioHtml;
        
        case 'CHECKBOX':
            const checkOptions = field.fieldOptions ? field.fieldOptions.split('\n') : [];
            const selectedValues = value ? value.split(',') : [];
            let checkHtml = '';
            checkOptions.forEach((opt, idx) => {
                const checked = selectedValues.includes(opt.trim()) ? 'checked' : '';
                checkHtml += `
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" 
                               name="task_field_${field.id}" id="task_field_${field.id}_${idx}" 
                               value="${opt.trim()}" ${checked}>
                        <label class="form-check-label" for="task_field_${field.id}_${idx}">
                            ${opt.trim()}
                        </label>
                    </div>
                `;
            });
            return checkHtml;
        
        default:
            return `<input type="text" class="form-control" id="task_field_${field.id}" 
                    name="task_field_${field.id}" value="${value}" placeholder="${placeholder}" ${required}>`;
    }
}

// Render read-only field
function renderReadOnlyField(field) {
    const value = field.currentValue || '-';
    return `<input type="text" class="form-control" value="${value}" readonly>`;
}

// Collect form data
function collectFormData() {
    const formData = {};
    
    console.log('Collecting form data from fields:', currentFormFields);
    
    currentFormFields.forEach(field => {
        console.log(`Field ${field.id} (${field.fieldLabel}): isEditable=${field.isEditable}, fieldType=${field.fieldType}`);
        
        if (field.isEditable) {
            const element = document.getElementById(`field_${field.id}`);
            
            if (field.fieldType === 'CHECKBOX') {
                // Collect all checked checkboxes
                const checkboxes = document.querySelectorAll(`input[name="field_${field.id}"]:checked`);
                const values = Array.from(checkboxes).map(cb => cb.value);
                const value = values.join(',');
                if (value) {  // Only add if not empty
                    formData[field.id] = value;
                    console.log(`  Collected checkbox value: ${value}`);
                }
            } else if (field.fieldType === 'RADIO') {
                // Get selected radio button
                const radio = document.querySelector(`input[name="field_${field.id}"]:checked`);
                if (radio && radio.value) {  // Only add if selected
                    formData[field.id] = radio.value;
                    console.log(`  Collected radio value: ${radio.value}`);
                }
            } else if (element && element.value) {  // Only add if not empty
                formData[field.id] = element.value;
                console.log(`  Collected value: ${element.value}`);
            }
        } else {
            console.log(`  Skipping - not editable`);
        }
    });
    
    console.log('Final collected form data:', formData);
    return formData;
}

// Collect form data from task modal
function collectTaskFormData() {
    const formData = {};
    
    taskFormFields.forEach(field => {
        if (field.isEditable) {
            const element = document.getElementById(`task_field_${field.id}`);
            
            if (field.fieldType === 'CHECKBOX') {
                const checkboxes = document.querySelectorAll(`input[name="task_field_${field.id}"]:checked`);
                const values = Array.from(checkboxes).map(cb => cb.value);
                formData[field.id] = values.join(',');
            } else if (field.fieldType === 'RADIO') {
                const radio = document.querySelector(`input[name="task_field_${field.id}"]:checked`);
                formData[field.id] = radio ? radio.value : '';
            } else if (element) {
                formData[field.id] = element.value;
            }
        }
    });
    
    return formData;
}
