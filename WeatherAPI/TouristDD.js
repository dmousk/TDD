const WeatherApiKey = '1e135ac10813133aa82195bd3629907f';
let isEmpty = false;
const OpenAIKey = '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';
let weather = "";
let weatherIcon = "";
let iconUrl = "";
const searchButton = document.querySelector("#Search");
const months = ['Jan','Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct','Nov','Dec'];

searchButton.addEventListener("click", validateAddress);
searchButton.addEventListener("click", validateRegion);
searchButton.addEventListener("click", validateCity);

function validateAddress(event) {
  event.preventDefault();
  const addressInput = document.querySelector("#Address");
  const errorMessageA = document.querySelector("#errorMessageA");

  if (addressInput.value.trim() === "") {
    errorMessageA.textContent = "Please enter your address!";
    errorMessageA.hidden = false;
    isEmpty = true;
  } else {
    errorMessageA.hidden = true;
    isEmpty = false;
  }
}

function validateRegion(event) {
  event.preventDefault();
  const regionInput = document.querySelector("#Region");
  const errorMessageR = document.querySelector("#errorMessageR");

  if (regionInput.value.trim() === "") {
    errorMessageR.textContent = "Please enter your region!";
    errorMessageR.hidden = false;
    isEmpty = true;
  } else {
    errorMessageR.hidden = true;
    isEmpty = false;
  }
}

function validateCity(event) {
  event.preventDefault();
  const cityInput = document.querySelector("#city");
  const errorMessageC = document.querySelector("#errorMessageC");

  if (cityInput.value.trim() === "") {
    errorMessageC.textContent = "Please select your city!";
    errorMessageC.hidden = false;
    isEmpty = true;
  } else {
    errorMessageC.hidden = true;
    isEmpty = false;
  }
}

const clearButton = document.getElementById("Clear");
clearButton.addEventListener("click", clearForm);

function clearForm() {

  document.getElementById("Address").value = "";
  document.getElementById("Region").value = "";
  document.getElementById("city").selectedIndex = 0;

  document.getElementById("Celcius").checked = true;

  document.getElementById("errorMessageA").innerHTML = "";
  document.getElementById("errorMessageR").innerHTML = "";
  document.getElementById("errorMessageC").innerHTML = "";
  document.getElementById("errorMessageA").hidden = true;
  document.getElementById("errorMessageR").hidden = true;
  document.getElementById("errorMessageC").hidden = true;
}


const Location = {lon: "", lat: ""};

function SearchPlace() {

  const address = document.getElementById("Address").value;
  const region = document.getElementById("Region").value;
  const city = document.getElementById("city").value;
  
  const query = `${address}, ${region}, ${city}`;
  console.log(query);
  fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json`)
    .then((response) => response.json())
    .then((data) => {
      if(data.length === 0 && isEmpty === false){
        alert('No result for that Location!');
      }

      else{
        Location.lat = data[0].lat;
        Location.lon = data[0].lon;
        WeatherMap();
        ShowMap();
        openAI();
        next24h();
      }
      console.log(data);
      console.log(Location);
    })
    .catch((error) => {
      console.error(error);
    });
    
}

let searchB = document.getElementById("Search");
searchB.addEventListener("click", SearchPlace);

const regionI = document.querySelector("#Region");
let t = "";
let p = "";
let ws = "";

function WeatherMap(){
  
  let C = document.getElementById('Celcius');
  let F = document.getElementById('Farheneit');
  let userUnit;

  if (C.checked === true){
    userUnit = C.value;
    t = '°C';
    p = 'hPa';
    ws = 'meters/sec';
  }

  else if (F.checked === true){
    userUnit = F.value;
    t = '°F';
    p = 'Mb';
    ws = 'miles/hour';
  }

  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${Location.lat}&lon=${Location.lon}&units=${userUnit}&APPID=${WeatherApiKey}`)
  .then((response) => response.json())
    .then((data) => {
      console.log(data);
      
      weather = data.weather[0].main;
      weatherIcon = data.weather[0].icon;
      iconUrl = 'https://openweathermap.org/img/wn/' + weatherIcon + ".png";
      document.getElementById('icon').src = iconUrl;
    
      const selectedRegion = regionI.value;
      weather = data.weather[0].description;
      document.getElementById('wRegion');
      wRegion.innerText = `${weather} in ${selectedRegion} \n`;
    
      weather = data.main.temp;
      document.getElementById("thermokrasia");
      thermokrasia.innerText = `${weather} ${t}`;

      let wMin = "";
      let wMax = "";
      wMin = data.main.temp_min;
      wMax = data.main.temp_max;
      document.getElementById("LowHigh");
      LowHigh.innerText = `\n L:${wMin} ${t} |   H:${wMax} ${t}\n`;

      weather = data.main.pressure;
      document.getElementById("Pres");
      Pres.innerText = `${weather} ${p}`;

      weather = data.main.humidity;
      document.getElementById("Hum");
      Hum.innerText = `${weather} %`;

      weather = data.wind.speed;
      document.getElementById("WindSpeed");
      WindSpeed.innerText = `${weather} ${ws}`;

      weather = data.clouds.all;
      document.getElementById("CloudsC");
      CloudsC.innerText = `${weather} %`;

      weather = data.sys.sunrise;
      let Sunrise = new Date(weather*1000).toISOString().slice(11,16);
      document.getElementById("Sunr");
      Sunr.innerText = `${Sunrise}`;

      weather = data.sys.sunset;
      let Sunset = new Date(weather *1000).toISOString().slice(11,16);
      document.getElementById("Suns");
      Suns.innerText = `${Sunset}`;
    })
    .catch((error) => {
      console.error(error);
    });
}

