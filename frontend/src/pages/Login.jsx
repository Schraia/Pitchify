import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import "./styles/webstyle.css";

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post('http://127.0.0.1:3000/api/login', { username, password })
      setMessage(res.data.message)
      localStorage.setItem('username', username) // Save username
      navigate('/main') // Redirect after login
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setMessage(err.response.data.message)
      } else {
        setMessage('An error occurred')
      }
    }
  }

  return (
    <body className="landContainer">
      <div className='regisBox'>
          <form onSubmit={handleLogin}>
          <h2 className='whiteTitleText'>Login</h2>
          <input
            className='regForm'
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <input
            className='regForm'
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <div className='btnContainer'>
            <button className='pinkBtn' type="submit" style={{ marginRight: "1rem" }}>Login</button>
            <button className='regblackBtn' type="button" onClick={() => navigate("/")}>Back</button>
          </div>
          <div>{message}</div>
          </form>
      </div>
    </body>
  )
}

export default Login