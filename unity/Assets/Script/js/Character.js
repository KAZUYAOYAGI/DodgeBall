#pragma strict

var ball:GameObject;
var ballScript:Ball;

var myAnim:Animator;
var mainScript:GameMain;

var mainCamera:GameObject;
var mainCameraScript:MainCamera;

var haveBall = false;
var canCatch = false;
var gotHit = false;
var isAlive =  true;
var isLineSet = false;
var isActing = false;
var isWalk = false;
var speed:float;

var mySide = "player"; 
var myPostion = "";

var myType = "";
var hp:float = 0;
var hp_max:float = 0;
var attack:float = 0;
var ballSpeed:float = 0;
var catch_dist_min = 0;
var catch_dist_max = 0;
var pos_dist_max = 2;
var is_guard = false;

var is_hit_from_behind = false;

public var XposMax : float;
public var XposMin : float;
public var ZposMax : float;
public var ZposMin : float;

var my_icon:GameObject;
var my_hp:GameObject;	
var my_dead_icon:GameObject;

var circle_obj:GameObject;
var circle_script:Sign;
var isTarget = false;
var defaultPos:Vector3;

function Start() {
	rigidbody.isKinematic = true;
	
	/*/////////////////////// 
	//ステータス
	///////////////////////*/
	if(this.name == "p_1"  || this.name == "e_1"){
		if(this.name == "e_1"){
			hp = 2000;
			speed = 10;
		}else{
			hp = 1000;
			speed = 2;
		}
		//アタックタイプ
		myType = "attack";
		attack = 500;
		
		ballSpeed = 250;
		catch_dist_min = 0.1;
		catch_dist_max = 15;
	}else if(this.name == "p_2"  || this.name == "e_3"){
		//スピードタイプ
		myType = "speed";
		hp = 800;
		attack = 200;
		speed = 2;
		ballSpeed = 150;
		catch_dist_min = 1;
		catch_dist_max = 5;
	}else if(this.name == "p_3"  || this.name == "e_2"){				
		//防御タイプ
		hp = 2000;
		myType = "defense";
		attack = 400;
		speed = 2;
		ballSpeed = 150;
		catch_dist_min = 0.3;
		catch_dist_max = 5;
	}else if(this.name == "p_4"  || this.name == "e_4"){
		//外野のレスポンス早いタイプ
		hp = 1200;
		myType = "passer";
		attack = 200;
		speed = 3;
		ballSpeed = 150;
		catch_dist_min = 0.3;
		catch_dist_max = 5;
	}else{
		//その他
		myType = "weak";
		hp = 1000;
		attack = 150;
		speed = 3;
		ballSpeed =200;
		catch_dist_min = 0.3;
		catch_dist_max = 5;
	}
	
	if(mySide == "player"){
		speed = 3;
		ballSpeed = 200;
	}
	
	
	hp_max = hp;
	canCatch =  false;
	
	ball = GameObject.Find("Ball");
	ballScript = ball.GetComponent(Ball);
	myAnim = this.GetComponent(Animator);
	mainScript = GameObject.Find("GameMain").GetComponent(GameMain);
	mainCamera = GameObject.Find("MainCamera");
	mainCameraScript = GameObject.Find("Main Camera").GetComponent(MainCamera);
	
	if(name.Split("_"[0])[0] == "p"){
		mySide = "player"; 
	}else if(name.Split("_"[0])[0] == "e"){
		mySide = "enemy"; 
	}
	
	
	if(int.Parse(name.Split("_"[0])[1]) <= 3){
		myPostion = "inside";	
	}else{
		myPostion = "outside";	
	}
	
	if(mySide == "player"){
		XposMax = -13;
		circle_obj = Instantiate(Resources.Load("Prefabs/sign_prefab",GameObject),new Vector3(0,0,0),Quaternion.identity); 
		
	}else{
		circle_obj = Instantiate(Resources.Load("Prefabs/sign_e_prefab",GameObject),new Vector3(0,0,0),Quaternion.identity); 
		
		XposMax = 13;
	};
	circle_script = circle_obj.GetComponent(Sign);
	
	XposMin = 0;
	ZposMax = 6;
	ZposMin = -6;
	ballSpeed = (1 / ballSpeed)* 100;
	
	if(float.Parse(name.Split("_"[0])[1]) < 4){
		my_hp = GameObject.Find("icon_"+this.name + "/hp_bar");
		my_dead_icon = GameObject.Find("icon_"+this.name + "/dead_icon");
	}
	
	defaultPos.x = this.transform.position.x;
	defaultPos.y = this.transform.position.y;
	defaultPos.z = this.transform.position.z;
	
	//Debug.Log(my_hp.gameObject);
	
	//Debug.Log("============================================");
	//Debug.Log(attack);
	//Debug.Log(ballSpeed);
	//Debug.Log("============================================");
	
	//var text_name_prefab:TextNamePrefab = Instantiate(Resources.Load("Prefabs/TextNamePrefab"),new Vector3(0,0,0),Quaternion.identity);
	//var name_text:TextMesh = text_name_prefab.getComponent(TextMesh);
	//name_text.text = name;
}

