import React, { Component } from 'react';
import logo from './logo.svg';
import TEAM_LOC_MAP from './teamLocMap.js';
import './normalize.css';
import './App.css';

import MapSVG from './MapSVG.js';

class Node extends Component {
  render() {
    const style = {
      transform: `translate(${this.props.left}px, ${this.props.top}px)`
    };

    return (
      <div style={style} className="node">
        <img className="node-img" src={this.props.imgpath} />
      </div>
    );
  }
}

class Map extends Component {
  constructor(props) {
    super(props);
    this.onResize = this.onResize.bind(this);
  }

  componentDidMount() {
    this.setState({state: this.state});
    window.addEventListener('resize', this.onResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  }

  onResize() {
    this.setState({state: this.state});
  }

  render() {
    let teamElements = [];
    for (let key in TEAM_LOC_MAP) {
      let stateElem = document.getElementById(TEAM_LOC_MAP[key]['svg-id']);
      if (stateElem == null) {
        break;
      }
      let rect = stateElem.getBoundingClientRect();
      let imgPath = `/images/logos/${key}.svg`;

      teamElements.push(<Node key={imgPath} top={rect.top} left={rect.left} imgpath={imgPath} />);
    }

    return (
      <div className="map-container">
        <MapSVG />
        {teamElements}
      </div>
    );
  }
}

class YearSelector extends Component {
  render() {
    return (
      <div className="selector">
        <button type="button" onClick={this.props.onYearChanged.bind(this, -1)}>&#8592;</button>
        <div className="year-label">
          <div>{this.props.year}</div>
        </div>
        <button type="button" onClick={this.props.onYearChanged.bind(this, 1)}>&#8594;</button>
      </div>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {'year': new Date().getFullYear()};
    this.adjustYear = this.adjustYear.bind(this);
  }

  adjustYear(offset) {
    this.setState(state => ({
      'year': state.year + offset
    }));
  }

  render() {
    return (
      <div className="container">
        <div className="title-container">
          <h1>NBA Player Map</h1>
        </div>
        <Map year={this.state.year}/>
        <div className="select-container">
          <YearSelector year={this.state.year} onYearChanged={this.adjustYear}/>
        </div>
      </div>
    );
  }
}

export default App;
