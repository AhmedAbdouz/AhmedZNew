require("dotenv").config();
const express = require('express')
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const bcryptjs = require('bcryptjs');
const schedule = require('node-schedule');
const Router = new express.Router();
const cors = require('cors');

const hr = require("./hr.js");
const acMember = require("./AcMember.js");
const course = require('./course.js');
const department = require('./department.js');
const constants = require('./constants.js');
const locations = require('./locations.js');
const HrRouter = require('./HrPortal.js');

const { json, request } = require("express");

const app = express();
app.use(cors({credentials:true , origin:"http://localhost:3000"}));

Router.use(express.json()); 


app.use(express.json());
app.use(cookieParser());

app.use("/hr",HrRouter);

try {
  mongoose.connect("mongodb+srv://admin-Ashraf:qwertyuiop@cluster0.oamtr.mongodb.net/staffPortal?retryWrites=true&w=majority", {
    useUnifiedTopology: true,
    useNewUrlParser: true
  });
} catch (err) {
  console.log(err);
}



const hrHema = new hr({
  email: "s@sscn",
  id: "-12",
  name: "sad",
  password: "sad",
  salary: 1213,
  attendance:
    [{ day: "sad" }, { name: "xzc" }]

})
let c;
let hr_Counter;
let AC_Counter;
async function findC() {
  await constants.findOne({}, (err, result) => {
    if (err)
    console.log(err);
    else if (!result) {
      console.log("constants collection is empty")
    } else {
      c = result;
       hr_Counter=c.hr_Counter;
       AC_Counter=c.ac_Counter;
    }
    
  })
}

  findC();




/// Ahmed Part
{
  let emptyschadule = [{
    slot1: "free",
    slot2: "free",
    slot3: "free",
    slot4: "free",
    slot5: "free",
    day: "Saturday"
  }, {
    slot1: "free",
    slot2: "free",
    slot3: "free",
    slot4: "free",
    slot5: "free",
    day: "Sunday"
  }, {
    slot1: "free",
    slot2: "free",
    slot3: "free",
    slot4: "free",
    slot5: "free",
    day: "Monday"
  }, {
    slot1: "free",
    slot2: "free",
    slot3: "free",
    slot4: "free",
    slot5: "free",
    day: "Thursday"
  }, {
    slot1: "free",
    slot2: "free",
    slot3: "free",
    slot4: "free",
    slot5: "free",
    day: "Wednesday"
  }, {
    slot1: "free",
    slot2: "free",
    slot3: "free",
    slot4: "free",
    slot5: "free",
    day: "Tuesday"
  }];

  function authanticateToken(req, res, next) {
    //const token = authHeader && authHeader.split(" ")[1];
    const token = req.cookies.token;
    if (token == null) {
      console.log("test");
      return res.sendStatus(401);
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err)
        return res.sendStatus(403);
      req.userID = user.id;
      next();
    });
  };

  let genertateToken = function (res, id) {
    const token = jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET);
    return res.cookie('token', token, {
      secure: false, // set to true if your using https
      httpOnly: true,
    });
  };

  app.post("/test", authanticateToken, (req, res) => {
    res.send(req.userID);
    console.log(req.body.password);
    hr.findOne({ id: req.userID }, (err, founduser) => {
      founduser.name = "hello";
      founduser.save();
    })
  })

  app.get("/notification", authanticateToken, (req, res) => {
    const arr = req.userID.split("-");
        if (arr[0] == "hr") {
          hr.findOne({ id: req.userID }, (err, founduser) => {
            if(err)
            return res.send(err);
            else{
              return res.send(founduser.notification)
            }
          })
        }
        else{
          acMember.findOne({ id: req.userID }, (err, founduser) => {
            if(err)
            return res.send(err);
            else{
              return res.send(founduser.notification)
            }
          })
        }
    
  })

  app.post("/resetpassword", async (req, res) => {

    if (!req.body.oldPassword || !req.body.newPassword || !req.body.confirmPass || !req.body.id) {
      return res.send("missingfield(s)");
    }
    else {
      const newpass = req.body.newPassword;
      const confirmPass = req.body.confirmPass;
      if (newpass !== confirmPass) {
        return res.send("Password and confirmpassword don't match");
      }
      else {
        const salt = await bcryptjs.genSalt();
        const Hashedpassword = await bcryptjs.hash(newpass, salt);
        const arr = req.body.id.split("-");
        if (arr[0] == "hr") {
          hr.findOne({ id: req.body.id }, function (err, user) {
            if (err)
             return res.send(err);
            else if (!user)
              res.send("couldn't find the user with this email");
            else {
              bcryptjs.compare(req.body.oldPassword, user.password, async function (err, ok) {
                if (ok) { // Passwords match
                  const token = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET);
                  res.cookie('token', token, {
                    secure: false, // set to true if your using https
                    httpOnly: true,
                  })
                  user.password = Hashedpassword;
                  user.firstLogin = false;
                  await user.save();
                  res.send("ok")
                }
                else
                  res.send("wrong oldpassword");
              });
            }
          })
        }
        else {
          acMember.findOne({ id: req.body.id }, function (err, user) {
            if (err)
              res.send(err);
            else if (!user)
              res.send("couldn't find the user with this email");
            else {
              bcryptjs.compare(req.body.oldPassword, user.password, async function (err, ok) {
                if (ok) { // Passwords match
                  const token = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET);
                  res.cookie('token', token, {
                    secure: false, // set to true if your using https
                    httpOnly: true,
                  })
                  user.password = Hashedpassword;
                  user.firstLogin = false;
                  await user.save();
                  res.send("ok")
                }
                else
                  res.send("wrong oldpassword");
              });
            }
          })
        }
      }
    }
  })

  app.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const staffType = req.body.staffType;  // 1 => hr  && 2 => acmember
    if (!email || !password || !staffType) {
      res.send("make sure you entered email and password and staffType");
    }
    else {
      if (staffType == "1") {
        hr.findOne({ email: email }, function (err, user) {
          if (err)
            res.send(err);
          else if (!user)
            res.send("couldn't find the user with this email");
          else {
            bcryptjs.compare(password, user.password, function (err, ok) {
              if (ok) { // Passwords match
                res.userID = user.id;
                if (user.firstLogin) {
                  res.send({ message: "change password", id: user.id })
                }
                else {
                  const token = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET);
                  res
                    .status(202)
                    .cookie('token', token, {
                      secure: false, // set to true if your using https
                      httpOnly: true,
                    })
                    .send({ message: "loged in", id: user.id });
                }
              } else
                res.send("wrong password or he is not hr");
            });
          }
        })
      }
      else {
        acMember.findOne({ email: email }, function (err, user) {
          if (err)
            res.send(err);
          else if (!user)
            res.send("couldn't find the user with this email");
          else {
            bcryptjs.compare(password, user.password, function (err, ok) {
              if (ok) { // Passwords match
                res.userID = user.id;
                if (user.firstLogin) {
                  res.send({ message: "change password", id: user.id })
                }
                else {
                  const token = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET);
                  res
                    .status(202)
                    .cookie('token', token, {
                      secure: false, // set to true if your using https
                      httpOnly: true,
                    })
                    .send({ message: "loged in", id: user.id , instructor:user.instructor, head:user.head, coordinator:user.coordinator , ta:user.ta  });
                }
              } else
                res.send("wrong password or he is not ac");
            });
          }
        })
      }
    }
  })

  app.get("/logout", authanticateToken, (req, res) => {
    res.cookie("token", null, {
      expires: new Date(1999, 11, 24, 10, 33, 30, 0),
      secure: false, // set to true if your using https
      httpOnly: true
    });
    res.send("redirected to login page");
  });

  app.post("/addStuff", (req, res) => {
    // check that this user is hr
    hr.findOne({ id: req.userID }, async (err, result) => {
      if (err) {
        res.send("You aren't HR to do this!! || or some error happeded with the database");
      }
      else {
        const salt = await bcryptjs.genSalt();
        const passwordHashed = await bcryptjs.hash("123456", salt);

        // 1 for hr  and 2 for acMember
        if (req.body.staffType == "1") {
          const newstaff = new hr({
            email: req.body.email,
            id: "hr-" + hr_Counter,
            gender: req.body.gender,
            name: req.body.name,
            password: passwordHashed,
            salary: req.body.salary,
            monthSalary: 0,
            attendance: [],
            firstLogin: true,
            annual_leave_balance: 0,
            missingdays: 0,
            LeaveRequests: [],
            holidayRequests: [],
            notification: [],
            AccidentalCount: 0
          })
          c.hr_Counter++;
          
          try{
            await c.save();
          }
          catch(err){
            return res.send(err);
          }
          console.log("here");
          newstaff.save();
          res.send("successfully add new hr to the database you can look and make sure");
        }
        else {
          const newstaff = new acMember({
            id: "ac-" + AC_Counter,
            gender: req.body.gender,
            email: req.body.email,
            name: req.body.name,
            password: passwordHashed,
            salary: req.body.salary,
            monthSalary: 0,
            dayOff: req.body.dayOff,
            office: req.body.office,
            schadule: emptyschadule,
            attendance: [],
            firstLogin: true,
            hours: 0,
            head: false,
            instructor: false,
            coordinator: false,
            ta: true,
            request: [],
            annual_leave_balance: 0,
            missingdays: 0,
            LeaveRequests: [],
            holidayRequests: [],
            notification: [],
            AccidentalCount: 0
          });
          c.ac_Counter++; 
          try{
            await c.save();
          }
          catch(err){
            return res.send(err);
          }
          newstaff.save();
          res.send("successfully add new AC to the database you can look and make sure");
        }
      }
    })
  })


  app.get("/profile", authanticateToken, async (req, res) => {

    const arr = req.userID.split("-");
    if (arr[0] == "hr") {
      hr.findOne({ id: req.userID }, function (err, foundUser) {
        if (err) {
          res.send(err);
        }
        else if (!foundUser)
          res.send("there is a problem in database or something else can not find you date");
        else {
          foundUser.password = null;
          res.send(foundUser);
        }
      });
    }
    else {
      acMember.findOne({ id: req.userID }, {}, function (err, foundUser) {
        if (err) {
          res.send(err);
        }
        else if (!foundUser)
          res.send("there is a problem in database or something else can not find you date");
        else {
          let ans = {};
          ans.name = foundUser.name;
          ans.email = foundUser.email;
          ans.id = foundUser.id
          res.send(foundUser);
        }
      });
    }
  })

  app.put("/updateProfile", authanticateToken, async (req, res) => {
    // thsi part for any updated you want to add just pass it in the body and update below
    let updates = {};
    const arr = req.userID.split("-");

    if (req.body.email) {
      updates.email = req.body.email
    }

    // this part for changing password
    if (req.body.oldPassword) {
      let old = req.body.oldPassword;
      let newpass = req.body.newPassword;
      let confirmPass = req.body.confirmPass;
      if (newpass !== confirmPass) {
        return res.send("new password and confirm don't match");
      }
      else {
        const salt = await bcryptjs.genSalt();
        const Hashedpassword = await bcryptjs.hash(newpass, salt);
        if (arr[0] == "hr") {
          hr.findOne({ id: req.userID }, (err, foundUser) => {
            if (err)
              return res.send(err);
            if (!foundUser)
              return res.send("could not complete the update because of a problem in the database");
            else {
              bcryptjs.compare(old, foundUser.password, function (err, ok) {
                if (err) {
                  return res.send(err);
                }
                else {
                  if (ok) {
                    foundUser.password = Hashedpassword;
                    foundUser.save();
                  }
                  else {
                    return res.send("old password is wrong");
                  }
                }
              })
            }
          })
        }
        else {
          acMember.findOne({ id: req.userID }, (err, foundUser) => {
            if (err)
              return res.send(err);
            if (!foundUser)
              return res.send("could not complete the update because of a problem in the database");
            else {
              bcryptjs.compare(old, foundUser.password, function (err, ok) {
                if (err) {
                  return res.send(err);
                }
                else {
                  if (ok) {
                    foundUser.password = Hashedpassword;
                    foundUser.save();
                  }
                  else {
                    return res.send("old password is wrong");
                  }
                }
              })
            }
          })
        }
      }
    }
    if (arr[0] == "hr") {
      hr.updateOne({ id: req.userID }, updates, function (err) {
        if (err) {
          res.send(err);
        }
        else {
          res.send("Successfully updated these info");
        }
      });
    }
    else {
      acMember.updateOne({ id: req.userID }, updates, function (err) {
        if (err) {
          return res.send(err);
        }
        else {
          return res.send("Successfully updated these info");
        }
      });
    }
  })

  // no need for authantication he/she will give us the id than this is the authantication part
  app.post("/signin", (req, res) => {
    console.log(req.body);
    const added = { date: new Date(), type: "in" };
    const n = added.date.getTimezoneOffset();
    const startTime = new Date();
    const endTime = new Date();
    startTime.setHours(7, 0, 0);
    endTime.setHours(19, 0, 0);

    if (added.date >= startTime && added.date <= endTime) {
      if (!req.body.id)
        return res.send("you have to pass your id to the machine again");
      const arr = req.body.id.split("-");
      if (arr[0] == "hr") {
        hr.findOneAndUpdate({ id: req.body.id }, { $push: { attendance: added } }, function (err, foundUser) {
          if (err) {
            return res.send(err);
          }
          else if (!foundUser)
            return res.send("problem with the server of the date base couldn't find you");
        });
      }
      else {
        acMember.findOneAndUpdate({ id: req.body.id }, { $push: { attendance: added } }, function (err, foundUser) {
          if (err) {
            return res.send(err);
          }
          else if (!foundUser)
            return res.send("problem with the server of the date base couldn't find you");
        });
      }
      res.send("successfully add new sign-in date");
    }
    else {
      res.send("You can't sign in this time");
    }
  });

  app.post("/signout", async (req, res) => {
    const added = { date: new Date(), type: "out" };



    const startTime = new Date();
    const endTime = new Date();
    startTime.setHours(7, 0, 0);
    endTime.setHours(19, 0, 0);

    if (added.date >= startTime && added.date <= endTime) {
      if (!req.body.id)
        return res.send("you have to pass your id to the machine again");
      const arr = req.body.id.split("-");
      if (arr[0] == "hr") {
        hr.findOneAndUpdate({ id: req.body.id }, { $push: { attendance: added } }, function (err, foundUser) {
          if (err) {
            return res.send(err);
          }
          else if (!foundUser)
            return res.send("problem with the server of the date base couldn't find you");
        });
      }
      else {
        acMember.findOneAndUpdate({ id: req.body.id }, { $push: { attendance: added } }, function (err, foundUser) {
          if (err) {
            return res.send(err);
          }
          else if (!foundUser)
            return res.send("problem with the server of the date base couldn't find you");
        });
      }
      res.send("successfully add new sign-out date ");
    }
    else {
      res.send("You can't sign out this time")
    }
  });

  app.post("/attendance", authanticateToken, async (req, res) => {
    const month = req.body.month;
    const year = req.body.year;
    const filt = { id: req.userID }


    const arr = req.userID.split("-");
    if (arr[0] == "hr") {
      await hr.findOne(filt, (err, result) => {
        if (err)
          return res.send(err);
        if (!result) {
          return res.send("problem in server of data base could not find the requested date 401 error file not found");
        }
        else {
          let temp = result.attendance;
          if (month) {
            temp = result.attendance.filter(record => record.date.getMonth() + 1 == month && record.date.getFullYear() == year);
          }
          res.send(temp);
        }
      })
    }
    else {
      await acMember.findOne(filt, (err, result) => {
        if (err)
          return res.send(err);
        if (!result) {
          return res.send("problem in server of data base could not find the requested date 401 error file not found");
        }
        else {
          let temp = result.attendance;
          if (month) {
            temp = result.attendance.filter(record => record.date.getMonth() + 1 == month);
          }
          res.send(temp);
        }
      })
    }
  })

  app.get("/monthPiker",authanticateToken,(req,res)=>{
    res.send("render Month componant")
  })

  app.get("/testAuthantication",authanticateToken,(req,res)=>{
    res.send("render the componant")
  })
  // function filterMonth(arr,month,year){
  //   let temp=[];

  // }

  app.post("/view_missingdays_and_hours", authanticateToken, (req, res) => {
    const arr = req.userID.split("-");
    if (arr[0] == "hr") {
      hr.findOne({ id: req.userID }, (err, foundUser) => {
        if (err) {
          return res.send(err);
        }
        if (!foundUser)
          return res.send("could not complete the update because of a problem in the database");
        else {
          if (req.body.month && req.body.year) {
            const temp = foundUser.dayinfo.filter(record =>
              record.date.getMonth() + 1 == req.body.month && record.date.getFullYear() == req.body.year
            );
            res.send({ arr: temp, hours: foundUser.hours ,missingdays:foundUser.missingdays});
          }
          else {
            res.send({ arr: foundUser.dayinfo, hours: foundUser.hours ,missingdays:foundUser.missingdays});
          }
        }
      })
    }
    else {
      acMember.findOne({ id: req.userID }, (err, foundUser) => {
        if (err) {
          return res.send(err);
        }
        if (!foundUser)
          return res.send("could not complete the update because of a problem in the database");
        else {
          if (req.body.month && req.body.year) {
            const temp = foundUser.dayinfo.filter(record => record.date.getMonth() + 1 == req.body.month && record.date.getFullYear() == req.body.year);
            res.send({ arr: temp, hours: foundUser.hours ,missingdays:foundUser.missingdays});
          }
          else {
            res.send({ arr: foundUser.dayinfo, hours: foundUser.hours ,missingdays:foundUser.missingdays});
          }
        }
      })
    }
  })

  

  function check2dates(d1, d2) {
    return d1.getYear() == d2.getYear() && d1.getMonth() == d2.getMonth() && d1.getDate() == d2.getDate();
  }

  // function intervalFunc() {
  //   console.log('Cant stop me now!');
  //   updateDayinfo();
  // }


  const salaryJob = schedule.scheduleJob("0 20 10 * *", () => {
    console.log("jobs runs automaticaly  here");
    updateSalary();
  });



  function updateSalary() {
    hr.find({}, (err, users) => {
      if (err)
        console.log(err);
      else {
        users.forEach(record => {
          let salary = record.salary;
          let diffINDays = record.missingdays - Math.floor(record.annual_leave_balance);
          let monthDays = new Date(new Date().getFullYear, new Date().getMonth(), 0).getDate();
          let deduction = monthDays * 24 * 60 - record.hours - 179;
          let monthSalary = salary;
          if (diffINDays > 0) {
            monthSalary -= diffINDays * salary / 60;
          }
          if (deduction > 0) {
            monthSalary -= deduction * salary / (180 * 60);
          }

          console.log(monthSalary);
          record.monthSalary = monthSalary;
          record.annual_leave_balance += 2.5;
          record.hours = 0;
          record.missingdays = 0;
          record.save();
        })
      }
    })
  }

  const dayJob = schedule.scheduleJob({ hour: 19, minute: 0 }, () => {
    console.log("jobs runs automaticaly");
    updateDayinfo();
  });

  // updateDayinfo();
  function updateDayinfo() {
    hr.find({}, (err, users) => {
      if (err)
        console.log(err);
      else {
        users.forEach(record => {
          let ans = findrecordfordayinfo(record);
          record.dayinfo.push(ans);
          record.save();

        })
      }
    })
  }
  // dayOrPart   Part Day
  function compare2dates(curDay, d1, d2) {
    return curDay >= d1 && curDay < d2;
  }

  function findRecord(d1,d2){
    return d1.getDay()==d2.getDay() && d1.getMonth()==d2.getMonth() && d1.getFullYear()==d2.getFullYear() ;
  }

  function updateDayinfo(date,id){
    const arr = id.split("-");
    if (arr[0] == "hr") {
      hr.findOne({id:id},async(err,foundUser)=>{
        if(err)
          console.log(err);
        else{
          for(let idx= 0 ; idx<foundUser.dayOff;idx++){
            if(findRecord(date,foundUser.dayinfo[idx].date)){
              founduser.hours -= (8*60+24)/60 + foundUser.dayinfo[idx].missinghours;
              foundUser.dayinfo.splice(idx,idx);
              foundUser.dayinfo.push(findrecordfordayinfo());
              foundUser.dayinfo.sort();
              await foundUser.save();
            }
          }
        }
      })
    }
    else{
      acMember.findOne({id:id},async (err,foundUser)=>{
        if(err)
          console.log(err);
        else{
          for(let idx= 0 ; idx<foundUser.dayOff;idx++){
            if(findRecord(date,foundUser.dayinfo[idx].date)){
              founduser.hours -= (8*60+24)/60 + foundUser.dayinfo[idx].missinghours;
              foundUser.dayinfo.splice(idx,idx);
              foundUser.dayinfo.push(findrecordfordayinfo());
              foundUser.dayinfo.sort();
              await foundUser.save();
            }
          }
        }
      })
    }   
  }

  function findrecordfordayinfo(record,date) {

    let dayIdx = 0;
    let dayOff = record.dayOff;
    switch (dayOff) {
      case "Saturday": dayIdx = 6; break;
      case "Sunday": dayIdx = 0; break;
      case "Monday": dayIdx = 1; break;
      case "Tuesday": dayIdx = 2; break;
      case "Wednesday": dayIdx = 3; break;
      case "Thursday": dayIdx = 4; break;
      case "Friday": dayIdx = 5; break;
    }

    let sum = 0;
    let idx = record.attendance.length - 1;
    record.attendance.sort(function (a, b) { return a.date - b.date });
    let curDay = new Date();
    if(date)
      curDay=date;
    let f = false;
    let total = 8 * 60 + 24;
    while (idx >= 0) {
      let diff = (record.attendance[idx].date - curDay) / (1000 * 60);
      if (check2dates(record.attendance[idx].date, curDay) && record.attendance[idx].type == "out"
        && idx > 0 && record.attendance[idx - 1].type == "in" && check2dates(record.attendance[idx - 1].date, curDay)) {
        sum += (record.attendance[idx].date - record.attendance[idx - 1].date) / (1000 * 60);
        idx--;
        f = true;
      }
      else if (record.attendance[idx].date < curDay)
        break;
      idx--;
    }

    /// here for requests 
    let arr = record.sentLeaveRequest;
    arr.sort(function (a, b) { return a.date - b.date });
    idx = arr.length - 1;
    let g = false;
    while (idx >= 0) {
      if (arr[idx].status == "Accepted" && arr[idx].date.getDay() == curDay.getDay()) {

        if (arr[idx].type == "Annual") {
          record.missingdays++;
        }
        else if (arr[idx].type == "Accidental") {
          record.AccidentalCount--;
          record.missingdays++;
        }
        else if (arr[idx].type == "Sick") {
          record.AccidentalCount--;
          record.missingdays++;
        }
        sum += 8 * 60 + 24;
        g = true;
      }
      else if (arr.dateleave < curDay)
        break;
      idx--;
    }


    let ans = {};
    if (curDay.getDay() == 5) {
      ans = { date: curDay, missinghours: (total - sum)/60, type: "Friday", missingDay: "NO" };
    }
    else if (curDay.getDay() == dayIdx) {
      ans = ({ date: curDay, missinghours: (total - sum)/60, type: "dayOff", missingDay: "NO" })
    }
    else {
      ans = ({ date: curDay, missinghours: (total - sum)/60, type: " workDay", missingDay: "NO" });
    }
    // attended normal , attended in dayoff , attended in holidays,
    if (g) {
      ans.type = "leave Request"
    }
    if (curDay.getDay() == dayIdx)
      sum += 8 * 60 + 24;
    else if (curDay.getDay() == 5) {
      sum = 8 * 60 + 24;
    }

    if (!f && !g && curDay.getDay() != dayIdx && curDay.getDay() != 5) {
      ans.missingDay = "YES";
      record.missingdays++;
    }
    record.hours += sum/60;
    return ans;
  }

  //updateSalary(); // delete
  // updateDayinfo();
  //  setInterval(intervalFunc, 150000);

}

