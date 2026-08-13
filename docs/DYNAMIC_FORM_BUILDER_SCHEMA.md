# Dynamic Form Builder Architecture & Database Schema

## Overview
The NTC-EDGE Dynamic Form Builder allows agencies to dynamically define, sequence, and validate application forms per service catalog (`Service`).

Forms are structured into ordered **Sections**, which contain ordered **Fields** with custom validation rules and conditional visibility.

---

## 1. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    Service ||--o| Form : "1 to 1 (Service Form)"
    Form ||--o{ FormSection : "1 to Many (Sections)"
    FormSection ||--o{ SectionField : "1 to Many (SectionFields)"
    Field ||--o{ SectionField : "1 to Many (SectionFields)"
    Application ||--o{ FormSubmission : "1 to Many"
    Applicant ||--o{ FormSubmission : "0..1 to Many"
    Form ||--o{ FormSubmission : "1 to Many"
    FormSubmission ||--o{ FormFieldValue : "1 to Many (FieldValues)"
    Field ||--o{ FormFieldValue : "1 to Many"
```

---

## 2. Table Schemas & Relational Mapping

### 2.1 `Forms` Table
Represents a dynamic form definition tied to a specific `Service`.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `Id` | `uuid` | PK | Primary Key |
| `ServiceId` | `uuid` | FK -> `Services.Id` | Service catalog item this form belongs to |
| `Version` | `varchar` | Default `"1.0"` | Schema versioning |
| `CategorySelectionRequired` | `boolean` | Default `false` | Indicates if service variant selection is required |
| `CreatedAt` / `CreatedBy` | `timestamp`/`varchar` | Auditable | Audit metadata |
| `LastModifiedAt` / `LastModifiedBy` | `timestamp`/`varchar` | Auditable | Audit metadata |
| `IsDeleted` | `boolean` | Soft Delete | Soft delete flag |

### 2.2 `FormSections` Table
Represents a logical grouping of fields (e.g., "General Information", "Technical Specifications").

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `Id` | `uuid` | PK | Primary Key |
| `FormId` | `uuid` | FK -> `Forms.Id` (Cascade) | Parent Form |
| `Key` | `varchar` | Required | Unique section identifier matching contract key |
| `Title` | `varchar` | Required | Section title displayed on UI header |
| `OrderIndex` | `int` | Default `0` | Order of appearance within the form |

### 2.3 `Fields` Table
Global library of reusable form fields.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `Id` | `uuid` | PK | Primary Key |
| `FieldType` | `varchar` | Enum/String | `text` \| `date` \| `dropdown` \| `checkbox` \| `signature` \| `file` |
| `Label` | `varchar` | Required | Default label text |
| `ValidationRules` | `jsonb` / `text` | Nullable JSON | Validation constraints (regex, min/max, options) |
| `IsOtherEnabled` | `boolean` | Default `false` | Enables "Other (Specify)" input for dropdowns |
| `SyncBackOnSubmit` | `boolean` | Default `false` | Syncs field back to applicant/company profile |

### 2.4 `SectionFields` Join Table
Join table mapping fields to sections with section-specific overrides and display ordering.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `FormSectionId` | `uuid` | PK, FK -> `FormSections.Id` (Cascade) | Target Section |
| `FieldId` | `uuid` | PK, FK -> `Fields.Id` (Restrict) | Linked Field |
| `IsRequired` | `boolean` | Default `false` | Whether field is mandatory in this section |
| `OrderIndex` | `int` | Default `0` | Field position within the section |
| `VisibilityCondition` | `text` / `jsonb` | Nullable | Conditional visibility rule expression |

---

## 3. Submissions & User Values

When applicants submit a dynamic form, their responses are stored in `FormSubmissions` and `FormFieldValues`.

### 3.1 `FormSubmissions` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `Id` | `uuid` | PK | Primary Key |
| `ApplicationId` | `uuid` | FK -> `Applications.Id` | Parent application |
| `ApplicantId` | `uuid` | FK -> `Applicants.Id` (Nullable) | Linked applicant profile |
| `FormId` | `uuid` | FK -> `Forms.Id` | Form schema snapshot |

### 3.2 `FormFieldValues` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `Id` | `uuid` | PK | Primary Key |
| `FormSubmissionId` | `uuid` | FK -> `FormSubmissions.Id` | Parent submission |
| `FieldId` | `uuid` | FK -> `Fields.Id` | Linked Field |
| `CustomLabel` | `varchar` | Nullable | Custom label override |
| `Value` | `text` | Nullable | User submitted response string/JSON |

---

---

## 4. API Endpoints Catalog

| HTTP Method | Route | Description & Parameters | Return DTO |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v2/services/{id}/form` | Retrieves pure dynamic form schema layout for a service catalog item (no submitted answers). | `ApiResponse<FormDto>` |
| `GET` | `/api/v2/applications/{id}/form` | Retrieves form schema layout populated with the applicant's submitted answers.<br>**Query Params:**<br>• `applicantId` (`Guid`, optional): Target applicant ID.<br>• `submissionId` (`Guid`, optional): Target submission ID directly. | `ApiResponse<ApplicationFormSubmissionDto>` |
| `PATCH` | `/api/v2/applications/{id}/applicants/{applicantId}/form-values/admin-update` | Agency staff administrative correction update for submitted form field values.<br>**Payload Body:** `submissionId` (optional), `formFields` list. | `ApiResponse<Guid>` |

### 4.1 Endpoint Request & Response Examples

#### GET `/api/v2/applications/{id}/form?submissionId={submissionId}` Response Shape
```json
{
  "succeeded": true,
  "data": {
    "submissionId": "72b39c0d-7681-473e-8874-2c68b74a64f9",
    "formId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "serviceId": "a1000000-0000-0000-0000-000000000001",
    "applicationId": "b2000000-0000-0000-0000-000000000002",
    "applicantId": "c3000000-0000-0000-0000-000000000003",
    "version": "1.0",
    "sections": [
      {
        "key": "GENERAL_INFO",
        "title": "1. GENERAL INFORMATION",
        "required": true,
        "orderIndex": 1,
        "fields": [
          {
            "fieldId": "f1000000-0000-0000-0000-000000000001",
            "label": "Call Sign / Station Name",
            "type": "text",
            "isRequired": true,
            "orderIndex": 1,
            "validationRules": null,
            "visibilityCondition": null,
            "value": "DX1NTC"
          }
        ]
      }
    ]
  }
}
```

#### PATCH `/api/v2/applications/{id}/applicants/{applicantId}/form-values/admin-update` Request Shape
```json
{
  "submissionId": "72b39c0d-7681-473e-8874-2c68b74a64f9",
  "formFields": [
    {
      "fieldId": "f1000000-0000-0000-0000-000000000001",
      "fieldLabel": "Call Sign / Station Name",
      "value": "DX1NTC-MODIFIED"
    }
  ]
}
```

---

## 5. Key Source Code References

* **Entities**:
  * [`Form.cs`](file:///F:/projects/ustp/github/EDGE-v2/apps/backend/EDGE.Domain/Entities/Form.cs)
  * [`FormSection.cs`](file:///F:/projects/ustp/github/EDGE-v2/apps/backend/EDGE.Domain/Entities/FormSection.cs)
  * [`SectionField.cs`](file:///F:/projects/ustp/github/EDGE-v2/apps/backend/EDGE.Domain/Entities/SectionField.cs)
  * [`Field.cs`](file:///F:/projects/ustp/github/EDGE-v2/apps/backend/EDGE.Domain/Entities/Field.cs)
  * [`FormSubmission.cs`](file:///F:/projects/ustp/github/EDGE-v2/apps/backend/EDGE.Domain/Entities/FormSubmission.cs)
  * [`FormFieldValue.cs`](file:///F:/projects/ustp/github/EDGE-v2/apps/backend/EDGE.Domain/Entities/FormFieldValue.cs)
* **DbContext Configuration**:
  * [`ApplicationDbContext.cs`](file:///F:/projects/ustp/github/EDGE-v2/apps/backend/EDGE.Infrastructure/Persistence/ApplicationDbContext.cs#L321-L332) (`SectionField` composite key configuration)
* **Application Queries & Commands**:
  * [`GetFormByServiceIdQueryHandler.cs`](file:///F:/projects/ustp/github/EDGE-v2/apps/backend/EDGE.Application/Forms/Queries/GetFormByServiceId/GetFormByServiceIdQueryHandler.cs)
  * [`GetApplicationFormWithSubmissionQueryHandler.cs`](file:///F:/projects/ustp/github/EDGE-v2/apps/backend/EDGE.Application/Applications/Queries/GetApplicationFormWithSubmission/GetApplicationFormWithSubmissionQueryHandler.cs)
  * [`AdminUpdateFormValuesCommandHandler.cs`](file:///F:/projects/ustp/github/EDGE-v2/apps/backend/EDGE.Application/Applications/Commands/AdminUpdateFormValues/AdminUpdateFormValuesCommandHandler.cs)
  * [`CreateFormCommandHandler.cs`](file:///F:/projects/ustp/github/EDGE-v2/apps/backend/EDGE.Application/Forms/Commands/CreateForm/CreateFormCommandHandler.cs)
* **API Endpoints**:
  * [`ApplicationEndpoints.cs`](file:///F:/projects/ustp/github/EDGE-v2/apps/backend/EDGE.Api/Endpoints/ApplicationEndpoints.cs)
* **Frontend Services & Hooks**:
  * [`applicationService.ts`](file:///F:/projects/ustp/github/EDGE-v2/packages/api/src/services/applicationService.ts)
  * [`useApplicationFormWithSubmission.ts`](file:///F:/projects/ustp/github/EDGE-v2/packages/api/src/hooks/useApplicationFormWithSubmission.ts)

