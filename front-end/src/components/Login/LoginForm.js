import  { useState, React } from "react";
import { Redirect } from "react-router-dom";
import axios from 'axios';
import { Form, Button, Navbar, Nav, NavItem, NavDropdown } from 'react-bootstrap';
import './Login.scss'

export default function Login (props) {
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError ] = useState("")


  const userLoggedin =  function() {
    if (email === "") {
      setError("this cannot be blank")
      return;
    }
    if (password === "") {
      setError("this cannot be blank")
      return;
    }
    axios.post('http://localhost:8001/api/login', { email, password },{withCredentials:true}).then((res) =>
     { 
       if(res.data === "Email does not exist") {
         setError(res.data)
        
       } else {
        props.setisLogin(true);
       }
      }
    )
  }
  if (props.islogin) {
    return <Redirect to="/events"/>
  };

  return (
    <>
    <Navbar bg="light" expand="lg">
    <Navbar.Brand href="/">Sports</Navbar.Brand>
    <Navbar.Toggle aria-controls="basic-navbar-nav" />
    <Navbar.Collapse id="basic-navbar-nav">
    <Nav className="mr-auto">
    
      <Nav.Link href="/login">Login</Nav.Link>
      <Nav.Link href="/register">Register</Nav.Link>
    
    </Nav> 
    </Navbar.Collapse>
      
  </Navbar>
    <div className="Login">
    <Form 
    id="login"
    onSubmit={event => {
                  event.preventDefault();
                  userLoggedin()

                }}>
      <Form.Group size="lg" controlId="formBasicEmail">
        <Form.Label>Email</Form.Label>
        <Form.Control 
          type="email"  
           value={email} 
          onChange={(event) => {
            setEmail(event.target.value)
          }}
       />
    </Form.Group> 
      <Form.Group size="lg" controlId="password">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </Form.Group>
      <Button block size="lg" type="submit">
        Login
      </Button>
    </Form>
    <h2>{error}</h2>
    </div>
    </>
  );
 
}; 
