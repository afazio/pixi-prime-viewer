import React from 'react';
import Pixi from 'pixi.js';
import Immutable from 'immutable';

export default class PrimeViewer extends React.Component {
  constructor(props) {
    super(props)
    this.renderer = null;
  }
  
  // A lazy sequence generator that returns the next `n` numbers from 1 to infinity.
  next(count = 1) {
    this.range = this.range || Immutable.Range(1, 1e6);
    const result = this.range.take(count);
    this.range = this.range.skip(count);
    return result;
  }

  // Show exponentially more blocks over time
  numbersToShowSinceLast(time) {
    if (this.numToShowPerSecond === undefined)
      this.numToShowPerSecond = 1;

    if (this.lastTime === undefined) {
      this.lastTime = time;
      return 0;
    }

    const howOften = 1000.0 / this.numToShowPerSecond;
    const result = Math.floor((time - this.lastTime) / howOften);

    if (result > 0) {
      this.lastTime = time;

      if (this.numToShowPerSecond < 1e5)
        this.numToShowPerSecond = this.numToShowPerSecond / 0.92;
    }

    return result;
  }

  isPrime (n) {
    if (isNaN(n) || !isFinite(n) || n%1 || n<2) return false; 
    if (n%2==0) return (n==2);
    if (n%3==0) return (n==3);
    var m=Math.sqrt(n);
    for (var i=5;i<=m;i+=6) {
      if (n%i==0)     return false;
      if (n%(i+2)==0) return false;
    }
    return true;
  }

  setup() {
    const {width, height} = this.props.canvas;
    this.renderer = Pixi.autoDetectRenderer(width, height);
    this.refs.view.appendChild(this.renderer.view);

    this.stage = new Pixi.Container();

    //this.numberContainer = new Pixi.Container();
    //this.stage.addChild(this.numberContainer);

    let empty = new Pixi.Graphics()
    empty.beginFill(0xFFFFFF,0)
    empty.drawRect(0,0,1,1)
    empty.endFill()
    this.numberContainer = new Pixi.Sprite(empty.generateTexture(false));
    this.numberContainer.anchor.x = 0.5;
    this.numberContainer.anchor.y = 0.5;
    this.stage.addChild(this.numberContainer);

    this.graphics = new Pixi.Graphics();
    this.numberContainer.addChild(this.graphics);

    this.x = this.props.canvas.width / 2.0;
    this.y = this.props.canvas.height / 2.0;

    this.numberContainer.x = this.x - 150;
    this.numberContainer.y = this.y - 100;

    this.current = 0;

    this.RIGHT = 0;
    this.UP = 1;
    this.LEFT = 2;
    this.DOWN = 3;

    // maximum numbers we can do in various directions (RIGHT, UP, ...);
    this.max = [1, 1, 2, 2];

    this.direction = this.RIGHT;
    this.numberSize = 50;

    this.scaleAmount = 0.998

    this.texts = [];

    window.requestAnimationFrame(this.animate.bind(this));
  }

  drawNumber(number, color, x, y, size) {
    this.graphics.beginFill(color, 1);
    this.graphics.drawRect(x, y, size, size);

    if (number < 20) {
      const text = new Pixi.Text(''+number, { font: (this.numberSize / 2)+'px Snippet', fill: 'white', align: 'left' });
      text.position.x = x + this.numberSize / 2;
      text.position.y = y + this.numberSize / 2;
      text.anchor.x = 0.5;
      text.anchor.y = 0.5;
      this.texts.push(text);
      this.graphics.addChild(text);
    }
  }

  drawNext(number) {
    const blackAndYellow = [0x000000, 0xFFE20B];
    const redAndBlue = [0xFF0000, 0x0000FF];
    const theme = redAndBlue;

    const color = this.isPrime(number) ? theme[1] : theme[0];
    this.drawNumber(number, color, this.x, this.y, this.numberSize);

    if (this.current == this.max[this.direction]) {
      this.current = 0;
      this.max[this.direction] += 2;
      this.direction = (this.direction + 1) % 4;
    }
    
    switch(this.direction) {
    case this.RIGHT:
      this.x +=  this.numberSize; break;
    case this.UP:
      this.y += -this.numberSize; break;
    case this.LEFT:
      this.x += -this.numberSize; break;
    case this.DOWN:
      this.y +=  this.numberSize; break;
    }
    
    this.current += 1;
  }

  animate() {
    const time = new Date();
    const numbersToShow = this.next(this.numbersToShowSinceLast(time));

    this.graphicsScale = (this.graphicsScale || 1.0) * this.scaleAmount;
    
    if (this.graphicsScale < 0.05) 
      this.scaleAmount = Math.min(this.scaleAmount + 0.00001, 1);

    this.numberContainer.scale.set(this.graphicsScale);

    this.graphics.rotation += 0.0001

    numbersToShow.forEach(this.drawNext.bind(this));

    if (numbersToShow.size && numbersToShow.get(0) >= 8) {
      this.startFadingText = true;
    }

    if (this.startFadingText === true && this.texts[this.texts.length-1].alpha > 0) {
      this.texts.forEach((text) => text.alpha -= 0.01);
    }

    this.renderer.render(this.stage);
    window.requestAnimationFrame(this.animate.bind(this));
  }

  componentDidMount() {
    this.setup();
  }

  componentWillReceiveProps(props) {
    if (this.props.canvas.height != props.canvas.height ||
       this.props.canvas.width != props.canvas.width)
      this.resizeView(props.canvas.width, props.canvas.height);
  }

  resizeView(width, height) {
    this.renderer.view.style.width = width;
    this.renderer.view.style.height = height;
  }

  render() {
    return (
      <div ref="view" />
    );
  }
};
