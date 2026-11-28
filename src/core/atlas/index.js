'use strict';

const constants = require('./atlas-constants');
const events = require('./atlas-events');
const economy = require('./atlas-economy');
const store = require('./atlas-store');
const engine = require('./atlas-engine');
const obstacles = require('./atlas-obstacles');
const narrative = require('./atlas-narrative');
const miro = require('./atlas-miro');
const skills = require('./atlas-skills');
const materials = require('./atlas-materials');
const map = require('./atlas-map');
const trials = require('./atlas-trials');
const rewards = require('./atlas-rewards');
const ai = require('./atlas-ai');

module.exports = {
  ...constants,
  ...events,
  ...economy,
  ...store,
  ...engine,
  ...obstacles,
  ...narrative,
  ...miro,
  ...skills,
  ...materials,
  ...map,
  ...trials,
  ...rewards,
  ...ai,
};
