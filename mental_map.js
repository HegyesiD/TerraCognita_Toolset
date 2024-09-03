/*

line 148  
  const pos_base = { lat: 47.530704, lng: 19.088087 }; //This is the latitude and longitude of your central point.

line 164
  mapId: "561c5e15655f332c",    //This is the ID of your custom map style - this is the style used in the pilot project.

line 183 
  //This sets the rotation, 15 and -15 show the degree and direction.
  [L('rotate_left'),  "rotate_left",   15, google.maps.ControlPosition.LEFT_CENTER ],
  [L('rotate_right'), "rotate_right", -15, google.maps.ControlPosition.RIGHT_CENTER ],

line 317
  const ActUrl = "https:// ... here goes your server's name ... /place_insert_db.php"

*/
let map;

const aPlaces = []; //This is an array which contains the data for each object which are logged with the markers.
let iPlacesNum = 0;
let oStartTime;

const langs = {
  'base_name' : {
    'hu': 'Iskola',
    'en': 'School',
  },
  'button_to_north' : {
    'hu': 'Északra tájolás',
    'en': 'North',
  },
  'rotate_left' : {
    'hu': 'Balra forgatás',
    'en': 'Rotate left',
  },
  'rotate_right' : {
    'hu': 'Jobbra forgatás',
    'en': 'Rotate right',
  },
  'to_base' : {
    'hu': 'Iskolához',
    'en': 'To School',
  },
  'button_delete' : {
    'hu': 'Törlés',
    'en': 'Delete',
  },
  'placeholder_text' : {
    'hu': 'Itt jelennek majd meg a megjelölt helyek.  ',
    'en': 'Your places will be listed here.',
  },
  'button_send' : {
    'hu': 'Kész vagyok!',
    'en': 'I am finished!',
  },
  'store_in_db_success' : {
    'hu': 'A válasz tárolása sikeres!',
    'en': 'Success',
  },
  'store_in_db_fail' : {
    'hu': 'A válasz tárolása sikertelen!',
    'en': 'Fail',
  },
  'name_it_all' : {
    'hu': 'Kérlek minden helyet nevezz meg!<br>Ez után tudjuk majd tárolni a válaszodat.',
    'en': 'Please, give name(s) for all place(s)!',
  },

}
const lng = 'en';
// const lng = 'hu';
function L(sText) { return langs[sText][lng] }; //This function returns the elements of the platform in the chosen language.         e.g. langs['name_it_all']['en']


function funcButtons(ev) {
  
  // This is the delete button's code,
  if (ev.target.nodeName === 'BUTTON' ) { 
    const actPlaceId = ev.target.closest('tr').dataset.placeid;
    const aPlacesIndex = aPlaces.findIndex(x => x.placeid  === Number(actPlaceId) );
    
    aPlaces[aPlacesIndex].marker.setMap(null);
    aPlaces[aPlacesIndex].status = 0;

    ev.target.closest('tr').remove();
    
    iPlacesNum--;
    if ( iPlacesNum == 0 ) {
      let send_row = document.getElementById('info_table_send_row');
      if ( send_row ) send_row.remove();
      info_table_placeholder(info_table);
    }
  }
}

