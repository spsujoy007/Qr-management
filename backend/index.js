const express = require('express')
const app = express()
const port = 5000
var makeQrCode = require('qrcode');
var jwt = require('jsonwebtoken');
require('dotenv').config();

app.use(express.json());

const cors = require('cors');
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!')
})


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGODB_URI;
console.log(uri)

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
}
});


async function run() {
    try {
        
        await client.connect();
        console.log("Connected to MongoDB");
        
        const verificationStatusCollection = client.db("qr_generator").collection("verfication_status");
        
        app.get("/generate_qr", async(req, res) => {
            let verifyCode = Math.floor(100000 + Math.random() * 900000);
            console.log("hited - /generate_qr endpoint");

            const userinfo = {
                code: verifyCode.toString()
            }
            makeQrCode.toDataURL(`http://192.168.1.12:5500/verify.html?code=${verifyCode.toString()}`, function (err, url) {
                try {
                    if (err) {
                    console.log(err);
                    return res.status(500).send("QR error");
                }

                
                return (res.send({qr_url: url, code: verifyCode.toString()}), verificationStatusCollection.insertOne({qr_url: url, code: verifyCode.toString(), verified: false, createdAt: new Date()}) );

                } catch (error) {
                    console.log("Error generating QR code:", error);
                    res.status(500).send("Error generating QR code");
                }
            })
            // console.log(data)
        })

        app.post("/verify", (req, res) => {
            const { name, email} = req.body;
            const code = req.query.code;
            console.log(`Hello ${name}, Verification code received: ${code}`);

            // res.send(`Code ${code} received. Verification successful!`);
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