// mahmoud


{
  async function checkHOD(HODid) {
    await acMember.findOne({ id: HODid }, (err, foundUser) => {
      if (err){
        console.log(HODid+"5555555")
        console.log(err);
      }
        else{
          console.log(HODid+"44444444444")
          console.log(foundUser.head);
          return foundUser.head;
        }
      })
    return false;
  }

  async function checkINS(HODid) {
    await acMember.findOne({ id: HODid }, (err, foundUser) => {
      if (err)
        console.log(err);
      else
        return foundUser.instructor;
    })
    return false;
  }

app.post("/assign_instructor", authanticateToken, async function (req, res) {
  let tokenId = req.userID;
await  acMember.findOne({id:tokenId,head:true},async function(err,result){
    if(err)
    res.send(err)
    else{
      console.log(result);
  if (!result.head){
  console.log("22222225555555");
    return res.send("You are not allowed to do so");
  }
    const ins_id = req.body.id;
  const course_nam = req.body.course_name;
  acMember.findOneAndUpdate({id:ins_id},{instructor:true},function(err){
    if (err) {
      res.send(err);
    }
    else{
  course.findOneAndUpdate({ name: course_nam }, { $push: { instructor: ins_id } }, function (err) {
    if (err) {
      res.send(err);
    }
    else {
      console.log(req.userID)+"6666666";
      return res.send("Assigned");
    }
  });
}

})
  }
})
})

//HOD
app.post("/delete_instructor", authanticateToken, function (req, res) {
  const tokenId = req.userID;
  const ins_id = req.body.id;
  const course_nam = req.body.course_name;

  console.log(course_nam+"555555"+ins_id);
  course.findOneAndUpdate({ name: course_nam }, { $pull: { instructor: ins_id } }, function (err) {
    if (err) {
      res.send(err);
    }
    else
      res.send("deleted")
  });
})
//HOD
app.put("/update_instructor", authanticateToken, async function (req, res) {
  const tokenId = req.userID;
  const ins_id = req.body.id;
  const new_course_nam = req.body.new_course_name;
  const old_course_nam = req.body.old_course_name;
  course.findOneAndUpdate({ name: old_course_nam }, { $pull: { instructor: ins_id } }, function (err) {
    if (err) {
      res.send(err);
    }
    else {
      course.findOneAndUpdate({ name: new_course_nam }, { $push: { instructor: ins_id } }, function (err) {
        if (err) {
          res.send(err);
        }
        else
          res.send("Updated")
      });
    }
  });

})
//HOD AND INSTRUCTOR --
app.post("/view_depart_staff", authanticateToken, async function (req, res) {
  const depart_name = req.body.department_name;
  let x = [];
  await department.findOne({
    name: depart_name
  },
    async function (err, result) {
      if (err)
        res.send(err);
      else {
        if (result == undefined)
          res.send("No Staff found");
        else {
          for (let i = 0; i < result.staff.length; i++) {
            await acMember.findOne({
              id: result.staff[i]
            },
              function (err, result2) {
                if (err)
                  res.send(err);
                else {
                  x.push(result2)
                }
              }
            )

          }
        }
        console.log(x);
        return res.send(x);
      }
    }
  )



})
app.post("/get_staff_member", authanticateToken, async function (req, res) {
  const mem_id = req.body.id;
  await acMember.findOne({
    id: mem_id
  },
    async function (err, result) {
      if (err)
        res.send(err);
      else {
        if (result == undefined)
          res.send("No Staff found");
        else {
          return res.send(result);
        }
      }
    }
  )



})
//HOD --
app.post("/view_depart_staff_dayoff", authanticateToken, async function (req, res) {
  const tokenId = req.userID;
  const depart_name = req.body.department_name;
  let x = [];
  let y;
  await department.findOne({
    name: depart_name
  },
    async function (err, result) {
      if (err)
        res.send(err);
      else {
        if (result == undefined)
          res.send("No Staff found");
        else {
          for (let i = 0; i < result.staff.length; i++) {
            await acMember.findOne({
              id: result.staff[i]
            },
              function (err, result2) {
                if (err)
                  res.send(err);
                else {
                  x.push("Staff Member: "+result2.name + " - Day Off: " + result2.dayOff);
                }
              }
            )

          }

         // console.log(x);
          return res.send(x)
        }
      }
    }
  )
})
//HOD
app.post("/view_member_dayoff", authanticateToken, async function (req, res) {
  const tokenId = req.userID;

  const mem_id = req.body.staff_id;
        await acMember.findOne({
          id: mem_id
        },
          function (err, result) {
            if (err)
              res.send(err);
            else {
              if (result == undefined)
                res.send("No Staff found");
              else {
                return res.send("  DayOff:  " + result.dayOff);
              }
            }
          }
        )
})

//HOD --
app.post("/view_course_staff", authanticateToken, async function (req, res) {
  const tokenId = req.userID;
 
  const cour_name = req.body.course_name;
  let x = [];
  course.findOne({
    name: cour_name
  },
    async function (err, result) {
      if (err)
        res.send(err);
      else {
        for (let i = 0; i < result.instructor.length; i++) {
          await acMember.findOne({
            id: result.instructor[i]
          },
            async function (err, result) {
              if (err)
                res.send(err);
              else {
                if (result == undefined)
                res.send("No Staff found");
              else {
                x.push(result);
              }
            }
            }
          )

        }
        for (let j = 0; j < result.ta.length; j++) {
          await acMember.findOne({
            id: result.ta[j]
          },
            function (err, result) {
              if (err)
                res.send(err);
              else { 
                if (result == undefined)
                res.send("No Staff found");
              else {
                x.push(result);
              }
            }
            }
          )

        }
        return res.send(x);
      }
    }
  )



})

//HOD
app.post("/view_depart_courses_coverage", authanticateToken, async function (req, res) {
  const tokenId = req.userID;
  
  const course_na = req.body.course_name;
  let x;
  let y;
  await course.findOne({
    name: course_na
  },
    function (err, result) {
      if (err)
        res.send(err);
      else {
        if (result == undefined)
          res.send("No Staff found");
        else {
          y = result.covarge / result.total;
          x = y + "";
          console.log(x);
        }
      }
    }
  )

  return res.send(x);


})
//INSTRUCTOR
app.post("/view_Instructor_course_coverage", authanticateToken, async function (req, res) {
  const tokenId = req.userID;
  const course_na = req.body.course_name;
  await course.findOne({
    name: course_na
  },
    function (err, result) {
      if (err)
        res.send(err);
      else {
        return res.send(result.covarge + "");
      }
    }
  )
})
//HOD AND Instructor
app.post("/view_TAs_Assignments", authanticateToken, async function (req, res) {
  const course_na = req.body.course_name;
  await course.findOne({
    name: course_na
  },
    function (err, result) {
      if (err)
        res.send(err);
      else {
        if (result == undefined)
                res.send("No course found");
              else {
        return res.send(result.slots);
      }
    }
    }
  )
})
//HOD
app.post("/view_requests", authanticateToken, async function (req, res) {
  const tokenId = req.userID;
  const ac_id = req.body.Hod_Id;
  let x = [];
  await acMember.findOne({
    id: ac_id
  },
    function (err, result) {
      if (err)
        res.send(err);
      else {
        x.push(result.receivedDayoffRequest);
        x.push(result.receivedLeavefRequest);
        return res.send(x);
      }
    }
  )
})

//Instructor
app.post("/assign_course_coordinator", authanticateToken, async function (req, res) {
  const tokenId = req.userID;
  // req.userID // ac-15  hr-20
  /* x="hr-4";
   const arr = x.split("-");
   if(arr[0]=="hr"){
     hr.find()
   }
   else{
     acm.find()
   }*/

  const course_nam = req.body.course_name;
  const coor_id = req.body.coordinator_id;
  course.findOneAndUpdate({ name: course_nam }, { coordinator: coor_id }, function (err) {
    if (err) {
      res.send(err);
    }
    else {
      course.findOneAndUpdate({ id: coor_id }, { course: course_nam  }, function (err) {
        if (err) {
          res.send(err);
        }
        else{
          res.send("Assigned")
        }
      });
    }
  })
}
)
//Instructor
app.post("/assign_acm_to_slots", authanticateToken, async function (req, res) {
  const tokenId = req.userID;
  const course_na = req.body.course_name;
  const ac_id = req.body.acMember_id;
  const slot = req.body.slot;
  const day = req.body.day;
  var error = false;
  await acMember.find({
    id: "ac-2",
    instructor: true,
  }, async function (err, result) { //the token
    if (err) {
      res.send("err");
      error = true;
    } else {
      if (!error) {
        course.findOneAndUpdate({
          name: course_na
        }, {
          $inc: {
            covarge: 1.5
          }
        }, function (err) {
          if (err) {
            error = true;
            res.send(err);
          }
        })
      }
      let l = "";
      let t = "";
      if (!error) {
        await course.find({
          name: course_na,
        }, function (err, result) {

          (result[0].slots).forEach((x) => {


            if (x.day == day) {
              if ("slot1" == slot) {

                l = x.slot1.location;
                t = x.slot1.type;
              }
              if ("slot2" == slot) {

                l = x.slot2.location;
                t = x.slot2.type;
              }
              if ("slot3" == slot) {

                l = x.slot3.location;
                t = x.slot3.type;
              }
              if ("slot4" == slot) {
                l = x.slot4.location;
                t = x.slot4.type;

              }
              if ("slot5" == slot) {

                l = x.slot5.location;
                t = x.slot5.type;
              }

            }
          })

        })
      }

      if (!error) {
        course.findOneAndUpdate({
          name: course_na
        }, {
          $inc: {
            covarge: 1.5
          }
        }, function (err) {
          if (err) {
            error = true;
            res.send(err);
          }
        })
      }
      if (slot == "slot1" && !error) {


        acMember.updateOne({
          id: ac_id,
          "schadule.day": day,
          "schadule.slot1": "free"
        }, {
          $set: {
            "schadule.$.slot1": {
              location: l,
              course: course_na
            }
          }
        },
          function (err, result) {
            if (err) {
              res.send(err);
              error = true;
            }




          })


        if (!error) {

          course.findOneAndUpdate({ name: course_na }, { $push: { ta: ac_id } }, function (err) {
            if (err) {
              res.send(err);
            }
          });
          course.updateOne({
            name: course_na,
            "slots.day": day,
            "slots.slot1.instructorID": ""
          }, {
            $set: {
              "slots.$.slot1": {
                instructorID: ac_id,
                location: l,
                type: t
              }
            }
          },
            function (err, result) {
              if (err) {
                res.send(err);
                error = true;
              }
            })
        }

      }
      if (slot == "slot2" && !error) {
        acMember.updateOne({
          id: ac_id,
          "schadule.day": day
        }, {
          $set: {
            "schadule.$.slot2": {
              location: l,
              course: course_na
            }
          }
        },
          function (err, result) {
            if (err) {
              res.send(err);
              error = true;
            }
          })

        if (!error) {
          course.findOneAndUpdate({ name: course_na }, { $push: { ta: ac_id } }, function (err) {
            if (err) {
              res.send(err);
            }
          });
          course.updateOne({
            name: course_na,
            "slots.day": day
          }, {
            $set: {
              "slots.$.slot2": {
                instructorID: ac_id,
                location: l,
                type: t
              }
            }
          },
            function (err, result) {
              if (err) {
                res.send(err);
                error = true;
              }

            })
        }
      }
      if (slot == "slot3" && !error) {
        acMember.updateOne({
          id: ac_id,
          "schadule.day": day
        }, {
          $set: {
            "schadule.$.slot3": {
              location: l,
              course: course_na
            }
          }
        },
          function (err, result) {
            if (err) {
              res.send(err);
              error = true;
            }
          })
        if (!error) {
          course.findOneAndUpdate({ name: course_na }, { $push: { ta: ac_id } }, function (err) {
            if (err) {
              res.send(err);
            }
          });
          course.updateOne({
            name: course_na,
            "slots.day": day
          }, {
            $set: {
              "slots.$.slot3": {
                instructorID: ac_id,
                location: l,
                type: t
              }
            }
          },
            function (err, result) {
              if (err) {
                res.send(err);
                error = true;
              }

            })
        }

      }
      if (slot == "slot4" && !error) {
        acMember.updateOne({
          id: ac_id,
          "schadule.day": day
        }, {
          $set: {
            "schadule.$.slot4": {
              location: l,
              course: course_na
            }
          }
        },
          function (err, result) {
            if (err) {
              res.send(err);
              error = true;
            }

          })


        if (!error) {
          course.findOneAndUpdate({ name: course_na }, { $push: { ta: ac_id } }, function (err) {
            if (err) {
              res.send(err);
            }
          });
          course.updateOne({
            name: course_na,
            "slots.day": day
          }, {
            $set: {
              "slots.$.slot4": {
                instructorID: ac_id,
                location: l,
                type: t
              }
            }
          },
            function (err, result) {
              if (err) {
                res.send(err);
                error = true;
              }

            })
        }

      }
      if (slot == "slot5" && !error) {
        acMember.updateOne({
          id: ac_id,
          "schadule.day": day
        }, {
          $set: {
            "schadule.$.slot5": {
              location: l,
              course: course_na
            }
          }
        },
          function (err, result) {
            if (err) {
              res.send(err);
              error = true;
            }

          })

        if (!error) {
          course.findOneAndUpdate({ name: course_na }, { $push: { ta: ac_id } }, function (err) {
            if (err) {
              res.send(err);
            }
          });
          course.updateOne({
            name: course_na,
            "slots.day": day
          }, {
            $set: {
              "slots.$.slot5": {
                instructorID: ac_id,
                location: l,
                type: t
              }
            }
          },
            function (err, result) {
              if (err) {
                res.send(err);
                error = true;
              }

            })
        }
      }


    }
  })
})

// //Instructor
app.post("/delete_ac_slot_from_course", authanticateToken, async function (req, res) {
  const tokenId = req.userID;
  const course_na = req.body.course_name;
  const ac_id = req.body.acMember_id;
  const slot = req.body.slot;
  const day = req.body.day;
  if (!slot || !day || !ac_id || !course_na) {
    return res.send("there is some missing data You must enter");
  }
  await acMember.findOne({ id: ac_id }, async function (err, result) {
    if (err) {
      return res.send(err);
    }
    if (!result)
      return res.send("this is an invalid input2");
    else {
      let arr = JSON.parse(JSON.stringify(result.schadule));
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].day == day) {
          if ("slot1" == slot && arr[i].slot1 != "free") {
            if (arr[i].slot1.course == course_na)
              arr[i].slot1 = "free";
          }
          else if ("slot2" == slot && arr[i].slot2 != "free") {
            if (arr[i].slot2.course == course_na)
              arr[i].slot2 = "free";
          }


          else if ("slot3" == slot && arr[i].slot3 != "free") {
            if (arr[i].slot3.course == course_na)
              arr[i].slot3 = "free";
          }
          else if ("slot4" == slot && arr[i].slot4 != "free") {
            if (arr[i].slot4.course == course_na)
              arr[i].slot4 = "free";
          }
          else if ("slot5" == slot && arr[i].slot5 != "free") {
            if (arr[i].slot5.course == course_na)
              arr[i].slot5 = "free";
          }
        }
      }
      result.schadule = arr;

      await result.save();
      /////////////////////////course
      await course.findOne({ name: course_na }, async function (err, result2) {
        if (err) {
          return res.send(err);
        }
        if (!result2)
          return res.send("this is an invalid input2");
        else {
          let temp = JSON.parse(JSON.stringify(result2.slots));
          for (let j = 0; j < temp.length; j++) {
            if (temp[j].day == day) {
              if ("slot1" == slot && temp[j].slot1 != "free") {
                if (temp[j].slot1.instructorID == ac_id) {
                  temp[j].slot1.instructorID = "";
                  result2.covarge -= 1.5;

                }
                else {
                  return res.send("this is not the Academic member you want to remove")
                }
              }
              else if ("slot2" == slot && temp[j].slot2 != "free") {
                if (temp[j].slot2.instructorID == ac_id) {
                  temp[j].slot2.instructorID = "";
                  result2.covarge -= 1.5;

                }
                else {
                  return res.send("this is not the Academic member you want to remove")
                }
              }
              else if ("slot3" == slot && temp[j].slot3 != "free") {
                if (temp[j].slot3.instructorID == ac_id) {
                  temp[j].slot3.instructorID = "";
                  result2.covarge -= 1.5;
                }
                else {
                  return res.send("this is not the Academic member you want to remove")
                }
              }
              else if ("slot4" == slot && temp[j].slot4 != "free") {
                if (temp[j].slot4.instructorID == ac_id) {
                  temp[j].slot4.instructorID = "";
                  result2.covarge -= 1.5;
                }
                else {
                  return res.send("this is not the Academic member you want to remove")
                }
              }
              else if ("slot5" == slot && temp[j].slot5 != "free") {
                if (temp[j].slot5.instructorID == ac_id) {
                  temp[j].slot5.instructorID = "";
                  result2.covarge -= 1.5;
                }
                else {
                  return res.send("this is not the Academic member you want to remove")
                }
              }
            }
          }
          result2.slots = temp;

          await result2.save();
          return res.send("done")
        }

      })
    }

  })
})

