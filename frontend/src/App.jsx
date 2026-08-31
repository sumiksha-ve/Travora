import { useState } from 'react'
import './App.css'

function App() {

  const [page, setPage] = useState('dashboard')

  const [formData, setFormData] = useState({
    employeeId: 'EMP001',
    tripType: '',
    fromLocation: '',
    toLocation: '',
    travelDate: '',
    returnDate: '',
    projectName: '',
    reason: ''
  })

  const [requests, setRequests] = useState([
    {
      id: 101,
      fromLocation: 'Chennai',
      toLocation: 'Bengaluru',
      projectName: 'Client Meeting',
      travelDate: '2026-09-10',
      status: 'PENDING'
    }
  ])

  const [message, setMessage] = useState('')

  function handleChange(event) {
    const { name, value } = event.target

    setFormData({
      ...formData,
      [name]: value
    })
  }

  function handleSubmit(event) {
    event.preventDefault()

    const newRequest = {
      id: Date.now(),
      fromLocation: formData.fromLocation,
      toLocation: formData.toLocation,
      projectName: formData.projectName,
      travelDate: formData.travelDate,
      status: 'PENDING'
    }

    setRequests([...requests, newRequest])

    setMessage('Travel request submitted successfully!')

    setFormData({
      employeeId: 'EMP001',
      tripType: '',
      fromLocation: '',
      toLocation: '',
      travelDate: '',
      returnDate: '',
      projectName: '',
      reason: ''
    })
  }

  return (
    <div className="app">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="sidebar-brand">
          <div className="sidebar-icon">✈</div>
          <h2>TravelDesk</h2>
        </div>

        <nav>

          <button
            className={page === 'dashboard' ? 'nav-active' : ''}
            onClick={() => setPage('dashboard')}
          >
            🏠 Dashboard
          </button>

          <button
            className={page === 'request' ? 'nav-active' : ''}
            onClick={() => {
              setPage('request')
              setMessage('')
            }}
          >
            ✈️ New Travel Request
          </button>

          <button
            className={page === 'requests' ? 'nav-active' : ''}
            onClick={() => setPage('requests')}
          >
            📋 My Requests
          </button>

        </nav>

        <div className="sidebar-bottom">
          <p>Employee</p>
          <strong>EMP001</strong>
        </div>

      </aside>


      {/* MAIN CONTENT */}

      <main className="main-content">

        {page === 'dashboard' && (

          <>

            <div className="top-header">
              <div>
                <h1>Dashboard</h1>
                <p>Welcome back, Haripreeth 👋</p>
              </div>
            </div>


            {/* CARDS */}

            <div className="dashboard-cards">

              <div className="dashboard-card">
                <div className="card-icon">✈️</div>
                <div>
                  <p>New Request</p>
                  <h3>Plan your next trip</h3>
                </div>
                <button onClick={() => setPage('request')}>
                  Create
                </button>
              </div>


              <div className="dashboard-card">
                <div className="card-icon">📋</div>
                <div>
                  <p>My Requests</p>
                  <h3>{requests.length} Request(s)</h3>
                </div>
                <button onClick={() => setPage('requests')}>
                  View
                </button>
              </div>

            </div>


            {/* RECENT REQUESTS */}

            <div className="section">

              <h2>Recent Travel Requests</h2>

              {requests.slice(-3).map(request => (

                <div className="request-card" key={request.id}>

                  <div>
                    <strong>
                      {request.fromLocation} → {request.toLocation}
                    </strong>

                    <p>{request.projectName}</p>
                  </div>

                  <div>
                    <p>{request.travelDate}</p>

                    <span className="status pending">
                      {request.status}
                    </span>
                  </div>

                </div>

              ))}

            </div>

          </>

        )}


        {/* TRAVEL REQUEST PAGE */}

        {page === 'request' && (

          <div className="form-card">

            <button
              className="back-button"
              onClick={() => setPage('dashboard')}
            >
              ← Back to Dashboard
            </button>

            <h1>Create Travel Request</h1>

            <p className="form-description">
              Enter the details of your business trip.
            </p>

            <form onSubmit={handleSubmit}>

              <div className="form-row">

                <div className="form-group">
                  <label>Employee ID</label>

                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Trip Type</label>

                  <select
                    name="tripType"
                    value={formData.tripType}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select trip type
                    </option>

                    <option value="ONE_WAY">
                      One Way
                    </option>

                    <option value="ROUND_TRIP">
                      Round Trip
                    </option>

                  </select>

                </div>

              </div>


              <div className="form-row">

                <div className="form-group">
                  <label>From</label>

                  <input
                    type="text"
                    name="fromLocation"
                    value={formData.fromLocation}
                    onChange={handleChange}
                    placeholder="e.g. Chennai"
                    required
                  />

                </div>

                <div className="form-group">
                  <label>To</label>

                  <input
                    type="text"
                    name="toLocation"
                    value={formData.toLocation}
                    onChange={handleChange}
                    placeholder="e.g. Bengaluru"
                    required
                  />

                </div>

              </div>


              <div className="form-row">

                <div className="form-group">
                  <label>Travel Date</label>

                  <input
                    type="date"
                    name="travelDate"
                    value={formData.travelDate}
                    onChange={handleChange}
                    required
                  />

                </div>

                <div className="form-group">
                  <label>Return Date</label>

                  <input
                    type="date"
                    name="returnDate"
                    value={formData.returnDate}
                    onChange={handleChange}
                  />

                </div>

              </div>


              <div className="form-group">
                <label>Project Name</label>

                <input
                  type="text"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleChange}
                  placeholder="e.g. Client Meeting"
                  required
                />

              </div>


              <div className="form-group">
                <label>Reason for Travel</label>

                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Enter the reason for your travel"
                  rows="4"
                />

              </div>


              <button
                type="submit"
                className="submit-button"
              >
                Submit Travel Request
              </button>

            </form>

            {message && (
              <div className="success-message">
                {message}
              </div>
            )}

          </div>

        )}


        {/* MY REQUESTS */}

        {page === 'requests' && (

          <div className="section">

            <h1>My Travel Requests</h1>

            <p className="form-description">
              Track the status of your submitted travel requests.
            </p>

            {requests.map(request => (

              <div className="request-card" key={request.id}>

                <div>

                  <strong>
                    {request.fromLocation} → {request.toLocation}
                  </strong>

                  <p>
                    {request.projectName}
                  </p>

                  <p>
                    Travel Date: {request.travelDate}
                  </p>

                </div>

                <span className="status pending">
                  {request.status}
                </span>

              </div>

            ))}

          </div>

        )}

      </main>

    </div>
  )
}

export default App