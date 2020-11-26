import './App.scss';
import axios from 'axios';
import {
  BrowserRouter as Router,
  Switch,
  Route
  } from "react-router-dom";
import Login from './Login/LoginForm'
import EventId from './EventId/eventId'
import Register from './Register/RegisterForm'
// import ProfileForm from './Profile/ProfileForm'
import EventsIndex from './Events/EventsIndex';
import CreateEvent from './Events/CreateEvent';
import Navigation from './Navigation/Navigation'
import MyEventsIndex from './MyEvents/MyEventsIndex';
import Main from './Main';

import { useState , useEffect} from 'react';

export default function App(props) {
  const [islogin, setisLogin] = useState(false)
  const [currentUser, setCurrentUser] = useState(JSON.parse(window.localStorage.getItem('userData')));


  useEffect(() => {
      axios.get('http://localhost:8001/api/cookies', {withCredentials:true}).then((res) => 
      { 
        // console.log('before',islogin)
      // console.log('aftertrue',islogin)
        // return setCurrentUser(prev => ({...prev ,user : res.data}))
        return;
        
      })
    },[islogin])

  return (
    <div className="App">
      <Router>
        <Switch>

        <Route exact path='/'>
            <Main />
          </Route>

          <Route path='/login'>
            <Login 
            islogin ={islogin}
            setisLogin = {setisLogin} />
          </Route>

          <Route path='/register'>
            <Register />
          </Route> 
          {/* <Route exact path='/profile'>
            <ProfileForm  currentUser = {currentUser}
            /> 
          </Route>  */}

          <Route path='/navigation'>
            <Navigation
            /> 
          </Route>

          <Route exact path='/events' > 
          <EventsIndex  
           currentUser = {currentUser}/> 
          </Route>

          <Route exact path='/owners/events/new' >
            <CreateEvent currentUser = {currentUser}/>
          </Route>
          <Route exact path='/events/:eventId' > 
            <EventId currentUser = {currentUser}/>
           <EventsIndex  
            currentUser = {currentUser}/> 

          </Route>
          <Route exact path='/my-events/:screen' > 
          < MyEventsIndex currentUser = {currentUser}/>
        </Route > 
          <Route exact path='/events/:eventId' render={(props) => <EventId eventId={props.match.params.eventId}/>} /> 
        </Switch>
      </Router>
    </div>
    
  );
}

//id = {currentUser.user.id}
// first_name = {currentUser.user.first_name}
// last_name = {currentUser.user.last_name}