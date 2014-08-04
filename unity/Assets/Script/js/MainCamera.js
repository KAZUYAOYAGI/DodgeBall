#pragma strict
var mainScript:GameMain;
var ball:GameObject;
var isMove =false;

function Start () {
	
	mainScript = GameObject.Find("GameMain").GetComponent(GameMain);
	ball = GameObject.Find("Ball");
	mainScript.is_game_started = true;
	//this.transform.position.x =  0;
	//this.transform.position.y =  40;
	//this.transform.position.z =  0;
	
	
	
	//iTween.MoveTo(this.gameObject, iTween.Hash("time",1.6,"x", 0,"z", 9, "y",18, "easeType", "easeInOutExpo","delay",0.5));
	//iTween.RotateTo(this.gameObject, iTween.Hash("time",1.6,"x", 67,"y", 180,"easeType", "easeInOutExpo","delay",0.5,"oncomplete","_oncomp"));
}

function shakeCamera(type){
	Debug.Log("mainCamera > shakeCamera");
	Debug.Log("type = " + type);
	var shake_num = 0.2;
	var time = 0.3;
	switch(type){
		case "strong":
			shake_num = -0.5;
			time = 0.8;
		break;
		case "normal":
			shake_num = -0.2;
		break;
		case "weak":
			shake_num = -0.1;
			time = 0.1;
		break;
	};
	Debug.Log("shake_num = " + shake_num);
	iTween.ShakePosition(this.gameObject,iTween.Hash("time",time,"x",shake_num));
}
function _oncomp (){
	mainScript.is_game_started = true;
}
var xpos:float = 0;
function Update () {
	xpos = ball.transform.position.x;
	//
	if(xpos > 12){
		moveCamera(3);
		return;
	}else if(xpos < -12){
		moveCamera(-3);
		return;
	}
	
	if(xpos < 2 || xpos < -2){
		moveCamera(0);
	}
	
	if(mainScript.attackSide == "enemy"){
		
	}else if(mainScript.attackSide == "player"){
		
	}
	
	//transform.LookAt(ball.transform);
	//transform.position.x = xpos;
}

 function moveCamera(pos){
 	if(isMove){
 		return;
 	}
 	iTween.MoveTo(this.gameObject, iTween.Hash("time",0.3,"x", pos,"easeType", "easeOutSine","delay",0,"oncomplete","_oncomplete"));
 }
 
 function _oncomplete(){
 	isMove = false;
 }


