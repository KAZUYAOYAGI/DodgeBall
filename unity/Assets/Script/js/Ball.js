#pragma strict

var ballType = "pass";
var owner = "";
var movePath:Vector3 = new Vector3();
var isHit = false;
var mainScript:GameMain;
var fromScript:Character;
var toScript:Character;
var ball_hash;

var toObject:GameObject;
var fromObject:GameObject;
var myParticle:ParticleEmitter;
var text_notice_script:Text;

function Start () {
	ballType = "pass";
	text_notice_script = GameObject.Find("text_notice").GetComponent(Text);
	mainScript = GameObject.Find("GameMain").GetComponent(GameMain);
	//myParticle = this.GetComponent(ParticleEmitter);
}

function Update (){
	if(mainScript.is_game_started){
		if(gameObject.transform.position.y < 0){
			 //gameObject.transform.position.y = 10;
		};
	}
}

function startHitEffect(){
	//myParticle.particleSystem.Play();
}

function moveTo(from:GameObject,to:GameObject){
	Debug.Log("Ball > moveTo");	
	owner = to.name;
	
	fromScript = from.GetComponent(Character);
	toScript =  to.GetComponent(Character);
	//ボールのコライダーとリジッドボディを有効に戻す
	if(ballType != "shoot"){
		transform.parent = null;
	}
	setBallEnable();
	toObject = to;
	
	if(ballType == "toss"){
		toss();
		return;
	}
	
	if(ballType == "toss2"){
		toss2();
		return;
	}
	
	if(!from){
		from = GameObject.Find("e_1");
	};
	var pos = to.transform.position;
	var from_pos = from.transform.position;
	
	switch(ballType){
		case "pass":
			mainScript.pass_cnt += 1;
			//from.transform.LookAt(to.transform);
			iTween.LookTo(from,iTween.Hash("time",.4f,"looktarget",to.transform));
			yield WaitForSeconds(0.1);
			var dist = Vector3 .Distance(from.transform.position,to.transform.position);
			var time = ((dist/10) * (fromScript.ballSpeed));
			if(mainScript.pass_cnt > 5){
				time += (mainScript.pass_cnt/100);
			}			
			ball_hash =  iTween.Hash("time",time,"path",[Vector3(((from_pos.x+pos.x)/2),pos.y+3,pos.z),Vector3(pos.x-0.8,pos.y+1,pos.z)],"easeType", "easeOutSine","oncomplete","_oncomplete");
		break;
		case "shoot":
			
			//from.transform.LookAt(to.transform);
			iTween.LookTo(from,iTween.Hash("time",.4f,"looktarget",to.transform));
			yield WaitForSeconds(0.1);
			isHit = false;
			if(mainScript.attackSide == "enemy"){
				toScript.isTarget = true;
				text_notice_script.showText("TAP!!");
			}
			
			toScript.showCircleSlow();
			
			if(mainScript.getProbabilityNum(70)){
				fromScript.runToCenterLineAndJump(toObject);	
			}else{
				fromScript.runToCenterLine(toObject);	
			}
			//ball_hash = iTween.Hash("time",0.8,"x", pos.x-0.8,"y", pos.y+1,"z",pos.z, "easeType", "easeOutSine","oncomplete","_oncomplete");
			return;
		break;
	}
	
	iTween.MoveTo(gameObject,ball_hash);		
}

function toss(){
	Debug.Log("Ball > toss");
	var pos = toObject.transform.position;
	iTween.MoveTo(gameObject,iTween.Hash("time",1,"x", pos.x-0.8,"y", pos.y+1,"z",pos.z, "easeType", "easeOutSine","oncomplete","_tossComplete"));
	//mainScript.getNextAction();
}

function toss2(){
	Debug.Log("Ball > toss2");
	var pos = toObject.transform.position;
	iTween.MoveTo(gameObject,iTween.Hash("time",1,"x", pos.x-0.8,"y", pos.y+1,"z",pos.z, "easeType", "easeOutSine","oncomplete","_tossComplete"));
	 
	yield WaitForSeconds(1);
	mainScript.getNextAction();
}
	
