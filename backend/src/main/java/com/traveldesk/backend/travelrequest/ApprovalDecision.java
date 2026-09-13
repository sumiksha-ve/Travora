package com.traveldesk.backend.travelrequest;

public class ApprovalDecision {

    private String approverName;
    private String comment;

    public String getApproverName() {
        return approverName;
    }

    public void setApproverName(String approverName) {
        this.approverName = approverName;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}