let map;

function ShowMap(){
 map = new ol.Map({
    target: 'map',
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM() 
      })
      ], 
      view: new ol.View({
        center: ol.proj.fromLonLat([Location.lon, Location.lat]),
        zoom: 5
      })
});
 SuperimposeMap();
 perMap();
}

function SuperimposeMap(){
  layer_temp = new ol.layer.Tile({
    source: new ol.source.XYZ({ 
      url: `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=dad3a7b0350ef139a2b11407130100df`, 
    }) 
  }); 
  map.addLayer(layer_temp);
}


function perMap(){
  precipitation_new = new ol.layer.Tile({
    source: new ol.source.XYZ({ 
      url: `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=dad3a7b0350ef139a2b11407130100df`, 
    }) 
  }); 
  map.addLayer(precipitation_new);
}

const cityDropdown = document.getElementById("city");
const cardHeader = document.getElementById("cardHeader");

cityDropdown.addEventListener("change", (event) => {
  const selectedCity = event.target.value;
  cardHeader.innerText = `Tourist Attractions in ${selectedCity}`;
});


function openAI() {
  const city = document.getElementById("city").value;
  const spinner = document.getElementById("spinner"); 

  fetch('https://api.openai.com/v1/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + OpenAIKey,
    },
    body: JSON.stringify({
      model: 'text-davinci-003',
      prompt: "Give me a list of top 3 attractions " + city,
      temperature: 0.7,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    })
  })
  .then(response => response.json())
  .then(data => {
    const attractions = data.choices[0].text.trim().split("\n").slice(0, 3);
    const numAttractions = attractions.length;
    for (let i = 0; i < 3; i++) {
      if (i < numAttractions) { 
        document.getElementById("attraction-" + (i + 1)).textContent = attractions[i];
        console.log(attractions[i]); 
      } else { 
        document.getElementById("attraction-" + (i + 1)).textContent = "";
      }
    }
    spinner.style.display = "none";
  })
  .catch(error => console.error(error));
}


