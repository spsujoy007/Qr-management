const qr_basement = document.getElementById("qr_basement");

document.getElementById("generateNewQr").addEventListener("click", function() {
    fetch("http://localhost:5000/generate_qr")
    .then(res => res.json())
    .then(data => {
        qr_basement.innerHTML = `
        <h1 class="text-xl font-semibold text-orange-500 pb-2">Scan this QR code to verify</h1>
        <img style="width: 220px; height: 220px;" src="${data?.qr_url}">`;
        console.log(data);
    })
})