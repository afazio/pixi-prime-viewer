import React from 'react';
import Pixi from 'pixi.js';

export default class PrimeViewer extends React.Component {
  setup() {
    const {width, height} = this.props.canvas;
    const renderer = Pixi.autoDetectRenderer(width, height);
    this.refs.view.appendChild(renderer.view);
  }

  componentDidMount() {
    this.setup();
  }

  render() {
    return (
      <div ref="view" />
    );
  }
};