function next24h(){
  let C = document.getElementById('Celcius');
  let F = document.getElementById('Farheneit');
  let userUnit;

  if (C.checked === true){
    userUnit = C.value;
    t = '°C';
    p = 'hPa';
    ws = 'meters/sec';
  }

  else if (F.checked === true){
    userUnit = F.value;
    t = '°F';
    p = 'Mb';
    ws = 'miles/hour';
  }

  fetch(`http://api.openweathermap.org/data/2.5/forecast?lat=${Location.lat}&lon=${Location.lon}&units=${userUnit}&APPID=${WeatherApiKey}`)
  .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const regionW = document.getElementById("Region").value;
      const modalTitle = document.getElementById("viewModalTitle");

      for (let i = 0; i < 8; i++) {
        const city = data.city.name;
        const dt = data.list[i].dt;
        const date = new Date(dt * 1000);
        const day = ('0' + date.getDate()).slice(-2);
        const month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][date.getMonth()];
        const year = date.getFullYear();
        const hour = ('0' + date.getHours()).slice(-2);
        const minute = ('0' + date.getMinutes()).slice(-2);
        const title = `Weather in ${city} on ${day} ${month} ${year} ${hour}:${minute}`;

        if (i === 0) {
          modalTitle.innerText = title;
        }

        
      time24 = data.list[0].dt;
      convert = new Date(time24 *1000).toISOString().slice(11,16);
      document.getElementById("Time1");
      Time1.innerText = `${convert}`;

      time24 = data.list[1].dt;
      convert = new Date(time24 *1000).toISOString().slice(11,16);
      document.getElementById("Time2");
      Time2.innerText = `${convert}`;
      

      time24 = data.list[2].dt;
      convert = new Date(time24 *1000).toISOString().slice(11,16);
      document.getElementById("Time3");
      Time3.innerText = `${convert}`;

      time24 = data.list[3].dt;
      convert = new Date(time24 *1000).toISOString().slice(11,16);
      document.getElementById("Time4");
      Time4.innerText = `${convert}`;

      time24 = data.list[4].dt;
      convert = new Date(time24 *1000).toISOString().slice(11,16);
      document.getElementById("Time5");
      Time5.innerText = `${convert}`;

      time24 = data.list[5].dt;
      convert = new Date(time24 *1000).toISOString().slice(11,16);
      document.getElementById("Time6");
      Time6.innerText = `${convert}`;

      time24 = data.list[6].dt;
      convert = new Date(time24 *1000).toISOString().slice(11,16);
      document.getElementById("Time7");
      Time7.innerText = `${convert}`;

      time24 = data.list[7].dt;
      convert = new Date(time24 *1000).toISOString().slice(11,16);
      document.getElementById("Time8");
      Time8.innerText = `${convert}`;
      
      summ24 = data.list[0].weather[0].icon;
      iconUrl24 = 'https://openweathermap.org/img/wn/' + summ24 + ".png";
      document.getElementById('Summ1').src = iconUrl24;

      summ24 = data.list[1].weather[0].icon;
      iconUrl24 = 'https://openweathermap.org/img/wn/' + summ24 + ".png";
      document.getElementById('Summ2').src = iconUrl24;

      summ24 = data.list[2].weather[0].icon;
      iconUrl24 = 'https://openweathermap.org/img/wn/' + summ24 + ".png";
      document.getElementById('Summ3').src = iconUrl24;

      summ24 = data.list[3].weather[0].icon;
      iconUrl24 = 'https://openweathermap.org/img/wn/' + summ24 + ".png";
      document.getElementById('Summ4').src = iconUrl24;

      summ24 = data.list[4].weather[0].icon;
      iconUrl24 = 'https://openweathermap.org/img/wn/' + summ24 + ".png";
      document.getElementById('Summ5').src = iconUrl24;

      summ24 = data.list[5].weather[0].icon;
      iconUrl24 = 'https://openweathermap.org/img/wn/' + summ24 + ".png";
      document.getElementById('Summ6').src = iconUrl24;

      summ24 = data.list[6].weather[0].icon;
      iconUrl24 = 'https://openweathermap.org/img/wn/' + summ24 + ".png";
      document.getElementById('Summ7').src = iconUrl24;

      summ24 = data.list[7].weather[0].icon;
      iconUrl24 = 'https://openweathermap.org/img/wn/' + summ24 + ".png";
      document.getElementById('Summ8').src = iconUrl24;

      Temp24 = data.list[0].main.temp;
      document.getElementById("Temp1");
      Temp1.innerText = `${Temp24} ${t}`;

      Temp24 = data.list[1].main.temp;
      document.getElementById("Temp2");
      Temp2.innerText = `${Temp24} ${t}`;

      Temp24 = data.list[2].main.temp;
      document.getElementById("Temp3");
      Temp3.innerText = `${Temp24} ${t}`;

      Temp24 = data.list[3].main.temp;
      document.getElementById("Temp4");
      Temp4.innerText = `${Temp24} ${t}`;

      Temp24 = data.list[4].main.temp;
      document.getElementById("Temp5");
      Temp5.innerText = `${Temp24} ${t}`;

      Temp24 = data.list[5].main.temp;
      document.getElementById("Temp6");
      Temp6.innerText = `${Temp24} ${t}`;

      Temp24 = data.list[6].main.temp;
      document.getElementById("Temp7");
      Temp7.innerText = `${Temp24} ${t}`;

      Temp24 = data.list[7].main.temp;
      document.getElementById("Temp8");
      Temp8.innerText = `${Temp24} ${t}`;

      Cc24 = data.list[0].clouds.all;
      document.getElementById("Cc1");
      Cc1.innerText = `${Cc24} %`;

      Cc24 = data.list[1].clouds.all;
      document.getElementById("Cc2");
      Cc2.innerText = `${Cc24} %`;

      Cc24 = data.list[2].clouds.all;
      document.getElementById("Cc3");
      Cc3.innerText = `${Cc24} %`;

      Cc24 = data.list[3].clouds.all;
      document.getElementById("Cc4");
      Cc4.innerText = `${Cc24} %`;

      Cc24 = data.list[4].clouds.all;
      document.getElementById("Cc5");
      Cc5.innerText = `${Cc24} %`;

      Cc24 = data.list[5].clouds.all;
      document.getElementById("Cc6");
      Cc6.innerText = `${Cc24} %`;

      Cc24 = data.list[6].clouds.all;
      document.getElementById("Cc7");
      Cc7.innerText = `${Cc24} %`;

      Cc24 = data.list[7].clouds.all;
      document.getElementById("Cc8");
      Cc8.innerText = `${Cc24} %`;
      }
      
    })
    .catch((error) => {
      console.error(error);
    });
  }