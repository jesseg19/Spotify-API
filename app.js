// Need to add scopes for new features

let redirect_uri = "http://127.0.0.1:5500/index.html";

var client_id = "";
var client_secret = "";

let access_token = null;
let refresh_token = null;

//spotify endpoints
const AUTHORIZE = "https://accounts.spotify.com/authorize"
const TOKEN = "https://accounts.spotify.com/api/token";
const DEVICES = "https://api.spotify.com/v1/me/player/devices";
const PERSONALIZATION = "https://api.spotify.com/v1/me/top/tracks";

function onPageLoad() {
    //client_id = localStorage.getItem("client_id");
    //client_secret = localStorage.getItem("client_secret");

    if ( window.location.search.length > 0 ){
        handleRedirect();
    }
   
}

// ----- AUTHORIZATION ---
function handleRedirect() {
    let code = getCode();
    fetchAccessToken(code);
    window.history.pushState("", "", redirect_uri); // remove the param from the url
}

function fetchAccessToken( code ){
    let body = "grant_type=authorization_code";
    body += "&code=" + code; 
    body += "&redirect_uri=" + encodeURI(redirect_uri);
    body += "&client_id=" + client_id;
    body += "&client_secret=" + client_secret;
    callAuthorizationApi(body);
}

function callAuthorizationApi(body){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", TOKEN, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(client_id + ":" + client_secret));
    xhr.send(body);
    xhr.onload = handleAuthorizationResponse;
}

function refreshAccessToken() {
    refresh_token = localStorage.getItem("refresh_token");
    let body = "grant_type=refresh_token";
    body += "&refresh_token=" + refresh_token;
    body += "&client_id=" + client_id;
    callAuthorizationApi(body);
}

function handleAuthorizationResponse(){
    if ( this.status == 200 ){
        console.log("good");
        var data = JSON.parse(this.responseText);
        console.log(data);
        //var data = JSON.parse(this.responseText);
        if ( data.access_token != undefined ){
            access_token = data.access_token;
            localStorage.setItem("access_token", access_token);
        }
        if ( data.refresh_token != undefined ){
            refresh_token = data.refresh_token;
            localStorage.setItem("refresh_token", refresh_token);
        }
        onPageLoad();
    }
    else {
        console.log("hey");
        console.log(this.responseText);
        console.log(this.status);
        alert(this.status);
    }
}

function getCode() {
    let code = null;
    const queuryString = window.location.search;
    if (queuryString.length > 0) {
        const urlParams = new URLSearchParams(queuryString);
        code = urlParams.get('code');
    }
    return code;
}

function requestAuthorization(){
    client_id = "e421578040e54847bb3f0db513997561";
    client_secret = "95bc05abd01a4f2ab9fed528f7038073";
    //client_id = document.getElementById("clientId").value;
    //client_secret = document.getElementById("clientSecret").value;
    localStorage.setItem("client_id", client_id);
    localStorage.setItem("client_secret", client_secret); // In a real app you should not expose your client_secret to the user

    let url = AUTHORIZE;
    url += "?client_id=" + client_id;
    url += "&response_type=code";
    url += "&redirect_uri=" + encodeURI(redirect_uri);
    url += "&show_dialog=true";
    url += "&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private";
    window.location.href = url; // Show Spotify's authorization screen
}

// -------- FOR DEVICES ---------
function refreshDevices() {
    callApi("GET", DEVICES, null, handleDevicesResponse);
}

function handleDevicesResponse() {
    if(this.status == 200) {
        var data = JSON.parse(this.responseText);
        console.log(data);
        removeAllItems("devices");
        data.devices.forEach(item => addDevice(item));
    } else if(this.status == 401) {
        refreshAccessToken();
    } else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

// add a new devince to the list
function addDevice(item) {
    let node = document.createElement("option");
    node.value = item.id;
    node.innerHTML = item.name;
    document.getElementById("devices").appendChild(node);
}

// call the spotify api
function callApi(method, url, body, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer '+ access_token);
    xhr.send(body);
    xhr.onload = callback;
}

//remove all the devices so they don't repeat
function removeAllItems(elementId) {
    let node = document.getElementById(elementId);
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}


function refreshTracks() {
    callApi("GET", PERSONALIZATION, PERSONALIZATION.items, handlePersoalResponse);
}

//end of tutorial code
//horribly unfinished code
function handlePersoalResponse() {
    console.log("code: "+this.status);
    if(this.status == 200) {
        var data = JSON.parse(this.responseText);
        console.log(data);
        console.log(PERSONALIZATION);
    } else if(this.status == 401) {
        refreshAccessToken();
    } else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function refreshTopPicks() {
    callApi("GET", PERSONALIZATION, null, handlePersoalResponse);
}

function addTopTrack(item) {
    let topTrack = document.createElement("p");
    topTrack.value = item.id;
}