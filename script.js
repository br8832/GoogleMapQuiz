// load the map
var theScore = document.querySelectorAll(".container")[1].querySelector("h1");

//refresh to play again
(function(){var script = document.createElement('script');
script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyACBjIVP400on84GYJSnji0W0sRzbldHkg&libraries=geometry&callback=initMap';
script.defer = true;
script.async = true;
document.head.appendChild(script);
//see if you beat the currentHighScore
if(sessionStorage.getItem('highScore'))
  {theScore.innerHTML = "HighScore: " + sessionStorage.getItem('highScore');}
          }())

//declare the variables
var G3;
var EH;
var SN;
var SC;
var CH;
var start;
var stopSetInterval;
var map;

//save the DOM elements 
var results = document.querySelector("#results");
var theTimer = document.querySelector(".timer");

var questionsList = [
          document.querySelector("#Location1"),
          document.querySelector("#Location2"),
          document.querySelector("#Location3"),
          document.querySelector("#Location4"),
          document.querySelector("#Location5")
        ];

//building lists that will be displayed in the quiz, chosen according to the center
var buildingNames = ['Sierra Center', 'G3 Parking Lot', 'Eucalyptus Hall', 'Santa Susana Hall', 'Chaparral Hall'];        
var correct = 0;
var finish = false;
var counter = 0;

