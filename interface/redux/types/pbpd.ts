import type { IEmployee } from "./hr";
import type { IClient } from "./sales";

export interface IClientPrescription {
  id: string;                // UUID string
  clientId: string;          // UUID of the client
  client: IClient;            // Related Client object
  images: string;               // JSON type (array/object of image URLs or metadata)
  notes?: string;            // Optional notes
  prescribedBy: string;      // UUID of the employee who prescribed
  employee: IEmployee;        // Related Employee object
  isReviewed: boolean;       // Indicates if the prescription has been reviewed
  reviewNotes?: string;      // Optional review notes
  updatedAt: Date;           // Last updated timestamp
  createdAt: Date;           // Created timestamp
}