//Instructor
app.put("/update_ac_slot_in_course", authanticateToken, async function (req, res) {
  const tokenId = req.userID;
  const course_na = req.body.course_name;
  const ac_id = req.body.acMember_id;
  const slot = req.body.oldslot;
  const day = req.body.oldday;
  const newslot = req.body.newslot;
  const newday = req.body.newday;
  if (!slot || !day || !ac_id || !course_na || !newslot || !newday) {
    return res.send("there is some missing data You must enter");
  }
  var error = false;
  await acMember.findOne({ id: ac_id }, async function (err, result) {
    if (err) {
      return res.send(err);
    }
    if (!result)
      return res.send("this is an invalid input2");
    else {
      let arr = JSON.parse(JSON.stringify(result.schadule));
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].day == day) {
          if ("slot1" == slot && arr[i].slot1 != "free") {
            if (arr[i].slot1.course == course_na)
              arr[i].slot1 = "free";
          }
          else if ("slot2" == slot && arr[i].slot2 != "free") {
            if (arr[i].slot2.course == course_na)
              arr[i].slot2 = "free";
          }


          else if ("slot3" == slot && arr[i].slot3 != "free") {
            if (arr[i].slot3.course == course_na)
              arr[i].slot3 = "free";
          }
          else if ("slot4" == slot && arr[i].slot4 != "free") {
            if (arr[i].slot4.course == course_na)
              arr[i].slot4 = "free";
          }
          else if ("slot5" == slot && arr[i].slot5 != "free") {
            if (arr[i].slot5.course == course_na)
              arr[i].slot5 = "free";
          }
        }
      }
      result.schadule = arr;

      await result.save();
      /////////////////////////course
      await course.findOne({ name: course_na }, async function (err, result2) {
        if (err) {
          return res.send(err);
        }
        if (!result2)
          return res.send("this is an invalid input2");
        else {
          let temp = JSON.parse(JSON.stringify(result2.slots));
          for (let j = 0; j < temp.length; j++) {
            if (temp[j].day == day) {
              if ("slot1" == slot && temp[j].slot1 != "free") {
                if (temp[j].slot1.instructorID == ac_id) {
                  temp[j].slot1.instructorID = "";
                  result2.covarge -= 1.5;

                }
                else {
                  return res.send("this is not the Academic member you want to remove")
                }
              }
              else if ("slot2" == slot && temp[j].slot2 != "free") {
                if (temp[j].slot2.instructorID == ac_id) {
                  temp[j].slot2.instructorID = "";
                  result2.covarge -= 1.5;

                }
                else {
                  return res.send("this is not the Academic member you want to remove")
                }
              }
              else if ("slot3" == slot && temp[j].slot3 != "free") {
                if (temp[j].slot3.instructorID == ac_id) {
                  temp[j].slot3.instructorID = "";
                  result2.covarge -= 1.5;
                }
                else {
                  return res.send("this is not the Academic member you want to remove")
                }
              }
              else if ("slot4" == slot && temp[j].slot4 != "free") {
                if (temp[j].slot4.instructorID == ac_id) {
                  temp[j].slot4.instructorID = "";
                  result2.covarge -= 1.5;
                }
                else {
                  return res.send("this is not the Academic member you want to remove")
                }
              }
              else if ("slot5" == slot && temp[j].slot5 != "free") {
                if (temp[j].slot5.instructorID == ac_id) {
                  temp[j].slot5.instructorID = "";
                  result2.covarge -= 1.5;
                }
                else {
                  return res.send("this is not the Academic member you want to remove")
                }
              }
            }
          }
          result2.slots = temp;

          await result2.save();

          await acMember.find({
            id: tokenId
            // instructor: true,
          }, async function (err, result) { //the token
            if (err) {
              res.send("err");
              error = true;
            } else {
              if (!error) {
                course.findOneAndUpdate({
                  name: course_na
                }, {
                  $inc: {
                    covarge: 1.5
                  }
                }, function (err) {
                  if (err) {
                    error = true;
                    res.send(err);
                  }
                })
              }
              var l = "";
              var t = "";
              if (!error) {
                await course.find({
                  name: course_na,
                }, function (err, result) {

                  (result[0].slots).forEach((x) => {


                    if (x.day == newday) {
                      if ("slot1" == newslot) {

                        l = x.slot1.location;
                        t = x.slot1.type;
                      }
                      if ("slot2" == newslot) {

                        l = x.slot2.location;
                        t = x.slot2.type;
                      }
                      if ("slot3" == newslot) {
                        l = x.slot3.location;
                        t = x.slot3.type;
                      }
                      if ("slot4" == newslot) {
                        l = x.slot4.location;
                        t = x.slot4.type;
                      }
                      if ("slot5" == newslot) {

                        l = x.slot5.location;
                        t = x.slot5.type;
                      }

                    }
                  })

                })
              }

              if (!error) {
                course.findOneAndUpdate({
                  name: course_na
                }, {
                  $inc: {
                    covarge: 1.5
                  }
                }, function (err) {
                  if (err) {
                    error = true;
                    res.send(err);
                  }
                })

                if (newslot == "slot1" && !error) {


                  acMember.updateOne({
                    id: ac_id,
                    "schadule.day": newday,
                    "schadule.slot1": "free"
                  }, {
                    $set: {
                      "schadule.$.slot1": {
                        location: l,
                        course: course_na
                      }
                    }
                  },
                    function (err, result) {
                      if (err) {
                        res.send(err);
                        error = true;
                      }




                    })


                  if (!error) {
                    course.findOneAndUpdate({ name: course_na }, { $push: { ta: ac_id } }, function (err) {
                      if (err) {
                        res.send(err);
                      }
                    });
                    course.updateOne({
                      name: course_na,
                      "slots.day": newday,
                      "slots.slot1.instructorID": ""
                    }, {
                      $set: {
                        "slots.$.slot1": {
                          instructorID: ac_id,
                          location: l,
                          type: t
                        }
                      }
                    },
                      function (err, result) {
                        if (err) {
                          res.send(err);
                          error = true;
                        }
                      })
                  }

                }
                if (newslot == "slot2" && !error) {
                  acMember.updateOne({
                    id: ac_id,
                    "schadule.day": newday
                  }, {
                    $set: {
                      "schadule.$.slot2": {
                        location: l,
                        course: course_na
                      }
                    }
                  },
                    function (err, result) {
                      if (err) {
                        res.send(err);
                        error = true;
                      }
                    })

                  if (!error) {
                    course.findOneAndUpdate({ name: course_na }, { $push: { ta: ac_id } }, function (err) {
                      if (err) {
                        res.send(err);
                      }
                    });
                    course.updateOne({
                      name: course_na,
                      "slots.day": newday
                    }, {
                      $set: {
                        "slots.$.slot2": {
                          instructorID: ac_id,
                          location: l,
                          type: t
                        }
                      }
                    },
                      function (err, result) {
                        if (err) {
                          res.send(err);
                          error = true;
                        }

                      })
                  }
                }
                if (newslot == "slot3" && !error) {
                  acMember.updateOne({
                    id: ac_id,
                    "schadule.day": newday
                  }, {
                    $set: {
                      "schadule.$.slot3": {
                        location: l,
                        course: course_na
                      }
                    }
                  },
                    function (err, result) {
                      if (err) {
                        res.send(err);
                        error = true;
                      }
                    })
                  if (!error) {
                    course.findOneAndUpdate({ name: course_na }, { $push: { ta: ac_id } }, function (err) {
                      if (err) {
                        res.send(err);
                      }
                    });
                    course.updateOne({
                      name: course_na,
                      "slots.day": newday
                    }, {
                      $set: {
                        "slots.$.slot3": {
                          instructorID: ac_id,
                          location: l,
                          type: t
                        }
                      }
                    },
                      function (err, result) {
                        if (err) {
                          res.send(err);
                          error = true;
                        }

                      })
                  }

                }
                if (newslot == "slot4" && !error) {
                  acMember.updateOne({
                    id: ac_id,
                    "schadule.day": newday
                  }, {
                    $set: {
                      "schadule.$.slot4": {
                        location: l,
                        course: course_na
                      }
                    }
                  },
                    function (err, result) {
                      if (err) {
                        res.send(err);
                        error = true;
                      }

                    })


                  if (!error) {
                    course.findOneAndUpdate({ name: course_na }, { $push: { ta: ac_id } }, function (err) {
                      if (err) {
                        res.send(err);
                      }
                    });
                    course.updateOne({
                      name: course_na,
                      "slots.day": newday
                    }, {
                      $set: {
                        "slots.$.slot4": {
                          instructorID: ac_id,
                          location: l,
                          type: t
                        }
                      }
                    },
                      function (err, result) {
                        if (err) {
                          res.send(err);
                          error = true;
                        }

                      })
                  }

                }
                if (newslot == "slot5" && !error) {
                  acMember.updateOne({
                    id: ac_id,
                    "schadule.day": newday
                  }, {
                    $set: {
                      "schadule.$.slot5": {
                        location: l,
                        course: course_na
                      }
                    }
                  },
                    function (err, result) {
                      if (err) {
                        res.send(err);
                        error = true;
                      }

                    })

                  if (!error) {
                    course.findOneAndUpdate({ name: course_na }, { $push: { ta: ac_id } }, function (err) {
                      if (err) {
                        res.send(err);
                      }
                    });
                    course.updateOne({
                      name: course_na,
                      "slots.day": newday
                    }, {
                      $set: {
                        "slots.$.slot5": {
                          instructorID: ac_id,
                          location: l,
                          type: t
                        }
                      }
                    },
                      function (err, result) {
                        if (err) {
                          res.send(err);
                          error = true;
                        }

                      })
                  }
                }

              }
            }
          })
        }

      })
    }

  })

  return res.send("done")
})


