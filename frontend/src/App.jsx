import './App.css'

function App() {
  return (
    <div className="login-page">
      <div className="login-box">

        <div className="brand">
  <div className="brand-icon">✈</div>
  <h1>TravelDesk</h1>
</div>
        <p className="subtitle">Employee Travel Portal</p>

        <div className="form-group">
          <label>Employee ID</label>
          <input
            type="text"
            placeholder="Enter your Employee ID"
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
          />
        </div>

        <button
  className="login-button"
  onClick={() => alert('Login button clicked!')}
>
  Login
</button>

      </div>
    </div>
  )
}

export default App