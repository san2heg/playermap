const TEAM_LOC_MAP = {
  'ATL': {
    'svg-id': 'US-GA',
    'offset-x': 0.3,
    'offset-y': 0.1
  },
  'BRK': {
    'svg-id': 'US-NY',
    'offset-x': 0.1,
    'offset-y': 0.4,
    'range': [2013, 9999]
  },
  'BOS': {
    'svg-id': 'US-MA',
    'offset-y': 0.4,
    'offset-x': 0.2
  },
  'CHO': {
    'svg-id': 'US-NC',
    'offset-x': 0.5,
    'offset-y': 0.1,
    'range': [2015, 9999]
  },
  'CHI': {
    'svg-id': 'US-IL',
    'offset-x': 0.7
  },
  'CLE': {
    'svg-id': 'US-OH',
    'offset-x': 0.6,
    'offset-y': 0.1
  },
  'DAL': {
    'svg-id': 'US-TX',
    'offset-x': 0.7,
    'offset-y': 0.25
  },
  'DEN': {
    'svg-id': 'US-CO',
    'offset-x': 0.7,
    'offset-y': 0.2
  },
  'DET': {
    'svg-id': 'US-MI',
    'offset-x': 0.8,
    'offset-y': 0.4
  },
  'GSW': {
    'svg-id': 'US-CA',
    'offset-x': 0.2,
    'offset-y': 0.4
  },
  'HOU': {
    'svg-id': 'US-TX',
    'offset-x': 0.9,
    'offset-y': 0.5
  },
  'IND': {
    'svg-id': 'US-IN',
    'offset-x': 0.4,
    'offset-y': 0.5
  },
  'LAC': {
    'svg-id': 'US-CA',
    'offset-x': 0.8,
    'offset-y': 0.6,
    'range': [1985, 9999]
  },
  'LAL': {
    'svg-id': 'US-CA',
    'offset-x': 0.4,
    'offset-y': 0.7
  },
  'MEM': {
    'svg-id': 'US-TN',
    'offset-x': 0.2,
    'range': [2002, 9999]
  },
  'MIA': {
    'svg-id': 'US-FL',
    'offset-x': 0.9,
    'offset-y': 0.5
  },
  'MIL': {
    'svg-id': 'US-WI',
    'offset-x': 0.7,
    'offset-y': 0.3
  },
  'MIN': {
    'svg-id': 'US-MN',
    'offset-x': 0.5,
    'offset-y': 0.6
  },
  'NOP': {
    'svg-id': 'US-LA',
    'offset-x': 0.7,
    'offset-y': 0.5,
    'range': [2014, 2019]
  },
  'NYK': {
    'svg-id': 'US-NY',
    'offset-x': 0.6,
    'offset-y': -0.1
  },
  'OKC': {
    'svg-id': 'US-OK',
    'offset-x': 0.7,
    'offset-y': 0.1,
    'range': [2009, 9999]
  },
  'ORL': {
    'svg-id': 'US-FL',
    'offset-x': 0.7
  },
  'PHI': {
    'svg-id': 'US-PA',
    'offset-x': 0.7,
    'offset-y': 0
  },
  'PHO': {
    'svg-id': 'US-AZ',
    'offset-x': 0.5,
    'offset-y': 0.3
  },
  'POR': {
    'svg-id': 'US-OR',
    'offset-x': 0.4,
    'offset-y': 0.2
  },
  'SAC': {
    'svg-id': 'US-CA',
    'offset-x': 0.4,
    'offset-y': 0.2,
    'range': [1986, 9999]
  },
  'SAS': {
    'svg-id': 'US-TX',
    'offset-x': 0.6,
    'offset-y': 0.6
  },
  'TOR': {
    'svg-id': 'CA-ON',
    'offset-x': 0.75,
    'offset-y': 0.2
  },
  'UTA': {
    'svg-id': 'US-UT',
    'offset-x': 0.6,
    'offset-y': 0.3
  },
  'WAS': {
    'svg-id': 'US-VA',
    'offset-x': 0.7,
    'offset-y': -0.1,
    'range': [1998, 9999]
  },
  'WSB': {
    'alias': 'WAS',
    'range': [1975, 1997],
    'img-type': 'png'
  },
  'CAP': {
    'alias': 'WAS',
    'range': [1974, 1974],
    'img-type': 'png'
  },
  'NJN': {
    'svg-id': 'US-NJ',
    'offset-x': 0.9,
    'offset-y': 0.5,
    'range': [1978, 2012],
    'img-type': 'png'
  },
  'SEA': {
    'svg-id': 'US-WA',
    'offset-x': 0.2,
    'range': [1968, 2008],
    'img-type': 'gif'
  },
  'BUF': {
    'alias': 'LAC',
    'range': [1971, 1978],
    'img-type': 'gif'
  },
  'CHA': {
    'alias': 'CHO',
    'range': [2005, 2014],
    'img-type': 'gif'
  },
  'VAN': {
    'svg-id': 'US-WA',
    'offset-x': 0.7,
    'offset-y': -0.1,
    'range': [1996, 2001],
    'img-type': 'gif'
  },
  'CHH': {
    'alias': 'CHO',
    'range': [1989, 2002],
    'img-type': 'png'
  },
  'NOH': {
    'alias': 'NOP',
    'range': [2003, 2013],
    'img-type': 'gif'
  },
  'NOJ': {
    'alias': 'NOP',
    'range': [1975, 1979]
  },
  'NOK': {
    'alias': 'NOP',
    'range': [2006, 2007],
    'img-type': 'gif'
  },
  'KCO': {
    'svg-id': 'US-KS',
    'offset-x': 0.4,
    'offset-y': 0.2,
    'range': [1973, 1975],
    'img-type': 'png'
  },
  'KCK': {
    'alias': 'KCO',
    'range': [1976, 1985],
    'img-type': 'png'
  },
  'SDC': {
    'svg-id': 'US-CA',
    'offset-x': 0.6,
    'offset-y': 0.4,
    'range': [1979, 1984],
    'img-type': 'gif'
  }
};

export default TEAM_LOC_MAP;
