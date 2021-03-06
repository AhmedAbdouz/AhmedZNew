import React, { useState } from "react";
import axios from "axios";
import { useLocalStorage } from "../useLocalStorage";
import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import NavBar from "./NavBar.jsx";

function ViewReceivedLeaveRequest(props) {
  const [data, setData] = useState([]);
  const [message, setMessage] = useState([]);
  const [id, setId] = useState([]);
  useEffect(async () => {
    var x = await axios.get(`http://localhost:4000/viewReceivedLeaveRequest/`+props.status
  );
  if(x.data!="No requests found")
    setData(x.data);
  }, []);

  function handleAccept(event) {
    event.preventDefault();
    axios
      .post(`http://localhost:4000/accept_leave_request`, {
        request_id: event.target.value,
      })
      .then(async (res) => {
        await setTimeout(async function () {
          // Whatever you want to do after the wait
          var x = await axios.get(
            `http://localhost:4000/viewReceivedLeaveRequest/` + props.status
          );
          if (x.data != "No requests found") setData(x.data);
          setMessage(res.data);
          setId(event.target.value);
        }, 500);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  function handleReject(event) {
    event.preventDefault();
    axios
      .post(`http://localhost:4000/reject_leave_request`, {
        request_id: event.target.value,
      })
      .then(async (res) => {
        await setTimeout(async function () {
          // Whatever you want to do after the wait
          var x = await axios.get(
            `http://localhost:4000/viewSentReplacment/` + props.status
          );
          if (x.data != "No requests found") setData(x.data);
          setMessage(res.data);
          setId(event.target.value);
        }, 500);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  return (
    <div>
      <NavBar />
      <h3 style={{ textAlign: "center" }}>recieved leave requests</h3>
      <table className="table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Id</th> 
            <th scope="col">Reason</th>
            <th scope="col">Date Leave</th>
            <th scope="col">Date Arrive</th>
            <th scope="col">status</th>
            <th scope="col">from</th>
            {(props.status == "Pending" || props.status == "") && (
              <th scope="col">Message</th>
            )}
            {(props.status == "Pending" || props.status == "") && (
              <th scope="col">accept</th>
            )}
            {(props.status == "Pending" || props.status == "") && (
              <th scope="col">reject</th>
            )}

          </tr>
        </thead>
        <tbody>
          {data.map((y, idx) => {
            return (
              <tr>
                <th scope="row">{idx + 1}</th>
                <td>{y.id}</td>
                <td>{y.reason}</td>
                <td>{y.dateLeave}</td>
                <td>{y.dateArrive}</td>
                <td>{y.status}</td>
                <td>{y.from}</td>
                {(y.status == "Pending" || y.status == "") && (
                  <td> {y.id == id ? "   " + message : ""}</td>
                )}
                {(y.status == "Pending" || y.status == "") && (
                  <td>
                    {" "}
                    <button
                      type="button"
                      className="btn btn-outline-success"
                      onClick={handleAccept}
                      value={y.id}
                    >
                      Accept
                    </button>
                  </td>
                )}
                {(y.status == "Pending" || y.status == "") && (
                  <td>
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={handleReject}
                      value={y.id}

                    >
                      Reject
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ViewReceivedLeaveRequest;