// HOD
app.post("/accept_leave_request", authanticateToken, async function (req, res) {
  const tokenId = req.userID;
  const request_id = req.body.request_id;
  if (!request_id)
    return res.send("this is an invalid input");
  await acMember.findOne({ id: tokenId }, async function (err, result) {
    if (err) {
      return res.send(err);
    }
    if (!result)
      return res.send("this is an invalid input2");
    else {
      let arr = JSON.parse(JSON.stringify(result.receivedLeavefRequest));
      for (let i = 0; i < arr.length; i++) {

        if (arr[i].id == request_id && arr[i].status == "Pending") {
          arr[i].status = "Accepted";
          result.receivedLeavefRequest = arr;
          await result.save();
          let x = arr[i].from;

          acMember.findOne({ id: x }, async function (err, foundUser) {
            if (err) {
              return res.send(err);
            }
            if (!foundUser)
              return res.send("there is an invalid input");
            else {
              let temp = JSON.parse(JSON.stringify(foundUser.sentLeaveRequest));
              for (let i = 0; i < temp.length; i++) {
                if (temp[i].id == request_id) {
                  temp[i].status = "Accepted";
                  break;
                }
              }
              foundUser.sentLeaveRequest = temp;
              await foundUser.save();

              return res.send("successfully updated sender and reciver");

            }
          })
        }
      }
    }


  })
})
app.post("/reject_leave_request", authanticateToken, async function (req, res) {
  const tokenId = req.userID;
  const request_id = req.body.request_id;
  const reason = req.body.reason;
  if (!request_id)
    return res.send("this is an invalid input");
  await acMember.findOne({ id: tokenId }, async function (err, result) {
    if (err) {
      return res.send(err);
    }
    if (!result)
      return res.send("this is an invalid input2");
    else {
      let arr = JSON.parse(JSON.stringify(result.receivedLeavefRequest));
      for (let i = 0; i < arr.length; i++) {

        if (arr[i].id == request_id && arr[i].status == "Pending") {
          arr[i].status = "Rejected";
          arr[i].request = reason;
          result.receivedLeavefRequest = arr;
          await result.save();
          let x = arr[i].from;

          acMember.findOne({ id: x }, async function (err, foundUser) {
            if (err) {
              return res.send(err);
            }
            if (!foundUser)
              return res.send("there is an invalid input");
            else {
              let temp = JSON.parse(JSON.stringify(foundUser.sentLeaveRequest));
              for (let i = 0; i < temp.length; i++) {
                if (temp[i].id == request_id) {
                  temp[i].status = "Rejected";
                  temp[i].request = reason;
                  break;
                }
              }
              foundUser.sentLeaveRequest = temp;
              await foundUser.save();

              return res.send("successfully updated sender and reciver");

            }
          })
        }
      }
    }


  })
})
app.post("/accept_change_day_off_request", authanticateToken, async function (req, res) {
  //const Hod_id = req.userId;
  const tokenId = req.userID;
  const request_id = req.body.request_id;
  console.log(request_id+"555555555"+tokenId);
  if (!request_id)
    return res.send("this is an invalid input");
  await acMember.findOne({ id: tokenId }, async function (err, result) {
    if (err) {
      return res.send(err);
    }
    if (!result)
      return res.send("this is an invalid input2");
    else {
      let arr = JSON.parse(JSON.stringify(result.receivedDayoffRequest));
      for (let i = 0; i < arr.length; i++) {

        if (arr[i].id == request_id && arr[i].status == "Pending") {
          arr[i].status = "Accepted";
          result.receivedDayoffRequest = arr;
          await result.save();
          let x = arr[i].from;

          acMember.findOneAndUpdate({ id: x }, { dayOff: result.receivedDayoffRequest[i].day }, async function (err, foundUser) {
            if (err) {
              return res.send(err);
            }
            if (!foundUser)
              return res.send("there is an invalid input");
            else {
              let temp = JSON.parse(JSON.stringify(foundUser.sentDayoffRequest));
              for (let i = 0; i < temp.length; i++) {
                if (temp[i].id == request_id) {
                  temp[i].status = "Accepted";
                  break;
                }
              }

              foundUser.sentDayoffRequest = temp;
              await foundUser.save();

              return res.send("successfully updated sender and reciver");
            }
          })
        }
      }

    }


  })
})


