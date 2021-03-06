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
import ProgressiveImage from 'react-progressive-image';

import MapSVG from './MapSVG.js';

class Node extends Component {
  render() {
    // Apply translation transformations with offset
    const translateStyle = {
      transform: `translate(${this.props.left + this.props.offsetX}px, ${this.props.top + this.props.offsetY}px) scale(${this.props.scale ? this.props.scale : 1}, ${this.props.scale ? this.props.scale : 1})`,
      zIndex: this.props.z == null ? 0 : this.props.z,
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
            <ProgressiveImage src={this.props.imgpath} placeholder="/images/placeholder.svg">
              {src => <img style={{width: this.props.scaleDown ? '70%' : '100%'}} className={this.props.type == 'team' ? 'node-img-team' : 'node-img-player'} src={src} />}
            </ProgressiveImage>
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
    console.log(this.props.changeMap);

    // Populate list of nodes representing each team
    let teamElements = [];
    for (let key in TEAM_LOC_MAP) {
      let teamObj = TEAM_LOC_MAP[key];

      // Check if current year is within team range
      if (teamObj['range'] != undefined && (this.props.year < teamObj['range'][0] || this.props.year > teamObj['range'][1])) continue;

      let stateElem, xFrac, yFrac;
      if (teamObj['alias'] != undefined) {
        let alias = teamObj['alias'];
        stateElem = document.getElementById(TEAM_LOC_MAP[alias]['svg-id']);
        [xFrac, yFrac] = [TEAM_LOC_MAP[alias]['offset-x'], TEAM_LOC_MAP[alias]['offset-y']]
      } else {
        stateElem = document.getElementById(teamObj['svg-id']);
        [xFrac, yFrac] = [teamObj['offset-x'], teamObj['offset-y']];
      }

      if (stateElem == null) break;

      let rect = stateElem.getBoundingClientRect();
      let imgPath = `/images/logos/${key}.`;
      imgPath += teamObj['img-type'] == undefined ? 'svg' : teamObj['img-type'];

      let offsetX = xFrac == null ? 0 : xFrac * rect.width;
      let offsetY = yFrac == null ? 0 : yFrac * rect.height;

      teamElements.push((
        <CSSTransition
          key={key}
          timeout={500}
          classNames="node">
          <Node id={key}
            active={false}
            animActive={this.props.animActive}
            topLabel={key}
            type='team'
            key={key}
            top={rect.top}
            left={rect.left}
            offsetX={offsetX}
            offsetY={offsetY}
            imgpath={imgPath}
            scaleDown={teamObj['img-type'] != undefined} />
        </CSSTransition>));
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
        let teamObj = TEAM_LOC_MAP[player.team];

        // If team not found, skip player
        if (teamObj == null) continue;

        let stateElem, xFrac, yFrac;
        if (teamObj['alias'] != undefined) {
          let alias = teamObj['alias'];
          stateElem = document.getElementById(TEAM_LOC_MAP[alias]['svg-id']);
          [xFrac, yFrac] = [TEAM_LOC_MAP[alias]['offset-x'], TEAM_LOC_MAP[alias]['offset-y']]
        } else {
          stateElem = document.getElementById(teamObj['svg-id']);
          [xFrac, yFrac] = [teamObj['offset-x'], teamObj['offset-y']];
        }

        if (stateElem == null) break;

        // Compute next top and left values
        let rect = stateElem.getBoundingClientRect();
        let [topVal, leftVal] = [rect.top, rect.left];

        // Compute next offset values
        let [offsetXVal, offsetYVal] = [xFrac == null ? 0 : xFrac * rect.width, yFrac == null ? 0 : yFrac * rect.height];

        // Push new player node with corresponding headshot image
        let imgPath = `/headshots/${key}.jpg`;
        let changeActive = key in this.props.changeMap && this.props.animActive;
        playerElements.push((
          <CSSTransition
            key={key}
            timeout={500}
            classNames="node">
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
        <TransitionGroup>
          {teamElements}
        </TransitionGroup>
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
        <a className="selector-btn selector-btn-left" onClick={this.props.onYearChanged.bind(this, -1)}><img className="selector-btn-img" src="/images/left-arrow.svg" /></a>
        <div className="year-label">
          <div>{this.props.year}</div>
        </div>
        <a className="selector-btn selector-btn-right" onClick={this.props.onYearChanged.bind(this, 1)}><img className="selector-btn-img" src="/images/right-arrow.svg" /></a>
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
    axios.get('/players/all')
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
      let changeOccured = Object.keys(changeMap).length > 0;
      this.setState(state => ({
        year: tempYear,
        prevYear: state.year,
        playerOrder: playerOrder,
        changeMap: changeMap,
        animActive: changeOccured ? true : false
      }));

      // Set animActive to false after animation time has elapsed
      if (changeOccured) {
        this.timerID = setTimeout(() => {
          this.setState({
            animActive: false
          });
        }, 4000);
      }
    }
  }

  render() {
    return (
      <div className="container">
        <div className="title-container">
          <div className="title-header">NBA Player Map</div>
          <div className="title-subheader">Made by Sanketh Hegde &copy; 2019</div>
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
