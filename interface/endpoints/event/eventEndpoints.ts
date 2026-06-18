export const EventEndpoints = {
    // Events
    createEvent: "/api/events/create",                        // POST
    listEvents: "/api/events",                         // GET
    getEvent: (id: string) => `/api/events/${id}`,     // GET
    updateEvent: (id: string) => `/api/events/modify/${id}`,  // PATCH
    deleteEvent: (id: string) => `/api/events/delete/${id}`,  // DELETE
    upcomingEvents: "/api/events/upcoming/all",        // GET
  
    // Participants
    addParticipant: (eventId: string) => `/api/events/${eventId}/participants`, // POST
    listParticipants: (eventId: string) => `/api/events/${eventId}/participants`, // GET
    getParticipant: (participantId: string) => `/api/events/participants/${participantId}`, // GET
    updateParticipant: (participantId: string) => `/api/events/participants/${participantId}`, // PATCH
  };
  