const addRow = function(tableObj, dataID, dataText) {
  
  const html_button = document.createElement("button");
  html_button.className = "btn btn-outline-danger funcDelete";
  html_button.innerHTML = L('button_delete');
  
  let placeholder_row = document.getElementById('info_table_placeholder_row');
  if ( placeholder_row ) placeholder_row.remove();

  let send_row = document.getElementById('info_table_send_row');
  if ( ! send_row ) {
    tableObj.tFoot.insertAdjacentHTML("afterbegin", info_table_send_html);
    initForm();
  }


  // Insert a row at the end of the table
  let newRow = tableObj.tBodies[0].insertRow(-1);
  newRow.setAttribute("data-placeid", dataID);
  
  // Insert a cell in the beginning of the row
  let newCell1 = newRow.insertCell(-1);

  // Append a text node to the cell
  let newText1 = document.createTextNode(dataID + ".");
  newCell1.appendChild(newText1);    

  let newCell2 = newRow.insertCell(-1);
  newCell2.setAttribute("width", "90%");
  let newInput = document.createElement("INPUT");
  newInput.setAttribute("type", "text");
  newInput.className = "form-control";
  newInput.setAttribute("name", "p_"+dataID); 
  newInput.setAttribute("id", "p_"+dataID); 
  newInput.required = true;

  newCell2.appendChild(newInput);
  newInput.focus();
  let newCell4 = newRow.insertCell(-1);
  var html_button_clone = html_button.cloneNode(true)
  newCell4.appendChild( html_button_clone );
  
  iPlacesNum++;
}

async function initMap() {

  // Request needed libraries.
  const { Map, InfoWindow } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
  
  const pos_base = { lat: 47.530704, lng: 19.088087 }; //This is the latitude and longitude of your central point.
  // Orchidea Magyar–Angol Két Tanítási Nyelvű Gimnázium 47.530704 19.088087 - this is the central point used in the pilot project.

  const svg = {
    rotate_left : '<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="512" height="512"><path d="M12,0c-2.978,0-5.821,1.111-8,3.057V0H2V5c0,1.103,.897,2,2,2h5v-2H4.86c1.867-1.901,4.437-3,7.14-3,5.514,0,10,4.486,10,10s-4.486,10-10,10S2,17.514,2,12H0c0,6.617,5.383,12,12,12s12-5.383,12-12S18.617,0,12,0Z"/></svg>',
    rotate_right : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="512" height="512"><g id="_01_align_center" data-name="01 align center"><path d="M22,12a10.034,10.034,0,1,1-2.878-7H15V7h5.143A1.859,1.859,0,0,0,22,5.143V0H20V3.078A11.985,11.985,0,1,0,24,12Z"/></g></svg>',
    to_north : '<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="512" height="512"><path d="M12,0A12,12,0,1,0,24,12,12.013,12.013,0,0,0,12,0Zm0,22A10,10,0,1,1,22,12,10.011,10.011,0,0,1,12,22ZM5,11.031a1.945,1.945,0,0,0,1.354,1.9l3.379,1.342,1.349,3.34A1.982,1.982,0,0,0,12.986,19H13a1.989,1.989,0,0,0,1.922-1.478L17.9,6.1,6.461,9.113A1.982,1.982,0,0,0,5,11.031ZM15.1,8.9,12.986,17l-1.719-4.271L7.093,11.071l-.108-.028Z"/></svg>',
    to_base : '<svg id="Layer_1" height="512" viewBox="0 0 24 24" width="512" xmlns="http://www.w3.org/2000/svg" data-name="Layer 1"><path d="m21 6h-6.586l-1.159-1.159 3.745-2.341-4-2.5h-2v4.586l-1.414 1.414h-6.586a3 3 0 0 0 -3 3v15h24v-15a3 3 0 0 0 -3-3zm0 2a1 1 0 0 1 1 1v1h-3.586l-2-2zm-18 0h4.586l-2 2h-3.586v-1a1 1 0 0 1 1-1zm10 14h-2v-3a1 1 0 0 1 2 0zm2 0v-3a3 3 0 0 0 -6 0v3h-7v-10h4.414l5.586-5.586 5.586 5.586h4.414v10zm-11-8h3v2h-3zm0 4h3v2h-3zm13-4h3v2h-3zm0 4h3v2h-3zm-3-6a2 2 0 1 1 -2-2 2 2 0 0 1 2 2z"/></svg>',
  };

  
  // The map, centered at pos_base 
  map = new Map(document.getElementById("map"), {
    zoom: 14,
    center: pos_base ,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapId: "561c5e15655f332c",    //This is the ID of your custom map style - this is the style used in the pilot project.
    heading: 0,
    
    disableDefaultUI: true,
    keyboardShortcuts: false,
    
    disableDoubleClickZoom: true,
  });
  

  // The marker positioned at pos_base.
  const marker = new AdvancedMarkerElement({
    map: map,
    position:pos_base ,
    title: L('base_name'),
  });
  
  
  const buttons = [
    [L('rotate_left'),  "rotate_left",   15, google.maps.ControlPosition.LEFT_CENTER ],
    [L('rotate_right'), "rotate_right", -15, google.maps.ControlPosition.RIGHT_CENTER ],
    [L('button_to_north'), "to_north",       0, google.maps.ControlPosition.TOP_CENTER ],
    [L('to_base'),       "to_base",        0, google.maps.ControlPosition.BOTTOM_CENTER ],
  ];

  buttons.forEach(([text, mode, amount, position]) => {
    const controlDiv = document.createElement("div");
    const controlUI = document.createElement("button");
    const htmlIcon = '<i class="icon ' + mode + '"></i>';
    
    controlUI.classList.add("ui-button");
    controlUI.innerText = `${text}` ;
    controlUI.addEventListener("click", () => {
      adjustMap(mode, amount);
    });

    controlDiv.appendChild(controlUI);
    controlUI.insertAdjacentHTML("afterbegin", svg[mode]);
   
  
    map.controls[position].push(controlDiv);
  });

  const adjustMap = function (mode, amount) {
    switch (mode) {
      case "to_north":
        map.setHeading(0);
        break;
      case "rotate_left" :
      case "rotate_right":
        map.setHeading(map.getHeading() + amount);
        break;
      case "to_base":
        map.setCenter( pos_base );
        map.setHeading(0);
        map.setZoom(14);
        break;
      default:
        break;
    }
  };  
  
 
  google.maps.event.addListener(map, 'dblclick', function(event) {
    const markerNum = aPlaces.length +1;
    
    const pin = new PinElement({
      scale: 1.0,
      background: "#FBBC04",
      borderColor: "#137333",
      glyphColor: "black",
      glyph: `${markerNum}`,
    });

    const markerLabel = markerNum + ". " + " " + JSON.stringify(event.latLng.toJSON(), null, 2);
    const m = new AdvancedMarkerElement({
      map: map,
      position: event.latLng,
      title: markerLabel,
      gmpDraggable: true,
      content: pin.element,
      gmpClickable: true,
    });
    
    aPlaces.push({ placeid: markerNum, lat: event.latLng.lat(), lng: event.latLng.lng(), marker: m, status: 1 });
    
    addRow(info_table, markerNum, markerLabel);
    
  });
  
}


