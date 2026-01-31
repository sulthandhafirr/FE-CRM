import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { ROUTE } from "../router/routes";

export default function AuthTest() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate()

  // const handleSignUp = async () => {
  //   const { data, error } = await supabase.auth.signUp({
  //     email,
  //     password,
  //   });

  //   if (error) {
  //     setMessage(`Error: ${error.message}`);
  //   } else {
  //     setMessage("Check your email maybe");
  //     console.log("User:", data);
  //   }
  // };

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      // setUser(data.user);
      setMessage("Logged in successful");
      navigate(ROUTE.main)
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto' }}>
      <h2>Supabase Auth Test</h2>
      
      <div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ display: 'block', marginBottom: '10px', padding: '8px', width: '100%' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: 'block', marginBottom: '10px', padding: '8px', width: '100%' }}
        />
        
        {/* <button onClick={handleSignUp} style={{ marginRight: '10px', padding: '8px 16px' }}>
          Sign Up
        </button> */}
        <button onClick={handleSignIn} style={{ padding: '8px 16px' }}>
          Sign In
        </button>
      </div>
      
      {message && (
        <p style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0' }}>
          {message}
        </p>
      )}
    </div>
  )
}
