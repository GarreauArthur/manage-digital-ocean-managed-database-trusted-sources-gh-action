/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 450:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 848:
/***/ ((module) => {

module.exports = eval("require")("node-fetch");


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
const fetch = __nccwpck_require__(848);
const core = __nccwpck_require__(450);

async function getIpAddress() {

  const response = await fetch('https://api.ipify.org');
  if (!response.ok) {
    throw new Error("Couldn't get IP address");
  }
  return await response.text();

}

/**
 * Check if the Ip address is already in the trusted sources, if it does, it
 * returns its index, otherwise, the function returns -1;
 */
function findIpInRules(ipAddress, rules) {
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    if (rule.type === 'ip_addr' && rule.value === ipAddress) {
      console.log("IP address already inside");
      return i;
    }
  }
  return -1;
}

async function main() {

  core.setCommandEcho(true);

  // get inputs
  const DATABASE_ID = core.getInput("database_id");
  const DIGITALOCEAN_TOKEN = core.getInput("digitalocean_token")
  const ACTION = core.getInput('action')


  // get Ip address of the runner
  const runnerIpAddress = await getIpAddress();
  console.log(runnerIpAddress);


  // get the list of trusted sources
  const resp = await fetch(`https://api.digitalocean.com/v2/databases/${DATABASE_ID}/firewall`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DIGITALOCEAN_TOKEN}`,
    },
  });

  if (!resp.ok) {
    throw Error("Error while trying to get the list of trusted sources");
  }

  let firewallRules = (await resp.json()).rules;
  if (!firewallRules) {
    throw Error("Missing firewall rules");
  }


  // Checking if the IP is already in the trusted sources
  let indexOfIpInRules = findIpInRules(runnerIpAddress, firewallRules);

  if (indexOfIpInRules === -1 && ACTION === 'add') {

    firewallRules.push({
      type: 'ip_addr',
      value: runnerIpAddress,
    });

  } else if (indexOfIpInRules !== -1 && ACTION === 'remove') {

    firewallRules.splice(indexOfIpInRules, 1);

  }
  else {

    console.log("Nothing to do");
    return;

  }

  // Modify the trusted sources
  const trustedSources = { rules: firewallRules };
  const respPut = await fetch(`https://api.digitalocean.com/v2/databases/${DATABASE_ID}/firewall`, {
    method: 'put',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DIGITALOCEAN_TOKEN}`,
    },
    body: JSON.stringify(trustedSources),
  });

  if (!respPut.ok) {
    throw new Error("Couldn't update trusted sources");
  }

}

main().catch(error => core.setFailed(error.message));

})();

module.exports = __webpack_exports__;
/******/ })()
;