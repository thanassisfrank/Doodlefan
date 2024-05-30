// app.js
// handles things for the top level apps
import {get, hide} from "./utils.js";

document.body.onload = function () {
    get("welcome-container").addEventListener("click", (e) => {
        hide(get("welcome-container"));
    });
}