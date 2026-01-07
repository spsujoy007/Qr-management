const express = require('express')
const app = express()
const port = 5000
var makeQrCode = require('qrcode');
var jwt = require('jsonwebtoken');
require('dotenv').config();

const cors = require('cors');
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

let verifyCode = Math.floor(100000 + Math.random() * 900000);

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://<db_username>:<db_password>@cluster0.6ke0m0t.mongodb.net/?appName=Cluster0";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


function run() {
    try {
app.get("/generate_qr", async(req, res) => {
    console.log("hited - /generate_qr endpoint");


    makeQrCode.toDataURL(`http://192.168.1.12:5000/verify?code=${verifyCode.toString()}`, function (err, url) {
            try {
                if (err) {
                console.log(err);
                return res.status(500).send("QR error");
            }

            res.send({qr_url: url, code: verifyCode.toString()});

            } catch (error) {
                console.log("Error generating QR code:", error);
                res.status(500).send("Error generating QR code");
            }
        })
        // console.log(data)
    })

    app.get("/verify", (req, res) => {
        const code = req.query.code;
        console.log("Verification code received:", code);

        res.send(`Code ${code} received. Verification successful!`);
    })

    app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
    })
    }
    catch (error) {
        console.log("Error in myApp function:", error);
    }
}
run();

