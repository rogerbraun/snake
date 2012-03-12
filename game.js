window.onload = function(){
    BLOCKSIZE = 10;
    WIDTH = 44 * BLOCKSIZE;
    HEIGHT = 28 * BLOCKSIZE;
  //init Crafty
    Crafty.init(WIDTH, HEIGHT);
  
  //generate a random color  
    var randColor = function(){
      return 'rgb(' + Crafty.math.randomInt(10, 255) + ',' + Crafty.math.randomInt(100, 255) + ',' + Crafty.math.randomInt(10, 255) + ')';
   }

/**
 *Timer component to trigger timerTick event every 200 ms
 *
 *
 *
 * */

    var EVERY_SECONDS = 100;
    Crafty.c('Timer', { 
        f            : EVERY_SECONDS
      , STOP         : true
      , name         : ''
   
      , init: function(name){
          if (typeof name === 'undefined'){
            this.name =  'timer_'+ new Date();
          }else{
            this.name = name;
          }
          return this;
        }  
      , updateClock: function(){
          Crafty.trigger("timerTick",this);
          if (!this.STOP){
            var self = this;
            Crafty.e("Delay").delay(function(){self.updateClock();},this.f);
          } 
        }  
      , setFrequency: function(f){
          if ( typeof f !== 'undefined'){
            this.f = f;
          }
          return this;
        }
      , stop: function(){
          this.STOP = true;
          return this;
        }
      , resume: function(){
          this.STOP = false;
          this.updateClock();
          return this;
        }  
  
   });

/******
 *
 *
 *
*/


    //component block
      Crafty.c("block", {
          init: function(){
            this.addComponent("2D,Canvas,Color,Tween");
            this.attr({w: BLOCKSIZE, h: BLOCKSIZE});  
          },
          makeBlock: function(x, y, current_dir, next_dir, color){
            this.attr("x", x);
            this.attr("y", y);
            this.attr("current_dir", current_dir);
            this.attr("next_dir", next_dir);
            this.color(color);
            return this;
          },
          moveTo: function(){
            this.move(this.current_dir, BLOCKSIZE);
            this.current_dir = this.next_dir; 
          }
      });

    //Initialize Timer
      var Timer = Crafty.e("Timer"); 

    //init start or restart scene
      var load = function(text){
        Timer.resume();
     //define start scene
        Crafty.scene("start", function(){
          //loading text
          Crafty.background("black");
          //middlepoint
          var m = {x: WIDTH/2 - 50, y: HEIGHT/2 - 10};
          //set text
          Crafty.e("2D, DOM, Text, Tween").attr({ w: 100, h: 20, x: m.x, y: m.y, fadeOut: "false"})
              .text(text)
              .css({ "text-align": "center", "color": "white"})
              .bind("timerTick", function(){
                if(this.fadeOut){
                  this.tween({alpha: 1.0}, 20);
                  this.fadeOut = false;
                } else {
                  this.tween({alpha: 0.0}, 20);
                  this.fadeOut = true;
                };
              });
          //trigger main scene
          Crafty.e("2D, DOM, Mouse").attr({w: 100, h: 50, x: m.x, y: m.y})
              .bind("Click", function(e){
                Crafty.scene("main");
              });

          //background
          var snake = Crafty.e("2D,Canvas")
                            .attr({blocks: [Crafty.e("block").makeBlock(0,0,"e","e",randColor())]})
                            .bind('timerTick', function(e){
                              var head = this.blocks[0];
                              var last = this.blocks[this.blocks.length - 1];
                              var max = {x: WIDTH/BLOCKSIZE, y: HEIGHT/BLOCKSIZE};
                              var min = {x: -10, y: 0};
                              head.moveTo();
                              for(var i = 1; i < this.blocks.length; i++){
                                this.blocks[i].moveTo();
                                this.blocks[i].next_dir = this.blocks[i-1].current_dir;
                              };
                              if (this.blocks.length >= max.x * 2 + max.y * 2) {
                                this.blocks.map(function(b){b.bind("timerTick", function(e){
                                  this.color(randColor());
                                })});
                                this.blocks = [Crafty.e("block").makeBlock(0,0,"e","e",randColor())];
                              } else {
                                this.blocks.push(Crafty.e("block").makeBlock(last.x, last.y, "", last.current_dir, randColor()));
                              };
                              if (head.x + 20 >= max.x * BLOCKSIZE) {head.next_dir = "s"};
                              if (head.y + 20 >= max.y * BLOCKSIZE) {
                                if (head.x - 20 <= min.x){
                                  head.next_dir = "n";
                                } else{ head.next_dir = "w"};
                              };
                          
                            })
      
        });
      Crafty.scene("start");
    };

  //main scene
    Crafty.scene("main", function(){
      Crafty.background("black");
      start();
    });

  //start game
    var start = function(){
      //create feed
      var makeFeed = function(){
        var x = Crafty.math.randomInt(BLOCKSIZE, WIDTH - BLOCKSIZE);
        var y = Crafty.math.randomInt(BLOCKSIZE, HEIGHT -BLOCKSIZE );
        var color = randColor();
        return Crafty.e("2D,Canvas,Color,Tween")
                     .attr({x: x, y: y, w: BLOCKSIZE, h: BLOCKSIZE, feedColor: color})
                     .color(color);  
      };
      var feed = makeFeed();
      //Score
      var score = Crafty.e("2D, DOM, Text, Tween")
                        .attr({w: 100, h: 20, x: 5, y: 5})
                        .tween({alpha: 0.5})
                        .css({"color": "white"});
      //create a snake-
      var t1 = Crafty.e("block").makeBlock(100, 100, "e", "e", randColor());
      var t2 = Crafty.e("block").makeBlock(90, 100, "e", "e", randColor());
      var t3 = Crafty.e("block").makeBlock(80, 100, "e", "e", randColor());
      var t4 = Crafty.e("block").makeBlock(70, 100, "e", "e", randColor());
      var snake = Crafty.e("2D,Canvas")
                  .attr({blocks:[t1,t2,t3,t4]})
                  .bind('timerTick', function(e){
                    var head = this.blocks[0];
                    //update score
                    var snakeScore = this.blocks.length - 4 
                    score.text("SCORE:" + snakeScore);
                    //is the snake within the boundary
                    var isWithin = this.blocks.reduce(function(res, e){
                                      return res && e.within(0, 0, WIDTH, HEIGHT)
                                    });
                    //restart the game
                    var that = this;
                    var restart = function(){
                      that.blocks.map(function(t){
                        t.tween({alpha: 0.0}, 20);
                        t.destroy();
                      });
                      that.destroy();
                      feed.destroy();
                      load("YOUR SCORE:" + snakeScore +"\nRESTART");
                    };                
                    //does the snake bite itself
                    var bite = this.blocks.slice(1).reduce(function(res, t){
                      return res || t.intersect(head.x, head.y, BLOCKSIZE, BLOCKSIZE);  
                    }, false);
                    //does the snake eat a feed
                    var eatFeed = head.intersect(feed.x, feed.y, BLOCKSIZE, BLOCKSIZE);

                    if (isWithin) {
                      head.moveTo();
                      for(var i = 1; i < this.blocks.length; i++){
                        this.blocks[i].moveTo();
                        this.blocks[i].next_dir = this.blocks[i-1].current_dir; 
                      };
                  
                      if (bite) { restart()};
                      if (eatFeed) {
                        var last = this.blocks[this.blocks.length - 1];
                        this.blocks.push(Crafty.e("block").makeBlock(last.x, last.y, "", last.current_dir, feed.feedColor));
                        feed.tween({alpha: 0.0}, 10);
                        feed.destroy();
                        feed = makeFeed();
                        return this;
                      };
                    } else {
                      restart();
                    };
                  })
                  .bind('KeyDown', function(e){
                    switch(e.keyCode){
                      case Crafty.keys.RIGHT_ARROW:
                        this.blocks[0].next_dir = "e"
                      break;
                      case Crafty.keys.LEFT_ARROW:
                        this.blocks[0].next_dir = "w"
                      break;
                      case Crafty.keys.UP_ARROW:
                        this.blocks[0].next_dir = "n"
                      break;
                      case Crafty.keys.DOWN_ARROW:
                        this.blocks[0].next_dir = "s"
                      break;
                      case Crafty.keys.SPACE:
                          if (!Timer.STOP) {
                            Timer.stop();
                          } else {
                            Timer.resume();
                          }
                      break;
                      default:
                        return;
                      break;
                    } 
                  });
    };
    load("START");
}
