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
      for (let key in this.players[this.props.year]) {
        let player = this.players[this.props.year][key];
        if (TEAM_LOC_MAP[player.team] == null) continue;

        let stateElem = document.getElementById(TEAM_LOC_MAP[player.team]['svg-id']);
        if (stateElem == null) {
          break;
        }
        let rect = stateElem.getBoundingClientRect();
        let imgPath = `http://localhost:5000/headshots/${key}.jpg`;

        let [xFrac, yFrac] = [TEAM_LOC_MAP[player.team]['offset-x'], TEAM_LOC_MAP[player.team]['offset-y']];

        let offsetX = xFrac == null ? 0 : xFrac * rect.width;
        let offsetY = yFrac == null ? 0 : yFrac * rect.height;

        playerElements.push(<Node type='player' key={key} top={rect.top} left={rect.left} offsetX={offsetX} offsetY={offsetY} imgpath={imgPath} />);
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
    this.state = {'year': this.currYear};
    this.adjustYear = this.adjustYear.bind(this);
  }

  // Adjust year with offset value
  adjustYear(offset) {
    let tempYear = this.state.year + offset;
    if (tempYear >= 1974 && tempYear <= this.currYear) {
      this.setState(state => ({
        'year': tempYear
      }));
    }
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
