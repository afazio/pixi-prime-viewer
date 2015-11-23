import React from 'react';
import Pixi from 'pixi.js';
import Immutable from 'immutable';

export default class PrimeViewer extends React.Component {

  static MAX_NUMBERS_TO_GENERATE = 1e6;

  constructor(props) {
    super(props)
    this.renderer = null;
  }

  componentDidMount() {
    // Setup initial state.
    this.setup();

    // When the user resizes the browser window, handle it
    window.addEventListener('resize', this.handleResizeEvent.bind(this));

    // Start animation!
    window.requestAnimationFrame(this.animate.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResizeEvent.bind(this));
  }

  componentWillReceiveProps(props) {
    // If the canvas props have changed then resize the view.
    if (this.props.canvas.height != props.canvas.height ||
       this.props.canvas.width != props.canvas.width)
      this.resizeView(props.canvas.width, props.canvas.height);
  }

  handleResizeEvent() {
    // The window has resized.  Let's shoot off the appropriate action to have the redux store
    // updated.
    this.props.changeCanvasSize(window.innerWidth, window.innerHeight);
  }

  resizeView(width, height) {
    this.renderer.view.style.width = width + 'px';
    this.renderer.view.style.height = height + 'px';
    this.renderer.resize(width, height);
  }

  // Is `n` prime?
  isPrime (n) {

    if (!isFinite(n) || // Is `n` infinite?
        isNaN(n) ||     // or Not a Number?
        n % 1 ||        // or a fraction of a whole number?
        n < 2) return false; // or less than two?  Then it's not prime...

    // Let's get these two out of the way to speed things up.
    if (n % 2 == 0) return n == 2;
    if (n % 3 == 0) return n == 3;

    // The max divisibility we need to try for is the square root of `n`.
    const max = Math.sqrt(n);

    // check divisibility from 5 to max, six at a time
    for (let i = 5; i <= max; i += 6) {
      if (n % i == 0)     return false;
      if (n % (i+2) == 0) return false;
    }

    // It wasn't divisible.  It's prime.
    return true;
  }

  // Setup initial state.  We don't use React or Redux state as that would re-render this
  // component upon state change.  Instead we just go with keeping traditional JS state.
  setup() {

    // Create the pixi renderer.
    const {width, height} = this.props.canvas;
    this.renderer = Pixi.autoDetectRenderer(width, height);
    this.refs.view.appendChild(this.renderer.view);

    // The stage is the root container
    this.stage = new Pixi.Container();

    // Container objects do not have an `anchor` property like Sprites do, so let's create a Sprite
    // object from an empty transparent Graphics object and use that as our container.  The neat
    // trick here is that a Sprite object has the same properties as a Container (has children).  So
    // we're misusing Sprite a bit, but only until Pixi provides an anchor on Containers :).
    let empty = new Pixi.Graphics()
    empty.beginFill(0xFFFFFF,0)
    empty.drawRect(0,0,1,1)
    empty.endFill()
    this.numberContainer = new Pixi.Sprite(empty.generateTexture(false));
    this.numberContainer.anchor.x = 0.5;
    this.numberContainer.anchor.y = 0.5;
    this.stage.addChild(this.numberContainer);

    // This is the graphics object we'll draw to
    this.graphics = new Pixi.Graphics();
    this.numberContainer.addChild(this.graphics);

    // Find the middle of the canvas.  `this.x` and `this.y` will be updated for drawing blocks
    this.x = this.props.canvas.width / 2.0;
    this.y = this.props.canvas.height / 2.0;

    this.numberContainer.x = this.x - 150;
    this.numberContainer.y = this.y - 100;

    // These are the variables used in drawing the spiral of blocks.  We need a direction to draw in
    // for the spiral (`this.UP`, etc.), how many blocks to draw in that direction (`this.max`), and
    // how many blocks we've drawn in that direction already (`this.current`).

    this.RIGHT = 0;  // Also serve as indices into `this.max`
    this.UP = 1;
    this.LEFT = 2;
    this.DOWN = 3;

    // maximum blocks we can draw in various directions (RIGHT, UP, ...);  These get updated.
    this.max = [1, 1, 2, 2];
    this.current = 0;

    // We start out going to the right in our spiral.
    this.direction = this.RIGHT;

    // The size (in pixels) of the blocks being drawn.
    this.numberSize = 50;

    // How much to alter the scale for zooming out.  This value gets updated later in `animate()`
    this.scaleAmount = 0.998

    // We draw text objects for `1`, `2`, etc. up to the first 20 numbers to let users know what's
    // going on.  We keep track of these text objects so that we can change their alpha later.
    this.texts = [];

    // That's it.  All of the initial state has been setup.
  }

