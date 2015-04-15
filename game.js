
var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");

//images
var imgBackground = new Image();
imgBackground.src = "./images/background.png"
var imgOverlay = new Image();
imgOverlay.src = "./images/overlay.png";

//sprites
var spritePlayer = new Image();
spritePlayer.src = "./images/sprites/playersprite.png";
var spriteBear = new Image();
spriteBear.src = "./images/sprites/bearsprite.png";
var spriteObjects = new Image();
spriteObjects.src = "./images/sprites/objects.png";

//audio
var songLoop = new Audio();
songLoop.src = './sounds/songLoop.mp3';
var gameOverSound = new Audio();
gameOverSound.src = './sounds/wokeTheBear.mp3';
var winSound = new Audio();
winSound.src = './sounds/didntWakeTheBear.mp3';
var breakingGlass = new Audio();
breakingGlass.src = './sounds/breakingGlass.mp3';
var banjoSound =  new Audio();
banjoSound.src = './sounds/banjo.mp3';
var fireworksSound =  new Audio();
fireworksSound.src = './sounds/fireworks.mp3';
var chainsSound =  new Audio();
chainsSound.src = './sounds/chain.mp3';
var sunchipsSound = new Audio();
sunchipsSound.src = './sounds/sunchips.mp3';
var pokeSound = new Audio();
pokeSound.src = './sounds/poke.mp3';
var soundThatWokeUpTheBear = null;

var fps = 50;
var roomWidth=220;
var roomDepth=100;
var playerWidth=105;
var playerHeight=210;
var bearWidth=474;
var bearHeight=422;
var halfWidth = canvas.width/2;
var halfHeight= canvas.height/3;

var keysDown = {};
var listening = false;
var gameStarted = false;
var totaltime = 45000;
var timer= totaltime;
var gameOver = false;
var win = false;
var gameOverTime = -1;
var gameOverReason = "This gets replaced with the text shown to the player at the end of the game";

var player = {
    x:-roomWidth/2,
    y:0,
    direction:"right",
    animation:"still",
    near: "none",
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
    soundCheck();
}

function checkGame(){
    //check for end of game conditions conditions
    if (gameStarted && !gameOver){
        // you won!
        if (timer<0){
            soundThatWokeUpTheBear={"duration":0};
            setGameOver(true,"Good job not waking up the bear!");
        }
        //you touched the bear...
        if (player.x>-39 && player.y>-14
            && player.x <25 && player.y < 3){
            player.near = "bear";
            soundThatWokeUpTheBear = pokeSound;
            setGameOver(false,"Why did you touch the bear?");
        }
        //stepped on bottle
        else if (player.x>30 && player.y>-34
            && player.x <45 && player.y <-28){
            player.near = "bottle";
            soundThatWokeUpTheBear = breakingGlass;
            setGameOver(false,"You shouldn't have stepped on that glass!");
        }
        else if (player.y<-47&&player.x<-80){
            player.near = "banjo";
        }
        else if (player.x>-88 && player.y>19
            && player.x <-61 && player.y <33){
            player.near = "fireworks";
        }
        else if (player.x>80 
            && player.x <102 && player.y <-47){
            player.near = "chains";
        }
        else if (player.x>60 && player.y>32
            && player.x <87 && player.y <47){
            player.near = "sunchips";
        }
        else{
            player.near = "none";
        }
    }
    //check for gameover screen expiration
    else if (gameOver && gameOverTime-timer>15000){
        resetGame();
    }
}

function soundCheck(){

    if (gameOver){
        if(!songLoop.paused){
            songLoop.pause();            
        }
        if(soundThatWokeUpTheBear!==null && soundThatWokeUpTheBear.currentTime===0){
            soundThatWokeUpTheBear.play();
        }
        else if(gameOverSound.paused && win === false 
            && gameOverSound.currentTime===0 && soundThatWokeUpTheBear.paused){
            gameOverSound.play();
        }
        else if (winSound.paused && win && winSound.currentTime ===0){
            winSound.play();
        }
    }
    else if(gameStarted && songLoop.paused){
        songLoop.play();
    }
}

function setGameOver(result,reason){
    gameOverTime=timer;
    gameOver=true;
    win = result;
    gameOverReason=reason;
    listening = false;
}