app.post('/test', authanticateToken, (req, res) => {
  acMember.findOne({ id: "ac-222" }, async (err, foundUser) => {
    const arr = JSON.parse(JSON.stringify(foundUser.receivedDayoffRequest));
    arr[0].status = "mahmod";
    foundUser.receivedDayoffRequest = arr;
    await foundUser.save();
    res.send(foundUser);
  })
})

app.post("/reject_change_day_off_request", authanticateToken, async function (req, res) {
  //const Hod_id = req.userId;
  const tokenId = req.userID;
  const request_id = req.body.request_id;
  const reason = req.body.reason;
  if (!request_id)
    return res.send("this is an invalid input");
  await acMember.findOne({ id: tokenId }, async function (err, result) {
    if (err) {
      return res.send(err);
    }
    if (!result)
      return res.send("this is an invalid input2");
    else {
      let arr = JSON.parse(JSON.stringify(result.receivedDayoffRequest));
      for (let i = 0; i < arr.length; i++) {

        if (arr[i].id == request_id && arr[i].status == "Pending") {
          arr[i].status = "Rejected";
          arr[i].reason = reason;
          result.receivedDayoffRequest = arr;
          await result.save();
          let x = arr[i].from;


          acMember.findOne({ id: x }, async function (err, foundUser) {
            if (err) {
              return res.send(err);
            }
            if (!foundUser)
              return res.send("there is an invalid input");
            else {
              let temp = JSON.parse(JSON.stringify(foundUser.sentDayoffRequest));
              for (let i = 0; i < temp.length; i++) {
                if (temp[i].id == request_id) {
                  temp[i].status = "Rejected";
                  temp[i].reason = reason;
                  break;
                }
              }
              foundUser.sentDayoffRequest = temp;
              await foundUser.save();

              return res.send("successfully updated sender  reciver");
            }
          })
        }
      }

    }


  })

})
}

