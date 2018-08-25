// Game: Cryptic Messages
// By: William Chang
// Date: 8/24/2018
//
// Description: The host enters in a word made up of 9 random letters.
// Gives a cryptic messages that gives a hint but doesn't reveal the word.
//


// Create randomized ID for client
function createID(){
	return '_' + Math.random().toString(36).substr(2, 9);
}


// Creates random letters for game
function letterGenerator(){
	const letters = "abcdefghijklmnopqrstuvwxyz"; //string of possible letters
	
	let randomLetters = []; //random letter array
	
	while(randomLetters.length < 9 ){ //add a random letter while array length less than 9
		randomLetters.push(letters[Math.floor(Math.random() * 25)]);
		
		if(randomLetters.length === 9){ // if array size = 9, then check to see if there's enough consonants & vowels
			let vowels = 0;
			let consonants = 0;
			randomLetters.forEach((letter)=>{
				switch(letter){
					case "a":
					case "e":
					case "i":
					case "o":
					case "u":
						vowels++;
					break;
					default:
						consonants++;
				}
			});
			if(vowels < 2 || consonants < 2){ // erase array if there are not enough vowels/consonants
				randomLetters = [];
			}
			else{
				return randomLetters; // return array if length === 9 and vowels/consonants > 2
			}
		}
	}
}


// Creates a new game in firebase
function createGame(playerID, letters){ 
	
	firebaseObj.ref().onDisconnect().remove(); // disconnect
	
	var promise = firebaseObj.ref().set({
		host : playerID,
		gameLetters : letters,
		gameState : "setup",
	});
	
	return promise;
}


// Creates a new player in firebase using unique ID
function createPlayer(ID){ 
	
	firebaseObj.ref("players/" + ID).onDisconnect().remove(); // disconnect
	
	var promise = firebaseObj.ref("players/" + ID).set({	
		hasRegistered: false,
	});
	
	return promise;
}


// Registers player once they enter their name
function registerPlayer(userName){
	
	var updates = {};
	updates["players/" + playerID + "/name"] = userName;
	updates["players/" + playerID + "/hasRegistered"] = true;
	
	var promise = firebaseObj.ref().update(updates);
	return promise;
}


//Adds host's word into fire base, validates word first
function addWord(word, gameLetters){
	
	let validEntry = true;
	
	const wordArr = word.toLowerCase().slice(); //Lowercases word and adds to new array
	let letterArr = gameLetters.slice(); // Converts game's letters to array
	
	for(let i = 0; i < wordArr.length; i++){        // Validates word by removing each letter
													// of user's word from the game's letters
		const index = letterArr.indexOf(wordArr[i]);
		if(index < 0){
			validEntry = false;
			break;
		}
		else{
			letterArr.splice(index, 1);
		}
	}
	
	if(wordArr === ""){
		alert("You have to enter a word!");
	}
	
	else if(validEntry){ // submits word if valid and returns promise
		var updates = {};
		updates.correctAnswer = word.toLowerCase();
		return firebaseObj.ref().update(updates);
	}
	else{
		alert(word + " is not valid!");
	}
}


// Adds cryptic message that describes word to firebase
function addDesc(desc){
		
	if(desc !== ""){
		//console.log("Here");
		firebaseObj.ref().update({answerDescription: desc});
		
	}
	else{
		alert("You have to cryptically describe your word!");
	}
}


// Shows countdown timer
function showTime(){ 
	
	const timeRef = document.getElementById("timer");
	const endTime = new Date().getTime() + 61000;
	
	// setInterval() shows time every second until time < 0
	let interval = setInterval(()=>{ 
		const now = new Date().getTime();
		const timeLeft = endTime - now;
		
		// Change timer colors depending on remaining time
		if(timeLeft > 30000){
			timeRef.style.color = "LawnGreen";
		}
		else if(timeLeft > 10000){
			timeRef.style.color = "yellow";
		}
		else{
			timeRef.style.color = "red";
		}
		
		timeRef.innerHTML = (Math.round(timeLeft/1000));
		
		if(now >= endTime){
			clearInterval(interval);
		}
	}, 1000);
}

// Starts countdown and changes game state once time runs out.
function checkTime(){
	
	const endTime = new Date().getTime() + 61000;
	
	let interval = setInterval(()=>{
		const now = new Date().getTime();
		if(now >= endTime){
			clearInterval(interval);
			firebaseObj.ref().update({gameState : "finished"});
		}
	}, 1000);
}


