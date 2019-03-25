import React, { Component } from 'react';
import logo from './logo.svg';
import TEAM_LOC_MAP from './teamLocMap.js';
import './normalize.css';
import './App.css';
import axios from 'axios';

import MapSVG from './MapSVG.js';

class Node extends Component {
  render() {
    // Apply translation transformations with offset
    let translateStr = `translate(${this.props.left + this.props.offsetX}px, ${this.props.top + this.props.offsetY}px)`;
    const style = {
      transform: `translate(${this.props.left + this.props.offsetX}px, ${this.props.top + this.props.offsetY}px)`,
      borderColor: this.props.type == 'team' ? 'darkgray' : '#3895D3',
      overflow: this.props.type == 'team' ? 'visible' : 'hidden'
    };

    return (
      <div style={style} className="node">
        {this.props.label && <div className="node-label">{this.props.label}</div>}
        <img className="node-img" src={this.props.imgpath} />
      </div>
    );
  }
}

class Map extends Component {
  constructor(props) {
    super(props);
    this.reRender = this.reRender.bind(this);

    // Fetch player rankings
    axios.get('http://localhost:5000/players/all')
      .then(res => {
        this.players = res.data;
        this.reRender();
      });
  }

  componentDidMount() {
    this.setState({state: this.state});
    window.addEventListener('resize', this.reRender);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.reRender);
  }

  reRender() {
    this.setState({state: this.state});
  }

  // Render three times:
  // 1. map-container
  // 2. MapSVG
  // 3. Nodes
  render() {
    console.log(`${this.props.prevYear} => ${this.props.year} - ${this.props.percentComplete}`);
    // Populate list of nodes representing each team
    let teamElements = [];
    for (let key in TEAM_LOC_MAP) {
      let stateElem = document.getElementById(TEAM_LOC_MAP[key]['svg-id']);
      if (stateElem == null) {
        break;
      }
      let rect = stateElem.getBoundingClientRect();
      let imgPath = `/images/logos/${key}.svg`;

      let [xFrac, yFrac] = [TEAM_LOC_MAP[key]['offset-x'], TEAM_LOC_MAP[key]['offset-y']];

      let offsetX = xFrac == null ? 0 : xFrac * rect.width;
      let offsetY = yFrac == null ? 0 : yFrac * rect.height;

      teamElements.push(<Node label={key} type='team' key={key} top={rect.top} left={rect.left} offsetX={offsetX} offsetY={offsetY} imgpath={imgPath} />);
    }

    // Dynamically adjust height and position of map
    let mapContainer = document.getElementById('mapc');
    let mapHeight = mapContainer == null ? 0 : mapContainer.offsetHeight;
    let mapWidth = mapContainer == null ? 0 : mapContainer.offsetWidth;

    // Populate list of nodes representing players
    let playerElements = [];
    if (this.players != null) {
      let prevYearPlayers = this.players[this.props.prevYear];
      let nextYearPlayers = this.players[this.props.year];
      for (let key in nextYearPlayers) {
        let prevPlayer = prevYearPlayers[key]; // null if player is not in next year rankings
        let nextPlayer = nextYearPlayers[key];

        if (TEAM_LOC_MAP[nextPlayer.team] == null) continue;

        let nextStateElem = document.getElementById(TEAM_LOC_MAP[nextPlayer.team]['svg-id']);
        let prevStateElem = prevPlayer == null ? nextStateElem : document.getElementById(TEAM_LOC_MAP[prevPlayer.team]['svg-id']);

        if (prevStateElem == null || nextStateElem == null) {
          break;
        }
        let prevRect = prevStateElem.getBoundingClientRect();
        let nextRect = nextStateElem.getBoundingClientRect();

        let topVal = prevRect.top + this.props.percentComplete * (nextRect.top - prevRect.top);
        let leftVal = prevRect.left + this.props.percentComplete * (nextRect.left - prevRect.left);

        let [nextXFrac, nextYFrac] = [TEAM_LOC_MAP[nextPlayer.team]['offset-x'], TEAM_LOC_MAP[nextPlayer.team]['offset-y']];
        let nextOffsetX = nextXFrac == null ? 0 : nextXFrac * nextRect.width;
        let nextOffsetY = nextYFrac == null ? 0 : nextYFrac * nextRect.height;
        let [prevXFrac, prevYFrac] = prevPlayer == null ? [nextXFrac, nextYFrac] : [TEAM_LOC_MAP[prevPlayer.team]['offset-x'], TEAM_LOC_MAP[prevPlayer.team]['offset-y']];
        let prevOffsetX = prevXFrac == null ? 0 : prevXFrac * prevRect.width;
        let prevOffsetY = prevYFrac == null ? 0 : prevYFrac * prevRect.height;

        let offsetXVal = prevOffsetX + this.props.percentComplete * (nextOffsetX - prevOffsetX);
        let offsetYVal = prevOffsetY + this.props.percentComplete * (nextOffsetY - prevOffsetY);

        let imgPath = `http://localhost:5000/headshots/${key}.jpg`;
        playerElements.push(<Node type='player' key={key} top={topVal} left={leftVal} offsetX={offsetXVal} offsetY={offsetYVal} imgpath={imgPath} />);
      }
    }

    return (
      <div id="mapc" className="map-container">
        {mapContainer && <MapSVG height={mapHeight} width={mapWidth} hasRendered={this.reRender}/>}
        {teamElements}
        {playerElements}
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
    this.currYear = new Date().getFullYear();
    this.state = {prevYear: this.currYear, year: this.currYear, percentComplete: 1.0};
    this.timerIDs = [];

    this.adjustYear = this.adjustYear.bind(this);
    this.animate = this.animate.bind(this);
  }

  // Adjust year with offset value
  adjustYear(offset) {
    let tempYear = this.state.year + offset;
    if (tempYear >= 1974 && tempYear <= this.currYear) {
      this.setState(state => ({
        year: tempYear,
        prevYear: state.year,
        percentComplete: 0
      }));
      this.timerIDs.push(setInterval(this.animate, 1));
    }
  }

  // Maintain animation state
  animate() {
    if (this.state.percentComplete >= 1) {
      this.setState({
        percentComplete: 1
      });
      clearInterval(this.timerIDs.pop());
      return;
    }
    this.setState(state => ({
      percentComplete: state.percentComplete + 0.005
    }));
  }

  render() {
    return (
      <div className="container">
        <div className="title-container">
          <h1>NBA Player Map</h1>
        </div>
        <Map year={this.state.year} year={this.state.year} prevYear={this.state.prevYear} percentComplete={this.state.percentComplete} />
        <div className="select-container">
          <YearSelector year={this.state.year} onYearChanged={this.adjustYear}/>
        </div>
      </div>
    );
  }
}

export default App;
