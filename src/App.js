import React, { Component } from 'react';
import logo from './logo.svg';
import TEAM_LOC_MAP from './teamLocMap.js';
import EasingFunctions from './easing.js';
import './normalize.css';
import './App.css';
import axios from 'axios';
import {
  CSSTransition,
  TransitionGroup,
} from 'react-transition-group';

import MapSVG from './MapSVG.js';

class Node extends Component {
  render() {
    // Apply translation transformations with offset
    const translateStyle = {
      transform: `translate(${this.props.left + this.props.offsetX}px, ${this.props.top + this.props.offsetY}px) scale(${this.props.scale ? this.props.scale : 1}, ${this.props.scale ? this.props.scale : 1})`,
      zIndex: this.props.z == null ? 0 : (this.props.active ? 999 : this.props.z),
    };

    const style = {
      borderColor: this.props.type == 'team' ? '#D3D3D3' : '#3895D3',
      opacity: this.props.type == 'player' ? (this.props.animActive ? (this.props.active ? 1 : 0) : 1) : 1
    };

    const classNames = this.props.active ? "node active" : "node";

    const topLabelStyle = {
      backgroundColor: this.props.type == 'team' ? 'darkgray' : '#e88a1a',
      opacity: this.props.animActive ? (this.props.active ? 1 : 0) : 1
    }

    return (
      <div id={this.props.id} style={translateStyle} className={classNames}>
        {this.props.topLabel && <div style={topLabelStyle} className="node-toplabel">{this.props.topLabel}</div>}
        {this.props.bottomLabel && <div className="node-bottomlabel">{this.props.bottomLabel}</div>}
        <div style={style} className="node-style">
          <div className="node-img-crop">
            <img className="node-img" src={this.props.imgpath} />
          </div>
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
    console.log(`${this.props.prevYear} => ${this.props.year} - animating: ${this.props.animActive}`);

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

      teamElements.push((<Node id={key}
                            animActive={this.props.animActive}
                            topLabel={key}
                            type='team'
                            key={key}
                            top={rect.top}
                            left={rect.left}
                            offsetX={offsetX}
                            offsetY={offsetY}
                            imgpath={imgPath} />));
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
        let changeActive = key in this.props.changeMap && this.props.animActive;
        playerElements.push((
          <CSSTransition
            key={key}
            timeout={500}
            classNames="player">
            <Node
              id={key}
              active={changeActive}
              animActive={this.props.animActive}
              topLabel={changeActive ? `${this.props.changeMap[key].old} ${String.fromCharCode(10142)} ${this.props.changeMap[key].new}` : null}
              bottomLabel={player.fullname}
              z={50 - player.rank}
              type='player'
              key={key}
              top={topVal}
              left={leftVal}
              offsetX={offsetXVal}
              offsetY={offsetYVal}
              imgpath={imgPath} />
          </CSSTransition>
        ))
      }
    }

    return (
      <div id="mapc" className="map-container">
        {mapContainer && <MapSVG height={mapHeight} width={mapWidth} hasRendered={this.reRender}/>}
        {teamElements}
        <TransitionGroup>
          {playerElements}
        </TransitionGroup>
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
    this.state = {year: this.currYear, prevYear: this.currYear, playerOrder: null, changeMap: null, animActive: false};

    // Fetch player rankings and update state
    axios.get('http://localhost:5000/players/all')
      .then(res => {
        this.players = res.data;
        this.rankingsLength = Object.keys(this.players['1974']).length;
        this.setState(state => ({
          playerOrder: Object.keys(this.players[state.year]),
          changeMap: {}
        }));
      });

    // Initialize timer ID for animation
    this.timerID = null;

    this.adjustYear = this.adjustYear.bind(this);
  }

  // Match player orderings to ensure functioning CSS transitions
  nextPlayerOrder(prevOrder, nextOrder, prevPlayers, nextPlayers) {
    let orderedPlayers = [];
    let overlapList = [];
    let changeMap = {};
    for (let key of prevOrder) {
      if (key in nextPlayers) {
        orderedPlayers.push(key);
        overlapList.push(key);
        if (prevPlayers[key].team != nextPlayers[key].team) {
          changeMap[key] = {old: prevPlayers[key].team, new: nextPlayers[key].team};
        }
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

    return [orderedPlayers, changeMap];
  }

  // Adjust year with offset value
  adjustYear(offset) {
    let tempYear = this.state.year + offset;
    if (tempYear >= 1974 && tempYear <= this.currYear && this.players != null) {
      // Clear existing animation timer if one exists
      if (this.timerID != null) {
        clearTimeout(this.timerID);
      }

      // Set next state
      let [playerOrder, changeMap] = this.nextPlayerOrder(this.state.playerOrder, Object.keys(this.players[tempYear]), this.players[this.state.year], this.players[tempYear]);
      this.setState(state => ({
        year: tempYear,
        prevYear: state.year,
        playerOrder: playerOrder,
        changeMap: changeMap,
        animActive: true
      }));

      // Set animActive to false after animation time has elapsed
      this.timerID = setTimeout(() => {
        this.setState({
          animActive: false
        });
      }, 4000);
    }
  }

  render() {
    return (
      <div className="container">
        <div className="title-container">
          <h1>NBA Player Map</h1>
        </div>
        <Map animActive={this.state.animActive} changeMap={this.state.changeMap} year={this.state.year} prevYear={this.state.prevYear} playerOrder={this.state.playerOrder} players={this.players == null ? null : this.players[this.state.year]} />
        <div className="select-container">
          <YearSelector year={this.state.year} onYearChanged={this.adjustYear}/>
        </div>
      </div>
    );
  }
}

export default App;
