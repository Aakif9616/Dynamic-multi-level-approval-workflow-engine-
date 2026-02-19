package com.workflow.entity;

public enum Permission {
    CREATE_REQUEST("Create new workflow requests"),
    APPROVE_TASK("Approve or reject tasks"),
    QUERY_TASK("Raise queries on tasks"),
    EDIT_REQUEST("Edit existing requests"),
    VIEW_REQUEST("View request details"),
    DELETE_REQUEST("Delete workflow requests"),
    MANAGE_LEVELS("Manage workflow levels"),
    VIEW_ALL_REQUESTS("View all requests in system");
    
    private final String description;
    
    Permission(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}