// Creates setup screen for players
function renderSetup(){
	
	
	renderDiv.innerHTML =
	`<h1>
		Enter your name:
	</h1>
	
	<form onsubmit = "return false">
		<input type="text" class="textbox" id="name_box" required>
		<input type="submit" class="button" id="btn_submit_user" value="TRANSMIT">
	</form>
	
	<p>
		Invite some of your pals by sharing this link: ${window.location.href}
	</p>
	
	<div id="wait_msg">
		<h2>Waiting for host to submit secret word</h2>
	</div>`;
	
}

// Displays word and message input to host
function renderHostWelcome(gameLetters, userName){
	
	renderDiv.innerHTML =
		`<h1>Hello ${userName}!</h1>
		
		<p>Here are 9 random letters</p>	
		<div id="game_letters" class="random_letters"></div>
		<p>
			Make a word using any of these letters. You can only use each letter once.
			Others will try to guess this word.
		</p>
		
		<form onsubmit = "return false">
			
			<p>Your secret word:</p>
			<input id="word" class="textbox" type="text" required>
			<p>Write a cryptic message about your word:</p>
			<input id="description" class="textbox" type="text" required>
			<input id="word_desc_btn" type="submit" value="START TIMER">
		</form>`;
		
	document.getElementById("game_letters").innerHTML = gameLetters.join(" ");
		
}

// Displays timer, text input, and user responses once game has STARTED
function renderGameView(snap){
	
	const word = snap.child("correctAnswer").val();
	const desc = snap.child("answerDescription").val();
	const letters = Object.values(snap.child("gameLetters").val());
	const host = snap.child("host").val();
	const isRegistered = snap.child("players/" + playerID + "/hasRegistered").val();
	
	if(host === playerID && isRegistered){ //What the host sees
		renderDiv.innerHTML =
		`<div class="time_div">
			<p>Time remaining: </p>
			<div id="timer"></div>
		</div>
		
		<h1>Your word is:</h1>
		<h2 id="host_word">${word}</h2>
		<h1>Cryptic description:</h1>
		<h2><i>${desc}</i></h2>
		
		<h1>See everyone's failures below:</h1>
		<div id="guesses"></div>`;
		
		showTime();  // Shows timer.
		checkTime(); // Changes game state once timer is finished.
	}
	
	else if(isRegistered){ //What normal players will see
		renderDiv.innerHTML =
		`<div class="time_div">
			<p>Time remaining: </p>
			<div id="timer"></div>
		</div>
		
		<h2>Can you guess the word?</h2>
		<p>Word is made up of these 9 letters</p>
		<p class="random_letters">${letters.join(" ")}</p>
		
		<h2 id="host_desc">Hint: <i>"${desc}"</i></h2>
		
		<form onsubmit="return false">
			<input id="answer_input" class="textbox" type="text">
			<input id="answer_btn" class="button" type="submit" value="Try">
		</form>
		
		<h2>Everyone's incorrect guesses below:</h2>
		<div id="guesses"></div>`;
		
		showTime();  // Shows timer.
	}
	
	
	else{                           // Unregistered players will be locked out
		renderDiv.innerHTML = 
		`<h1>Game in session...</h1>
		<h2>Wait around a bit for the next game...</h2>`;
	}
	
	
	
}


//Displays ending screen
function renderEnd(snap){
	
	const isRegistered = snap.child("players/" + playerID + "/hasRegistered").val();
	
	const winnerID = snap.child("winnerID").val();
	const hostID = snap.child("host").val();
	
	const word = snap.child("correctAnswer").val();
	const desc = snap.child("answerDescription").val();
	
	const hostName = snap.child("players/" + hostID + "/name").val();
	
	if(isRegistered){
		if(winnerID !== null){  //if players successfully guess word
			const gameWinner = snap.child("players/" + winnerID + "/name").val();
			
			renderDiv.innerHTML =
			`<h1>${gameWinner} has guessed the word!!!</h1>
			<h2>The word is ${word}: <i>"${desc}"</i></h2>
			<h1>${hostName}'s secret word was discovered!</h1>
			<button id="reset" class="button">Start Over?</button>`;
			
			
		}
		
		else{  // if no one guesses the word
			renderDiv.innerHTML =
			`<h1>No one guessed the word!!!</h1>
			<h2>The word is ${word}: <i>"${desc}"</i></h2>
			<h1>${hostName} was able to safeguard world secrets!</h1>
			<button id="reset" class="button">Start Over?</button>`;
		}
	}
	else{ // unregistered players are locked out
		renderDiv.innerHTML = 
		`<h1>Game in session...</h1>
		<h2>Wait around a bit for the next game...</h2>`;
	}
	
}


