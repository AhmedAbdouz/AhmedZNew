import React, { useState } from "react";
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';
import $ from 'jquery';
import Popper from 'popper.js';
import { Button } from 'react-bootstrap';

import axios from 'axios';
import { useLocalStorage } from '../useLocalStorage';
import { useEffect } from 'react';
import { useHistory } from "react-router-dom";
axios.defaults.withCredentials = true;

function NavBar(props) {

  const [noti, SetNoti] = useState([]);
  const [num, SetNum] = useState(0);
  const [id, setId] = useLocalStorage("id", "");
  const history = useHistory();

  // const e=<h1>asdfsgh</h1>
  // const x=props.name;
  const x = ["SIGN IN","SING OUT", "Update Profile", "logout"];
  const functionArr = [signin,signout, handleUpdateProfile, handleLogout];

  // setInterval(() => {
  //   handleNotifcation();
  // }, 3000);

  function handleNotifcation() {
    axios.get(`http://localhost:4000/notification`, {})
      .then(res => {
        console.log(res.data);
        SetNoti(res.data);
      })
      .catch(function (error) {
        console.log(error);
        history.push("/");
      });
  }

  function handleUpdateProfile() {
    history.push("/UpdateProfile");
  }

  function signin() {
    axios.post(`http://localhost:4000/signin`, {id:id})
      .then(res => {
        alert(res.data);
      })
  }

  function signout() {
    axios.post(`http://localhost:4000/signout`, {id:id})
      .then(res => {
        alert(res.data);
      })
  }

  function goNotification () {
    history.push("/notification");
    console.log("ok")
  }

  function handleLogout() {
    axios.get(`http://localhost:4000/logout`, {})
      .then(res => {
        history.push("/");
      })
  }

  function findrecords(){
    let idx = noti.length-1;
    let ans=[];
    for(let i = 0 ;i<5 && idx>=0;i++,idx--){
      let y = noti  
      ans.push(<button className="notitem" type="button" onClick= {()=>{history.push(y.route)}}>{y.id} -- {y.status} </button>);
    }
    return ans;
  }

  return (
    <div className="NavColor">
      <nav className="navbar navbar-expand-lg navbar-dark">
        <a className="navbar-brand" href="">GUC</a>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav ml-auto">
          {/* <li key="45464">
          <select
          value={"Notification"}
          onChange={handleNotifcation}
          className="custom-select"
        >
          <option value="">Choose slot</option>
          <option value="slot1">slot1 </option>
          <option value="slot2">slot2 </option>
          <option value="slot3">slot3 </option>
          <option value="slot4">slot4 </option>
          <option value="slot5">slot5 </option>
        </select>
          </li> */}
            <li key={20}>
              <div className="btn-group">
                <button type="button" className = "navButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" onClick={handleNotifcation}>
                  Notification
  </button>
                <div className="dropdown-menu dropdown-menu-right">
                  {
                    findrecords()
                  }
                  <button className="noti" type="button" onClick={goNotification}>Show all</button>
                </div>
              </div>
            </li>
            {
              x.map((y, idx) => {
                return (<li className="" key={y}>
                  <button  className = "navButton" aria-haspopup="true" aria-expanded="false" onClick={functionArr[idx]} name={y} >{y}</button>
                </li>)
              })
            }
          </ul>
        </div>
      </nav>
    </div>
  )
}

export default NavBar;