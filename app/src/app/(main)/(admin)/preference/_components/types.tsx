export type ModelType = "invoice" | "client" | "vendor" | "purchase_order";

export interface FieldDefinition {
  name: string
  type: string
  required: boolean
  description: string
  example: string | number
}

export interface ModelDefinition {
  name: ModelType
  displayName: string
  description: string
  fields: FieldDefinition[]
}

export const MODEL_DEFINITIONS: ModelDefinition[] = [
  {
    name: "invoice",
    displayName: "Invoices",
    description: "Sync invoice records with your external system",
    fields: [
      { name: "id", type: "string", required: true, description: "Unique identifier", example: "inv_123" },
      {
        name: "organization_id",
        type: "string",
        required: true,
        description: "Organization identifier",
        example: "org_123",
      },
      { name: "account_id", type: "string", required: true, description: "Account identifier", example: "acc_123" },
      {
        name: "customer_name",
        type: "string",
        required: true,
        description: "Name of the customer",
        example: "John Doe",
      },
      {
        name: "invoice_number",
        type: "string",
        required: true,
        description: "Invoice reference number",
        example: "INV-001",
      },
      { name: "client_id", type: "string", required: true, description: "Client identifier", example: "client_123" },
      { name: "amount_paid", type: "number", required: true, description: "Amount already paid", example: 1000 },
      { name: "balance_due", type: "number", required: true, description: "Remaining balance", example: 500 },
      { name: "due_date", type: "string", required: true, description: "Payment due date", example: "2024-03-01" },
      { name: "status", type: "enum", required: true, description: "Current invoice status", example: "SENT" },
      { name: "amount", type: "number", required: true, description: "Total invoice amount", example: 1500 },
      {
        name: "created_at",
        type: "string",
        required: true,
        description: "Creation timestamp",
        example: "2024-02-08T12:00:00Z",
      },
      {
        name: "updated_at",
        type: "string",
        required: true,
        description: "Last update timestamp",
        example: "2024-02-08T12:00:00Z",
      },
    ],
  },
  {
    name: "client",
    displayName: "Clients",
    description: "Sync client records with your external system",
    fields: [
      { name: "id", type: "string", required: true, description: "Unique identifier", example: "client_123" },
      {
        name: "organization_id",
        type: "string",
        required: true,
        description: "Organization identifier",
        example: "org_123",
      },
      { name: "first_name", type: "string", required: true, description: "Client's first name", example: "John" },
      { name: "last_name", type: "string", required: true, description: "Client's last name", example: "Doe" },
      {
        name: "contact_person",
        type: "string",
        required: false,
        description: "Alternative contact",
        example: "Jane Smith",
      },
      { name: "email", type: "string", required: true, description: "Email address", example: "john@example.com" },
      { name: "phone", type: "string", required: false, description: "Phone number", example: "+1234567890" },
      {
        name: "created_at",
        type: "string",
        required: true,
        description: "Creation timestamp",
        example: "2024-02-08T12:00:00Z",
      },
      {
        name: "updated_at",
        type: "string",
        required: true,
        description: "Last update timestamp",
        example: "2024-02-08T12:00:00Z",
      },
    ],
  },
  {
    name: "vendor",
    displayName: "Vendors",
    description: "Sync vendor records with your external system",
    fields: [
      { name: "id", type: "string", required: true, description: "Unique identifier", example: "vendor_123" },
      { name: "name", type: "string", required: true, description: "Vendor name", example: "Acme Corp" },
      {
        name: "contact_person",
        type: "string",
        required: false,
        description: "Primary contact",
        example: "Jane Smith",
      },
      {
        name: "organization_id",
        type: "string",
        required: true,
        description: "Organization identifier",
        example: "org_123",
      },
      { name: "phone_number", type: "string", required: false, description: "Phone number", example: "+1234567890" },
      { name: "email", type: "string", required: false, description: "Email address", example: "contact@acme.com" },
      {
        name: "created_at",
        type: "string",
        required: true,
        description: "Creation timestamp",
        example: "2024-02-08T12:00:00Z",
      },
      {
        name: "updated_at",
        type: "string",
        required: true,
        description: "Last update timestamp",
        example: "2024-02-08T12:00:00Z",
      },
    ],
  },
  {
    name: "purchase_order",
    displayName: "Purchase Orders",
    description: "Sync purchase order records with your external system",
    fields: [
      { name: "id", type: "string", required: true, description: "Unique identifier", example: "po_123" },
      {
        name: "bill_number",
        type: "string",
        required: true,
        description: "Bill reference number",
        example: "BILL-001",
      },
      { name: "account_id", type: "string", required: false, description: "Expense account", example: "acc_123" },
      { name: "vendor_name", type: "string", required: true, description: "Vendor name", example: "Acme Corp" },
      { name: "vendor_id", type: "string", required: false, description: "Vendor identifier", example: "vendor_123" },
      { name: "supplier_id", type: "string", required: false, description: "Supplier identifier", example: "sup_123" },
      { name: "amount", type: "number", required: true, description: "Total amount", example: 1500 },
      { name: "amount_paid", type: "number", required: true, description: "Amount paid", example: 1000 },
      { name: "balance_due", type: "number", required: true, description: "Remaining balance", example: 500 },
      { name: "due_date", type: "string", required: true, description: "Payment due date", example: "2024-03-01" },
      { name: "status", type: "enum", required: true, description: "Current status", example: "RECEIVED" },
      {
        name: "organization_id",
        type: "string",
        required: true,
        description: "Organization identifier",
        example: "org_123",
      },
      {
        name: "created_at",
        type: "string",
        required: true,
        description: "Creation timestamp",
        example: "2024-02-08T12:00:00Z",
      },
      {
        name: "updated_at",
        type: "string",
        required: true,
        description: "Last update timestamp",
        example: "2024-02-08T12:00:00Z",
      },
    ],
  },
];