//graphics 
function drawGame(){
    drawBackground();
    drawForeground();
    if(!gameStarted){
        drawDirections();
    }
    if(gameOver && gameOverTime-soundThatWokeUpTheBear.duration*1000
        -gameOverSound.duration*1000>timer){
        drawGameOver();
    }
}

function drawBackground(){
    ctx.font = "70px Tahoma";
    ctx.drawImage(imgBackground,0,0);
    
    if (!gameOver && gameStarted){
        drawTimer();
    }
}

//calculates the players position, then draws all of the foreground.
//you have to calculate players y pos first in order to make sure the 
//ordering of elements is correct.
function drawForeground(){
    var drawnY = player.y/(roomDepth/2)*halfHeight+halfHeight*2;
    var drawnX = player.x/(roomWidth/2)*
        (halfWidth-playerWidth/2)*(.24*(player.y+roomDepth/2)/roomDepth+.76)+halfWidth;

    var foregroundObjects = [[0,drawBear],
            [player.y,function(){drawPlayer(drawnX,drawnY,player["direction"]);}],
            [-roomDepth/2-1,drawBanjo],
            [roomDepth/2 -24, drawFireworks],
            [-30,drawBottle],
            [roomDepth/2 -10, drawSunChips]
            ];
    foregroundObjects.sort(function(a,b){return a[0]-b[0];});


    for (var i = 0;i<foregroundObjects.length;i++){
        foregroundObjects[i][1]();
    }
}

function drawPlayer(drawnX,drawnY,direction){
    if (player["animation"]=="still"){
        ctx.drawImage(spritePlayer,0,0,playerWidth,playerHeight,
            drawnX-playerWidth/2,drawnY-playerHeight,playerWidth,playerHeight);
    }
    else if(player["animation"]=="moving"){
        var animationTime = Math.floor((((totaltime-timer)/(1000/fps))%56)/4);
        if(animationTime>6){
            animationTime=13-animationTime;
        }
        if(direction=="right"){
            ctx.drawImage(spritePlayer,(animationTime+4)*playerWidth,0,playerWidth,playerHeight,
                drawnX-playerWidth/2,drawnY-playerHeight,playerWidth,playerHeight);
        }
        else{
            ctx.drawImage(spritePlayer,(animationTime+4)*playerWidth,playerHeight,playerWidth,playerHeight,
                drawnX-playerWidth/2,drawnY-playerHeight,playerWidth,playerHeight);
        }
    }
    //
    if (player.near==="banjo"){
        drawToolTip("hit d to play the banjo",drawnX,drawnY);
    }
    else if (player.near === "fireworks"){
        drawToolTip("hit d to set off fireworks",drawnX,drawnY);
    }
    else if (player.near === "chains"){
        drawToolTip("hit d to rattle the chain",drawnX,drawnY);        
    }
    else if (player.near === "sunchips"){
        drawToolTip("hit d to eat sunchips",drawnX,drawnY);        
    }
}

function drawToolTip(tip,drawnX,drawnY){
    if(listening){
        ctx.fillStyle="rgba(0,0,255,.5";
        ctx.fillRect(drawnX+playerWidth/2,drawnY-playerHeight,240,50);
        ctx.fillStyle="white";
        ctx.font = "20px Arial";
        ctx.fillText(tip,drawnX+playerWidth/2+20,drawnY-playerHeight+30);
    }
}


function drawBanjo(){
    ctx.drawImage(spriteObjects,207,34,232,85,
        230,200,232,85);
}

function drawFireworks(){
    ctx.drawImage(spriteObjects,338,349,156,200,
        300,728,156,200);
}

function drawBottle(){
    ctx.drawImage(spriteObjects,88,448,176,100,
        1147,432,142,80);
}

function drawSunChips(){
    ctx.drawImage(spriteObjects,219,256,103,140,
        1500,864,103,140);
}

function drawTimer(){
    ctx.fillStyle = "black";
    ctx.fillText(Math.floor(timer/1000) +" seconds left!", 170,90);
}

function drawDirections(){
    ctx.drawImage(imgOverlay,200,200);
    ctx.fillStyle="black";
    ctx.fillText("Don't wake up the bear for 45 seconds!",300,400,1620,780);
    ctx.fillText("Hit P to begin",300,600,1620,780);
}

