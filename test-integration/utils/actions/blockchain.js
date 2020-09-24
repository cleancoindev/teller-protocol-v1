const {
  minutesToSeconds,
} = require("../../../test/utils/consts");

const advanceMinutes = async ({timer}, {testContext}, {minutes}) => {
  const {network} = testContext;
  if(network.toLowerCase() !== 'ganache') {
    return;
  }

  console.log(
    `Advancing time to take out loan (current: ${await timer.getCurrentDate()})...`
  );
  const nextTimestamp = await timer.getCurrentTimestampInSecondsAndSum(
    minutesToSeconds(minutes)
  );
  await timer.advanceBlockAtTime(nextTimestamp);
};

module.exports = {
  advanceMinutes,
};