/* 
info_table management
*/
const info_table = document.getElementById('info_table');

function info_table_placeholder(tableObj) {
  const info_table_placeholder_html = '<tr id="info_table_placeholder_row"><td>'+L('placeholder_text')+'</td></tr>';
  tableObj.insertAdjacentHTML("afterbegin", info_table_placeholder_html );    
}

const info_table_send_html = '<tr id="info_table_send_row"><td colspan="3"><div class="d-grid gap-2"><input type="submit" name="btnConfirm" id="btnConfirm" class="btn btn-outline-success" value="'+L('button_send')+'" ></div></td></tr>';


/* 
Forms management
*/
const initForm = function(){
  document.getElementById('btnConfirm').addEventListener('click', confirmForm);
  document.getElementById('btnConfirmedSubmit').addEventListener('click', sendForm);
}

const confirmForm = function(ev){
  ev.preventDefault(); 
  ev.stopPropagation();  //or the click will travel to the form and the form will submit
  
  let placesNamed = 0;
  let placesNotNamed = 0;

  const aPlaceInputs = document.getElementById('info_table').querySelectorAll("input[type=text]");
  for (let index = 0; index < aPlaceInputs.length; ++index) {
    if( aPlaceInputs[index].value === ""){
      placesNotNamed++;
    } else {
      placesNamed++;
    }
  }
  
  const modalConfirm = new bootstrap.Modal('#modalConfirmation', {
    keyboard: false
  })
  document.getElementById('placesAll').innerHTML = placesNamed + placesNotNamed;
  document.getElementById('placesNamed').innerHTML = placesNamed;

  if (placesNotNamed > 0) {
    document.getElementById('btnConfirmedSubmit').disabled = true;
  } else {
    document.getElementById('btnConfirmedSubmit').disabled = false;
  }

  modalConfirm.toggle();

  
}


