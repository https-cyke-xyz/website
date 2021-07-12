var controller = new ScrollMagic.Controller();
var tween = TweenMax.from("#projets", 1, {left: 700,opacity:0, ease: Power1.easeInOut})
var tween2 = TweenMax.from("#avis-content", 1, {left: -700,opacity:0, rotation:50, ease: Power1.easeInOut})
var tween3 = TweenMax.from("#letter", 1, {x: -700, opacity:0}, {x: 0,opacity:1, ease: Power1.easeInOut})

var project1 = new ScrollMagic.Scene({triggerElement: "#projets", offset: 0})
.triggerHook(0.4)
//.addIndicators({name: "txt", colorTrigger: "red", indent:200})
.setTween(tween)
.addTo(controller) 
.reverse(false)

var project2 = new ScrollMagic.Scene({triggerElement: "#avis", offset: 0})
.triggerHook(0.4)
//.addIndicators({name: "txt", colorTrigger: "red", indent:200})
.setTween(tween2)
.addTo(controller) 
.reverse(false)

var project3 = new ScrollMagic.Scene({triggerElement: "#about", offset: 0})
.triggerHook(0.4)
//.addIndicators({name: "txt", colorTrigger: "red", indent:200})
.setTween(tween3)
.addTo(controller) 
.reverse(true)

