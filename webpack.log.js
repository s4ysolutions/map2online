module.exports = config => {
  console.log("== CONFIG ==========================");
  console.log(config);
  console.log("== CONFIG.PLUGINS ==================");
  console.log(config.plugins);
  console.log("== CONFIG.RULES ====================");
  if (config.module) {
    if (config.module.rules){
      for (var i = 0;i < config.module.rules.length;i++){
        console.log("== TEST: " + config.module.rules[i].test);
        console.log(config.module.rules[i]);
        for (var j = 0; j < config.module.rules[i].use.length; j++){
          console.log("... options ...");
          console.log(config.module.rules[i].use[j].options);
          if (config.module.rules[i].use[j].options && config.module.rules[i].use[j].options.presets){
            console.log(config.module.rules[i].use[j].options.presets[0]);
          }
        }
      }
    }
  }
};