function Update(){
	if(!isAlive){
		circle_script.eraseCircle();
		return;
	}
	if(mainScript.ballOwner != this.gameObject){
		haveBall = false;
	}
	if(mainScript.is_game_started  && !mainScript.isLock && !haveBall){
		setCharacterPosition();
	}
	if(is_guard){
		setCharacterPosition();
	}
	//倒れて動かなくならないようにする
	keepBalance(); 
	
	circle_obj.transform.position = this.transform.position;
	//circle_obj.transform.rotation.x = 180;
	
	if(mainScript.attackSide == mySide){
		isTarget = false;
	}
	
	if(isTarget){
		return;
	}
	
	
	if(mainScript.attackSide == "enemy"){
		eraseCircle();
		return;
	}
	
	if(haveBall){
		startAnime("catch");
		eraseCircle();
		return;
	}
	
	if(mainScript.attackSide != mySide  && myPostion == "outside"){
		eraseCircle();
	}else if(mainScript.attackSide == mySide || mySide == "enemy"){
		showCircle();
	}
	
	
//	if(mainScript.attackSide != mySide){
//		circle_script.colorTo("red");
//	}else{
//		circle_script.colorTo("blue");
//	}
	
}

function setCharacterPosition(){
	//speedに応じてキャラクターを回転させる
	var relativePos = ball.transform.position - transform.position;
	relativePos.y = 0;
	var rotation = Quaternion.LookRotation(relativePos);
	transform.rotation = Quaternion.Slerp (transform.rotation, rotation, Time.deltaTime * speed);

	//自分のサイドが攻撃中でかつ内野かつボールがヒットしてない状態
	if(mainScript.attackSide != mySide && myPostion == "inside"&& !gotHit){
		isWalk = false;
			// キャラクターの移動出来る位置を制限
			var addVec:Vector3;
			var newPos = transform.position;
			var xPos;
			var zPos;

			if(mySide  == "enemy"){
				addVec = -(rotation * Vector3(0,0,speed/10));
	 			if (XposMin < transform.position.x && transform.position.x < XposMax){
					xPos = transform.position.x + addVec.x;
					xPos = Mathf.Clamp(xPos, XposMin, XposMax);
				 	newPos.x = xPos;
				 	startAnime("walk");	
				 	isWalk = true;
	 			}
	 			
				if(ZposMin < transform.position.z && transform.position.z < ZposMax){
					zPos = transform.position.z + addVec.z;
					zPos = Mathf.Clamp(zPos, ZposMin, ZposMax);
					newPos.z = zPos;
					startAnime("walk");	
				}else{
					if(!isWalk){
						startAnime("idle");
					};
				}
			}else if(mySide  == "player"){
				addVec = -(rotation * Vector3(0,0,speed/10));
	 			if (XposMin > transform.position.x && transform.position.x > XposMax){
					xPos = (transform.position.x) + (addVec.x);
					xPos = Mathf.Clamp(xPos,XposMax,XposMin);
				 	newPos.x = xPos;
				 	startAnime("walk");	
				 	isWalk = true;
	 			}
				if(ZposMin < transform.position.z && transform.position.z < ZposMax){
					zPos = transform.position.z + addVec.z;
					zPos = Mathf.Clamp(zPos, ZposMin, ZposMax);
					newPos.z = zPos;
					startAnime("walk");
				}else{
					if(!isWalk){
						startAnime("idle");
					}
				}
			}
			
			var arr = [];
			if(mySide == "enemy"){
				arr = mainScript.enemyList;
			}else if(mySide == "player"){
				arr = mainScript.playerList;
			}
			
			var gm:GameObject;
			var dist;
			var max:Vector3;

			for(var i = 0; i < 3; i++){
				gm = GameObject.Find(arr[i]);
				if(this.name != gm.name){
					dist = Vector3.Distance(transform.position,gm.transform.position);
					if(float.Parse(dist.ToString()) < pos_dist_max){
						 newPos.x = transform.position.x;
						 newPos.z = transform.position.z;
					}
				}
			}
			
		//ボールある位置から逆の方向へ逃げる 
		transform.position = newPos;
		isMoveBack = false;			
	}else{
		startAnime("stop");
		if(myPostion == "inside" && !isMoveBack){
			isMoveBack = true;
			//transform.position = defaultPos;
			startAnime("walk");
			iTween.MoveTo(this.gameObject,iTween.Hash("time",1,"x",defaultPos.x,"y",defaultPos.y,"z",defaultPos.z,"easeType","easeInOutExpo","onComplete","moveBackComp"));
		}
	}
	
	if(mainScript.attackSide == mySide && myPostion == "inside" && !haveBall){
		if(transform.position.x){
					
		}
	}
}


