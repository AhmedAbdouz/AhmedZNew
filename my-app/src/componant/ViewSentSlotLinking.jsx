import React, { useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import NavBar from "./NavBar.jsx";

function SentSlotLinking(props) {
  const [data, setData] = useState([]);
  const [message, setMessage] = useState([]);
  const [id, setId] = useState([]);
  useEffect(async () => {
    var x = await axios.get(
      `http://localhost:4000/viewSentSlotLinkingRequests/`+props.status
    );
    if(x.data!="No requests found")
    setData(x.data);
  }, []);

  function handleCancel(event) {
    event.preventDefault();
    axios
      .post(`http://localhost:4000/cancelSlotLinkingRequest`, {
        id: event.target.value,
      })
      .then(async (res) => {
        await setTimeout(async function () {
          // Whatever you want to do after the wait
          var x = await axios.get(
            `http://localhost:4000/viewSentSlotLinkingRequests/` + props.status
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
      <h3 style={{textAlign:"center"}}>SlotLinking requests</h3>
      <table className="table">
        <thead>
          <tr >
            <th scope="col">#</th>
            <th scope="col">Request</th>
            <th scope="col">slot</th>
            <th scope="col">day</th>
            <th scope="col">course</th>
            <th scope="col">status</th>
            <th scope="col">to</th>
            {(props.status == "Pending" || props.status == "") && (
              <th scope="col">Message</th>
            )}
            {(props.status == "Pending" || props.status == "") && (
              <th scope="col">cancel</th>
            )}

          </tr>
        </thead>
        <tbody>
          {data.map((y, idx) => {
            return (
              <tr>
                <th scope="row">{idx + 1}</th>
                <td>{y.request}</td>
                <td>{y.slot}</td>
                <td>{y.day}</td>
                <td>{y.course}</td>
                <td>{y.status}</td>
                <td>{y.to}</td>
                {(props.status == "Pending" || props.status == "") && (
                  <td> {y.id == id ? "   " + message : ""}</td>
                )}
                {(props.status == "Pending" || props.status == "") && (
                  <td>
                    {" "}
                    <button
                      type="button"
                      className="btn btn-outline-warning"
                      onClick={handleCancel}
                      value={y.id}
                    >
                      cancel
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

export default SentSlotLinking;