  // A lazy sequence generator that returns the next `n` numbers from 1 onwards.
  next(count = 1) {
    this.range = this.range || Immutable.Range(1, PrimeViewer.MAX_NUMBERS_TO_GENERATE); // LazySeq
    const result = this.range.take(count); // take the first n numbers from this sequence
    this.range = this.range.skip(count); // keep the rest for next time.
    return result;
  }

  // How many blocks should we show since the last time we showed blocks?? Show exponentially more
  // blocks over time.
  numbersToShowSinceLast(time) {

    // Start out showing one block per second
    if (this.numToShowPerSecond === undefined)
      this.numToShowPerSecond = 1;

    // lastTime will track the last time blocks were rendered to the screen.
    if (this.lastTime === undefined) {
      this.lastTime = time;
      return 0;
    }

    // Calculate how often (in milliseconds) to show blocks and use this to figure out how many
    // blocks should be rendered from the last time blocks were rendered.  Could be none, could be a
    // lot.
    const howOften = 1000.0 / this.numToShowPerSecond;
    const result = Math.floor((time - this.lastTime) / howOften);

    // If we should render at least one block then update lastTime and change the number of blocks
    // to per second to increase the rate a bit.  Keep increasing the rate each time for an
    // exponential effect.
    if (result > 0) {
      this.lastTime = time;

      if (this.numToShowPerSecond < 1e5)
        this.numToShowPerSecond = this.numToShowPerSecond / 0.92;
    }

    return result;
  }

  // Draw the actual block to the screen.
  drawNumber(number, color, x, y, size) {
    this.graphics.beginFill(color, 1);
    this.graphics.drawRect(x, y, size, size);

    // The first 20 numbers get a text label.
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

  // Figure out *how* to draw this block: ie, what position (x, y), what direction to move in, and
  // what color to draw the block.
  drawNext(number) {
    const blackAndYellow = [0x000000, 0xFFE20B];
    const redAndBlue = [0xFF0000, 0x0000FF];
    const blueAndGreen = [0x0000FF, 0x00FF00];
    const greenAndYellow = [0x00FF00, 0xFFE20B];
    const whiteAndPurple = [0xFFFFFF, 0x551A8B];
    const theme = redAndBlue;

    // Draw this block
    const color = this.isPrime(number) ? theme[1] : theme[0];
    this.drawNumber(number, color, this.x, this.y, this.numberSize);

    // Have we drawn all the blocks for this direction?  If so go in the next direction.
    if (this.current == this.max[this.direction]) {
      this.current = 0;
      this.max[this.direction] += 2;
      this.direction = (this.direction + 1) % 4;
    }

    // Update x and y for next block
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

    // How fast to zoom out.  Increases very slowly over time
    this.graphicsScale = (this.graphicsScale || 1.0) * this.scaleAmount;
    
    if (this.graphicsScale < 0.05) 
      // We've gone as far as we want.  Start slowing down the zooming effect
      this.scaleAmount = Math.min(this.scaleAmount + 0.00001, 1);

    // Zoom out
    this.numberContainer.scale.set(this.graphicsScale);

    // Add a subtle rotation for more visual interest
    this.graphics.rotation += 0.0001

    // For each of the numbers to show, draw them!
    numbersToShow.forEach(this.drawNext.bind(this));

    // Fading the number texts is a sleek way of saying: see what these blocks represent?  Good, now
    // forget about all that and just enjoy the ride.  We'll start fading the number texts after the
    // first 8 have been draw.
    if (numbersToShow.size && numbersToShow.get(0) >= 8)
      this.startFadingText = true;
    if (this.startFadingText === true && this.texts[this.texts.length-1].alpha > 0)
      this.texts.forEach((text) => text.alpha -= 0.01);

    // Rinse and repeat
    this.renderer.render(this.stage);
    window.requestAnimationFrame(this.animate.bind(this));
  }

  render() {
    return (
      <div ref="view" />
    );
  }
};
