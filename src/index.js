const core = require('@actions/core');

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
