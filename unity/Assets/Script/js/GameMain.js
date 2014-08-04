#pragma strict

var playerList:Array = ["p_1","p_2","p_3","p_4","p_5","p_6"];
var enemyList:Array = ["e_1","e_2","e_3","e_4","e_5","e_6"];

var sequenceList:Array = [];
var sequenceNum = 0;
var progressSequence = {};

var attackSide = "player";
var target:GameObject;

var ball:GameObject;
var ballScript:Ball;

var ballOwner:GameObject;
var ballOwnerScript:Character;

var targetScript:Character;

var pre_target:GameObject;
var pre_target_script:Character;

var isSelectMode = true;
//var line : LineRenderer;
//var from_obj:GameObject;
var is_game_started = false;
var is_shoot_going = false;

var characterDistance = [];
var isLock = false;

var sideSign:GameObject;

var highCamera:Camera;

var text_notice_script:Text;

var pass_cnt:float = 0;



//var player_mission = "";

function Start (){
	isSelectMode = true;
	is_game_started = false;
	text_notice_script = GameObject.Find("text_notice").GetComponent(Text);
	//highCamera = GameObject.Find("HighCamera").GetComponent(Camera);
	//highCamera.enabled = false;
	
	
	sequenceList = [ 
//			{ 
//				'target': 'e_1', 
//				'action_type': 'pass' 
//			},
//			{ 
//				'target': 'e_4', 
//				'action_type': 'pass' 
//			}

//			
	];
	Screen.orientation = ScreenOrientation.LandscapeLeft; 
	sideSign = GameObject.Find("sideSign");
	
	ball = GameObject.Find("Ball");
	ballScript = ball.GetComponent(Ball);
	
	tossTheBall();	
}

function tossTheBall(){
	ballScript.ballType = "toss";
	ballOwner = GameObject.Find("p_1");
	ballScript.moveTo(ballOwner,GameObject.Find("p_1"));
}
function getSequenceStatus(){
	var str = "";
	
	if(sequenceList.length == sequenceNum){
		str = "complete";
	}else{
		str = "progress";
	}
	
	return str;
}
function startSequence(){
	
	Debug.Log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
	Debug.Log("GameMain > startSequence");
	
	if(sequenceList.length == sequenceNum){
		Debug.Log("SEQUENCE IS COMPLETE");
		resetSequence();
		return;
	};
		
	progressSequence = sequenceList[sequenceNum];
	ballScript.ballType = progressSequence["action"];
	
	//ボールを所持してる場合は投げるモーションを設定
	if(ballScript.owner != "" && ballScript.ballType != "shoot"){
		ballOwner = GameObject.Find(ballScript.owner);
		ballOwnerScript = ballOwner.GetComponent(Character);
		ballOwnerScript.playPass();
		//Debug.Log("!!!!!ballOwner = " + ballOwner);
		//Debug.Break();
	}
	
	target = GameObject.Find(progressSequence["target"]);
	Debug.Log("target  = " + target);
	targetScript = target.GetComponent(Character);
	
	//キャラのキャッチ用アニメーションを再生	
	if(progressSequence	["action_type"]  == "shoot"){
		ballScript.ballType = "shoot";
		targetScript.canCatch = true;
	}
	
	var from:GameObject = GameObject.Find(ballScript.owner);
	pre_target = from;
	//Debug.Log("target >>>>>> "  + target.name);
	ballScript.moveTo(from,target);
	sequenceNum ++;
}

function getNextAction(){
	Debug.Log("GameMain > getNextAction");
	//ballScript.setBallEnable();
	resetFromCharacter();
	startSequence();
};

function resetFromCharacter(){
	//Debug.Log("GameMain > resetFromCharacter");
	//Debug.Log(pre_target.name);
	pre_target_script = pre_target.GetComponent(Character);
  	if(pre_target_script.gotHit){
  		pre_target_script.gotHit = false;
  	}else{
  		pre_target_script.resetCharacter();
	}
	pre_target_script.haveBall = false;
	pre_target_script.enablePhysics();
	pre_target_script.isTarget = false;
};