// ashraf 
{
  
  app.get("/viewSlots", authanticateToken, function (req, res) {
    acMember.find({
      coordinator: true,
      id: req.userID // id of loged in user
    }, function (err, result) {
      if (err)
        res.send(err);
      else {
        if (!result[0])
          return res.send("ERROR");
        res.send(result[0].slotLinkingReceivedRequests);
      }
    })
  }) //done

  app.post("/slotsAcceptance", authanticateToken, async function (req, res) {
    try {

      let coord;
      var co = "";
      coord = await acMember.find({
        id: req.userID, //loged in id
        coordinator: true,
      })
      if (!coord)
        return res.send("there is no acmember with this id");

      for (r of coord[0].slotLinkingReceivedRequests) {
        if (r.id == req.body.id) {
          co = r;
        }
      }

      var ins;
      var loc = "";
      var type = "";
      var result;
      result = await course.find({
        name: co.course,
      })

      var myc = result[0];
      if (!result[0])
        return res.send("Error");
      (result[0].slots).forEach((x) => {
        // console.log(x);
        // console.log(x.day+" "+co.day+" "+x.slot1+" "+co.slot);
        if (x.day == co.day) {
          if ("slot1" == co.slot) {
            ins = x.slot1.instructorID;
            loc = x.slot1.location;
            type = x.slot1.type;
          }
          if ("slot2" == co.slot) {
            loc = x.slot2.location;
            type = x.slot2.type;
          }
          if ("slot3" == co.slot) {
            loc = x.slot3.location;
            type = x.slot3.type;
          }
          if ("slot4" == co.slot) {
            loc = x.slot4.location;
            type = x.slot4.type;
          }
          if ("slot5" == co.slot) {
            loc = x.slot5.location;
            type = x.slot5.type;
          }
          //    console.log(l+" "+t);
        }
      })
      if (ins)
        return res.send("the instructor can't thake this slot");



      result = "undefined";
      result = await acMember.findOne({
        id: co.from,
      })
      //sender
      var arr = JSON.parse(JSON.stringify(result.slotLinkingSentRequests));
      result.notification.push({status:"Accepted",id:req.body.id,route:"/ViewSentSlotLinking"});
      var qq = false;
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].status == "Pending" && arr[i].id == req.body.id) {
          arr[i].status = "Accepted";
          qq = true;
        }
      }
      result.slotLinkingSentRequests = JSON.parse(JSON.stringify(arr));
      await result.save();

      //receiver
      arr = JSON.parse(JSON.stringify(coord[0].slotLinkingReceivedRequests));
      qq = false;
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].status == "Pending" && arr[i].id == req.body.id) {
          arr[i].status = "Accepted";
          qq = true;
        }
      }
      coord[0].slotLinkingReceivedRequests = JSON.parse(JSON.stringify(arr));
      await coord[0].save();

      if (!qq)
        return res.send("ERROR");


      course.findOneAndUpdate({
        name: co.course
      }, {
        $inc: {
          covarge: 1.5
        }
      })

      course.findOneAndUpdate({ name: co.course }, { $push: { ta: co.from } }, function (err) {
        if (err) {
          return res.send(err);
        }
      });



      arr = JSON.parse(JSON.stringify(myc.slots));
      qq = false;
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].day == co.day) {
          if (co.slot == "slot1") {
            arr[i].slot1 = {
              instructorID: co.from,
              location: loc,
              course: co.course
            };
          }
          if (co.slot == "slot2") {
            arr[i].slot2 = {
              instructorID: co.from,
              location: loc,
              course: co.course
            };
          }
          if (co.slot == "slot3") {
            arr[i].slot3 = {
              instructorID: co.from,
              location: loc,
              course: co.course
            };
          }
          if (co.slot == "slot4") {
            arr[i].slot4 = {
              instructorID: co.from,
              location: loc,
              course: co.course
            };
          }
          if (co.slot == "slot5") {
            arr[i].slot5 = {
              instructorID: co.from,
              location: loc,
              course: co.course
            };
          }
          qq = true;
        }
      }
      myc.slots = JSON.parse(JSON.stringify(arr));
      await myc.save();


      arr = JSON.parse(JSON.stringify(result.schadule));
      qq = false;
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].day == co.day) {
          if (co.slot == "slot1") {
            arr[i].slot1 = {
              location: loc,
              course: co.course
            };
          }
          if (co.slot == "slot2") {
            arr[i].slot2 = {
              location: loc,
              course: co.course
            };
          }
          if (co.slot == "slot3") {
            arr[i].slot3 = {
              location: loc,
              course: co.course
            };
          }
          if (co.slot == "slot4") {
            arr[i].slot4 = {
              location: loc,
              course: co.course
            };
          }
          if (co.slot == "slot5") {
            arr[i].slot5 = {
              location: loc,
              course: co.course
            };
          }
          qq = true;
        }
      }
      result.schadule = JSON.parse(JSON.stringify(arr));
      await result.save();


      res.send("Accepted");
    } catch {
      res.send("ERROR")
    }
  }) //not done

  app.post("/slotsRejection", authanticateToken, async function (req, res) {
    try {
      var loginID = req.userID; // fix

      await acMember.find({
        id: req.userID,
        coordinator: true,
      }, function (err, result) { //the token
        if (err) {
          return res.send("err");
        } else {
          // let arr = JSON.parse(JSON.stringify(result[0].slotLinkingReceivedRequests));
          // console.log(arr);


          result[0].slotLinkingReceivedRequests.forEach(function (co) {
            if (co.id == req.body.id) {
              console.log(co);
              acMember.findOne({
                id: co.from,
              },
                function (err, foundUser) {
                  if (err) {
                    res.send(err);
                  } else if (!foundUser) {
                    return res.send("Can't find the date for server of date base")
                  } else {
                    let arr = JSON.parse(JSON.stringify(foundUser.slotLinkingSentRequests));
                    result.notification.push({status:"Accepted",id:req.body.id,route:"/ViewSentSlotLinking"});
                    for (let i = 0; i < arr.length; i++) {
                      if (arr[i].status == "Pending" && arr[i].id == req.body.id) {
                        arr[i].status = "Rejected";
                      }
                    }
                    foundUser.slotLinkingSentRequests = arr;
                    foundUser.save();
                    console.log("updated sender");
                  }
                })

            }
          })
        }
      })
      ///// reciver
      acMember.findOne({
        id: req.userID,
        coordinator: true
      },
        function (err, foundUser) {
          if (err) {
            res.send(err);
          } else if (!foundUser) {
            return res.send("Can't find the date for server of datebase")
          } else {
            let arr = JSON.parse(JSON.stringify(foundUser.slotLinkingReceivedRequests));
            for (let i = 0; i < arr.length; i++) {
              if (arr[i].status == "Pending" && arr[i].id == req.body.id) {
                arr[i].status = "Rejected";
              }
            }
            foundUser.slotLinkingReceivedRequests = arr;
            foundUser.save();
            console.log("updated reciver");
          }
        })


      res.send("Done");
    } catch {
      res.send("ERROR")
    }
  }) //done

  app.post("/addSlot", authanticateToken,async function (req, res) {
    try {
      var error = false;

    var location=await locations.findOne({
        name:req.body.location
      })

      if(!location){
        return res.send("there is no location with this name");
      }

      acMember.find({
        id: req.userID,
        coordinator: true
      }, async function (err, result) {
        if (err) {
          return res.send(err);
          error = true;
        } else {

          if (!result[0]) {
            return res.send("you cannot add the slot");
          }
          var cour = result[0].course;

          if (!cour||cour=="") {
            return res.send("you cannot add the slot");
          }

          if (!error) {

            var qq = JSON.stringify("schadule." + req.body.slot);
            var xx = await course.findOne({
              name: cour,
              "schadule.day": req.body.day,
              qq: "free"
            })
            if (!xx) {
              return res.send("this slot is free");
            }
            if (!error && !xx)
              course.findOneAndUpdate({
                name: cour
              }, {
                $inc: {
                  total: 1.5
                }
              }, function (err) {
                if (err) {
                  return res.send(err);
                }
              })


            if (req.body.slot == "slot1" && !error) {


              course.updateOne({
                name: cour,
                "slots.day": req.body.day
              }, {
                $set: {
                  "slots.$.slot1": {
                    location: req.body.location,
                    type: req.body.type,
                    instructorID: ""
                  }
                }
              },
                function (err, result) {
                  if (err) {
                    return res.send(err);
                  }

                })
            }
            if (req.body.slot == "slot2" && !error) {
              course.updateOne({
                name: cour,
                "slots.day": req.body.day
              }, {
                $set: {
                  "slots.$.slot2": {
                    location: req.body.location,
                    type: req.body.type,
                    instructorID: ""
                  }
                }
              },
                function (err, result) {
                  if (err) {
                    res.send(err);
                    error = true;
                  }

                })
            }

            if (req.body.slot == "slot3" && !error) {
              course.updateOne({
                name: cour,
                "slots.day": req.body.day
              }, {
                $set: {
                  "slots.$.slot3": {
                    location: req.body.location,
                    type: req.body.type,
                    instructorID: ""
                  }
                }
              },
                function (err, result) {
                  if (err) {
                    res.send(err);
                    error = true;
                  }

                })
            }

            if (req.body.slot == "slot4" && !error) {
              course.updateOne({
                name: cour,
                "slots.day": req.body.day
              }, {
                $set: {
                  "slots.$.slot4": {
                    location: req.body.location,
                    type: req.body.type,
                    instructorID: ""
                  }
                }
              },
                function (err, result) {
                  if (err) {
                    res.send(err);
                    error = true;
                  }

                })
            }

            if (req.body.slot == "slot5" && !error) {
              course.updateOne({
                name: cour,
                "slots.day": req.body.day
              }, {
                $set: {
                  "slots.$.slot5": {
                    location: req.body.location,
                    type: req.body.type,
                    instructorID: ""
                  }
                }
              },
                function (err, result) {
                  if (err) {
                    res.send(err);
                    error = true;
                  }

                })
            }


          }

        }
      })
      return res.send("done");
    }
    catch {
      return res.send("ERROR")
    }
  }) // done
  /////////////////////////////////
  app.post("/deleteSlot", authanticateToken,async function (req, res) {
    try {
      var error = false;


      acMember.find({
        id: req.userID,
        coordinator: true
      }, async function (err, result) {
        if (err) {
          return res.send(err);
        } else {

          if (!result[0]) {
            return res.send("you cannot add the slot");
          }
          var cour = result[0].course;

          if (!cour||cour=="") {
            return res.send("you cannot add the slot");
          }

          var qq = JSON.stringify("schadule." + req.body.slot);
          var xx = await course.findOne({
            name: cour,
            "schadule.day": req.body.day,
            qq: "free"
          })
          if (!xx) {
            return res.send("this slot is free");
          }
          if (!error && xx)
            course.findOneAndUpdate({
              name: cour
            }, {
              $inc: {
                total: -1.5
              }
            }, function (err) {
              if (err) {
                return res.send(err);
              }
            })


          if (req.body.slot == "slot1" && !error) {


            course.updateOne({
              name: cour,
              "slots.day": req.body.day
            }, {
              $set: {
                "slots.$.slot1": "free"
              }
            },
              function (err, result) {
                if (err) {
                  return res.send(err);
                }

              })
          }
          if (req.body.slot == "slot2" && !error) {
            course.updateOne({
              name: cour,
              "slots.day": req.body.day
            }, {
              $set: {
                "slots.$.slot2": "free"
              }
            },
              function (err, result) {
                if (err) {
                  res.send(err);
                  error = true;
                }

              })
          }

          if (req.body.slot == "slot3" && !error) {
            course.updateOne({
              name: cour,
              "slots.day": req.body.day
            }, {
              $set: {
                "slots.$.slot3": "free"
              }
            },
              function (err, result) {
                if (err) {
                  res.send(err);
                  error = true;
                }

              })
          }

          if (req.body.slot == "slot4" && !error) {
            course.updateOne({
              name: cour,
              "slots.day": req.body.day
            }, {
              $set: {
                "slots.$.slot4": "free"
              }
            },
              function (err, result) {
                if (err) {
                  res.send(err);
                  error = true;
                }

              })
          }

          if (req.body.slot == "slot5" && !error) {
            course.updateOne({
              name: cour,
              "slots.day": req.body.day
            }, {
              $set: {
                "slots.$.slot5": "free"
              }
            },
              function (err, result) {
                if (err) {
                  res.send(err);
                  error = true;
                }

              })
          }

        }
      })
      return res.send("Done");
    } catch {
      return res.send("Error")
    }
  }) //done

  app.put("/updateSlot", authanticateToken,async function (req, res) {
    try {
      var error = false;

      var location=await locations.findOne({
          name:req.body.location
        })

        if(!location){
          return res.send("there is no location with this name");
        }


      acMember.find({
        id: req.userID,
        coordinator: true
      }, async function (err, result) {
        if (err) {
          res.send(err);
          error = true;
        } else {

          if (!result[0]) {
            return res.send("you cannot update the slot");
          }
          var cour = result[0].course;

          if (!cour||cour=="") {
            return res.send("you cannot update the slot");
          }

          if (req.body.slot == "slot1" && !error) {

            await course.find({
              name: cour,
            }, function (err, resul) {

              if (err) {
                res.send(err)
                error = true;
              } else {
                var inst = "";
                (resul[0].slots).forEach((x) => {
                  if (x.day == req.body.day)
                    inst = x.slot1.instructorID;
                })
              }
            })

            if (!error)
              course.updateOne({
                name: cour,
                "slots.day": req.body.day
              }, {
                $set: {
                  "slots.$.slot1": {
                    location: req.body.location,
                    type: req.body.type,
                    instructorID: inst
                  }
                }
              },
                function (err, result) {
                  if (err) {
                    res.send(err);
                    error = true;
                  }

                })

            if (!error) {
              acMember.updateOne({
                id: inst,
                "schadule.day": req.body.day
              }, {
                $set: {
                  "schadule.$.slot1": {
                    location: req.body.location,
                    course: cour
                  }
                }
              },
                function (err, result) {
                  if (err) {
                    res.send(err);
                    error = true;
                  }

                })
            }
          }

          if (req.body.slot == "slot2" && !error) {
            var inst = "";

            await course.find({
              name: cour,
              "slots.day": req.body.day
            }, function (err, resul) {
              if (err) {
                res.send(err)
                error = true;
              } else {
                (resul[0].slots).forEach((x) => {
                  if (x.day == req.body.day)
                    inst = x.slot2.instructorID;
                })
              }
            })


            course.updateOne({
              name: cour,
              "slots.day": req.body.day
            }, {
              $set: {
                "slots.$.slot2": {
                  location: req.body.location,
                  type: req.body.type,
                  instructorID: inst
                }
              }
            },
              function (err, result) {
                if (err) {
                  res.send(err);
                  error = true;
                }

              })

            if (!error) {
              acMember.updateOne({
                id: inst,
                "schadule.day": req.body.day
              }, {
                $set: {
                  "schadule.$.slot2": {
                    location: req.body.location,
                    course: cour
                  }
                }
              },
                function (err, result) {
                  if (err) {
                    res.send(err);
                    error = true;
                  }

                })
            }
          }


          if (req.body.slot == "slot3" && !error) {
            var inst = "";

            await course.find({
              name: cour,
              "slots.day": req.body.day
            }, function (err, resul) {
              if (err) {
                res.send(err)
                error = true;
              } else {
                (resul[0].slots).forEach((x) => {
                  if (x.day == req.body.day)
                    inst = x.slot3.instructorID;
                })
              }
            })


            course.updateOne({
              name: cour,
              "slots.day": req.body.day
            }, {
              $set: {
                "slots.$.slot3": {
                  location: req.body.location,
                  type: req.body.type,
                  instructorID: inst
                }
              }
            },
              function (err, result) {
                if (err) {
                  res.send(err);
                  error = true;
                }

              })
            if (!error) {
              acMember.updateOne({
                id: inst,
                "schadule.day": req.body.day
              }, {
                $set: {
                  "schadule.$.slot3": {
                    location: req.body.location,
                    course: cour
                  }
                }
              },
                function (err, result) {
                  if (err) {
                    res.send(err);
                    error = true;
                  }

                })
            }
          }


          if (req.body.slot == "slot4" && !error) {
            var inst = "";

            await course.find({
              name: cour,
              "slots.day": req.body.day
            }, function (err, resul) {
              if (err) {
                res.send(err)
                error = true;
              } else {
                (resul[0].slots).forEach((x) => {
                  if (x.day == req.body.day)
                    inst = x.slot4.instructorID;
                })
              }
            })


            course.updateOne({
              name: cour,
              "slots.day": req.body.day
            }, {
              $set: {
                "slots.$.slot4": {
                  location: req.body.location,
                  type: req.body.type,
                  instructorID: inst
                }
              }
            },
              function (err, result) {
                if (err) {
                  res.send(err);
                  error = true;
                }

              })

            if (!error) {
              acMember.updateOne({
                id: inst,
                "schadule.day": req.body.day
              }, {
                $set: {
                  "schadule.$.slot4": {
                    location: req.body.location,
                    course: cour
                  }
                }
              },
                function (err, result) {
                  if (err) {
                    res.send(err);
                    error = true;
                  }

                })
            }
          }


          if (req.body.slot == "slot5" && !error) {
            var inst = "";

            await course.find({
              name: cour,
              "slots.day": req.body.day
            }, function (err, resul) {
              if (err) {
                res.send(err)
                error = true;
              } else {
                (resul[0].slots).forEach((x) => {
                  if (x.day == req.body.day)
                    inst = x.slot5.instructorID;
                })
              }
            })


            course.updateOne({
              name: cour,
              "slots.day": req.body.day
            }, {
              $set: {
                "slots.$.slot5": {
                  location: req.body.location,
                  type: req.body.type,
                  instructorID: inst
                }
              }
            },
              function (err, result) {
                if (err) {
                  res.send(err);
                  error = true;
                }

              })
          }

          if (!error) {
            acMember.updateOne({
              id: inst,
              "schadule.day": req.body.day
            }, {
              $set: {
                "schadule.$.slot5": {
                  location: req.body.location,
                  course: cour
                }
              }
            },
              function (err, result) {
                if (err) {
                  res.send(err);
                  error = true;
                }

              })
          }

        }
      })

      return res.send("Upadted");
    }
    catch {
      return res.send("ERROR");
    }
  }) //done

  app.get("/notification", authanticateToken, async function (req, res) {
    try {
      r=await acMember.findOne({
        id:req.userID
      })
      res.send(r.notification);
    }
    catch{
      res.send("Error");
    }
  })
  
  app.post("/sendReplacmentRequest", authanticateToken, async function (req, res) {
    try {
      var error = false;

      var r=await locations.findOne({
        name:req.body.location
      })
      if(!r){
        return res.send("there is no location with this name");
      }

      r=await course.findOne({
        name:req.body.course
      })
      if(!r){
        return res.send("there is no course with this name");
      }

      r=await acMember.findOne({
        id:req.body.to
      })

      if(!r){
        return res.send("there is no user with this id");
      }

      if (c == undefined) {
        await findC();
      }
      c.requestID++;
      c.save();
      var reqID = c.requestID;



  await  acMember.findOneAndUpdate({
        id: req.body.to
      }, {
        $push: {
          receivedReplacment: {
            request: req.body.request,
            slot: req.body.slot,
            day: req.body.day,
            date: new Date(req.body.date),
            from: req.userID, // loged in id
            course: req.body.course,
            status: "Pending",

            location: req.body.location,
            id: reqID
          }
        }
      }, function (err) {
        if (err) {
          error = true;
         return res.send(err);
        }
      });

      acMember.findOneAndUpdate({
        id: req.body.to
      }, {
        $push: {
          notification: {
            status: "Pending",
            id: reqID,
            route:"/ViewReceivedReplacment"
          }
        }
      }, function (err) {
        if (err) {
          error = true;
         return res.send(err);
        }
      });


      if (!error) {
        acMember.findOneAndUpdate({
          id: req.userID // loged in id
        }, {
          $push: {
            sentReplacment: {
              request: req.body.request,
              slot: req.body.slot,
              day: req.body.day,
              to: req.body.to,
              course: req.body.course,
              date: new Date(req.body.date),
              status: "Pending",
              location: req.body.location,
              id: reqID
            }
          }
        }, function (err) {
          if (err) {
          return res.send(err);
          }
        });
      }
        return res.send("SENT");
    }
    catch {
      return res.send("Error")
    }

  }) //done

  app.get("/viewSchadule", authanticateToken, function (req, res) {
    try {
      acMember.find({
        id: req.userID // id of loged in user
      }, function (err, result) {
        if (err)
          res.send(err);
        else {
          if(!result[0])
          return res.send("Can't see the schadule")
          return res.send(result[0].schadule);
        }
      })
    }
    catch {
      return res.send("Error")
    }
  }) //done

  app.post("/replacmentRejection", authanticateToken, async function (req, res) {
    try {
      var loginID = req.userID; // fix



      await acMember.find({
        id: loginID,
      }, function (err, result) { //the token
        if (err) {
          return res.send("err");
        } else {
          // let arr = JSON.parse(JSON.stringify(result[0].slotLinkingReceivedRequests));
          // console.log(arr);


          result[0].receivedReplacment.forEach(function (co) {
            if (co.id == req.body.id) {

              acMember.findOne({
                id: co.from,
              },
                function (err, foundUser) {
                  if (err) {
                    res.send(err);
                  } else if (!foundUser) {
                    return res.send("Can't find the date ")
                  } else {
                    let arr = JSON.parse(JSON.stringify(foundUser.sentReplacment));
                    foundUser.notification.push({status:"Rejected",id:req.body.id,route:"/ViewSentReplacment"});
                    for (let i = 0; i < arr.length; i++) {
                      if (arr[i].status == "Pending" && arr[i].id == req.body.id) {
                        arr[i].status = "Rejected";
                      }
                    }
                    foundUser.sentReplacment = arr;
                    foundUser.save();
                  }
                })

            }
          })
        }
      })
      ///// reciver
      acMember.findOne({
        id: req.userID,
      },
        function (err, foundUser) {
          if (err) {
            res.send(err);
          } else if (!foundUser) {
            return res.send("Can't find the data ")
          } else {
            let arr = JSON.parse(JSON.stringify(foundUser.receivedReplacment));
            for (let i = 0; i < arr.length; i++) {
              if (arr[i].status == "Pending" && arr[i].id == req.body.id) {
                arr[i].status = "Rejected";
              }
            }
            foundUser.receivedReplacment = arr;
            foundUser.save();
          }
        })




      res.send("Done");
    } catch {
      res.send("ERROR")
    }

  }) //done

  app.post("/replacmentAcceptance", authanticateToken, async function (req, res) {

    try {

      var loginID = req.userID; // fix

      var mydata;

      mydata = await acMember.findOne({
        id: loginID
      })

      var request;
      for (x of mydata.receivedReplacment) {
        if (x.id == req.body.id) {
          request = x;
          break;
        }
      }

      if (!request) {
        return res.send("you can't find this request");
      }

      var free = true;
      var arr = mydata.schadule;
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].day == request.day) {
          if (request.slot == "slot1") {
            if (arr[i].slot1 != "free")
              free = false;
          }
          if (request.slot == "slot2") {
            if (arr[i].slot2 != "free")
              free = false;
          }
          if (request.slot == "slot3") {
            if (arr[i].slot3 != "free")
              free = false;
          }
          if (request.slot == "slot4") {
            if (arr[i].slot4 != "free")
              free = false;
          }
          if (request.slot == "slot5") {
            if (arr[i].slot5 != "free")
              free = false;
          }
          qq = true;
        }
      }

      if (!free)
        return res.send("YOU can't accept this request");





      await acMember.find({
        id: req.userID,
      }, function (err, result) { //the token
        if (err) {
          return res.send("err");
        } else {
          // let arr = JSON.parse(JSON.stringify(result[0].slotLinkingReceivedRequests));
          // console.log(arr);


          result[0].receivedReplacment.forEach(function (co) {
            if (co.id == req.body.id) {

              acMember.findOne({
                id: co.from,
              },
                function (err, foundUser) {
                  if (err) {
                    res.send(err);
                  } else if (!foundUser) {
                    return res.send("Can't find the data ")
                  } else {
                    let arr = JSON.parse(JSON.stringify(foundUser.sentReplacment));
                    foundUser.notification.push({status:"Accepted",id:req.body.id,route:"/ViewSentReplacment"});
                    for (let i = 0; i < arr.length; i++) {
                      if (arr[i].status == "Pending" && arr[i].id == req.body.id) {
                        arr[i].status = "Accepted";
                      }
                    }
                    foundUser.sentReplacment = arr;
                    foundUser.save();
                  }
                })

            }
          })
        }
      })
      ///// reciver
      acMember.findOne({
        id: req.userID,
      },
        function (err, foundUser) {
          if (err) {
            res.send(err);
          } else if (!foundUser) {
            return res.send("Can't find the date ")
          } else {
            let arr = JSON.parse(JSON.stringify(foundUser.receivedReplacment));
            for (let i = 0; i < arr.length; i++) {
              if (arr[i].status == "Pending" && arr[i].id == req.body.id) {
                arr[i].status = "Accepted";
              }
            }
            foundUser.receivedReplacment = arr;
            foundUser.save();
          }
        })


      res.send("Done");
    } catch {
      res.send("ERROR")
    }



  })

  // const dayJob = schedule.scheduleJob({hour: 19 }, () => {

  //   updateSchaduel();
  //   console.log("jobs runs automaticaly");
  //   updateDayinfo();
  // });

  async function updateSchaduel() {

    var members = [];

    members = await acMember.find({ id: req.userID });

    members.forEach((mem) => {
      arr = JSON.parse(JSON.stringify(mem.schadule));
      mem.receivedReplacment.forEach((request) => {
        if (request.status == "Accepted") {
          var dif = (request.date - new Date()) / (1000 * 60 * 60 * 24 * 7);
          if (dif < 0 && dif > -7) {
            for (var i = 0; i < arr.length; i++) {
              if (arr[i].day == request.day) {
                if (request.slot == "slot1") {
                  arr[i].slot1 = "free";
                }
                if (request.slot == "slot2") {
                  arr[i].slot2 = "free";
                }
                if (request.slot == "slot3") {
                  arr[i].slot3 = "free";
                }
                if (request.slot == "slot4") {
                  arr[i].slot4 = "free";
                }
                if (request.slot == "slot5") {
                  arr[i].slot5 = "free";
                }
              }
            }
          }
          if (dif >= 0 && dif <= 7) {

            for (var i = 0; i < arr.length; i++) {
              if (arr[i].day == request.day) {
                if (request.slot == "slot1") {
                  arr[i].slot1 = {
                    location: loc,
                    course: co.course
                  };
                }
                if (request.slot == "slot2") {
                  arr[i].slot2 = {
                    location: loc,
                    course: co.course
                  };
                }
                if (request.slot == "slot3") {
                  arr[i].slot3 = {
                    location: loc,
                    course: co.course
                  };
                }
                if (request.slot == "slot4") {
                  arr[i].slot4 = {
                    location: loc,
                    course: co.course
                  };
                }
                if (request.slot == "slot5") {
                  arr[i].slot5 = {
                    location: loc,
                    course: co.course
                  };
                }
              }
            }


          }

        }
      })
      mem.schadule = JSON.parse(JSON.stringify(arr));
      mem.save();
    })
  }

  app.post("/sendSlotLinkingRequest", authanticateToken, async function (req, res) {

    var error = false;

    var x = "";
    if (c == undefined) {
      await findC();
    }
    c.requestID++;
    c.save();
    var reqID = c.requestID;
    x = await course.findOne({
      name: req.body.course
    }, function (err, result) {
      if (err) {
        return res.send(err);
        error = true;
      }
    })
    x = x.coordinator;
    if (!error) {
      acMember.findOneAndUpdate({
        id: x
      }, {
        $push: {
          slotLinkingReceivedRequests: {
            request: req.body.request,
            slot: req.body.slot,
            day: req.body.day,
            from: req.userID, // loged in id
            course: req.body.course,
            status: "Pending",
            id: reqID
          }
        }
      }, function (err) {
        if (err) {
          error = true;
          res.send(err);
        }
      })
    }

    if (!error) {
      acMember.findOneAndUpdate({
        id: x
      }, {
        $push: {
          slotLinkingReceivedRequests: {
            route: "/ViewReceivedSlotLinking",
            status: "Pending",
            id: reqID
          }
        }
      }, function (err) {
        if (err) {
          error = true;
          res.send(err);
        }
      })
    }

    if (!error) {
      acMember.findOneAndUpdate({
        id: x
      }, {
        $push: {
          slotLinkingReceivedRequests: {
            request: req.body.request,
            slot: req.body.slot,
            day: req.body.day,
            from: req.userID, // loged in id
            course: req.body.course,
            status: "Pending",
            id: reqID
          }
        }
      }, function (err) {
        if (err) {
          error = true;
          res.send(err);
        }
      })
    }

    if (!error) {
      acMember.findOneAndUpdate({
        id: x
      }, {
        $push: {
          notification: {
            route:"/ViewReceivedSlotLinking",
            status: "Pending",
            id: reqID
          }
        }
      }, function (err) {
        if (err) {
          error = true;
          res.send(err);
        }
      })
    }

    if (!error) {
      acMember.findOneAndUpdate({
        id: req.userID // loged in id
      }, {
        $push: {
          slotLinkingSentRequests: {
            request: req.body.request,
            slot: req.body.slot,
            day: req.body.day,
            to: x,
            course: req.body.course,
            status: "Pending",
            id: reqID
          }
        }
      }, function (err) {
        if (err) {
          error = true;
          res.send(err);
        }
      });

    }
    if (!error)
      res.send("slotLinking SENT");
  })

  app.post("/sendChangeDayOffRequest", authanticateToken, async function (req, res) {
    try {
      var error = false;
      if (c == undefined) {
        await findC();
      }
      c.requestID++;
      c.save();
      var reqID = c.requestID;

      var hod = "";
      var mycourse = "";
      var zz;
      zz = await acMember.findOne({
        id: req.userID //loged in id
      }, function (err, result) {
        if (err) {
          error = true;
          return res.send(err);
        }
      })
      mycourse = zz.course;

      if(mycourse==""){
        return res.send("You can't send the request ");
      }

      if (!error) {
        zz = undefined;
        zz = await course.find({
          name: mycourse
        }, async function (err, result) {
          if (err) {
            res.send(err);
            error = true;
          }
        })
      }
      if (zz[0].ta.includes(req.userID)) { // loged in id

        hod = await department.findOne({
          name: zz[0].department
        }, function (erro, ans) {
          if (erro) {
            res.send(erro);
            error = true;
          }
        })
        hod = hod.head;
      }
      else{
          return res.send("You can't send the request ");
      }
      var reqFound = "";
      if (req.body.hasOwnProperty("reason")) {
        reqFound = req.body.reason;
      }

      if (!error) {
        acMember.findOneAndUpdate({
          id: hod
        }, {
          $push: {
            receivedDayoffRequest: {
              reason: reqFound,
              day: req.body.day,
              from: req.userID, // loged in id
              status: "Pending",
              id: reqID
            }
          }
        }, function (err) {
          if (err) {
            error = true;
          return  res.send(err);
          }
        })
      }

      if (!error) {
        acMember.findOneAndUpdate({
          id: hod
        }, {
          $push: {
            notification: {
              route:"/ViewReceivedDayOffRequest",
              status: "Pending",
              id: reqID
            }
          }
        }, function (err) {
          if (err) {
            error = true;
          return  res.send(err);
          }
        })
      }

      if (!error) {
        acMember.findOneAndUpdate({
          id: req.userID // loged in id
        }, {
          $push: {
            sentDayoffRequest: {
              reason: reqFound,
              day: req.body.day,
              status: "Pending",
              id: reqID
            }
          }
        }, function (err) {
          if (err) {
            error = true;
          return  res.send(err);
          }
        });

      }
      if (!error)
      return  res.send("dayoff change request SENT");
    }
    catch {
      return res.send("ERROR");
    }
  })

  app.post("/sendLeaveRequest", authanticateToken, async function (req, res) {
    try {


      var error = false;
      if (c == undefined) {
        await findC();
      }
      c.requestID++;
      c.save();
      var reqID = c.requestID;

      var hod = "";
      var mycourse = "";
      var zz;
      zz = await acMember.findOne({
        id: req.userID //loged in id
      }, function (err, result) {
        if (err) {
          error = true;
          return res.send(err);
        }
      })
      mycourse = zz.course;
      if(mycourse=="" || (req.body.type=="Maternity"&& zz.gender=="male")){
        return res.send("You can't send the request ");
      }
      if (!error) {
        zz = undefined;
        zz = await course.find({
          name: mycourse
        }, async function (err, result) {
          if (err) {
            res.send(err);
            error = true;
          }
        })
      }
      if (zz[0].ta.includes(req.userID)) { // loged in id

        hod = await department.findOne({
          name: zz[0].department
        }, function (erro, ans) {
          if (erro) {
            res.send(erro);
            error = true;
          }
        })
        hod = hod.head;
      }
      else{
          return res.send("You can't send the request ");
      }

      var reqFound = "";
      if (req.body.hasOwnProperty("reason")) {
        reqFound = req.body.reason;
      } else {
        if (req.body.type === "Compensation") {
          return res.send("ERROR Compensation request must have a reason ")
          error = true;
        }
      }

      // console.log(hod + " szx");
      if (!error) {
        acMember.findOneAndUpdate({
          id: hod
        }, {
          $push: {
            receivedLeavefRequest: {
              date: new Date(req.body.date),
              type: req.body.type,
              reason: reqFound,
              from: req.userID, // loged in id
              status: "Pending",
              id: reqID
            }
          }
        }, function (err) {
          if (err) {
            error = true;
            res.send(err);
          }
        })
      }

      if (!error) {
        acMember.findOneAndUpdate({
          id: hod
        }, {
          $push: {
            receivedLeavefRequest: {
              route:"/ViewReceivedLeaveRequest",
              status: "Pending",
              id: reqID
            }
          }
        }, function (err) {
          if (err) {
            error = true;
            res.send(err);
          }
        })
      }

      if (!error) {
        acMember.findOneAndUpdate({
          id: req.userID // loged in id
        }, {
          $push: {
            sentLeaveRequest: {
              date: new Date(req.body.date),
              type: req.body.type,
              reason: reqFound,
              status: "Pending",
              id: reqID
            }
          }
        }, function (err) {
          if (err) {
            error = true;
            res.send(err);
          }
        });

      }
      if (!error)
        res.send("Leave request SENT");
    }
    catch {
      return res.send("ERROR")
    }

  })

  app.get("/viewReceivedSlotLinkingRequest", authanticateToken, function (req, res) {
    acMember.find({
      id: req.userID // id of loged in user
    }, function (err, result) {
      if (err)
        res.send(err);
      else {
        if (result[0] == undefined)
          res.send("No requests found");
        else
          res.send(result[0].slotLinkingReceivedRequests);
      }
    })
  })

  app.get("/viewSentSlotLinkingRequests", authanticateToken, function (req, res) {
    acMember.find({
      id: req.userID // id of loged in user
    }, function (err, result) {
      if (err)
        res.send(err);
      else {
        if (result[0] == undefined)
          res.send("No requests found");
        else
          res.send(result[0].slotLinkingSentRequests);
      }
    })
  })

  app.get("/viewReceivedReplacment", authanticateToken, function (req, res) {
    acMember.find({
      id: req.userID // id of loged in user
    }, function (err, result) {
      if (err)
        res.send(err);
      else {
        if (result[0] == undefined)
          res.send("No requests found");
        else
          res.send(result[0].receivedReplacment);
      }
    })
  })

  app.get("/viewSentReplacment", authanticateToken, function (req, res) {
    acMember.find({
      id: req.userID // id of loged in user
    }, function (err, result) {
      if (err)
        res.send(err);
      else {
        if (result[0] == undefined)
          res.send("No requests found");
        else
          res.send(result[0].sentReplacment);
      }
    })
  })

  app.get("/viewReceivedDayOffRequest", authanticateToken, function (req, res) {
    acMember.find({
      id: req.userID // id of loged in user
    }, function (err, result) {
      if (err)
        res.send(err);
      else {
        if (result[0] == undefined)
          res.send("No requests found");
        else
          res.send(result[0].receivedDayoffRequest);
      }
    })
  })

  app.get("/viewSentDayOffRequest", authanticateToken, function (req, res) {
    acMember.find({
      id: req.userID // id of loged in user
    }, function (err, result) {
      if (err)
        res.send(err);
      else {
        if (result[0] == undefined)
          res.send("No requests found");
        else
          res.send(result[0].sentDayoffRequest);
      }
    })
  })

  app.get("/viewReceivedLeaveRequest", authanticateToken, function (req, res) {
    acMember.find({
      id: req.userID // id of loged in user
    }, function (err, result) {
      if (err)
        res.send(err);
      else {
        if (result[0] == undefined)
          res.send("No requests found");
        else
          res.send(result[0].receivedLeavefRequest);
      }
    })
  })



  app.get("/viewSentLeaveRequest", authanticateToken, function (req, res) {
    acMember.find({
      id: req.userID // id of loged in user
    }, function (err, result) {
      if (err)
        res.send(err);
      else {
        if (result[0] == undefined)
          res.send("No requests found");
        else
          res.send(result[0].sentLeaveRequest);
      }
    })
  })

  app.get("/viewReceivedSlotLinkingRequest/:status",  function (req, res) {
    acMember.find({
      id: req.userID, // id of loged in user
      "slotLinkingReceivedRequests.status": req.params.status
    }, function (err, result) {
      if (err)
        res.send(err);
      else {
        if (result[0] == undefined)
          res.send("No requests found");
        else{
          var ans=[];
          result[0].slotLinkingReceivedRequests.forEach(y=>{
            if(y.status==req.params.status){
              ans.push(y);
            }
          })
          res.send(ans);

        }
      }
    })
  })

  app.get("/viewSentSlotLinkingRequests/:status",function (req, res) {
    acMember.find({
      id: req.userID, // id of loged in user
      "slotLinkingSentRequests.status": req.params.status
    }, function (err, result) {
      if (err)
        res.send(err);
      else {
        if (result[0] == undefined)
          res.send("No requests found");
        else{
          var ans=[];
          result[0].slotLinkingSentRequests.forEach(y=>{
            if(y.status==req.params.status){
              ans.push(y);
            }
          })
          res.send(ans);

        }
      }
    })
  })

  app.get("/viewReceivedReplacment/:status", authanticateToken, function (req, res) {
    acMember.find({
      id: req.userID, // id of loged in user
      "receivedReplacment.status": req.params.status
    }, function (err, result) {
      if (err)
        res.send(err);
      else {
        // console.log(result.receivedReplacment);
        if (result[0] == undefined)
          res.send("No requests found");
        else{
          var ans=[];
          result[0].receivedReplacment.forEach(y=>{
            if(y.status==req.params.status){
              ans.push(y);
            }
          })
          res.send(ans);

        }
      }
    })
  })

  app.get("/viewSentReplacment/:status", authanticateToken, function (req, res) {
    acMember.find({
      id: req.userID, // id of loged in user
      "sentReplacment.status": req.params.status
    }, function (err, result) {
      if (err)
        res.send(err);
      else {
        if (result[0] == undefined)
          res.send("No requests found");
        else{
          var ans=[];
          result[0].sentReplacment.forEach(y=>{
            if(y.status==req.params.status){
              ans.push(y);
            }
          })
          res.send(ans);

        }
      }
    })
  })

  app.get("/viewReceivedDayOffRequest/:status", authanticateToken, function (req, res) {
    acMember.find({
      id: req.userID, // id of loged in user
      "receivedDayoffRequest.status": req.params.status
    }, function (err, result) {
      if (err)
        res.send(err);
      else {
        if (result[0] == undefined)
          res.send("No requests found");
        else{
          var ans=[];
          result[0].receivedDayoffRequest.forEach(y=>{
            if(y.status==req.params.status){
              ans.push(y);
            }
          })
          res.send(ans);

        }
      }
    })
  })

  app.get("/viewSentDayOffRequest/:status", authanticateToken, function (req, res) {
    acMember.find({
      id: req.userID, // id of loged in user
      "sentDayoffRequest.status": req.params.status
    }, function (err, result) {
      if (err)
        res.send(err);
      else {
        if (result[0] == undefined)
          res.send("No requests found");
        else{
          var ans=[];
          result[0].sentDayoffRequest.forEach(y=>{
            if(y.status==req.params.status){
              ans.push(y);
            }
          })
          res.send(ans);

        }
      }
    })
  })

  app.get("/viewReceivedLeaveRequest/:status", authanticateToken, function (req, res) {
    acMember.find({
      id: req.userID, // id of loged in user
      "receivedLeavefRequest.status": req.params.status
    }, function (err, result) {
      if (err)
        res.send(err);
      else {
        if (result[0] == undefined)
          res.send("No requests found");
        else{
          var ans=[];
          result[0].receivedLeavefRequest.forEach(y=>{
            if(y.status==req.params.status){
              ans.push(y);
            }
          })
          res.send(ans);

        }
      }
    })
  })

  app.get("/viewSentLeaveRequest/:status", authanticateToken, function (req, res) {
    acMember.find({
      id: req.userID, // id of loged in user
      "sentLeaveRequest.status": req.params.status
    }, function (err, result) {
      if (err)
        res.send(err);
      else {
        if (result[0] == undefined)
          res.send("No requests found");
        else{
          var ans=[];
          result[0].sentLeaveRequest.forEach(y=>{
            if(y.status==req.params.status){
              ans.push(y);
            }
          })
          res.send(ans);

        }
      }
    })
  })



  app.post("/getCovarge", authanticateToken, function (req, res) {
    try {

      course.findOne({
        name: req.body.course

      }, function (err, result) {
        if (err) {
          res.send(err)
        }
        else {
          res.send(result.covarge / result.total + "");
        }
      })
    }
    catch {
      res.send("ERROR");
    }
  })

  app.post("/cancelSlotLinkingRequest", authanticateToken, async function (req, res) {
    try {
      var error = false;

      var x = "";
      var logedinID = req.userID; //fix
      x = await acMember.findOne({
        id: logedinID
      }, function (err, result) {
        if (err) {
          return res.send(err);
          error = true;
        }
      })
      if (!x)
        return res.send("ERROR");
      var to;
      for (g of x.slotLinkingSentRequests) {
        if (g.id == req.body.id) {
          to = g.to;
        }
      }
      if (!to)
        return res.send("ERROR");

      acMember.findOne({
        id: logedinID
      },
        function (err, foundUser) {
          if (err) {
            res.send(err);
          } else if (!foundUser) {
            return res.send("Can't find the date ")
          } else {
            let arr = JSON.parse(JSON.stringify(foundUser.slotLinkingSentRequests));
            for (let i = 0; i < arr.length; i++) {
              if (arr[i].status == "Pending" && arr[i].id == req.body.id) {
                arr[i].status = "Canceled";
              }
            }
            foundUser.slotLinkingSentRequests = arr;
            foundUser.save();
          }
        })


      acMember.findOne({
        id: to,
        coordinator: true
      },
        function (err, foundUser) {
          if (err) {
            res.send(err);
          } else if (!foundUser) {
            return res.send("Can't find the date")
          } else {
            let arr = JSON.parse(JSON.stringify(foundUser.slotLinkingReceivedRequests));
            result.notification.push({status:"Accepted",id:req.body.id,route:"/ViewReceivedSlotLinking"});
            for (let i = 0; i < arr.length; i++) {
              if (arr[i].status == "Pending" && arr[i].id == req.body.id) {
                arr[i].status = "Canceled";
              }
            }
            foundUser.slotLinkingReceivedRequests = arr;
            foundUser.save();
          }
        })


    return res.send("Canceld if it is not responed");
    } catch {
      return res.send("ERROR")
    }
  })

  app.post("/cancelReplacmentRequest", authanticateToken, async function (req, res) {

    try {
      var error = false;
      var x = "";
      var logedinID = req.userID; //fix
      x = await acMember.findOne({
        id: logedinID
      }, function (err, result) {
        if (err) {
          return res.send(err);
          error = true;
        }
      })
      if (!x)
        return res.send("ERROR");
      var to;
      for (g of x.sentReplacment) {
        if (g.id == req.body.id) {
          to = g.to;
          if (!to)
        return res.send("ERROR");

      acMember.findOne({
        id: logedinID
      },
        function (err, foundUser) {
          if (err) {
            res.send(err);
          } else if (!foundUser) {
            return res.send("Can't find the data ")
          } else {
            let arr = JSON.parse(JSON.stringify(foundUser.sentReplacment));
            foundUser.notification.push({status:"Canceled",id:req.body.id,route:"/ViewReceivedSlotLinking"});
            for (let i = 0; i < arr.length; i++) {
              if (arr[i].status == "Pending" && arr[i].id == req.body.id) {
                arr[i].status = "Canceled";
              }
            }
            foundUser.sentReplacment = arr;
            foundUser.save();
          }
        })


      acMember.findOne({
        id: to,
      },
        function (err, foundUser) {
          if (err) {
            res.send(err);
          } else if (!foundUser) {
            return res.send("Can't find the date")
          } else {
            let arr = JSON.parse(JSON.stringify(foundUser.receivedReplacment));
            for (let i = 0; i < arr.length; i++) {
              if (arr[i].status == "Pending" && arr[i].id == req.body.id) {
                arr[i].status = "Canceled";
              }
            }
            foundUser.receivedReplacment = arr;
            foundUser.save();
          }
        })

      }
    }
    return res.send("Canceld if it is not responed");
    } catch {
      res.send("ERROR")
    }

  })

  app.post("/cancelDayoffRequest", authanticateToken, async function (req, res) {
    try {
      var error = false;

      var x = "";
      var logedinID = req.userID; //fix
      x = await acMember.findOne({
        id: logedinID
      }, function (err, result) {
        if (err) {
          return res.send(err);
          error = true;
        }
      })
      if (!x)
        return res.send("ERROR");
      var to;
      for (g of x.sentDayoffRequest) {
        if (g.id == req.body.id) {
          to = g.to;
        }
      }
      if (!to)
        return res.send("ERROR");

      acMember.findOne({
        id: logedinID
      },
        function (err, foundUser) {
          if (err) {
            res.send(err);
          } else if (!foundUser) {
            return res.send("Can't find the date ")
          } else {
            let arr = JSON.parse(JSON.stringify(foundUser.sentDayoffRequest));
            foundUser.notification.push({status:"Cancelled" , id : req.body.id , route:"/ViewSentDayOffRequest"});
            for (let i = 0; i < arr.length; i++) {
              if (arr[i].status == "Pending" && arr[i].id == req.body.id) {
                arr[i].status = "Canceled";
              }
            }
            foundUser.sentDayoffRequest = arr;
            foundUser.save();
          }
        })


      acMember.findOne({
        id: to
      },
        function (err, foundUser) {
          if (err) {
            res.send(err);
          } else if (!foundUser) {
            return res.send("Can't find the date")
          } else {
            let arr = JSON.parse(JSON.stringify(foundUser.receivedDayoffRequest));
            for (let i = 0; i < arr.length; i++) {
              if (arr[i].status == "Pending" && arr[i].id == req.body.id) {
                arr[i].status = "Canceled";
              }
            }
            foundUser.receivedDayoffRequest = arr;
            foundUser.save();
          }
        })


    return  res.send("Canceld if it is not responed");
    } catch {
      res.send("ERROR")
    }
  })

  app.post("/cancelLeaveRequest", authanticateToken, async function (req, res) {
    try {
      var error = false;

      var x = "";
      var logedinID = req.userID; //fix
      x = await acMember.findOne({
        id: logedinID
      }, function (err, result) {
        if (err) {
          return res.send(err);
          error = true;
        }
      })
      if (!x)
        return res.send("ERROR");
      var to;
      for (g of x.sentLeaveRequest) {
        if (g.id == req.body.id) {
          to = g.to;
        }
      }
      if (!to)
        return res.send("ERROR");

      acMember.findOne({
        id: logedinID
      },
        function (err, foundUser) {
          if (err) {
            res.send(err);
          } else if (!foundUser) {
            return res.send("Can't find the date ")
          } else {
            let arr = JSON.parse(JSON.stringify(foundUser.sentLeaveRequest));
            foundUser.notification.push({status:"Canceled",id:req.body.id,route:"/ViewReceivedLeaveRequest"});
            for (let i = 0; i < arr.length; i++) {
              if (arr[i].status == "Pending" && arr[i].id == req.body.id) {
                arr[i].status = "Canceled";
              }
            }
            foundUser.sentLeaveRequest = arr;
            foundUser.save();
            console.log("updated sender");
          }
        })


      acMember.findOne({
        id: to
      },
        function (err, foundUser) {
          if (err) {
            res.send(err);
          } else if (!foundUser) {
            return res.send("Can't find the date")
          } else {
            let arr = JSON.parse(JSON.stringify(foundUser.receivedLeavefRequest));
            for (let i = 0; i < arr.length; i++) {
              if (arr[i].status == "Pending" && arr[i].id == req.body.id) {
                arr[i].status = "Canceled";
              }
            }
            foundUser.receivedLeavefRequest = arr;
            foundUser.save();
            console.log("updated reciver");
          }
        })


    return  res.send("Canceld if it is not responed");
    } catch {
      res.send("ERROR")
    }
  })

}


app.listen(4000, function () {
  console.log("Server started at port 4000 changed");
});