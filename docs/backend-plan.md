# TravelDesk Backend Plan

## What the backend does

The backend stores information and controls the travel-request journey.

## User roles

- Employee: creates a travel request
- Approver: approves or rejects a request
- Travel Desk: adds ticket booking details

## Travel request journey

1. Employee creates a request
2. Request status becomes PENDING
3. Approver approves or rejects it
4. If approved, Travel Desk books travel
5. Booking is completed
6. A booking can later be cancelled

## Information we will store

### Employee

- Name
- Employee ID
- Department
- Designation
- Location

### Travel Request

- One way or round trip
- From location
- To location
- Travel date
- Return date
- Project name
- Reason for travel
- Status

### Booking

- Type: Air, Train, Bus, Hotel, or Cab
- Ticket or booking reference
- Cost
- Savings
- Notes
- Cancellation reason, if cancelled