var isMoveBack = false;
function moveBackComp(){
	isMoveBack = false;
	startAnime("stop");
}
function keepBalance(){
	if(this.transform.rotation.x < -24  || this.transform.rotation.x > 24){
		this.transform.rotation.x = 0;
	}else if(this.transform.rotation.z < -24  || this.transform.rotation.z > 24){
		this.transform.rotation.z = 0;
	}
}

function OnCollisionEnter(col:Collision){
	//Debug.Log("Character > OnCollisionEnter");
	
	if(col.gameObject.name == "Ball"  &&  !haveBall){
		if(mainScript.pre_target){
			hitAngleHandler(this.gameObject,mainScript.pre_target);//col.gameObject);	
		}
		//getHitAngle(this.gameObject,mainScript.pre_target);
		if(ballScript.ballType == "shoot"){			
			if(!isTarget && mySide == "player"){
				return;
			}
			if(mySide == mainScript.attackSide){
				return;
			}
		};
		
		if(!mainScript.isLock){
			ballHitHandler();	
		}
		//Debug.Log("Character > OnCollisionEnter > Ball Hit!");
	}
}

function ballHitHandler(){
	Debug.Log(" Character > ballHitHandler");
	if(!mainScript.isLock && !haveBall){
		switch(ballScript.ballType){
			case "pass":
			if(mySide != mainScript.attackSide){
				return;
			}
			mainCameraScript.shakeCamera("weak");
			grabBall();
			break;
			case "toss":
				grabBall();
			break;
			case "shoot":
				if(mainScript.getProbabilityNum(1) && myType != "defense"){
					mainScript.isLock = true;
					getGuardian();
					break;
				}
				ballScript.isHit = true;
				if(canCatch){
					grabBall();
				}else{
					getHit();
					mainCameraScript.shakeCamera("strong");
				}
			break;
		}
	}
	
	//衝突判定とiTweenが被って動きが変になるので一旦オフる
	iTween.Stop(ball, "moveTo");
	mainScript.is_shoot_going = false;
}

function getGuardian(){
	var arr = [];
	if(mySide == "enemy"){
		arr = mainScript.enemyList;
	}else if(mySide == "player"){
		arr = mainScript.playerList;
	}
	var gm:GameObject;
	var gmScript:Character;
	for(var i = 0; i < 3; i++){
		gm = GameObject.Find(arr[i]);
		gmScript = gm.GetComponent(Character);
		if(gmScript.myType == "defense"){
			gmScript.startGuard(this.gameObject);
			return;
		}
	}
}

function startGuard(target:GameObject){
	//var pos = target.transform.position;
	is_guard = true;
	var pos = ball.transform.position;
	transform.LookAt(target.transform);
	Time.timeScale = 0.5;
	ballScript.ballType = "pass";
	iTween.MoveTo(gameObject,iTween.Hash("time",1,"x",pos.x,"z",pos.z,"easeType", "easeInOutExpo","ignoretimescale",true,"oncomplete","guardComplete"));
}

function guardComplete(){
	mainScript.isLock = false;
	//mainScript.changeBallOwner("");
	startAnime("down2");
	
	yield WaitForSeconds(2);
	ballScript.startSerchNearCharacter();
	Time.timeScale = 1;
}

function playPass(){
 	Debug.Log("playShoot");
	startAnime("shoot");
	disablePhysics();
	Invoke("playPassSub",0.3);
}

function playPassSub(){
	startAnime("reset");
};

//ボールをキャッチ
function grabBall(){
	Debug.Log("Character > grabBall");
	setHaveBall(true);
	startAnime("catch");
	getBallInHands();
	
	ballScript.setBallDisable();
	 
	//	myAnim.SetBool("isCatch",true);
	//	myAnim.speed = 2;
	//mainScript.from_obj = this.gameObject;
	
	mainScript.changeBallOwner(this.name);//ballOwner = this.gameObject;
	if(ballScript.ballType != "toss"){
		Invoke("getNextAction",0.5 / speed);
	}
}

