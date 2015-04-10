
var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");
ctx.font = "90px Tahoma";


var imgBackground = new Image();
imgBackground.src = "./images/bear.jpg"
var imgPlayerRight = new Image();
imgPlayerRight.src = "./images/brotherright.png"
var imgPlayerLeft = new Image();
imgPlayerLeft.src = "./images/brotherleft.png"
var imgBear = new Image();
imgBear.src = "./images/bear-sleeping.png"


var fps = 50;
var roomWidth=220;
var roomDepth=95;
var playerWidth=100;
var playerHeight=200;
var halfWidth = canvas.width/2;
var halfHeight= canvas.height/4;

var keysDown = {};
var listening = false;
var gameStarted = false;
var timer= 45000;
var gameOver = false;
var win = false;
var gameOverReason = "This gets replaced with the text shown to the player at the end of the game";

var player = {
    x:-roomWidth/2,
    y:0,
    direction:"right",
    animation:"still",

}

function fullScreen(){
    // go full-screen
    if (canvas.requestFullscreen) {
        canvas.requestFullscreen();
    } else if (canvas.webkitRequestFullscreen) {
        canvas.webkitRequestFullscreen();
    } else if (canvas.mozRequestFullScreen) {
        canvas.mozRequestFullScreen();
    } else if (canvas.msRequestFullscreen) {
        canvas.msRequestFullscreen();
    }
}

function startGame(){
    setInterval(gameloop,1000/fps);
}


function gameloop(){
    drawGame();
    handleKeys();
    checkGame();
    if (gameStarted){
        timer -= 1000/fps;        
    }
}

function checkGame(){
    //check for end of game conditions conditions
    if (gameStarted && !gameOver){
        // you won!
        if (timer<0){
            setGameOver(true,"Good job not waking up the bear!");
        }
        //you touched the bear...
        if (player.x>-50 && player.y>-20
            && player.x <50 && player.y < 10){
            setGameOver(false,"Why did you touch the bear?");
        }
    }
    //check for gameover screen expiration
    else if (gameOver && timer<0){
        resetGame();
    }
}

function setGameOver(result,reason){
    gameOver=true;
    win = result;
    gameOverReason=reason;
    timer=10000;
    listening = false;
}


//graphics 
function drawGame(){
    drawBackground();
    drawForeground();
    if(!gameStarted){
        drawDirections();
    }
    if(gameOver){
        drawGameOver();
    }
}

function drawBackground(){
    ctx.drawImage(imgBackground,0,0);
    if (!gameOver && gameStarted){
        drawTimer();
    }
}

//calculates the players position, then draws all of the foreground.
//you have to calculate players y pos first in order to make sure the 
//ordering of elements is correct.
function drawForeground(){
    var drawnY = player.y/(roomDepth/2)*halfHeight+halfHeight*3;
    var drawnX = player.x/(roomWidth/2)*
        (halfWidth-playerWidth/2)*(.2*(player.y+roomDepth/2)/roomDepth+.8)+halfWidth;

    if(player.y>0){
        drawBear();
    }
    if (player["direction"]==="right"){
        ctx.drawImage(imgPlayerRight,drawnX-playerWidth/2,
            drawnY-playerHeight,playerWidth,playerHeight);
    }
    else{
        ctx.drawImage(imgPlayerLeft,drawnX-playerWidth/2,
            drawnY-playerHeight,playerWidth,playerHeight);
    }
    if(player.y<=0){
        drawBear();
    }
}

function drawTimer(){
    ctx.fillText(Math.floor(timer/1000) +" seconds left!", 1050,120);
}

function drawDirections(){
    ctx.fillStyle="white";
    ctx.fillRect(200,200,1520,680);
    ctx.fillStyle="black";
    ctx.fillText("Don't wake up the bear for 45 seconds!",300,300,1620,780);

    ctx.fillText("Hit P to begin",300,600,1620,780);
}

function drawGameOver(){
    ctx.fillStyle="white";
    ctx.fillRect(200,200,1520,680);
    ctx.fillStyle="black";
    if(win){
        ctx.fillText("You Won!",300,300);
    }
    else{
        ctx.fillText("You woke up the bear...",300,300);
    }
    ctx.fillText(gameOverReason,300,600,1620,780);

    ctx.fillText("hit O to reset",300,800,1620,780);

}

function drawBear(){
    ctx.drawImage(imgBear,halfWidth-(imgBear.width/2),halfHeight*3-(imgBear.height));
}

//useractions
function handleKeys(){
    if (keysDown[80]&&gameStarted==false){
        listening=true;
        gameStarted=true;
    }
    else if (keysDown[79]&&gameOver==true){
        resetGame();
    }
    if (!listening){
        return;
    }
    //action moves
    if (keysDown[72]){
        return;
    }
    else if (keysDown[74]){
        return;
    }
    else if (keysDown[75]){
        return;
    }
    else if (keysDown[76]){
        return;
    }
    // 38 is up, 39 is right, 40 is down, 37 is left
    else{
        if (keysDown[38]){
            if (player.y > -(roomDepth/2)){
                player.y-=1;
            }
        }
        if (keysDown[39]){
            player["direction"]="right";
            if (player.x < roomWidth/2){
                player.x+=1;
            }
        }
        if (keysDown[40]){
            if (player.y < (roomDepth/2)){
                player.y+=1;
            }
        }
        if (keysDown[37]){
            player["direction"]="not right";
            if (player.x > -roomWidth/2){
                player.x-=1;
            }
        }
    } 
}


function resetGame(){
    listening = false;
    gameStarted = false;
    timer= 45000;
    gameOver = false;
    win = false;
    gameOverReason = "This gets replaced with the text shown to the player at the end of the game";

    player = {
        x:-roomWidth/2,
        y:0,
        direction:"right",
        animation:"still",
    }

}



// listeners
addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true;
    console.log(keysDown);
}, false);

addEventListener("keyup", function (e) {
    delete keysDown[e.keyCode];
}, false);

document.getElementById("fs_button").addEventListener("click",fullScreen);
window.onload = startGame();