function drawGameOver(){
    ctx.drawImage(imgOverlay,200,200);
    ctx.fillStyle="black";
    if(win){
        ctx.fillText("You Won!",300,400);
    }
    else{
        ctx.fillText("You woke up the bear...",300,400);
    }
    ctx.fillText(gameOverReason,300,600,1620,780);

}

function drawBear(){
    if (!gameOver || (gameOver && win) 
        || gameOverTime-soundThatWokeUpTheBear.duration*1000<timer){
        var animationTime = Math.floor((((totaltime-timer)/(1000/fps))%90)/15);
        ctx.drawImage(spriteBear,
            animationTime*bearWidth,0,bearWidth,bearHeight,
            halfWidth-bearWidth*.7,halfHeight*2-bearHeight,bearWidth,bearHeight);        
    }
    else if(!win){
        var animationTime = 
            Math.min(Math.floor(((gameOverTime-soundThatWokeUpTheBear.duration*1000-timer)/(1000/fps))/20),5);
        ctx.drawImage(spriteBear,
            animationTime*bearWidth,bearHeight,bearWidth,bearHeight,
            halfWidth-bearWidth*.7,halfHeight*2-bearHeight,bearWidth,bearHeight);        
    }
}

//useractions
function handleKeys(){
    if (keysDown[80]&&gameStarted==false){
        listening=true;
        gameStarted=true;
    }
    if (!listening){
        player["animation"] = "still";
        return;
    }
    //action moves
    if (keysDown[68] || keysDown[69] || keysDown[70] || keysDown[82]){
        handleActionKey();
    }
    // 38 is up, 39 is right, 40 is down, 37 is left
    else{
        if (keysDown[38]){
            player["animation"] = "moving";
            if (player.y > -(roomDepth/2)){
                player.y-=1;
            }
        }
        if (keysDown[39]){
            player["animation"] = "moving";
            player["direction"]="right";
            if (player.x < roomWidth/2){
                player.x+=1;
            }
        }
        if (keysDown[40]){
            player["animation"] = "moving";
            if (player.y < (roomDepth/2)){
                player.y+=1;
            }
        }
        if (keysDown[37]){
            player["animation"] = "moving";
            player["direction"]="not right";
            if (player.x > -roomWidth/2){
                player.x-=1;
            }
        }
        if(!(keysDown[37] || keysDown[38] || keysDown[39] || keysDown[40])){
            player["animation"] = "still";
        }
    }
}

function handleActionKey(){
    if(player.near==="none"){
        return;
    }
    else{
        var objectMapping={
            "sunchips":[sunchipsSound,"Opening the bag made too much noise!"],
            "banjo":[banjoSound,"Lesson: Banjo music will wake up bears."],
            "chains":[chainsSound,"That chain rattled too loudly."],
            "fireworks":[fireworksSound,"Why would you set off fireworks?"]
        }
        soundThatWokeUpTheBear= objectMapping[player.near][0];
        setGameOver(false,objectMapping[player.near][1]);
    }
}

function resetGame(){
    listening = false;
    gameStarted = false;
    timer= totaltime;
    gameOver = false;
    win = false;
    gameOverReason = "This gets replaced with the text shown to the player at the end of the game";

    player = {
        x:-roomWidth/2,
        y:0,
        direction:"right",
        animation:"still",
    }
    resetSounds();
}

function resetSounds(){
    songLoop.currentTime = 0;
    gameOverSound.currentTime=0;
    winSound.currentTime = 0;
    breakingGlass.currentTime = 0;
    banjoSound.currentTime = 0;
    fireworksSound.currentTime = 0;
    chainsSound.currentTime = 0;
    sunchipsSound.currentTime = 0;
    pokeSound.currentTime = 0;
    soundThatWokeUpTheBear = null;
}

// listeners
addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
    delete keysDown[e.keyCode];
}, false);

songLoop.addEventListener('timeupdate', function(){
                var buffer = .30
                if(this.currentTime > this.duration - buffer){
                    this.currentTime = 0
                    this.play()
                }}, false);


document.getElementById("fs_button").addEventListener("click",fullScreen);
window.onload = startGame();
