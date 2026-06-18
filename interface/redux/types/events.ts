export interface IEvent {
  id: string;
  title: string;
  description?: string | null;
  startDate: Date;
  endDate: Date;
    ticketPrice: string;
    status: string;
  location?: string | null;
  updatedAt: Date;
  createdAt: Date;

  EventParticipant: EventParticipant[];
}

export interface EventParticipant {
  id: string;
  firstName: string;
  lastname: string;
  tel: string;
  tel2: string;
    amountPaid: number;
    balance: number;
    paymentStatus: string;
  eventId: string;
  event: Event;
  updatedAt: Date;
  createdAt: Date;
}