const sendForm = function(ev){
  ev.preventDefault(); 
  ev.stopPropagation(); //or the click will travel to the form and the form will submit
  
  const oEndTime = new Date();
  const ActUrl = "https:// ... here goes your server's name ... /place_insert_db.php"
  
  let fails = validateForm();
  if(fails.length === 0){
  
    let h = new Headers();
    h.append('Accept', 'application/json'); //what we expect back

    let myForm = document.getElementById("placesForm");
    let fd = new FormData(myForm);

    fd.append('participantID', document.getElementById('inputUserId').value );
    fd.append('timeStart', oStartTime.toISOString().slice(0, 19).replace('T', ' ') );
    fd.append('timeEnd'  , oEndTime.toISOString().slice(0, 19).replace('T', ' ') );
    
    let iPlaceNum = 0;
    aPlaces.forEach( ( actMarker, actIndex )=>{
      if ( actMarker["status"] == 1 ) {
        iPlaceNum++;
        fd.append('marker_'+actMarker["placeid"]+'_num',  iPlaceNum);
        fd.append('marker_'+actMarker["placeid"]+'_lat',  actMarker["lat"]);
        fd.append('marker_'+actMarker["placeid"]+'_lng',  actMarker["lng"]);
      }
    });

    const aInputs = document.getElementById('info_table').querySelectorAll("input[type=text]");
    let aMarkerId;
    let sPlaceName;
    for (let index = 0; index < aInputs.length; ++index) {
      aMarkerId  = aInputs[index].name.split('_');
      sPlaceName = aInputs[index].value;
      fd.append('marker_'+aMarkerId[1]+'_name', sPlaceName);
    }
    
    let req = new Request(ActUrl, {
        method: 'POST',
        headers: h,
        mode: 'cors',
        body: fd
    });

    fetch(req)
        .then( (response)=>{
          if(response.ok){
            console.log("RESP OK: ", response);
            return response.json();
          }else{
              console.log("RESP not OK: ", response);
              throw new Error('Bad HTTP!')
          }
        })
        .then( (j) =>{
          console.log('SUCCESS (response.json()): ', j);
          new AvalynxAlert(L('store_in_db_success'), 'success', {position: 'top-right'});
        })
        .catch( (err) =>{
          console.log('ERROR:', err.message);
          new AvalynxAlert(L('store_in_db_fail'), 'warning', {position: 'top-right'});
        });    
    
  }else{
    new AvalynxAlert(L('name_it_all'), 'danger', {position: 'top-right'});
    fails.forEach(function(obj){
      let field = document.getElementById(obj.input);
    })
  }
}

const validateForm = function(ev){
  
  let failures = [];

  const aPlaceInputs = document.getElementById('info_table').querySelectorAll("input[type=text]");
  for (let index = 0; index < aPlaceInputs.length; ++index) {
    if( aPlaceInputs[index].value === ""){
      failures.push({input:aPlaceInputs[index].name, msg:'Required Field'})
    } else {
    }
  }
  return failures;
}


const alertPlaceholder = document.getElementById('liveAlertPlaceholder')
const appendAlert = (message, type) => {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = [
    `<div class="alert alert-${type} alert-dismissible" role="alert">`,
    `   <div>${message}</div>`,
    '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
    '</div>'
  ].join('')

  alertPlaceholder.append(wrapper)
}

