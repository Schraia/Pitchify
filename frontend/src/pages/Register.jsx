import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';

function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post('http://127.0.0.1:3000/api/register', { username, password })
      setMessage("Registration successful! You can now login.")
      setSuccess(true)
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed.")
      setSuccess(false)
    }
  }

  return (
    <div className='regContainer'>
      <div className='regisBox'>
        <form onSubmit={handleRegister}>
        <h2 className='whiteTitleText'>Register</h2>
        <input className='regForm' value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" disabled={success} />
        <input className='regForm' type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" disabled={success} />
        <button className='pinkWhiteBtn' type="submit" style={{ marginRight: "1rem" }} disabled={success}>Register</button>
        <button className='regblackBtn' type="button" onClick={() => navigate("/")} disabled={success}>Back</button>
        <div className='msg'>{message}</div>
        {success && (
          <button className='regblackBtn' type="button" onClick={() => navigate("/login")}>
            Go to Login
          </button>
        )}
        </form>
      </div>
    </div>
  )
}

export default Register