function getBallInHands(){
	//ボールのコライダーとリジッドボディをオフ
	ball.transform.parent = this.transform;
	//ボールの位置をキャラクターのローカルポジションの手の位置にする
	ball.transform.position.y = this.transform.position.y+1.2;
	if(ball.transform.position.x > 0){
		ball.transform.localPosition.x = 0;
		ball.transform.localPosition.z = 0.015;
	}else{
		ball.transform.localPosition.x = 0;
		ball.transform.localPosition.z = 0.015;
	}
}

//ボールがヒット
function getHit(){
	Debug.Log("Character > getHit ");
	mainScript.isLock = true;
	gotHit = true;
	
	if(is_hit_from_behind){
		startAnime("down2");
	}else{
		startAnime("down");	
	}
	
	is_hit_from_behind = false;
	
	myAnim.speed = 0.6;
	Time.timeScale = 0.7;
	disablePhysics();
	
	//ボールを上に飛ばす
	ballScript.setBallEnable();
	ballScript.ballType = "pass";
	ball.rigidbody.AddForce(Vector3.up *  60.0, ForceMode.Impulse);
	
	hp -= 300;
	var damage_scale_num:float = hp / hp_max;
	if(damage_scale_num <= 0){
		damage_scale_num = 0;
	}
	my_hp.transform.localScale.x = damage_scale_num;
	
	Debug.Log("damage_scale_num  = "+damage_scale_num);
	Debug.Log("hp_max  = "+hp_max);
	Debug.Log("hp  = "+hp);
	Debug.Log("hp / hp_max  = "+ (hp / hp_max));
	
	if(hp > 0){
		yield WaitForSeconds(3);
		Time.timeScale = 1;
		standUp();	
	}else{
		yield WaitForSeconds(1);
		Time.timeScale = 1;
		dead();
	}
	
	ballScript.startHitEffect();
	
}

function dead(){
	isAlive = false;
	circle_script.eraseCircle();
	iTween.MoveTo(gameObject,iTween.Hash("time",3,"y",20,"easeType", "easeInOutSine","delay",1,"oncomplete","deadSub"));
	my_dead_icon.transform.localScale.x = 1;	
}

function deadSub(){
	var s:GameObject = mainScript.checkSurvivor(mySide);
	var s_s =s.GetComponent(Character);
	s_s.grabBall();
}

function followBall(){
	mainScript.isLock = true;
	gameObject.transform.LookAt(ball.transform);
}

function standUp(){
	Time.timeScale = 1;
	Debug.Log("standUp  "+ this.name);
	startAnime("standup");
	standUpSub();
	enablePhysics();
	mainScript.attackSide = mySide;
	ball.transform.parent = this.transform;
	yield WaitForSeconds(1);
	grabBall();
}

function standUpSub(){
	mainScript.isLock = false;
}

function getNextAction(){
	Debug.Log("Character > getNextAction");
	if(!gotHit || mainScript.getSequenceStatus() == "complete" || haveBall){
		//Debug.Log("Character > getNextAction > getHit");
		mainScript.getNextAction();
	}
	
}

function resetCharacter(){
 	Debug.Log("Character > resetCharacter  "+ this.name);
 	mainScript.isLock = false;
 	canCatch = false;
 	
	enablePhysics();
	startAnime("reset");
	
	
}

function runToCenterLine(target:GameObject){
	Debug.Log("Character > runToCenterLine");
	mainScript.isLock = true;
	var xpos = 0;
	var zpos = target.transform.position.z;
	var isDirect = false;
	disablePhysics();
	getBallInHands();
	
	if(mySide == "enemy"){
		xpos = 2;
		if(transform.position.x < 4){
			isDirect = true;
		}
	}else if(mySide == "player"){
		xpos = -2;
		if(transform.position.x > -4){
			isDirect = true;
		}
	}
	ball.transform.parent = this.transform;
	if(myPostion == "outside" || isDirect){
		runToCenterLineSub();
	}else if(myPostion == "inside"){
		//iTween.MoveTo(gameObject,iTween.Hash("time",0.8/speed,"x",xpos,"z",zpos,"easeType", "easeOutSine","oncomplete","runToCenterLineSub"));
		iTween.MoveTo(gameObject,iTween.Hash("time",0.8/speed,"x",xpos,"easeType", "easeOutSine","oncomplete","runToCenterLineSub"));
	}
}

function runToCenterLineSub(){
	Debug.Log("Character > runToCenterLineSub");
	startAnime("shoot");
	this.collider.enabled = false;
	ballScript.shootHandler(ballSpeed);
	mainScript.isLock = false;
	setHaveBall(false);
	Invoke("enablePhysics",0.05);
}