function _tossComplete(){
	Debug.Log("Ball > _tossComplete");
}

function shootHandler(speed:float){
	
	Debug.Log("Ball > shootHandler");
	mainScript.is_shoot_going = true;
	var pos = toObject.transform.position;
	
	var time:float = speed;
	if(mainScript.pass_cnt > 5){
		time += (mainScript.pass_cnt/100);
	}
	
	mainScript.pass_cnt = 0;
	transform.parent = null;
	Time.timeScale = 0.7;
	ball_hash = iTween.Hash("time",speed,"x", pos.x-0.8,"y", pos.y+1,"z",pos.z, "easeType", "easeOutSine","oncomplete","_oncomplete");
	//iTween.ScaleTo(gameObject,iTween.Hash("x",2,"y",2,"z",2,"time",0.4));
	iTween.MoveTo(gameObject,ball_hash);

}

function _oncomplete(){
	switch(ballType){
		case "pass":
			fromScript.startAnime("reset");
			fromScript.setHaveBall(false);
		break;
		case "shoot":
			toScript.isTarget = false;
			mainScript.is_shoot_going = false;
			if(!isHit){
				//シュート後のボールが誰の手にも無い状態の場合の処理
				ballCollectHandler();
			}
		break;
		
		case "toss":
			
		break;
	}	
}

function setBallEnable(){
	Debug.Log("Ball > setBallEnable ");
	this.rigidbody.isKinematic = false;
	this.collider.enabled = true;
}

function setBallDisable(){
	Debug.Log("Ball > setBallDisable");
	this.rigidbody.isKinematic = true;
	this.collider.enabled = false;
}

function ballCollectHandler(){
	//シュート後のボールが誰の手にも無い状態の場合の処理
	//Debug.Log("ballCollectHandler");
	ballType = "toss";
	mainScript.getNextAction();
	var arr = [];
	 if(mainScript.attackSide == "player"){
	 	 arr = mainScript.playerList;
	 }else if(mainScript.attackSide == "enemy"){
	 	 arr = mainScript.enemyList;
	 }
	 var charaObj:GameObject;
	 var nearestNum = 0;
	 var dist = 0;
	 var nearestCharaObj:GameObject;
	 
	 for(var i=0; i < arr.length/2; i ++){
	 	 charaObj = GameObject.Find(arr[i]);
	 	 dist = Vector3.Distance(charaObj.transform.position, transform.position);
		 if(i == 0){
		 	nearestCharaObj = charaObj;
		 	nearestNum = dist;
		 }else if(nearestNum > dist){
		 	nearestCharaObj = charaObj;
		 	nearestNum = dist;
		 }
	 }
	 
	 
	 
	 //Debug.Log(nearestCharaObj);
	 if(nearestCharaObj){
	 	var pos = transform.position;
	 	var charaScript = nearestCharaObj.GetComponent(Character);
	 	charaScript.startAnime("walk");
	 	iTween.MoveTo(nearestCharaObj, iTween.Hash("time",2,"x", pos.x,"z",pos.z, "easeType", "easeOutSine"));//,"oncomplete","_oncomplete"));
	 }	
}

function startSerchNearCharacter(){
	Debug.Log("Ball > startSerchNearCharacter");
	var arr = mainScript.playerList.Concat(mainScript.enemyList);
	var gm:GameObject;
	var nearest_gm:GameObject;
	var dist;
	var distance_num = 100;
	for(var i = 0; i<arr.length; i++){
		gm = GameObject.Find(arr[i]);
		dist = Vector3.Distance(this.transform.position,gm.transform.position);
		
		if(distance_num > float.Parse(dist.ToString())){
			distance_num = float.Parse(dist.ToString());
			nearest_gm = gm;
		}
		
	}
	
	Debug.Log(distance_num + " m");
	Debug.Log(nearest_gm.name);
	
	ballType = "toss";
	mainScript.sequenceList.Push({'target': nearest_gm.name, 'action': 'toss2' });
	mainScript.getNextAction();
}







