import { Redirect, useRouteMatch, Link } from 'react-router-dom';
import axios from 'axios';
import { useState, useEffect } from 'react';
import EventFilter from './EventFilter';
import { Button } from 'react-bootstrap';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap/';
import Card from 'react-bootstrap/Card'
import './Events.scss';

export default function EventsIndex(props) {
  const { path } = useRouteMatch();
  const [isLogout, setisLogout] = useState(false)
  const [allUpcomingEvents, setAllUpcomingEvents] = useState([{}]);
  const [allPastEvents, setAllPastEvents] = useState([{}]);
  const [myUpcomingEvents, setMyUpcomingEvents] = useState([{}]);
  const [myPastEvents, setMyPastEvents] = useState([{}]);
  const [isAllEvents, setIsAllEvents] = useState("All Events");
  const [isUpcoming, setIsUpcoming] = useState("Upcoming");
  const [categoryFilter, setCategoryFilter] = useState({});
  const [position, setPosition] = useState([])
  const [distanceFlag, setDistanceFlag] = useState(false);
  const [distanceArr, setDistanceArr] = useState([])

  const distanceApi = (coords, locations) => {
    //Distance Matrix API
    const proxyurl = "https://cors-anywhere.herokuapp.com/";
    let URL = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${coords[0]},${coords[1]}&destinations=`
    locations.map((location, index) => {
      if (index === 0) {
        URL += `${location.x}%2C${location.y}`
      } else {
        URL += `%7C${location.x}%2C${location.y}`
      }
    })
    URL += `&key=${process.env.REACT_APP_geocodeKey}`
    const myInit = {
      method: 'GET',
      mode: 'no-cors',
    }
    //Using proxy for this fetch
    fetch(proxyurl + URL)
      .then(response => response.text())
      .then(data => {
        return data ? JSON.parse(data) : {}
      })
      .then(data => {
        const tempDistanceArr = data.rows[0].elements.map((event) => {
          return event.duration.text
        })
        setDistanceFlag(true)
        setDistanceArr(tempDistanceArr) 
        return tempDistanceArr
      })
  }
  useEffect(() => {
    const first = axios.get('http://localhost:8001/api/events')
    const second = axios.get('http://localhost:8001/api/events/past')
    const third = axios.get(`http://localhost:8001/api/events/users/${props.currentUser.id}`)
    const fourth = axios.get(`http://localhost:8001/api/events/users/${props.currentUser.id}/past`)
    Promise.all([
      first,
      second,
      third,
      fourth
    ]).then(all => {
      setAllUpcomingEvents(prev => all[0].data);
      setAllPastEvents(prev => all[1].data);
      setMyUpcomingEvents(prev => all[2].data);
      setMyPastEvents(prev => all[3].data);
      const locations = []

      let selectedEvents
      //Filtering List of events to send to distance matrix api 
      if (isAllEvents === 'All Events') {
        if (isUpcoming === 'Upcoming') {
          selectedEvents = filterEvents(all[0].data, categoryFilter)
        } else {
          selectedEvents = filterEvents(all[1].data, categoryFilter)
        }
      } else {
        if (isUpcoming === 'Upcoming') {
          selectedEvents = filterEvents(all[2].data, categoryFilter)
        } else {
          selectedEvents = filterEvents(all[3].data, categoryFilter)
        }
      }

      // //If Events match criteria push coords to arr
      if (selectedEvents.length !== 0) {
        selectedEvents.map((event) => {
          locations.push(event.location)
        })
      }

  //     //Request users position
      navigator.geolocation.getCurrentPosition(async success => {
        const pos = [
          success.coords.latitude,
          success.coords.longitude
        ];
        if (locations) {
          //Set user position
          setPosition(pos)
          if (pos && selectedEvents.length !== 0) {
            //Get distance from user to event
            const check = distanceApi(pos, locations)
          }
        }
      })
    })
  }, [categoryFilter, isUpcoming, isAllEvents])

  function logout_validation() {
    axios.post('http://localhost:8001/api/logout', {}).then((res) => setisLogout(true))
  };


  if (isLogout) {
    return <Redirect to="/" />
  };

 
  //----------Delete the event-------------
  function cancelEvent(event_id) {
    return axios.delete(`http://localhost:8001/api/owners/events/${event_id}/delete`).then(() =>
    { const event = {
      ...allUpcomingEvents.events[event_id],
      event: null
    }
    const events = {
      ...allUpcomingEvents.events,
      [event_id]: event
    }
      setAllUpcomingEvents({...allUpcomingEvents, events})
  })
  }
  
  //should redirect the edit form
  function edit(id) {
    return <Redirect to={`owner/events/edit/${id}`}/>
  }

  //Check if the user is owner 
  function checkOwner (event) {
    if (event.owner_id === props.currentUser.id) {
      return true
    }
  }
  // Function to filter event based on category
  const filterEvents = (eventsList, filter) => {
    let filteredEvents = eventsList;
    for (let category in filter) {
      filteredEvents = filter[category] ? filteredEvents.filter(event => event[category] === filter[category]) : filteredEvents;
    }
    return filteredEvents;
  }

  // Create an object that 
  const makeEventsByDateObj = (events) => {
    let dates = [...new Set(events.map(event => event.date).sort())];
    const eventsByDate = {};
    for (let date of dates) {
      const dateFormatted = date //date.slice(0, 10) //Removing time from date string
      //eventsByDate[dateFormatted] = events.filter(item => item.dateFormatted === dateFormatted)
      eventsByDate[date] = events.filter(item => item.date === date)
    }
    return eventsByDate;
  }

  let subsetEvents;

  if (isAllEvents === "All Events") {
    subsetEvents = isUpcoming === "Upcoming" ? allUpcomingEvents : allPastEvents;
  } else {
    subsetEvents = isUpcoming === "Upcoming" ? myUpcomingEvents : myPastEvents;
  }

  let filteredEvents = filterEvents(subsetEvents, categoryFilter);
  let eventsByDate = makeEventsByDateObj(filteredEvents);
  
  const eventElements = Object.keys(eventsByDate).map((date, index) => {
    return (
      <div key={date}>
      <h3>{new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
      {
        eventsByDate[date].map(event => {
          return (
            <div className="events">
            <Card >
              <Card.Link href={`/events/${event.id}`}>
              <div id="card-top">
              <Card.Header > {event.start_time && event.start_time.slice(0, 5)} - {event.end_time && event.end_time.slice(0, 5)}</Card.Header>
                      {distanceFlag && <Card.Header > {distanceFlag && distanceArr[index]} away </Card.Header>}
                <Card.Header>{event.first_name} {event.last_name} </Card.Header>
              </div>
              <Card.Body >
                <Card.Title>{event.title}</Card.Title>
                <Card.Text>
                  <small className="text-muted">{event.province}</small>
                </Card.Text>
                <div id="card-bottom">
                  <Card.Text>
                    {event.skill_level}
                  </Card.Text>
                  <Card.Text>
                  {event.current_participants}/{event.max_participants}
                  </Card.Text>
                </div>
                </Card.Body>
                </Card.Link>
                
               {  checkOwner(event) && 
               <>
               <Card.Footer className="edit-delete_buttons">
                <Button block size="sm"  onClick= {(e) => { e.preventDefault();
                                          console.log('here', event)
                                          cancelEvent(event.id)}} > Delete</Button>

                <Button block size="sm" onClick= {(e) => { e.preventDefault();
                console.log('id',event.id)
                                          edit(event.id)
                                          }}> Edit </Button>
                </Card.Footer>
                </> }
            </Card>
            
            </div>
          )
        }) 
      }
      </div>
    )
  });
  if (!distanceFlag) {
    return 'loading'
  }
  return (
    <>
      <Navbar bg="light" expand="lg">
        <Navbar.Brand href="/events">Sports</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav>
            <NavDropdown title="All Events" id="basic-nav-dropdown">
              <NavDropdown.Item href="/my-events/upcoming">Upcoming</NavDropdown.Item>
              <NavDropdown.Item href="/my-events/past">Past</NavDropdown.Item>
            </NavDropdown>

            <NavDropdown title="My Events" id="basic-nav-dropdown">
              <NavDropdown.Item href="/my-events/upcoming">Joined</NavDropdown.Item>
              <NavDropdown.Item href="/my-events/past">Owned</NavDropdown.Item>
            </NavDropdown>

          </Nav>
          {props.currentUser &&
            <Nav className="justify-content-end">
              <Nav.Link href="/profile">My Profile<span>{props.currentUser.first_name} {props.currentUser.last_name}</span></Nav.Link>
              <Button size="sm" onClick={(event) => {
                event.preventDefault();
                logout_validation()
              }}>Logout</Button>
            </Nav>}
        </Navbar.Collapse>
      </Navbar>
      <Nav className="col-md-12 d-none d-md-block bg-light sidebar">
        <div className="sidebar-sticky"></div>
        <EventFilter 
          setCategoryFilter={setCategoryFilter} 
          setIsUpcoming={setIsUpcoming} 
          setIsAllEvents={setIsAllEvents}
          />
      </Nav>
      {eventElements.length ? eventElements : <p>There's no event with your criteria.</p>}
    </>
    )
}
