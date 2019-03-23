import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class Map extends Component {
  render() {
    return (
      <img id="map" src="images/us-canada-map.svg" />
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
        <div className="map-container">
          <Map year={this.state.year}/>
        </div>
        <div className="select-container">
          <YearSelector year={this.state.year} onYearChanged={this.adjustYear}/>
        </div>
      </div>
    );
  }
}

export default App;