//------------------------------------------------------------------------------------------------

const playerID = createID();             // Creates random ID for client
const letters = letterGenerator();       // 9 random game letters
const firebaseObj = firebase.database(); // firebase object

const renderDiv = document.getElementById("render_div");
const playersDiv = document.getElementById("render_players_div");

// Tracks changes in game state and adds dynamic HTML accordingly
firebaseObj.ref("gameState").on("value", snap => { // Game SETUP: Things are being set up by the host
	
	if(snap.val() === null){ //Creates a game if nothing is in firebase

		createGame(playerID, letters);		
	}
	
	//Setting up game and players
	else if(snap.val() === "setup"){
		
		createPlayer(playerID);
		renderSetup();
	}
	
	// GAME has started
	else if(snap.val() === "active"){ // timer countdown begins
		
		firebaseObj.ref().once("value")
		.then(snap => {renderGameView(snap);});
	}
	
	// GAME has finished
	else if(snap.val() === "finished"){

		firebaseObj.ref().once("value")
		.then(snap => {renderEnd(snap);});
	}
	
	// GAME has been reset
	else if(snap.val() === "reset"){
		location.reload();
		//console.log(snap.val());
	}
	
});


// Display all registered players at bottom of screen
firebaseObj.ref("players").on("value", snap => {
	
	playersDiv.innerHTML = "";
	
	snap.forEach(player => {
	
		const playerName = player.child("name").val();
	
		if(playerName !== null){
			let node = document.createElement("div");
			const nameText = document.createTextNode(playerName.toUpperCase());
			node.appendChild(nameText);
			playersDiv.appendChild(node);
		}
		
	});
	
	if(playersDiv.innerHTML === ""){
		playersDiv.innerHTML = "<p><i>No one's here yet...</i></p>";
	}

});


// Show failed guesses
firebaseObj.ref("wrongAnswers").on("child_added", (snap) => {
	const guessDiv = document.getElementById("guesses");
	const guess = snap.val();
	let node = document.createElement("p");
	const nodeText = document.createTextNode(guess);
	node.appendChild(nodeText);
	guessDiv.appendChild(node);
});


//Event Listeners
renderDiv.addEventListener("click", (e)=>{
		
	// Add player's name and register them
	if(e.target && e.target.id === "btn_submit_user"){
		
		const userName = document.getElementById("name_box").value;
			
		registerPlayer(userName)
		.then(()=>{firebaseObj.ref("host").once("value")
			  
		.then(snap => { //Check if user is the game's host
			const gameHost = snap.val();
			if(gameHost === playerID){
				renderHostWelcome(letters, userName);			
			}
			else{
				const waitMsg = document.getElementById("wait_msg");
				waitMsg.style.display = "block";
			}
		});	
		});
		
	}
	
	// Add words and description
	if(e.target && e.target.id === "word_desc_btn"){
		
		const word = document.getElementById("word").value;
		const desc = document.getElementById("description").value;
		
		addWord(word, letters)
		.then(addDesc(desc))
		.then(()=>{
			firebaseObj.ref().update({gameState: "active"});
		});
	}
	
	// Players guess the word
	if(e.target && e.target.id === "answer_btn"){
		
		const guessBox = document.getElementById("answer_input");
		const guess = guessBox.value.toLowerCase();
		
		firebaseObj.ref().once("value")
		.then(snap => {
			
			const answer = snap.child("correctAnswer").val();
			
			if(answer === guess){ // Correct guess ends the game
				let updates = {};
				updates.winnerID = snap.child("players/" + playerID).key;
				updates.gameState = "finished";
				//console.log(updates.winner);
				firebaseObj.ref().update(updates);
			}
			else{ // Incorrect guesses get added to firebase
				firebaseObj.ref("wrongAnswers").push(guess);
			}
			guessBox.value = "";
		});
	}
	
	// If anyone resets the game at the end
	if(e.target && e.target.id === "reset"){
		firebaseObj.ref().update({gameState : "reset"});
	}
}					   
);









