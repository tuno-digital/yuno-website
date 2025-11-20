document.addEventListener("DOMContentLoaded", function () {
    const banner = document.getElementById("cookie-banner");
    const acceptBtn = document.getElementById("cookie-accept");

    if (!localStorage.getItem("yuno_cookie_consent")) {
        banner.classList.add("show");
    }

    acceptBtn.addEventListener("click", () => {
        localStorage.setItem("yuno_cookie_consent", "accepted");
        banner.classList.remove("show");
    });
});