//boundary lists for the buildings
//by far the most time consuming, needed to the help of the developer tools.
var buildingList = [
  //my assigned building Sierra Center
  SC = [
   { lat: 34.23905414125862, lng: -118.53101292377842 },
   { lat: 34.23879050067669, lng: -118.53101839859666 },
   { lat: 34.23878276403903, lng: -118.53120226677218 },
   { lat: 34.23891586824201, lng: -118.5313859335596 },
   { lat: 34.239057509348065, lng: -118.53138829259122 },
   { lat: 34.23905414125862, lng: -118.53101292377842 },  
],
  G3 = [
   { lat:34.23894099039943, lng: -118.52470512259919 },
   { lat:34.237378508003, lng: -118.52467877196648 },
   { lat:34.23737454461203, lng: -118.52565344331046 },    
   { lat:34.23743962529881, lng: -118.52568869769193 },
   { lat:34.23887596094998, lng: -118.52570585779843 },
   { lat:34.238929178041595, lng: -118.52563075594601 },
   { lat:34.23894099039943, lng: -118.52470512259919 }
  ],
  EH = [
    { lat:34.238741498536214, lng: -118.52874038931314 },
    { lat:34.238741498536214, lng: -118.52766015731676 },
    { lat:34.23855331749921, lng: -118.52766015731676 },
    { lat:34.23855331749921, lng: -118.52876993013541 },
    { lat:34.238741498536214, lng:  -118.52876993013541 },
  ],
  SN = [
     { lat:34.2378464795698, lng: -118.52938844259414 },
     { lat:34.237852023086205, lng: -118.52916850145492 },
     { lat:34.23737749676063, lng: -118.52916045482787 },
     { lat:34.23737749676063, lng: -118.52938844259414 },
     { lat:34.23782652290773, lng: -118.5293803959671 },
  ],  
  CH = [
    { lat:34.23855440972421, lng: -118.52723372486925 },
    { lat:34.23854332278355, lng: -118.52672276405191 },
    { lat:34.237891408105384, lng: -118.52671203521585 },
    { lat:34.2378825384831, lng: -118.52693465856409 },
    { lat:34.237942408415265, lng: -118.52707681564188 },
    { lat:34.23824395657951, lng: -118.5272253632873 },
    { lat:34.23853665236438, lng: -118.52721999886927 }
  ]
]
// the timer from the Typing Test, more details of how it works are in there
function timer() 
{ 
  var now = new Date().getTime(); 
  var t = now - start.getTime();
  var mins = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60));
  var secs = Math.floor((t % (1000 * 60)) / 1000);
  var hundreths =  Math.floor((t % 1000)/10);
  theTimer.innerHTML = ("0"+mins).slice("-2")+":"+("0"+secs).slice("-2")+":"+("0"+hundreths).slice("-2");
}
//change timer format to seconds
function timerConvert(time)
{
  let newT = time.split(":");
  return parseInt(newT[0] * 60, 10) + parseInt(newT[1], 10) + parseFloat(newT[2] / 100);
}
//change time in seconds to our Timer format
function convertTime(time)
{
  let timeInMilliSeconds = time * 1000;
  var hours = Math.floor((timeInMilliSeconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var mins = Math.floor((timeInMilliSeconds % (1000 * 60 * 60)) / (1000 * 60));
  var secs = Math.floor((timeInMilliSeconds % (1000 * 60)) / 1000);
  var hundreths =  Math.floor((timeInMilliSeconds % 1000)/10);
  return (hours==0) ? ("0"+mins).slice("-2")+":"+("0"+secs).slice("-2")+":"+("0"+hundreths).slice("-2") : ("0"+hours).slice("-2")+":"+("0"+mins).slice("-2")+":"+("0"+secs).slice("-2")+"."+("0"+hundreths).slice("-2")
}
//adjust time to account for errors
function adjustedTime()
{
  let completed = timerConvert(theTimer.innerHTML);
  // each mistake costs 10 seconds to get wrong
  completed += (5 - correct)*10;
  return convertTime(completed);
}
//create the map
window.initMap = function() {
  //statically define the center of the map
            let longLat = { lat: 34.23855, lng: -118.5278533 }; //google search and using the developer tools
            map = new google.maps.Map(document.getElementById('map'), {
                center: longLat,
                zoom: 17,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                //disable a lot of the zooming and panning options
                disableDoubleClickZoom: true,
                disableDefaultUI: true,
                zoomControl: false,
                gestureHandling: "none",
                scrollwheel: false,
                styles: [
                    //disable the labels
                    { "elementType": "labels", "stylers": [{ "visibility": "off" }] }]
        });    
      }

function Game()
{
  //display the first question
  questionsList[counter].querySelector("p").innerHTML = buildingNames[counter];
  questionsList[counter].style.display = "block";  
 // for some reason you need to use addListener and not the usual addEventListener
  map.addListener('dblclick', function (event){
     //start timer once first double click
  if(!stopSetInterval && counter < 4){
    start = new Date()
    stopSetInterval = setInterval(timer, 10);
  }
  if(!finish){
      
    //get the current boundary
    var current = new google.maps.Polygon({
      paths: buildingList[counter]
    });
    // color change signals to the user, along with the rectangle, if they were right or wrong
    //if selected point is correct show green rectangle
    //https://developers.google.com/maps/documentation/javascript/examples/poly-containsLocation for having a method to check if a point is in a polygon
    if(google.maps.geometry.poly.containsLocation(event.latLng, current)){
      var polygon = new google.maps.Polygon({
        strokeColor: '#05741F',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#05741F',
        fillOpacity: 0.35,
        map: map,
        paths: buildingList[counter]
      });
      //for replayability, don't show for too long
      setTimeout(() => polygon.setOptions({visible: false}), 1500);
      //show that the questions was correct
      questionsList[counter].querySelector("p").style.backgroundColor = "#05741F";
      correct++;
    }
    //if incorrect then show red polygon
    else{
      var polygon = new google.maps.Polygon({
        strokeColor: '#E30B0B',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#E30B0B',
        fillOpacity: 0.35,
        map: map,
        paths: buildingList[counter]        
      });
      //same deal as the correct version; don't give away too much
       setTimeout(() => polygon.setOptions({visible: false}), 1500);
      //show that the question was wrong
      questionsList[counter].querySelector("p").style.backgroundColor = "#E30B0B";
    }
    
          //next question
          if(counter < 4){
          counter++;
          questionsList[counter].querySelector("p").innerHTML = buildingNames[counter];
          questionsList[counter].style.display = "block";  
          }
          //game is over
          else{
            finish = true;
            //display the final total results
            results.querySelector("p").innerHTML = "Correct: " + correct + " Incorrect: " + (5-correct);
            results.style.display = "block";
            //play an animation to signal the end
            results.style.animation = "result 4s";
            //stop the timer and display the adjusted time
            clearInterval(stopSetInterval);
            theTimer.style.display = "none";
            document.querySelectorAll(".timer")[1].style.display = "inherit";
            let finalTime = adjustedTime();
            document.querySelectorAll(".timer")[1].querySelector("p").innerHTML = "Adjusted time: " + finalTime;
            if(timerConvert(finalTime) < timerConvert(theScore.innerHTML.slice(12)))//get the timer portion
              theScore.innerHTML = "HighScore: " + finalTime;
              //remember this time. Session Storage helps with that
              //https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage
              sessionStorage.setItem('highScore', finalTime);
          }
          //this helped to establish the boundaries
          console.log("{ lat:" + event.latLng.lat() + ", lng: " + event.latLng.lng() + " },");
        }
      });
}
 