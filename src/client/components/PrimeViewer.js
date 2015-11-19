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
    this.range = this.range || Immutable.Range(1, Infinity);
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

      if (this.numToShowPerSecond < 1e3)
        this.numToShowPerSecond = this.numToShowPerSecond / 0.9;
    }

    return result;
  }

  setup() {
    const {width, height} = this.props.canvas;
    this.renderer = Pixi.autoDetectRenderer(width, height);
    this.refs.view.appendChild(this.renderer.view);

    this.stage = new Pixi.Container();

    this.numberContainer = new Pixi.Container();
    this.stage.addChild(this.numberContainer);

    this.graphics = new Pixi.Graphics();
    this.stage.addChild(this.graphics);

    this.x = this.props.canvas.width / 2.0;
    this.y = this.props.canvas.height / 2.0;

    window.requestAnimationFrame(this.animate.bind(this));
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

  drawNumber(number, color, x, y, size) {
    this.graphics.beginFill(color, 1);
    this.graphics.drawRect(x, y, size * 3000, size);
  }

  drawNext(number) {
    const color = this.isPrime(number) ? 0x0000FF : 0x000000;
    this.drawNumber(number, color, 0, 25 * number, 25);
  }

  animate() {
    const time = new Date();
    const numbersToShow = this.next(this.numbersToShowSinceLast(time));

    this.graphicsScale = (this.graphicsScale || 1.0) * 0.998;
    this.graphics.scale.set(this.graphicsScale);
    //this.graphics.rotation += 0.00001

    numbersToShow.forEach(this.drawNext.bind(this));

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