function runToCenterLineAndJump(target:GameObject){
	Debug.Log("Character > runToCenterLine");
	mainScript.isLock = true;
	var xpos = 0;
	var jumpPos = 0;
	var zpos = target.transform.position.z;
	disablePhysics();
	getBallInHands();
	
	if(mySide == "enemy"){
		xpos = 3;
		jumpPos = 1;
	}else if(mySide == "player"){
		xpos = -3;
		jumpPos = -1;
	}
	startAnime("walk");
	var time = 0.8/speed;
	if(myPostion == "outside"){
		runToCenterLineSub();
		return;
	}
	
	ball.transform.parent = this.transform;
	iTween.MoveTo(gameObject,iTween.Hash("time",time,"x",xpos,"easeType", "easeOutSine"));	
	iTween.MoveTo(gameObject,iTween.Hash("delay",time,"time",0.5,"x",jumpPos,"y",4,"easeType", "easeInOutExpo","onstart","runToCenterLineAndJumpStart","oncomplete","runToCenterLineAndJumpSub"));	
}
function runToCenterLineAndJumpStart(){
	//startAnime("jump");
	myAnim.SetBool("isJump",true);
	 myAnim.speed = 1.2;
}
function runToCenterLineAndJumpSub(){
	Debug.Log("Character > runToCenterLineSub");
	//startAnime("shoot");
	myAnim.SetBool("isShoot",true);
	ballScript.shootHandler(ballSpeed);
	mainScript.isLock = false;
	setHaveBall(false);
	iTween.MoveTo(gameObject,iTween.Hash("time",0.3,"y",0,"easeType", "easeOutSine"));	
	Invoke("enablePhysics",0.05);
}

function setHaveBall(b){	
	haveBall = b;
}

function startAnime(type){
	myAnim.SetBool("isDown",false);
	myAnim.SetBool("isDown2",false);
	myAnim.SetBool("isEscape",false);
	myAnim.SetBool("isShoot",false);
	myAnim.SetBool("isCatch",false);
	myAnim.SetBool("isJump",false);
	myAnim.speed = 1;
	
	switch(type){
		case "idle":
			//myAnim.SetBool("isEscape",true);
		break;
		case "walk":
			myAnim.SetBool("isEscape",true);
		break;
		case "catch":
			myAnim.speed = 5;
			myAnim.SetBool("isCatch",true);
		break;
		case "stop":
			myAnim.SetBool("isEscape",false);
		break;
		case "shoot":
			myAnim.speed = 3;
			myAnim.SetBool("isShoot",true);
			Debug.Log("mainScript.isLock = " +  mainScript.isLock);
		break;
		case "down":
			myAnim.speed = 3;
			myAnim.SetBool("isDown",true);
		break;
		case "down2":
			myAnim.speed = 3;
			myAnim.SetBool("isDown2",true);
		break;
		case "down_front":
			myAnim.speed = 3;
			myAnim.SetBool("isDown",true);
		break;
		case "standup":
			//myAnim.SetBool("isDown",false);
			myAnim.SetBool("isStandUp",true);
		break;
		case "standup":
			myAnim.SetBool("isCatch",true);
		break;
		case "jump":
			myAnim.SetBool("isJump",true);
		break;
		case "reset":
			//do nothing
		break;
	};
}

function enablePhysics(){
	Debug.Log("Character > enablePhysics");
	//rigidbody.isKinematic = false;
	rigidbody.isKinematic = true;
	collider.enabled = true;
}

function disablePhysics(){
	Debug.Log("Character > disablePhysics");
	rigidbody.isKinematic = true;
	
	collider.enabled = false;
}

function showCircle(){
	circle_script.showCircle();
}

function showCircleSlow(){
	circle_script.showCircleSlow();
}

function eraseCircle(){
	circle_script.eraseCircle();
}

function hitAngleHandler(orign:GameObject,target:GameObject){
	//var xpos = target.transform.position.x - orign.transform.position.x;
	//var zpos = target.transform.position.z - orign.transform.position.z;
	// 角度radianを求める
	//var radian = Mathf.Atan2(xpos,zpos);
	// 度に変換
    //var degree = radian * 360 /(2*Mathf.PI);
    //Debug.Log("degree = " + degree + "度");
    //Debug.Log("rotation.y = " + orign.transform.rotation.eulerAngles.y);
    
    var targetDir = target.transform.position - orign.transform.position;
	var forward = orign.transform.forward;
	var angle = Vector3.Angle(targetDir, forward);
    
    if(angle > 45){
    	canCatch = false;
    }else if(angle < 35){
    	if(ballScript.ballType == "pass"){
    		canCatch = true;
    	}
    }
};
