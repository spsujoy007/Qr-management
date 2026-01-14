// https://qrgeneratorbe.vercel.app
// http://192.168.1.12:5500
const express = require('express')
const app = express()
const port = 5000
var makeQrCode = require('qrcode');
var jwt = require('jsonwebtoken');
require('dotenv').config();

const nodemailer = require('nodemailer')

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


const MailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,   // your gmail
        pass: process.env.MAIL_PASS    // app password
    }
})

async function run() {
    try {
        
        await client.connect();
        console.log("Connected to MongoDB");
        
        const qrCollection = client.db("qr_generator").collection("qr_code");
        const bookTicketsCollection = client.db("qr_generator").collection("ticket");
        
        app.get("/generate_qr", async(req, res) => {
            let verifyCode = Math.floor(100000 + Math.random() * 900000);
            console.log("hited - /generate_qr endpoint");

            const userinfo = {
                code: verifyCode.toString()
            }
            makeQrCode.toDataURL(`https://qrmanagement-sp.netlify.app/verify.html?code=${verifyCode.toString()}`, function (err, url) {
                try {
                    if (err) {
                    console.log(err);
                    return res.status(500).send("QR error");
                }

                const getToken = () => { 
                    return jwt.sign(userinfo, process.env.JWT_SECRET, { expiresIn: '3m' });
                }
                const datas = {
                    qr_url: url, 
                    code: verifyCode.toString(), 
                    verified: false, 
                    createdAt: new Date(),
                    token: getToken()
                }
                
                qrCollection.insertOne(datas) 
                
                return (res.send({qr_url: url, code: verifyCode.toString()}));

                } catch (error) {
                    console.log("Error generating QR code:", error);
                    res.status(500).send("Error generating QR code");
                }
            })
            // console.log(data)
        })

        app.post("/verify", async (req, res) => {
            const { name, email} = req.body;
            const code = req.query.code;
            console.log(`Hello ${name}, Verification code received: ${code}`);

            const isAlreadyBooked = await bookTicketsCollection.findOne({code: code});
            if(isAlreadyBooked){
                return res.status(400).send({status: 400,message: `Code ${code} has already been used for booking.`});
            }
            
            const isAlreadyQrGenerated = await qrCollection.findOne({code: code});
            if(!isAlreadyQrGenerated){
                return res.status(401).send({status: 401,message: `Code ${code} is invalid. Please generate a valid QR code.`});
            }

            await bookTicketsCollection.insertOne({
                name: name,
                email: email,
                code: code,
                email_verified: false,
                bookedAt: new Date()
            })

            const updatedVerificationStatus = await qrCollection.updateOne({code: code}, {
                $set: {
                    createdAt: null,
                    verified: true
                }
            }, {new: true})

            try {
                await MailTransporter.sendMail({
                    from: `"QR Verify" <${process.env.MAIL_USER}>`,
                    to: email,
                    subject: "Please verify your email for QR Ticketing System",
                    html: `<h3>Hello ${name},</h3>
                           <p>Thank you for booking a ticket using our QR Ticketing System. Please click the link below to verify your email address:</p>
                           <a href="https://qrmanagement-sp.netlify.app/verify_email.html?code=${code}">Verify Email</a>
                           <p>If you did not make this request, please ignore this email.</p>
                           <br/>
                           <p>Best regards,<br/>QR Ticketing System Team</p>`
                })
                console.log("Email sent to", email)


            } catch (err) {
                console.error("Mail error:", err)
            }

            res.status(200).send({message: `Code ${code} received. Verification successful!`, data: updatedVerificationStatus});
        })

        app.get(`/verify_email`, async (req, res) => {
            const code = req.query.code;
            console.log(`Email verification code received: ${code}`);

            const isAlreadyQrGenerated = await qrCollection.findOne({code: code});
            if(!isAlreadyQrGenerated){
                return res.status(401).send({status: 401,message: `Code ${code} is invalid. Please generate a valid QR code.`});
            }

            const updatedVerificationStatus = await bookTicketsCollection.updateOne({code: code}, {
                $set: {
                    email_verified: true
                }
            }, {new: true})

            return res.status(200).send({message: `Email verification successful for code ${code}.`, data: updatedVerificationStatus});
        })

        app.get(`/verify_email_status`, async (req, res) => {
            const email = req.query.email;

            const bookingRecord = await bookTicketsCollection.findOne({email: email});
            if(!bookingRecord){
                return res.status(400).send({status: 400,message: `No booking found for email ${email}.`});
            }
            if(bookingRecord.email_verified){
                return res.status(200).send({status: 200, message: `Hey ${bookingRecord.name} your email ${email} is verified`});
            } else {
                return res.status(400).send({status: 400,message: `Email ${email} is not verified.`});
            }
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

