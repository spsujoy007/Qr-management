// const e = require("express");

const qr_basement = document.getElementById("qr_basement");
const generateNewQrBtn = document.getElementById("generateNewQr");

generateNewQrBtn.addEventListener("click", function() {
    generateNewQrBtn.disabled = true;
    generateNewQrBtn.innerText = "Generating...";
    fetch("https://qrgeneratorbe.vercel.app/generate_qr")
    .then(res => res.json())
    .then(data => {
        if(data){
        qr_basement.innerHTML = `
        <h1 class="text-xl font-semibold text-orange-500 pb-2">Scan this QR code to verify</h1>
        <img style="width: 220px; height: 220px;" src="${data?.qr_url}">`;
        console.log(data);
    }
        generateNewQrBtn.disabled = false;
        generateNewQrBtn.innerText = "Generate New QR";
    })
})

const verifyEmailBtn = document.getElementById("verifyEmailBtn");
async function handleCheckEmail(event) {
    event.preventDefault(); // Prevent default form submission
    verifyEmailBtn.disabled = true;
    verifyEmailBtn.innerText = "Checking...";

    const emailInput = document.getElementById("emailInput").value;
    console.log("Checking email verification for:", emailInput);

    await fetch(`https://qrgeneratorbe.vercel.app/verify_email_status?email=${emailInput}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(res => res.json())
    .then(data => {
        const verificationResult = document.getElementById("verificationResult");
        verifyEmailBtn.disabled = false;
        verifyEmailBtn.innerText = "Check Verification";
        if(data.status && data.status === 400){
            verificationResult.innerText = data.message;
            verificationResult.classList.add("text-red-500");
            verificationResult.classList.remove("text-green-500");
        } else if(data.status && data.status === 200){
            verificationResult.innerText = data.message;
            verificationResult.classList.add("text-green-500");
            verificationResult.classList.remove("text-red-500");
        }
    })
}