class AvalynxAlert {
    constructor(message, type, options = {}) {
        this.message = message;
        this.type = type;
        this.options = {
            duration: options.duration || 5000,
            position: options.position || 'top-center',
            closeable: options.closeable || true,
            autoClose: options.autoClose || true,
            width: options.width || '400px',
            onClose: options.onClose || null,
            ...options
        };
        if (!['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'].includes(this.type)) {
            this.type = 'info';
        }
        if (!['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'].includes(this.options.position)) {
            this.options.position = 'top-center';
        }
        if (this.options.autoClose !== false && this.options.autoClose !== true) {
            this.options.autoClose = true;
        }
        if ((this.options.closeable !== false && this.options.closeable !== true) || (this.options.autoClose === true)) {
            this.options.closeable = true;
        }

        this.init();
    }

    ensureAlertContainer() {
        if (!document.getElementById('avalynx-alert-container-' + this.options.position)) {
            var container = document.createElement('div');
            container.id = 'avalynx-alert-container-' + this.options.position;
            container.style.width = '100%';
            container.style.maxWidth = this.options.width;
            container.style.zIndex = '1000';
            container.classList.add('container-fluid');

            if (this.options.position === 'top-left') {
                container.style.position = 'fixed';
                container.style.top = '10px';
                container.style.left = '0px';
            } else if (this.options.position === 'top-center') {
                container.style.position = 'fixed';
                container.style.top = '10px';
                container.style.left = '50%';
                container.style.transform = 'translateX(-50%)';
            } else if (this.options.position === 'top-right') {
                container.style.position = 'fixed';
                container.style.top = '10px';
                container.style.right = '0px';
            } else if (this.options.position === 'bottom-left') {
                container.style.position = 'fixed';
                container.style.bottom = '10px';
                container.style.left = '0px';
            } else if (this.options.position === 'bottom-center') {
                container.style.position = 'fixed';
                container.style.bottom = '10px';
                container.style.left = '50%';
                container.style.transform = 'translateX(-50%)';
            } else if (this.options.position === 'bottom-right') {
                container.style.position = 'fixed';
                container.style.bottom = '10px';
                container.style.right = '0px';
            }

            document.body.appendChild(container);
        }
    }

    init() {
        this.ensureAlertContainer();

        var alert = document.createElement('div');
        alert.className = `alert alert-${this.type}`;
        if (this.options.closeable) {
            alert.classList.add('alert-dismissible');
        }
        alert.classList.add('fade');
        alert.classList.add('show');
        alert.classList.add('p-0');
        alert.classList.add('overflow-hidden');
        alert.classList.add('avalynx-alert');
        alert.role = 'alert';
        alert.innerHTML = `<div class="alert-content">${this.message}`;
        if (this.options.closeable) {
            alert.innerHTML += `<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
        }
        alert.innerHTML += `</div>`;
        if (this.options.autoClose) {
            alert.innerHTML += `<div class="alert-timer" style="height: 5px; width: 0;"></div>`;
        }

        document.getElementById('avalynx-alert-container-' + this.options.position).appendChild(alert);

        if (this.options.autoClose) {
            var timerBar = alert.querySelector('.alert-timer');
            timerBar.style.transition = `width ${this.options.duration}ms linear`;

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    timerBar.style.width = '100%';
                });
            });

            setTimeout(() => {
                alert.classList.remove('show');
                setTimeout(() => {
                    alert.remove();
                    if (typeof this.options.onClose === 'function') {
                        this.options.onClose();
                    }
                }, 150);
            }, this.options.duration);
        }
    }
}


document.addEventListener('DOMContentLoaded', () => {

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  let uid = '';
  if ( urlParams.has('uid') ) {
    uid = urlParams.get('uid');
    const inpUID = document.getElementById('inputUserId');
    inpUID.value = uid;
    inpUID.readOnly = true;
    inpUID.disabled = true;
  }

  initMap();

  info_table_placeholder(info_table);
  info_table.addEventListener('click', funcButtons ); 
  oStartTime = new Date();




});
