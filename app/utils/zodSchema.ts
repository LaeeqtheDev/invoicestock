import { z } from "zod";

// ------------------------------
// Existing Schemas
// ------------------------------

export const onboardingSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  secondName: z.string().min(2, "Last name is required"),
  address: z.string().min(2, "Address is required"),
});

export const noteSchema = z.object({
  id: z.string().optional(), // Optional for creating notes, required for updating or deleting
  title: z.string().min(1, { message: "Title is required" }),
  content: z.string().min(1, { message: "Content is required" }),
});

export const todoSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  content: z.string().optional(),
  completed: z.boolean().optional(),
});
export type TodoSchema = z.infer<typeof todoSchema>;

export const StockSchema = z.object({
  id: z.string().optional(), // UUID format for id
  stockBarcode: z.string().min(1, { message: "Barcode is required" }),
  stockName: z.string().min(1, { message: "Stock Name is required" }),
  category: z.string().optional(),
  subCategory: z.string().optional(),
  status: z.string().optional(),
  quantity: z
    .number()
    .int({ message: "Quantity must be an integer" })
    .min(0, { message: "Quantity must be a non-negative integer" })
    .optional(),
  stockRate: z
    .number()
    .min(0, { message: "Stock Rate must be a non-negative number" })
    .optional(),
  sellingRate: z
    .number()
    .min(0, { message: "Selling Rate must be a non-negative number" })
    .optional(),
  supplier: z.string().optional(),
  purchaseDate: z
    .any({ message: "Purchase Date must be a valid date" })
    .optional(),
  expiryDate: z.any({ message: "Expiry Date must be a valid date" }).optional(),
  stockLocation: z.string().optional(),
  discountAllowed: z.boolean().optional().default(false),
  VAT: z
    .number()
    .min(0, { message: "VAT must be a non-negative number" })
    .optional(),
  SKU: z.string().min(1, { message: "SKU is required" }),
});

export const invoiceSchema = z.object({
  invoiceName: z.string().min(1, "Invoice Name is required"),
  total: z.number().min(1, "1$ is minimum"),
  status: z.enum(["PAID", "PENDING"]).default("PENDING"),
  date: z.string().min(1, "Date is required"),
  fromName: z.string().min(1, "Your name is required"),
  fromEmail: z.string().email("Invalid Email address"),
  fromAddress: z.string().min(1, "Your address is required"),
  clientName: z.string().min(1, "Client name is required"),
  clientEmail: z.string().email("Invalid Email address"),
  clientAddress: z.string().min(1, "Client address is required"),
  currency: z.string().min(1, "Currency is required"),
  invoiceNumber: z.number().min(1, "Minimum invoice number of 1"),
  note: z.string().optional(),
  invoiceItems: z
    .array(
      z.object({
        stockid: z.string().min(1, "Stock ID is required").optional(),
        invoiceItemQuantity: z
          .number()
          .min(1, "Quantity must be at least 1")
          .positive("Quantity must be a positive integer")
          .optional(),
        invoiceItemRate: z
          .number()
          .positive("Rate must be a positive number")
          .min(1, "Rate must be at least 1"),
        discount: z
          .number()
          .positive("Discount must be a positive number")
          .optional(),
        vat: z.number().positive("VAT must be a positive number").optional(),
      }),
    )
    .min(1, "At least one item is required"),
});

// Business Schema
export const businessSchema = z.object({
  id: z.string().optional(),
  businessType: z.string().optional(),
  businessName: z.string().optional(),
  businessAddress: z.string().optional(),
  businessPhone: z.string().optional(),
  businessEmail: z.string().optional(),
  businessEIN: z.string().optional(), // Employer Identification Number
  businessVAT: z.string().optional(), // VAT Number
  businessLogo: z.string().optional(),
  returnPolicy: z.string().optional(),
  // The ownerId should be provided when creating a business.
  ownerId: z.string({ required_error: "Owner ID is required" }),
});

// Employee Schema
export const employeeSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address: z.string().optional(),
  ssn: z.string().optional(), // Only the last four digits
  salary: z.number().optional(),
  workingHours: z.number().optional(),
  attendance: z.number().optional(),
  // Enum for role validation
  role: z
    .enum(["SUPER_ADMIN", "ADMIN", "DATABASE_ADMIN", "SALES", "HRM"])
    .default("SALES"),
  // Link to the business that employs this employee.
  businessId: z.string({ required_error: "Business ID is required" }),
});

// InvoiceItem Schema (can be used separately or inside invoiceSchema)
export const invoiceItemSchema = z.object({
  id: z.string().optional(),
  stockid: z.string().min(1, "Stock ID is required").optional(),
  invoiceItemQuantity: z
    .number()
    .min(1, "Quantity must be at least 1")
    .optional(),
  invoiceItemRate: z.number().min(1, "Rate must be at least 1"),
  invoiceId: z.string().optional(), // Optional if set later in the process
});

export const employeeInvitationSchema = z.object({
  // The email address of the invitee
  email: z.string().email("Invalid email address"),
  // The role to assign on acceptance (using the same enum as in your Employee schema)
  role: z
    .enum(["SUPER_ADMIN", "ADMIN", "DATABASE_ADMIN", "SALES", "HRM"])
    .default("SALES"),
  // The businessId should be provided so you know which business is inviting
  businessId: z.string({ required_error: "Business ID is required" }),
  // Optionally, you can include an expiresAt date as a string (or leave it out)
  expiresAt: z.string().optional(),
});

export const createBusinessSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  businessType: z.string().min(1, "Business type is required"),
  businessAddress: z.string().min(1, "Business address is required"),
  businessPhone: z.string().min(1, "Business phone is required"),
  businessEmail: z.string().email("Invalid email"),
  businessEIN: z.string().optional(),
  businessVAT: z.string().optional(),
  returnPolicy: z.string().optional(),
  businessLogo: z.string().optional(),
});

export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;

export const settingsSchema = z.object({
  businessName: z.string().min(1, { message: "Business name is required" }),
  businessAddress: z
    .string()
    .min(1, { message: "Business address is required" }),
  businessEmail: z.string().email({ message: "Must be a valid email address" }),
  businessEIN: z.string().min(1, { message: "Business EIN is required" }),
  businessVAT: z.string().min(1, { message: "Business VAT is required" }),
});
export type SettingsSchema = z.infer<typeof settingsSchema>;
