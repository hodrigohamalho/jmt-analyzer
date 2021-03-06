'use strict';

const { exec } = require('child_process');

module.exports = function(app) {

  app.get('/metrics/:project/:pod', function(req, res){
    var project = req.params.project;
    var pod = req.params.pod;
    var cmd = `oc -n ${project} rsh ${pod} jcmd 1 VM.native_memory summary`;

    var memory = getJVMMetrics(cmd, res);
    res.send(memory);
  });

  app.get('/metrics/:processid', function(req, res){
    var processid = req.params.processid;
    var cmd = `jcmd ${processid} VM.native_memory summary`;
    
    var memory = getJVMMetrics(cmd, res);
  });

  app.get('/local-process', function(req, res){
    var cmd = `jps`;
    var process = [];

    exec(cmd, (err, stdout, stderr) => {   
      var lines = stdout.split(/\r?\n/);
      lines.forEach(function(line){
        if (line){
          var lineSplitted = line.split(' ');
          process.push(
            {
              id: lineSplitted[0],
              description: lineSplitted[1]
            }
          );
        }
      });

      res.send(process);
    });
  });

  function getJVMMetrics(cmd, res){
    var memory = {
        total: { inuse: 0, max: 0 },
        heap: { inuse: 0, max: 0},
        class: { inuse: 0, max: 0},
        thread: { inuse: 0, max: 0},
        code: { inuse: 0, max: 0},
        gc: { inuse: 0, max: 0},
      }

    exec(cmd, (err, stdout, stderr) => {   
      var lines = stdout.split(/\r?\n/);

      lines.forEach(function(line){
        if (line.includes('Total')){
          memory['total']['inuse'] = extractValueFromField(line, 'committed');
          memory['total']['max'] = extractValueFromField(line, 'reserved');
        } else if (line.includes('Java Heap')){
          memory['heap']['inuse'] = extractValueFromField(line, 'committed');
          memory['heap']['max'] = extractValueFromField(line, 'reserved');
        }else if (line.includes('Class')){
          memory['class']['inuse'] = extractValueFromField(line, 'committed');
          memory['class']['max'] = extractValueFromField(line, 'reserved');
        }else if (line.includes('Thread')){
          memory['thread']['inuse'] = extractValueFromField(line, 'committed');
          memory['thread']['max'] = extractValueFromField(line, 'reserved');
        }else if (line.includes('Code')){
          memory['code']['inuse'] = extractValueFromField(line, 'committed');
          memory['code']['max'] = extractValueFromField(line, 'reserved');
        }else if (line.includes('GC')){
          memory['gc']['inuse'] = extractValueFromField(line, 'committed');
          memory['gc']['max'] = extractValueFromField(line, 'reserved');
        }
      });
      
      res.send(memory);
    });
  }

  function extractValueFromField(line, field){
    var valueInMB = 0;
    var valueInBytes =  0;

    if (field == 'reserved'){
      var endOfString = ',';
    }else if (field == 'committed'){
      var endOfString = '\)';
    }
    
    if ((field == 'committed') && (line.includes('Total'))){
       valueInBytes = line.substring(line.indexOf(field+'=') + (field+'=').length, line.length -2);
    }else{
      valueInBytes = line.substring(line.indexOf(field+'=') + (field+'=').length, line.indexOf(endOfString) - 2);
    }

    return convertToMB(valueInBytes);
  }

  function convertToMB(value){
     return Math.trunc(value/1000);
  }
}