#pragma strict

var referencetotext:GUIText;
var isAnimation = false;

function Start () {
	
	iTween.FadeTo(gameObject, iTween.Hash("alpha", 0, "time", 0)); 
}

function Update () {

}

function showText (text) {
	if(isAnimation){
		//return;
	}
	//Debug.Break();
	Debug.Log("showText");
	if(text){
		this.gameObject.guiText.text = text;
	};
	
	isAnimation = true;
	//iTween.FadeFrom(gameObject,iTween.Hash("time",1,"alpha",1));
	iTween.FadeTo(gameObject, iTween.Hash("alpha", 1, "time", .4)); 
	iTween.FadeTo(gameObject, iTween.Hash("alpha", 0, "time", .4,"delay",0.7f)); 
	iTween.FadeTo(gameObject, iTween.Hash("alpha", 1, "time", .4,"delay",0.8)); 
	iTween.FadeTo(gameObject, iTween.Hash("alpha", 0, "time", .4,"delay",1,"oncomplete","_oncomplete")); 
	
	//transform.position.x = -0.1;
	//iTween.MoveTo(gameObject,iTween.Hash("time",0.4,"x",0.5,"easeType", "easeOutExpo","ignoretimescale",true));	
	//iTween.MoveTo(gameObject,iTween.Hash("time",0.4,"x",1.1,"easeType", "easeInExpo","ignoretimescale",true,"delay",1.4));	
	//iTween.FadeTo(gameObject,iTween.Hash("time",1,"alpha",1)); 
	
}

function _oncomplete(){
	isAnimation = false;
}