function Update(){
	
	if(is_shoot_going  && attackSide == "player"){
		is_shoot_going = false;
		autoCatch();
	}

	if(Input.GetMouseButton(0)){
		if(is_shoot_going){
			is_shoot_going = false;
			Debug.Log("Tap!!!!");
			checkDistance();
		}
		if(!isSelectMode || attackSide == "enemy"){
			return;
		};

		var ray:Ray;
		var hit:RaycastHit;
		ray = Camera.main.ScreenPointToRay(Input.mousePosition);
		if(Physics.Raycast(ray, hit, 100)){
			var selectedGameObject:GameObject = hit.collider.gameObject;
			if(selectedGameObject.name.Split("_"[0])[0] == "p" || selectedGameObject.name.Split("_"[0])[0] == "e"){
				if(!selectedGameObject.GetComponent(Character).haveBall ){ //&& !selectedGameObject.GetComponent(Character).isLineSet){
					if(attackSide != selectedGameObject.GetComponent(Character).mySide && selectedGameObject.GetComponent(Character).myPostion == "outside"){
						return;
					}
					setSequence(selectedGameObject,ballOwner);
				}
			}
		}else {
			selectedGameObject = null;
		}
	}
	
	ballOwner = GameObject.Find(ballScript.owner);
	
	//
}

function checkDistance(){
	
	var dist = Vector3.Distance(ballOwner.transform.position, ball.transform.position);
	//Debug.Log("距離 : "  + dist + "m");
	targetScript.canCatch = false;
	if(dist > targetScript.catch_dist_min && dist <  targetScript.catch_dist_max){
		Debug.Log("キャッチ成功");
		text_notice_script.showText("Success!!");
		targetScript.canCatch = true;
	}else{
		Debug.Log("キャッチ失敗");
		text_notice_script.showText("Faile");
		targetScript.canCatch = false;
	};
	
}

function autoCatch(){
	targetScript.canCatch = true;
}

function setSequence(to:GameObject,from:GameObject){
	
	Debug.Log("Main > setSequence");
	
	//line = from.GetComponent(LineRenderer);
  	//line.SetWidth(0.2, 0.8);
  	//line.SetVertexCount(2);
  	
  	isSelectMode = false;
  	
  	if(attackSide == "player"){
		if(to.name.Split("_"[0])[0] == "p"){
			sequenceList.Push({'target':to.name,'action':"pass"});
	//		line.material.color = Color(0.2,0.4,0.7,1);
		}
		if(to.name.Split("_"[0])[0] == "e"){
			sequenceList.Push({'target':to.name,'action':"shoot"});
			isSelectMode = false;
	//		line.material.color = Color(0.7,0.2,0.2,1);
			//Debug.Log(sequenceList);
		}
	}else if(attackSide == "enemy"){
		if(to.name.Split("_"[0])[0] == "e"){
			sequenceList.Push({'target':to.name,'action':"pass"});
	//		line.material.color = Color(0.2,0.4,0.7,1);
		}
		if(to.name.Split("_"[0])[0] == "p"){
			sequenceList.Push({'target':to.name,'action':"shoot"});
			isSelectMode = false;
	//		line.material.color = Color(0.7,0.2,0.2,1);
		}
	}
  	
  	ballOwner = to;
  	var fromPos = to.transform.position;
  	var toPos = from.transform.position;
  	
  	///line.SetPosition(0, fromPos);
  	//line.SetPosition(1, toPos);
  	
  	if(!isSelectMode){
  		sequenceNum = 0;
  		startSequence();
  	}
}

function resetSequence(){
	Debug.Log("GameMain > resetSequence");
	var i = 0;
	var go:GameObject;
	var go_script:Character;
	var line:LineRenderer;
	
	if(target.name.Split("_"[0])[0] == "p"){
		attackSide = "player";
		//sideSign.transform.position.x = -7.3;
		iTween.MoveTo(sideSign,iTween.Hash("time",.4f,"x",-7.4,"easeType","easeOutExpo","delay",.2f));
		//iTween.FadeFrom(sideSign,iTween.Hash("time",.8f,"alpha",1));
	}
	
	//iTween.ScaleTo(sideSign,iTween.Hash("time",.2f,"x",1.2,"z",1.4,"easeType","easeOutExpo"));
	//iTween.ScaleTo(sideSign,iTween.Hash("time",.8f,"x",1.45,"z",1.63,"easeType","easeOutExpo","delay",.2f));
	
//	iTween.FadeTo(sideSign,iTween.Hash("time",.2f,"alpha",0));
//	iTween.FadeTo(sideSign,iTween.Hash("time",.4f,"alpha",1,"delay",.2f));
	
	if(target.name.Split("_"[0])[0] == "e"){
		attackSide = "enemy";
		//sideSign.transform.position.x = 7.3;
		iTween.MoveTo(sideSign,iTween.Hash("time",.4f,"x",7.4,"easeType","easeOutExpo","delay",.2f));
		//iTween.FadeFrom(sideSign,iTween.Hash("time",.8f,"alpha",1));
		
	}

	Debug.Log("------------------------------------");
	Debug.Log("attackSide = " + attackSide);
	Debug.Log("------------------------------------");
	
	//from_obj = ballOwner;
	var arr = new Array();
	arr = playerList.Concat(enemyList);
//	if(attackSide == "palyer"){
//		arr = enemyList;
//	}else{
//		arr = playerList;
//	}
	var gm:GameObject;
	
	for(i = 0; i < arr.length; i ++){
		gm = GameObject.Find(arr[i]);
		gm.collider.enabled = true;	
	}
	
	isSelectMode = true;
	sequenceList = [];
	sequenceNum = 0;
	progressSequence = {};
	if(attackSide == "enemy"){
		yield WaitForSeconds(1);
		autoAttack();
	} 
	Debug.Log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
}

