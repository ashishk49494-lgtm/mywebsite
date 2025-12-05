const btn = document.getElementById("helloBtn");
const msg = document.getElementById("message");

if (btn && msg) {
    btn.addEventListener("click", () => {
        msg.textContent = "Hello from JavaScript running in a page created via CMD!";
    });
}
