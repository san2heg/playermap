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
    let translateStr = `translate(${this.props.left + this.props.offsetX}px, ${this.props.top + this.props.offsetY}px)`;
    const style = {
      transform: `translate(${this.props.left + this.props.offsetX}px, ${this.props.top + this.props.offsetY}px) scale(${this.props.scale ? this.props.scale : 1}, ${this.props.scale ? this.props.scale : 1})`,
      borderColor: this.props.type == 'team' ? 'darkgray' : '#3895D3',
      opacity: this.props.opacity,
      zIndex: this.props.z == null ? 0 : this.props.z
    };

    return (
      <div style={style} className="node">
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

    // Fetch player rankings
    axios.get('http://localhost:5000/players/all')
      .then(res => {
        this.players = res.data;
        this.rankingsLength = Object.keys(this.players['1974']).length;
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
    // console.log(`${this.props.prevYear} => ${this.props.year} - ${this.props.percentComplete}`);
    // Ease percent complete
    let easedPercent = EasingFunctions.easeInOutQuad(this.props.percentComplete);

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

      teamElements.push(<Node topLabel={key} type='team' key={key} top={rect.top} left={rect.left} offsetX={offsetX} offsetY={offsetY} imgpath={imgPath} />);
    }

    // Dynamically adjust height and position of map
    let mapContainer = document.getElementById('mapc');
    let mapHeight = mapContainer == null ? 0 : mapContainer.offsetHeight;
    let mapWidth = mapContainer == null ? 0 : mapContainer.offsetWidth;

    // Populate list of nodes representing players in animated positions
    let playerElements = [];
    if (this.players != null) {
      let prevYearPlayers = this.players[this.props.prevYear];
      let nextYearPlayers = this.players[this.props.year];
      for (let key in nextYearPlayers) {
        let prevPlayer = prevYearPlayers[key]; // null if player is not in prev year rankings
        let nextPlayer = nextYearPlayers[key];
        let teamsChanged = prevPlayer == null ? false : prevPlayer.team != nextPlayer.team;

        if (TEAM_LOC_MAP[nextPlayer.team] == null) continue;

        let nextStateElem = document.getElementById(TEAM_LOC_MAP[nextPlayer.team]['svg-id']);
        let prevStateElem = prevPlayer == null ? nextStateElem : document.getElementById(TEAM_LOC_MAP[prevPlayer.team]['svg-id']);

        if (prevStateElem == null || nextStateElem == null) {
          break;
        }
        let prevRect = prevStateElem.getBoundingClientRect();
        let nextRect = nextStateElem.getBoundingClientRect();

        let topVal = prevRect.top + easedPercent * (nextRect.top - prevRect.top);
        let leftVal = prevRect.left + easedPercent * (nextRect.left - prevRect.left);

        let [nextXFrac, nextYFrac] = [TEAM_LOC_MAP[nextPlayer.team]['offset-x'], TEAM_LOC_MAP[nextPlayer.team]['offset-y']];
        let nextOffsetX = nextXFrac == null ? 0 : nextXFrac * nextRect.width;
        let nextOffsetY = nextYFrac == null ? 0 : nextYFrac * nextRect.height;
        let [prevXFrac, prevYFrac] = prevPlayer == null ? [nextXFrac, nextYFrac] : [TEAM_LOC_MAP[prevPlayer.team]['offset-x'], TEAM_LOC_MAP[prevPlayer.team]['offset-y']];
        let prevOffsetX = prevXFrac == null ? 0 : prevXFrac * prevRect.width;
        let prevOffsetY = prevYFrac == null ? 0 : prevYFrac * prevRect.height;

        let offsetXVal = prevOffsetX + easedPercent * (nextOffsetX - prevOffsetX);
        let offsetYVal = prevOffsetY + easedPercent * (nextOffsetY - prevOffsetY);

        let opacityVal = prevPlayer != null ? 1 : this.props.percentComplete * 1.0;

        let bottomLabelOpacityVal = !teamsChanged ? 0 : -1*(2*this.props.percentComplete-1)*(2*this.props.percentComplete-1)+1;
        let scaleVal = !teamsChanged ? 1 : -0.5*(2*this.props.percentComplete-1)*(2*this.props.percentComplete-1)+1.5;

        let imgPath = `http://localhost:5000/headshots/${key}.jpg`;
        playerElements.push(<Node scale={scaleVal} bottomLabelOpacity={bottomLabelOpacityVal} bottomLabel={nextPlayer.fullname} z={this.rankingsLength - nextPlayer.rank} opacity={opacityVal} type='player' key={key} top={topVal} left={leftVal} offsetX={offsetXVal} offsetY={offsetYVal} imgpath={imgPath} />);
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
      }), () => this.animate());
    }
  }

  // Animate one frame and use rAF to start the next frame until completion
  animate() {
    if (this.state.percentComplete >= 1) {
      this.setState({
        percentComplete: 1
      });
      cancelAnimationFrame(this.request);
      return;
    }
    this.request = requestAnimationFrame(this.animate);
    this.setState(state => ({
      percentComplete: state.percentComplete + 0.003
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