function autoAttack(){
	Debug.Log("Main > autoAttack");
	isSelectMode = false;
	var target = "p_1";
	if(!GameObject.Find(target).GetComponent(Character).isAlive){
		target = checkSurvivor("player").name;
	};
	
	if(getProbabilityNum(50)){
		if(checkAttackStatus(ballOwner,"enemy") == "lower"){
			var attacker:GameObject = getAttacker("enemy");
			sequenceList.Push({'target': attacker.name,'action':"pass"});
			 if(getProbabilityNum(30)){
				sequenceList.Push({'target':  "e_2",'action':"pass"});
			}
		}
	}else{
	
		if(getProbabilityNum(50)){
			sequenceList.Push({'target':"e_4",'action':"pass"});
		}else{
			sequenceList.Push({'target':"e_6",'action':"pass"});
		}
		
		if(getProbabilityNum(50)){
			sequenceList.Push({'target':"e_5",'action':"pass"});
		}
		
		if(getProbabilityNum(60)){
			sequenceList.Push({'target':"e_1",'action':"pass"});
		}
	}
	sequenceList.Push({'target': target,'action':"shoot"});
	startSequence();
	
	//var first_gameobj = "e_4";
	//sequenceList.Push({'target': first_gameobj,'action':"pass"});
	//from_obj = GameObject.Find(first_gameobj);
}

function getAttacker(side){
	Debug.Log("GameMain > getAttacker");
	var arr:Array = [];
	var target:GameObject;
	
	if(side == "player"){
		arr = playerList;
	}else if(side == "enemy"){
		arr = enemyList;
	}
	
	var a = "";
	var g:GameObject;
	var s:Character;
	var attack_num = 0;
	
	for(var i=0; i<arr.length;i++){
		a  = arr[i];
		g = GameObject.Find(a);
		s = g.GetComponent(Character);
		
		if(s.attack > attack_num){
			attack_num = s.attack;
			target = g;
		}
	}
	
	return target;
}

function checkAttackStatus(t:GameObject,side){
	Debug.Log("GameMain > checkAttackStatus");
	var str = "";
	var arr:Array = [];
	var target:GameObject = t;
	var target_script = target.GetComponent(Character);
	
	if(side == "player"){
		arr = playerList;
	}else if(side == "enemy"){
		arr = enemyList;
	}
	
	var a = "";
	var g:GameObject;
	var s:Character;
	
	for(var i=0; i<arr.length;i++){
		a  = arr[i];
		g = GameObject.Find(a);
		s = g.GetComponent(Character);
		
		if(target_script.attack < s.attack){
			str = "lower";
			return str;
		};
	}
	
	if(str == ""){
		str = "highest";
	}
	
	return str;
}

function checkSurvivor(side){
	Debug.Log("GameMain > checkSurvivor");
	var arr:Array = [];
	var target:GameObject;
	
	if(side == "player"){
		arr = playerList;
	}else if(side == "enemy"){
		arr = enemyList;
	}
	var a = "";
	var g:GameObject;
	var s:Character;
	for(var i=0; i<arr.length;i++){
		a  = arr[i];
		g = GameObject.Find(a);
		s = g.GetComponent(Character);
		if(s.isAlive){
			target = g;
			return target;
		}
	}
	return null;
}

function changeBallOwner(str){
	Debug.Log("GameMain > changeBallOwner");
	ballScript.owner = str;
}

function getProbabilityNum(num:float){
	var r = Random.RandomRange(0,100);
	
	var b = true;
    if (r > num){
        b = false;
    }
    return b;
}



