const axios = require("axios");

module.exports.home_get = async (req, res, next) => {
  // get all data link
  console.log(process.env.KEY);
  try {
    const response = await axios.get(
      `${process.env.BASE_URL}${process.env.PARAMS}${process.env.APLICATION}${process.env.DEVICE_1}?fu=1&ty=4&drt=1`,
      {
        headers: {
          "X-M2M-Origin": process.env.KEY,
          "Content-Type": "application/json;ty=4",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
        },
      }
    );

    // console.log(response.data["m2m:uril"]);
    resArray = response.data["m2m:uril"];
    const allResponseTruck1 = resArray.map(async (url) => {
      const response = await axios.get(`${process.env.BASE_URL}${url}`, {
        headers: {
          "X-M2M-Origin": process.env.KEY,
          "Content-Type": "application/json;ty=4",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
        },
      });
      // console.log(JSON.parse(response.data["m2m:cin"].con));
      return JSON.parse(response.data["m2m:cin"].con);
    });

    Promise.all(allResponseTruck1).then((response) => {
      let latestData;
      // console.log(response);
      let banyak_kb_1 = [];
      let banyak_kb_2 = [];
      let status_kb_1 = [];
      let status_kb_2 = [];
      let status_kc_1 = [];
      let status_kc_2 = [];
      let total_kb_arr = [];

      response.forEach((data, index) => {
        if (index === 0) {
          latestData = data;
        }
        banyak_kb_1.push(data.b_kb_1);
        banyak_kb_2.push(data.b_kb_2);
        status_kb_1.push(data.s_kb_1);
        status_kb_2.push(data.s_kb_2);
        status_kc_1.push(data.s_kc_1);
        status_kc_2.push(data.s_kc_2);
        total_kb_arr.push(data.b_kb_1 + data.b_kb_2);
      });
      // console.log(latestData);
      res.locals.kecepatan = Math.floor(Math.random() * 60);
      const status1 = latestData.s_kb_1;
      const status2 = latestData.s_kb_2;
      let lamp_1;
      let lamp_2;

      if (status1 == 1 && status2 == 0) {
        lamp_1 = "Orange";
        lamp_2 = "Merah";
      } else if (status1 == 0 && status2 == 1) {
        lamp_1 = "Merah";
        lamp_2 = "Orange";
      } else if (status1 == 0 && status2 == 0) {
        lamp_1 = "Orange";
        lamp_2 = "Orange";
      } else if (status1 == 1 && status2 == 1) {
        lamp_1 = "Orange";
        lamp_2 = "Merah";
      } else {
        lamp_1 = "Merah";
        lamp_2 = "Merah";
      }

      // total kendaraan besar
      const total_kb = total_kb_arr.reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0
      );
      console.log(total_kb, total_kb_arr);
      return res.render("dashboard/index", {
        banyak_kb_1,
        banyak_kb_2,
        banyak_kb_1_la: latestData.b_kb_1,
        banyak_kb_2_la: latestData.b_kb_2,
        total_kb,
        status_kb_1: latestData.s_kb_1 ? "Ada" : "Tidak ada",
        status_kb_2: latestData.s_kb_2 ? "Ada" : "Tidak ada",
        lamp_1,
        lamp_2,
        kecepatan: Math.floor(Math.random() * 60),
      });
    });
  } catch (err) {
    console.log(err, "error cuy");
    return next(err);
  }
};

module.exports.home_post = async (req, res) => {
  const content = JSON.parse(
    req.body["m2m:sgn"]["m2m:nev"]["m2m:rep"]["m2m:cin"].con
  );
  content.kecepatan = Math.floor(Math.random() * 60);

  // console.log(JSON.parse(content));
  req.io.sockets.emit("message", { content });

  res.send("ack");
};

module.exports.status_post = async (req, res, next) => {
  const data = req.body;

  // orange = 0, merah = 1

  try {
    const response = await axios.post(
      `${process.env.BASE_URL}${process.env.PARAMS}${process.env.APLICATION}${process.env.DEVICE_2}`,
      {
        "m2m:cin": {
          con: `{"cam_a":1,"cam_b":1,"lamp_a":${data.data1},"lamp_b":${data.data2}}`,
        },
      },
      {
        headers: {
          "X-M2M-Origin": process.env.KEY,
          "Content-Type": "application/json;ty=4",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
        },
      }
    );
    console.log(response);
  } catch (err) {
    console.log(err);
    return next(err);
  }

  res.send("work");
};
