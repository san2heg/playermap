import React, { Component } from 'react';
import logo from './logo.svg';
import TEAM_LOC_MAP from './teamLocMap.js';
import EasingFunctions from './easing.js';
import './normalize.css';
import './App.css';
import axios from 'axios';

import MapSVG from './MapSVG.js';

class Node extends Component {
  render() {
    // Apply translation transformations with offset
    const style = {
      transform: `translate(${this.props.left + this.props.offsetX}px, ${this.props.top + this.props.offsetY}px) scale(${this.props.scale ? this.props.scale : 1}, ${this.props.scale ? this.props.scale : 1})`,
      borderColor: this.props.type == 'team' ? 'darkgray' : '#3895D3',
      opacity: this.props.opacity,
      zIndex: this.props.z == null ? 0 : this.props.z
    };

    return (
      <div id={this.props.id} style={style} className="node">
        {this.props.topLabel && <div className="node-toplabel">{this.props.topLabel}</div>}
        {this.props.bottomLabel && <div style={{opacity: this.props.bottomLabelOpacity}} className="node-bottomlabel">{this.props.bottomLabel}</div>}
        <div className="node-img-crop">
          <img className="node-img" src={this.props.imgpath} />
        </div>
      </div>
    );
  }
}

class Map extends Component {
  constructor(props) {
    super(props);
    this.reRender = this.reRender.bind(this);
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
    console.log(`${this.props.prevYear} => ${this.props.year}`);

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

      teamElements.push(<Node id={key} topLabel={key} type='team' key={key} top={rect.top} left={rect.left} offsetX={offsetX} offsetY={offsetY} imgpath={imgPath} />);
    }

    // Dynamically adjust height and position of map
    let mapContainer = document.getElementById('mapc');
    let mapHeight = mapContainer == null ? 0 : mapContainer.offsetHeight;
    let mapWidth = mapContainer == null ? 0 : mapContainer.offsetWidth;

    // Populate list of nodes representing players in animated positions
    let playerElements = [];
    if (this.props.players != null) {
      for (let key of this.props.playerOrder) {
        let player = this.props.players[key];

        // If team not found, skip player
        if (TEAM_LOC_MAP[player.team] == null) continue;

        let stateElem = document.getElementById(TEAM_LOC_MAP[player.team]['svg-id']);
        if (stateElem == null) break;

        // Compute next top and left values
        let rect = stateElem.getBoundingClientRect();
        let [topVal, leftVal] = [rect.top, rect.left];

        // Compute next offset values
        let [xFrac, yFrac] = [TEAM_LOC_MAP[player.team]['offset-x'], TEAM_LOC_MAP[player.team]['offset-y']];
        let [offsetXVal, offsetYVal] = [xFrac == null ? 0 : xFrac * rect.width, yFrac == null ? 0 : yFrac * rect.height];

        // Push new player node with corresponding headshot image
        let imgPath = `http://localhost:5000/headshots/${key}.jpg`;
        playerElements.push(<Node id={key} scale={1} bottomLabelOpacity={1} bottomLabel={player.fullname} z={this.rankingsLength - player.rank} opacity={1} type='player' key={key} top={topVal} left={leftVal} offsetX={offsetXVal} offsetY={offsetYVal} imgpath={imgPath} />)
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
    this.state = {year: this.currYear, prevYear: this.currYear, currPlayers: null};

    // Fetch player rankings and update state
    axios.get('http://localhost:5000/players/all')
      .then(res => {
        this.players = res.data;
        this.rankingsLength = Object.keys(this.players['1974']).length;
        this.setState(state => ({
          playerOrder: Object.keys(this.players[state.year]),
        }));
      });

    this.adjustYear = this.adjustYear.bind(this);
  }

  // Match player orderings to ensure functioning CSS transitions
  nextPlayerOrder(prevOrder, nextOrder, nextPlayers) {
    let orderedPlayers = [];
    let overlapList = [];
    for (let key of prevOrder) {
      if (key in nextPlayers) {
        orderedPlayers.push(key);
        overlapList.push(key);
      } else {
        orderedPlayers.push(null);
      }
    }

    let newPlayers = nextOrder.filter((e) => !overlapList.includes(e));

    for (let i=0; i < orderedPlayers.length; i++) {
      if (orderedPlayers[i] == null) {
        orderedPlayers[i] = newPlayers.pop();
      }
    }

    return orderedPlayers;
  }

  // Adjust year with offset value
  adjustYear(offset) {
    let tempYear = this.state.year + offset;
    if (tempYear >= 1974 && tempYear <= this.currYear && this.players != null) {
      this.setState(state => ({
        year: tempYear,
        prevYear: state.year,
        playerOrder: this.nextPlayerOrder(state.playerOrder, Object.keys(this.players[tempYear]), this.players[tempYear])
      }));
    }
  }

  render() {
    return (
      <div className="container">
        <div className="title-container">
          <h1>NBA Player Map</h1>
        </div>
        <Map year={this.state.year} prevYear={this.state.prevYear} playerOrder={this.state.playerOrder} players={this.players == null ? null : this.players[this.state.year]} />
        <div className="select-container">
          <YearSelector year={this.state.year} onYearChanged={this.adjustYear}/>
        </div>
      </div>
    );
  }
}

export default App;
